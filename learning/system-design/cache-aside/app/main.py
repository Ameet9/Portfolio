import asyncio
import os
import time
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis.asyncio as redis

app = FastAPI(title="Cache-Aside Pattern API with Redis & Single-Flight Locking")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# In-memory dictionary for stampede prevention (Single-Flight locking)
fetching_tasks = {}

# In-memory mock database
MOCK_DB = {
    1: {"id": 1, "name": "Mechanical Keyboard", "price": 129.99},
    2: {"id": 2, "name": "Wireless Mouse", "price": 59.99},
    3: {"id": 3, "name": "4K Monitor", "price": 399.99},
}

# Cache telemetry metrics
METRICS = {
    "hits": 0,
    "misses": 0,
    "invalidations": 0
}


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None


@app.on_event("startup")
async def startup():
    app.state.redis = await redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


@app.on_event("shutdown")
async def shutdown():
    await app.state.redis.close()


async def fetch_from_db(product_id: int):
    """Simulates a slow, expensive database query."""
    print(f"[DB] Fetching product {product_id} from database...")
    await asyncio.sleep(1)  # Simulate 1s database latency
    if product_id in MOCK_DB:
        return MOCK_DB[product_id]
    return {"id": product_id, "name": f"Product {product_id}", "price": 99.99}


async def fetch_and_cache(product_id: int, redis_client):
    """Fetches from DB and caches the result with TTL."""
    try:
        product_data = await fetch_from_db(product_id)
        # Save to Redis with 60s TTL (bounds staleness)
        await redis_client.set(f"product:{product_id}", json.dumps(product_data), ex=60)
        return product_data
    finally:
        fetching_tasks.pop(product_id, None)


@app.get("/product/{product_id}")
async def get_product(product_id: int):
    start_time = time.time()
    redis_client = app.state.redis
    cache_key = f"product:{product_id}"

    # 1. Check Cache (Cache-Aside pattern)
    cached_data = await redis_client.get(cache_key)

    if cached_data:
        METRICS["hits"] += 1
        latency = time.time() - start_time
        print(f"[Cache Hit] Product {product_id} (latency: {latency:.4f}s)")
        return {"source": "cache", "data": json.loads(cached_data), "latency_s": latency}

    # 2. Cache Miss
    METRICS["misses"] += 1

    # Single-Flight / Stampede Prevention: coalesce concurrent requests for the same key
    if product_id in fetching_tasks:
        print(f"[Stampede Prevention] Coalescing duplicate fetch for product {product_id}...")
        product_data = await fetching_tasks[product_id]
        latency = time.time() - start_time
        return {"source": "db_shared", "data": product_data, "latency_s": latency}

    # If no task exists, create one and store in registry
    task = asyncio.create_task(fetch_and_cache(product_id, redis_client))
    fetching_tasks[product_id] = task

    product_data = await task
    latency = time.time() - start_time
    print(f"[Cache Miss] Product {product_id} fetched from DB (latency: {latency:.4f}s)")
    return {"source": "db", "data": product_data, "latency_s": latency}


@app.put("/product/{product_id}")
async def update_product(product_id: int, update: ProductUpdate):
    """
    Cache Invalidation on Write:
    Updates the database record and immediately deletes the cached entry in Redis.
    Ensures subsequent reads do not serve stale data.
    """
    redis_client = app.state.redis
    cache_key = f"product:{product_id}"

    # 1. Update underlying database
    if product_id not in MOCK_DB:
        MOCK_DB[product_id] = {"id": product_id, "name": f"Product {product_id}", "price": 99.99}

    if update.name is not None:
        MOCK_DB[product_id]["name"] = update.name
    if update.price is not None:
        MOCK_DB[product_id]["price"] = update.price

    # 2. Invalidate cache key in Redis
    await redis_client.delete(cache_key)
    METRICS["invalidations"] += 1

    print(f"[Write Invalidation] Updated product {product_id} and purged key '{cache_key}' from Redis.")
    return {
        "status": "updated",
        "invalidated_key": cache_key,
        "product": MOCK_DB[product_id]
    }


@app.get("/metrics")
async def get_metrics():
    """Cache efficiency telemetry."""
    total_requests = METRICS["hits"] + METRICS["misses"]
    hit_rate = (METRICS["hits"] / total_requests * 100) if total_requests > 0 else 0.0
    return {
        "hits": METRICS["hits"],
        "misses": METRICS["misses"],
        "invalidations": METRICS["invalidations"],
        "total_requests": total_requests,
        "hit_rate_pct": round(hit_rate, 2)
    }

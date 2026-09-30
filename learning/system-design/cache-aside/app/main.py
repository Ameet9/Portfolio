import asyncio
import os
import time
import json
from fastapi import FastAPI
import redis.asyncio as redis

app = FastAPI()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# In-memory dictionary for stampede prevention
# Maps product_id to an asyncio.Task (or Future)
fetching_tasks = {}

@app.on_event("startup")
async def startup():
    app.state.redis = await redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

@app.on_event("shutdown")
async def shutdown():
    await app.state.redis.close()

async def fetch_from_db(product_id: int):
    """Simulates a slow database query."""
    print(f"[DB] Fetching product {product_id} from database...")
    await asyncio.sleep(1) # simulate slow DB
    return {"id": product_id, "name": f"Product {product_id}", "price": 99.99}

async def fetch_and_cache(product_id: int, redis_client):
    """Fetches from DB and caches the result."""
    try:
        # Fetch from DB
        product_data = await fetch_from_db(product_id)
        
        # Save to Redis with 60s TTL
        await redis_client.set(f"product:{product_id}", json.dumps(product_data), ex=60)
        
        return product_data
    finally:
        # Clean up the task from the dictionary so subsequent misses can fetch again
        fetching_tasks.pop(product_id, None)

@app.get("/product/{product_id}")
async def get_product(product_id: int):
    start_time = time.time()
    redis_client = app.state.redis
    cache_key = f"product:{product_id}"

    # 1. Check Cache
    cached_data = await redis_client.get(cache_key)
    
    if cached_data:
        latency = time.time() - start_time
        print(f"[Cache Hit] Product {product_id} (latency: {latency:.4f}s)")
        return {"source": "cache", "data": json.loads(cached_data), "latency_s": latency}

    # 2. Cache Miss - Implement Stampede Prevention
    if product_id in fetching_tasks:
        print(f"[Stampede Prevention] Waiting for existing DB fetch for product {product_id}...")
        product_data = await fetching_tasks[product_id]
        latency = time.time() - start_time
        return {"source": "db_shared", "data": product_data, "latency_s": latency}

    # If no task exists, create one and store it
    task = asyncio.create_task(fetch_and_cache(product_id, redis_client))
    fetching_tasks[product_id] = task
    
    product_data = await task
    
    latency = time.time() - start_time
    print(f"[Cache Miss] Product {product_id} fetched from DB (latency: {latency:.4f}s)")
    return {"source": "db", "data": product_data, "latency_s": latency}

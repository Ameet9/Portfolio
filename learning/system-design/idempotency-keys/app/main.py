import asyncio
import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from typing import Annotated, Optional

from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from redis import asyncio as aioredis

# Configure structured logging to observe concurrent lock acquisition and replay behavior
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("payment-idempotency")

# Configuration constants
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
# Lock duration while charging: prevents indefinite deadlocks if worker crashes during external payment gateway call
PROCESSING_LOCK_TTL_SECONDS = 30
# Final response caching TTL: 24 hours (industry standard for payment replay window before settling)
FINAL_RESPONSE_TTL_SECONDS = 86400
# Polling parameters for concurrent requests waiting on the in-flight transaction
MAX_POLL_ATTEMPTS = 30
POLL_INTERVAL_SECONDS = 0.1  # 30 * 0.1s = 3.0s total max wait


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the lifecycle of application resources.
    Establishes an async Redis connection pool on startup and ensures graceful cleanup on shutdown.
    """
    logger.info("Initializing Redis async connection pool at %s:%s", REDIS_HOST, REDIS_PORT)
    app.state.redis = aioredis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
        socket_timeout=5.0,
        socket_connect_timeout=5.0
    )
    try:
        # Ping Redis to verify connectivity on application startup
        await app.state.redis.ping()
        logger.info("Successfully connected to Redis.")
        yield
    finally:
        logger.info("Closing Redis connection pool.")
        await app.state.redis.close()


app = FastAPI(
    title="Payment API with Distributed Idempotency Keys",
    description=(
        "Production-grade idempotency key implementation using Redis SET NX EX "
        "to guarantee exactly-once payment processing under high concurrency."
    ),
    version="1.0.0",
    lifespan=lifespan
)


class ChargeRequest(BaseModel):
    """Request payload representing a payment charge attempt."""
    amount: float = Field(..., gt=0, description="Charge amount in dollars, must be strictly greater than 0")
    card_id: str = Field(..., min_length=4, description="Tokenized credit card ID (e.g. card_tok_12345)")


class ChargeResponse(BaseModel):
    """Standardized response returned on successful charge or idempotent replay."""
    transaction_id: str
    amount: float
    card_id: str
    status: str


@app.get("/health", tags=["Monitoring"])
async def health_check(request: Request):
    """
    Liveness and readiness probe for Docker / Kubernetes.
    Verifies that the API and its Redis backing store are responsive.
    """
    try:
        redis_client: aioredis.Redis = request.app.state.redis
        await redis_client.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis connectivity failed: {str(exc)}"
        )


@app.post(
    "/charge",
    response_model=ChargeResponse,
    status_code=status.HTTP_200_OK,
    tags=["Payments"]
)
async def process_charge(
    charge_req: ChargeRequest,
    request: Request,
    response: Response,
    idempotency_key: Annotated[Optional[str], Header(alias="Idempotency-Key")] = None
):
    """
    Charges a payment method with atomic idempotency guarantees.

    Algorithm:
    1. Validate presence of `Idempotency-Key` header.
    2. Attempt to claim ownership atomically via `SET idempotency:{key} 'processing' NX EX 30`.
    3. If lock acquisition fails (SET NX returns False/None):
       - Another process is executing or has completed this charge.
       - Poll Redis briefly for the final JSON result.
       - If resolved to JSON, return cached response with `X-Cache: HIT`.
       - If still 'processing' after timeout, return HTTP 409 Conflict.
    4. If lock acquisition succeeds:
       - Execute payment logic (generate transaction_id, simulate gateway I/O).
       - Store final result: `SET idempotency:{key} {json} EX 86400` (24h TTL).
       - Return fresh response with `X-Cache: MISS`.
    """
    # 1. Enforce requirement for client-provided idempotency key
    if not idempotency_key or not idempotency_key.strip():
        logger.warning("Rejected charge attempt missing 'Idempotency-Key' header")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required 'Idempotency-Key' header"
        )

    clean_key = idempotency_key.strip()
    redis_key = f"idempotency:{clean_key}"
    redis_client: aioredis.Redis = request.app.state.redis

    # 2. Atomic claim step using SET ... NX EX
    # NX = Only set the key if it does NOT exist.
    # EX 30 = Auto-expire after 30 seconds to prevent permanent deadlocks if the worker dies mid-charge.
    # This single atomic Redis command prevents check-then-act race conditions across all API replicas.
    acquired = await redis_client.set(
        redis_key,
        "processing",
        nx=True,
        ex=PROCESSING_LOCK_TTL_SECONDS
    )

    if not acquired:
        # 3. Someone else claimed the key or it already finished.
        logger.info(
            "Idempotency key '%s' was already claimed. Polling for completed result...",
            clean_key
        )

        for attempt in range(1, MAX_POLL_ATTEMPTS + 1):
            val = await redis_client.get(redis_key)

            if val is None:
                # Key disappeared (e.g., initial worker encountered an unhandled crash or lock expired).
                # To be resilient, we break out so the client can safely retry.
                logger.warning(
                    "Idempotency key '%s' disappeared while polling. Worker likely crashed.",
                    clean_key
                )
                break

            if val != "processing":
                # Stored value is the serialized JSON result!
                logger.info(
                    "Resolved cached response for idempotency key '%s' on attempt %d",
                    clean_key, attempt
                )
                try:
                    cached_data = json.loads(val)
                    # Add informative headers for client observability
                    response.headers["X-Cache"] = "HIT"
                    response.headers["X-Idempotent-Replay"] = "true"
                    return cached_data
                except json.JSONDecodeError:
                    logger.error("Corrupted JSON payload in Redis key '%s'", redis_key)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Corrupted idempotency record found"
                    )

            # Still in 'processing' state, wait briefly before next poll
            await asyncio.sleep(POLL_INTERVAL_SECONDS)

        # Polling timed out and key is still marked "processing"
        logger.warning(
            "Timed out waiting for in-flight charge for key '%s' after %d attempts",
            clean_key, MAX_POLL_ATTEMPTS
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A request with this Idempotency-Key is currently in progress. Please retry shortly."
        )

    # 4. We successfully claimed the idempotency lock! We are the primary processor.
    logger.info("Successfully claimed idempotency lock for key '%s'. Processing charge...", clean_key)
    try:
        # Simulate payment gateway network round-trip / card charging latency
        # (e.g. contacting Stripe, Adyen, or card network)
        await asyncio.sleep(0.5)

        # Generate a globally unique transaction ID representing the single debit
        transaction_id = str(uuid.uuid4())
        response_payload = {
            "transaction_id": transaction_id,
            "amount": charge_req.amount,
            "card_id": charge_req.card_id,
            "status": "charged"
        }

        # Store final result in Redis with 24h TTL, overwriting the "processing" lock placeholder.
        # This guarantees subsequent requests with the same key receive the exact same response.
        serialized_result = json.dumps(response_payload)
        await redis_client.set(
            redis_key,
            serialized_result,
            ex=FINAL_RESPONSE_TTL_SECONDS
        )

        logger.info(
            "Charge completed successfully. Transaction ID: %s. Saved idempotency record with 24h TTL.",
            transaction_id
        )

        response.headers["X-Cache"] = "MISS"
        response.headers["X-Idempotent-Replay"] = "false"
        return response_payload

    except Exception as exc:
        # If an unhandled exception or gateway failure occurs, delete the "processing" lock
        # so subsequent client retries are not falsely blocked for 30 seconds.
        logger.error(
            "Error while processing charge for key '%s': %s. Releasing processing lock.",
            clean_key, exc
        )
        await redis_client.delete(redis_key)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment processing failed due to internal error"
        )

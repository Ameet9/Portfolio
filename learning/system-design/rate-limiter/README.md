# Token Bucket Rate Limiter

A production-ready rate limiting service implementing the Token Bucket algorithm, backed by Redis and built with Python/Flask.

## What is Rate Limiting and Why Does it Matter?

Rate limiting is a technique used to control the rate of traffic sent or received by a network. In modern web architectures, it is essential for:
- **Preventing Denial of Service (DoS) attacks**: Throttling malicious actors trying to overwhelm your servers.
- **Resource Management**: Ensuring fair usage among clients so no single user starves others of resources.
- **Cost Control**: Limiting downstream API calls to paid third-party services.

## The Token Bucket Algorithm

The Token Bucket algorithm is popular because it allows for sudden bursts of traffic while maintaining an average rate over time.

```text
    [ Tokens Refill at Constant Rate (e.g., 1/sec) ]
                       │
                       ▼
                 ┌───────────┐
                 │ 🟢 🟢 🟢  │  <-- Bucket Capacity (e.g., 5 tokens)
                 │ 🟢 🟢     │
                 └─────┬─────┘
                       │
               Request │ Needs 1 Token
                       ▼
             Is there a token?
            /                 \
          YES                  NO
          /                     \
    Consume 1 Token         Reject Request
    Allow Request           (HTTP 429 Too Many Requests)
```

## Features

- **Standard Implementation**: Python-level calculations.
- **Production Implementation (Lua Script)**: Atomic Redis operations to prevent race conditions during high concurrency.
- **Graceful Failure**: Returns 429 status codes with standard `Retry-After` and `X-RateLimit-*` headers.

## Running the Application

This project is fully containerized.

1. Start the stack (Redis + Web App):
   ```bash
   docker-compose up --build
   ```
2. The API will be available at `http://localhost:5000`.

## Testing the API

The `BUCKET_CAPACITY` is set to 5 and `REFILL_RATE` is 1 token/sec by default.

**Test Health Check (Not Rate Limited):**
```bash
curl -i http://localhost:5000/health
```

**Test Ping Endpoint (Rate Limited):**
Run this quickly multiple times to exhaust the bucket:
```bash
for i in {1..10}; do curl -i http://localhost:5000/ping; echo ""; done
```

Watch the headers. You will see:
- `X-RateLimit-Remaining: 4`
- `X-RateLimit-Limit: 5`

When you exceed the limit, you will get:
- `HTTP/1.1 429 TOO MANY REQUESTS`
- `Retry-After: 1`

## Running Unit Tests

To run the test suite using `fakeredis` (no real Redis needed):
```bash
pip install -r requirements.txt
pytest tests/
```

## Production Considerations & Next Steps

If deploying this to a high-scale production environment, consider the following enhancements:

1. **Sliding Window Log / Counter**: Token bucket is great, but Sliding Window algorithms provide tighter enforcement of limits over a strictly defined window (e.g., exactly 100 req per minute, rather than potentially bursting 200 around the minute boundary).
2. **Per-Endpoint / Tiered Limits**: Currently, this limits globally per IP. We could modify the Redis keys to include the endpoint route or a user's subscription tier (e.g., `rate_limit:premium_user_123:/api/v1/data`).
3. **Cluster Mode / Redis Scalability**: Use Redis Cluster or a fast memory cache like Memcached for high throughput. Ensure Lua scripts align with slot hashing if using Redis Cluster.

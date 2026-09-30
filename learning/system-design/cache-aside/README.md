# Cache-Aside Pattern with Redis

This project demonstrates the Cache-Aside pattern using Redis and FastAPI, with built-in cache stampede (thundering herd) prevention.

## Architecture & Concepts

### Cache-Aside (Lazy Loading)
In the Cache-Aside pattern, the application is responsible for reading and writing from storage. The cache does not interact with the database directly.
1. Application checks the cache for data.
2. If the data is found (Cache Hit), it's returned to the client.
3. If the data is not found (Cache Miss), the application queries the database, writes the data to the cache, and returns it.

**Vs Write-Through:**
- **Cache-Aside:** Data is loaded on demand. Cache contains only requested data. Stale data can be an issue, mitigated by TTLs.
- **Write-Through:** Every write to the DB goes through the cache. Cache is always up-to-date, but can be filled with rarely requested data.

### TTL (Time To Live)
A fundamental concept where cached data is given an expiration time. This ensures data doesn't stay in the cache forever, freeing up memory and reducing the chance of serving highly stale data. In this project, a TTL of 60 seconds (`EX 60`) is used.

### Cache Stampede (Thundering Herd)
A phenomenon that occurs when a highly requested cache key expires (or is missing) and multiple concurrent requests hit the system simultaneously. All these requests see a cache miss and try to fetch from the database simultaneously, potentially overwhelming the DB.
**Prevention implemented here:** An in-memory dictionary of `asyncio.Task` instances. When the first request misses the cache, it starts the DB fetch and registers its task. Subsequent concurrent requests for the same ID wait on this same task instead of hitting the database again.

## How to Run

1. Start the services using Docker Compose:
   ```powershell
   docker-compose up --build
   ```
2. In a separate terminal, run the stampede test:
   ```powershell
   python test_stampede.py
   ```
   *Note: Ensure you have `httpx` installed locally, or run this within a virtual environment.*
3. Observe the logs in the docker-compose terminal to see only a single `[DB] Fetching product...` log despite 20 concurrent requests.

## Interview Q&A

**Q: Why use Cache-Aside instead of Read-Through?**
A: Cache-aside gives the application full control over what and when to cache. It's often simpler to implement with existing infrastructure since the cache and DB don't need to be integrated directly. Read-through requires the cache layer to know how to fetch from the DB, which isn't natively supported by standard Redis without external plugins or specific caching architectures.

**Q: How do you handle a Cache Stampede for a distributed system with multiple API instances?**
A: The in-memory future approach only works per-instance. For a distributed system, you can use:
1. **Distributed Locks (e.g., Redlock):** Only the instance acquiring the lock fetches from the DB, others wait or return slightly stale data.
2. **Probabilistic Early Expiration (XFetch):** Background refresh before the actual TTL expires, based on a randomized probability curve.

**Q: What happens if the database query fails during a Cache Miss?**
A: The application should handle the exception. If using the in-memory future approach, the exception will be propagated to all waiting requests. The task must be cleared from the pending dictionary so subsequent requests can try again.

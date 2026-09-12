# System Design Interview Notes â€” Rate Limiting & Caching

## Rate Limiting

### Q1: "How would you design a rate limiter for a public API?"

**Strong Answer:**
"There are three main algorithms to consider, each with different tradeoffs:

1. **Token Bucket** â€” A bucket holds up to N tokens and refills at a fixed rate. Each request costs 1 token. If the bucket is empty, reject with 429. This allows short bursts while enforcing an average rate â€” it's what most real APIs use (AWS, Stripe).

2. **Fixed Window Counter** â€” Count requests in fixed time windows (e.g., per minute). Simplest to implement, but has a burst problem at window boundaries: a user could make 100 requests at 11:59:59 and 100 more at 12:00:01 â€” effectively 200 in 2 seconds despite a 100/min limit.

3. **Sliding Window Log** â€” Store the timestamp of every request and count how many fall within the trailing window. Most accurate, but expensive on memory (storing every timestamp).

I'd use **token bucket** for most cases because it handles bursty traffic gracefully, is simple to reason about, and maps well to Redis for distributed deployments."

**Follow-ups:**
- "How does the sliding window *counter* variant work?" â€” Hybrid approach: weight the previous window's count by how much of it overlaps with the current window. More accurate than fixed window, cheaper than the log approach.
- "Where in the architecture does the rate limiter sit?" â€” Typically in an API gateway or reverse proxy (e.g., Kong, Envoy, or a custom middleware), before requests hit the application servers.

---

### Q2: "Why use Redis instead of an in-memory variable for this?"

**Strong Answer:**
"Because in production, API servers are horizontally scaled â€” you have multiple instances behind a load balancer. A Python variable in one instance doesn't know about requests hitting another instance. Redis solves this by being a shared, fast, in-memory store that all servers can read/write to. It also survives individual server restarts.

The tradeoff is a network hop per request to check the rate limit, but Redis is extremely fast (~0.1ms per operation on a LAN) so the overhead is negligible compared to the latency of processing the actual API request."

---

### Q3: "What happens if two requests hit at the exact same time (race condition)?"

**Strong Answer:**
"A naive read-modify-write pattern in application code creates a TOCTOU (Time of Check/Time of Use) race condition â€” both requests read '1 token remaining', both subtract 1, and both proceed. The fix is to make the check-and-decrement operation **atomic**. In Redis, this is done with a Lua script executed via `EVAL` â€” Redis guarantees Lua scripts execute atomically (single-threaded), so no two requests can interleave.

```lua
-- Pseudocode for the atomic token bucket check
local tokens = redis.call('HGET', key, 'tokens')
if tokens >= 1 then
  redis.call('HINCRBY', key, 'tokens', -1)
  return 1  -- allowed
else
  return 0  -- rejected
end
```"

---

### Q4: "How would you rate-limit per-user vs. globally?"

**Strong Answer:**
"Key the Redis entry by the user's identity:
- **Authenticated users**: Use the user ID from the auth token â†’ `rate_limit:user:12345`
- **Unauthenticated traffic**: Fall back to IP address â†’ `rate_limit:ip:203.0.113.1`

IP-based limiting has weaknesses: shared IPs (corporate NAT, VPNs) can cause false positives. For critical APIs, I'd use a tiered approach: generous IP-based limits for anonymous users, stricter per-API-key limits for authenticated users, and separate limits per endpoint (e.g., login gets tighter limits than read-only endpoints)."

---

### Q5: "What HTTP status code and headers would you return when rate-limited?"

**Strong Answer:**
"Return **429 Too Many Requests** with these headers:
- `Retry-After: <seconds>` â€” tells the client exactly when to retry
- `X-RateLimit-Limit: 100` â€” the total allowed requests per window
- `X-RateLimit-Remaining: 0` â€” how many requests are left
- `X-RateLimit-Reset: 1694000000` â€” Unix timestamp when the limit resets

Good API design includes these headers on *every* response (not just 429s), so clients can proactively back off before hitting the limit."

---

## Caching & Eviction

### Q6: "How does an LRU Cache work internally?"

**Strong Answer:**
"An LRU Cache combines two data structures to achieve O(1) for both get and put:
1. **HashMap** (dict) â€” maps keys to linked list nodes for O(1) lookup
2. **Doubly Linked List** â€” maintains access order. Head = most recently used, tail = least recently used.

On `get(key)`: look up the node in the dict, move it to the head of the list (mark as recently used), return the value.
On `put(key, value)`: if the key exists, update and move to head. If new, insert at head. If over capacity, remove the tail node (LRU) from both the list AND the dict.

The sentinel/dummy node trick eliminates null checks at list boundaries â€” every real node always has valid prev/next pointers."

---

### Q7: "How does this relate to Redis or a CDN at scale?"

**Strong Answer:**
"Same core idea â€” track recency, evict least-recently-used â€” but at scale, maintaining a perfect global LRU ordering across millions of keys is expensive. Redis uses an **approximated LRU**: it samples a configurable number of random keys (default 5) and evicts the least recently used among those samples. This is O(1) regardless of total key count, and in practice achieves very close to true LRU behavior.

CDNs face the same problem across geographically distributed edge nodes, where each node maintains its own local LRU cache. The tradeoff is cache coherency â€” a popular item might be evicted from one edge while still cached at another."

---

## Load Balancing & Proxies

### Q8: "How would you scale an API that's getting too much traffic for one server?"

**Strong Answer:**
"The standard first step is horizontal scaling. I'd run multiple identical instances of the API server (e.g., as Docker containers) and place a Load Balancer (like Nginx, AWS ALB, or HAProxy) in front of them. The load balancer receives all incoming traffic and distributes it across the available instances.

A critical requirement for this is **statelessness**: the application servers cannot store session data or file uploads in local memory or disk, because subsequent requests from the same user might route to a different instance. State must be pushed out to shared storage like Redis or S3."

---

### Q9: "What's the difference between round-robin and least-connections load balancing?"

**Strong Answer:**
"These are routing algorithms:
- **Round-robin** blindly alternates requests (Instance 1, Instance 2, Instance 3, repeat). It's simple and works well if all requests take roughly the same amount of time.
- **Least-connections** dynamically routes new requests to whichever backend currently has the fewest active connections. This is much better for workloads where request durations vary wildly (e.g., some requests take 10ms, some take 5 seconds) because it prevents a single server from getting clogged with all the slow requests while others sit idle."

---

### Q10: "What happens if one of your backend servers goes down?"

**Strong Answer:**
"A load balancer is only effective if it routes around failure. It achieves this using **Health Checks**.

The load balancer periodically pings a specific endpoint (e.g., `/health`) on each backend server. If a server fails to respond, or returns a 5xx error, the load balancer removes it from the 'upstream' pool. Traffic is automatically redistributed to the healthy instances. Once the failing server recovers and passes its health checks again, it's added back to the pool."

---

### Q11: "Why can't you load-balance a server that stores session data in local memory?"

**Strong Answer:**
"Because HTTP is stateless, and load balancers distribute requests. User A logs in, and request #1 goes to Server 1. Server 1 stores their session in memory. Then User A clicks 'View Profile', and request #2 is routed by the load balancer to Server 2. Server 2 checks its local memory, doesn't see the session, and redirects the user back to the login page.

To fix this, you either need:
1. **Shared state**: Move sessions to an external store like Redis that all servers query. (Best practice).
2. **Sticky Sessions**: Configure the load balancer to inject a cookie ensuring all requests from User A *always* route to Server 1. (Anti-pattern, makes scaling and deployments harder)."

---

### Q12: "What's the difference between a load balancer and a reverse proxy?"

**Strong Answer:**
"A **reverse proxy** sits in front of one or more backend servers and forwards client requests to them. Its primary jobs are abstraction, security, SSL termination, and caching.

A **load balancer** is a specific type of reverse proxy whose primary job is to distribute traffic across *multiple* backend servers to increase capacity and reliability. Nginx is a reverse proxy that also functions as a load balancer."

---

## API Gateways & Protection

### Q13: "What's the difference between rate limiting and throttling?"

**Strong Answer:**
"Rate limiting typically acts as a hard wall: it rejects excess requests outright, returning a 429 Too Many Requests status to protect the system.

Throttling is softer: instead of rejecting requests, it queues or delays them to smooth out traffic spikes (traffic shaping). You might throttle a heavy background sync job to run slowly, but you rate-limit a public API endpoint to prevent abuse."

---

### Q14: "What happens if Redis goes down — does your whole API go down?"

**Strong Answer:**
"It depends on your failure strategy. You have two choices:
1. **Fail-open**: If Redis is unreachable, allow all requests through. This prioritizes availability but risks your backend being overwhelmed.
2. **Fail-closed**: If Redis is unreachable, reject all requests. This prioritizes protection but brings your API down.

For a read-heavy public API, fail-open is usually better. For a sensitive endpoint like login/OTP generation, fail-closed is safer to prevent brute-force attacks during a Redis outage. In production, you'd use Redis Sentinel or Redis Cluster for high availability so single-node failures don't bring down the rate limiter."


---

## Serverless Architecture

### Q15: "Explain serverless computing and how it differs from containers or VMs."

**Strong Answer:**
"There are three levels of infrastructure abstraction:

- **VMs** — You manage the OS, patches, runtime, and scaling. Full control but high ops burden.
- **Containers** — You manage the runtime and app logic; the container platform manages the OS. Better DX but you still manage scaling and keep containers running.
- **Serverless** — You only manage the function code. The cloud provider handles everything else: provisioning, scaling (including to zero), patching, OS. You pay per invocation, not per hour running.

The trade-offs of serverless: no server management and near-zero idle cost, but limited execution time (Lambda max 15 min), cold starts, less control over the runtime environment, and it can become more expensive than containers at very high sustained throughput."

---

### Q16: "What is a cold start and how would you reduce its impact?"

**Strong Answer:**
"A cold start happens when a Lambda function hasn't been called recently and AWS needs to provision a brand-new execution environment. It has to download your code, start the runtime (e.g. Python interpreter), and run your initialization code before handling the first request. This adds latency — typically 100ms–1s depending on your package size and language.

Mitigation strategies:
1. **Minimize package size** — fewer dependencies = faster initialization.
2. **Use a faster-starting runtime** — Python and Node.js cold-start faster than JVM-based languages.
3. **Provisioned Concurrency** — AWS keeps a specified number of instances pre-warmed. Eliminates cold starts but costs money even when idle.
4. **Lazy initialization** — move expensive setup (DB connections, SDK clients) outside the handler but inside the module scope, so it's cached after the first cold start."

---

### Q17: "When would you NOT choose serverless?"

**Strong Answer:**
"Three clear cases:
1. **Steady, predictable high traffic** — you pay per invocation on Lambda. If you have constant traffic, a container running 24/7 on ECS/Kubernetes is cheaper.
2. **Long-running processes** — Lambda has a 15-minute maximum execution timeout. Video transcoding, large data migrations, or ML training jobs don't fit this model.
3. **Fine-grained runtime control** — serverless abstracts away the OS and runtime. If you need specific kernel versions, GPU access, or custom system libraries, containers or VMs give you more flexibility."

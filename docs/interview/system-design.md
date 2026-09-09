# System Design Interview Notes — Rate Limiting & Caching

## Rate Limiting

### Q1: "How would you design a rate limiter for a public API?"

**Strong Answer:**
"There are three main algorithms to consider, each with different tradeoffs:

1. **Token Bucket** — A bucket holds up to N tokens and refills at a fixed rate. Each request costs 1 token. If the bucket is empty, reject with 429. This allows short bursts while enforcing an average rate — it's what most real APIs use (AWS, Stripe).

2. **Fixed Window Counter** — Count requests in fixed time windows (e.g., per minute). Simplest to implement, but has a burst problem at window boundaries: a user could make 100 requests at 11:59:59 and 100 more at 12:00:01 — effectively 200 in 2 seconds despite a 100/min limit.

3. **Sliding Window Log** — Store the timestamp of every request and count how many fall within the trailing window. Most accurate, but expensive on memory (storing every timestamp).

I'd use **token bucket** for most cases because it handles bursty traffic gracefully, is simple to reason about, and maps well to Redis for distributed deployments."

**Follow-ups:**
- "How does the sliding window *counter* variant work?" — Hybrid approach: weight the previous window's count by how much of it overlaps with the current window. More accurate than fixed window, cheaper than the log approach.
- "Where in the architecture does the rate limiter sit?" — Typically in an API gateway or reverse proxy (e.g., Kong, Envoy, or a custom middleware), before requests hit the application servers.

---

### Q2: "Why use Redis instead of an in-memory variable for this?"

**Strong Answer:**
"Because in production, API servers are horizontally scaled — you have multiple instances behind a load balancer. A Python variable in one instance doesn't know about requests hitting another instance. Redis solves this by being a shared, fast, in-memory store that all servers can read/write to. It also survives individual server restarts.

The tradeoff is a network hop per request to check the rate limit, but Redis is extremely fast (~0.1ms per operation on a LAN) so the overhead is negligible compared to the latency of processing the actual API request."

---

### Q3: "What happens if two requests hit at the exact same time (race condition)?"

**Strong Answer:**
"A naive read-modify-write pattern in application code creates a TOCTOU (Time of Check/Time of Use) race condition — both requests read '1 token remaining', both subtract 1, and both proceed. The fix is to make the check-and-decrement operation **atomic**. In Redis, this is done with a Lua script executed via `EVAL` — Redis guarantees Lua scripts execute atomically (single-threaded), so no two requests can interleave.

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
- **Authenticated users**: Use the user ID from the auth token → `rate_limit:user:12345`
- **Unauthenticated traffic**: Fall back to IP address → `rate_limit:ip:203.0.113.1`

IP-based limiting has weaknesses: shared IPs (corporate NAT, VPNs) can cause false positives. For critical APIs, I'd use a tiered approach: generous IP-based limits for anonymous users, stricter per-API-key limits for authenticated users, and separate limits per endpoint (e.g., login gets tighter limits than read-only endpoints)."

---

### Q5: "What HTTP status code and headers would you return when rate-limited?"

**Strong Answer:**
"Return **429 Too Many Requests** with these headers:
- `Retry-After: <seconds>` — tells the client exactly when to retry
- `X-RateLimit-Limit: 100` — the total allowed requests per window
- `X-RateLimit-Remaining: 0` — how many requests are left
- `X-RateLimit-Reset: 1694000000` — Unix timestamp when the limit resets

Good API design includes these headers on *every* response (not just 429s), so clients can proactively back off before hitting the limit."

---

## Caching & Eviction

### Q6: "How does an LRU Cache work internally?"

**Strong Answer:**
"An LRU Cache combines two data structures to achieve O(1) for both get and put:
1. **HashMap** (dict) — maps keys to linked list nodes for O(1) lookup
2. **Doubly Linked List** — maintains access order. Head = most recently used, tail = least recently used.

On `get(key)`: look up the node in the dict, move it to the head of the list (mark as recently used), return the value.
On `put(key, value)`: if the key exists, update and move to head. If new, insert at head. If over capacity, remove the tail node (LRU) from both the list AND the dict.

The sentinel/dummy node trick eliminates null checks at list boundaries — every real node always has valid prev/next pointers."

---

### Q7: "How does this relate to Redis or a CDN at scale?"

**Strong Answer:**
"Same core idea — track recency, evict least-recently-used — but at scale, maintaining a perfect global LRU ordering across millions of keys is expensive. Redis uses an **approximated LRU**: it samples a configurable number of random keys (default 5) and evicts the least recently used among those samples. This is O(1) regardless of total key count, and in practice achieves very close to true LRU behavior.

CDNs face the same problem across geographically distributed edge nodes, where each node maintains its own local LRU cache. The tradeoff is cache coherency — a popular item might be evicted from one edge while still cached at another."

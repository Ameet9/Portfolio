import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Category = 'All' | 'JavaScript' | 'JavaScript & Python' | 'Python' | 'System Design' | 'React & Angular' | 'Vue' | 'DSA';

interface QA {
  id: string;
  category: Exclude<Category, 'All'>;
  question: string;
  answer: string;
  tags: string[];
}

const qas: QA[] = [
  // ── JavaScript ───────────────────────────────────────────────────────────────
  {
    id: 'js-1',
    category: 'JavaScript',
    question: 'Explain how JavaScript handles asynchronous operations despite being single-threaded.',
    answer: `JS uses an Event Loop concurrency model. The V8 engine has a single Call Stack. When an async operation (like \`fetch\` or \`setTimeout\`) is called, it's offloaded to the Web APIs (browser) or libuv (Node). Once complete, the callback is pushed to a queue.

There are two queues:
- **Microtask Queue** (Promises, \`queueMicrotask\`, \`process.nextTick\`) — emptied completely before each macrotask
- **Macrotask Queue** (\`setTimeout\`, I/O, UI rendering) — one task processed per loop iteration

When the Call Stack is empty, the Event Loop empties the *entire* Microtask queue first, then executes exactly *one* Macrotask, and repeats.

⚠️ **Follow-up trap:** If a microtask continually schedules new microtasks, it creates an infinite loop — the browser freezes because the macrotask queue (and rendering) never gets a turn.`,
    tags: ['Event Loop', 'Microtasks', 'Concurrency'],
  },
  {
    id: 'js-2',
    category: 'JavaScript',
    question: 'What is a closure, and what are its practical use cases and risks?',
    answer: `A closure is formed when a function retains access to its lexical scope, even when executed outside its original scope. In V8, when a function references an outer variable, that variable moves from the **stack to the heap** to persist.

**Practical uses:**
- Data privacy (emulating private methods before ES2022 private fields)
- Currying and partial application
- Memoization caches

**Main risk — memory leaks:** If the closure is attached to a long-lived object (like a DOM event listener or a global cache) and holds a reference to a large object, that large object cannot be garbage collected. Use \`WeakMap\` for object metadata to avoid this.`,
    tags: ['Closures', 'Memory', 'GC'],
  },
  {
    id: 'js-3',
    category: 'JavaScript',
    question: 'How does prototypal inheritance differ from classical inheritance?',
    answer: `Classical inheritance defines classes as blueprints — instances are *copies* of those blueprints.

Prototypal inheritance (which JS uses) is about **live object linkage**. Objects inherit directly from other objects via the hidden \`[[Prototype]]\` property. When you access a property, the engine traverses this prototype chain. If the prototype is mutated dynamically, all linked objects immediately reflect the change.

ES6 \`class\` syntax is just syntactic sugar over this prototype chain linkage — there is no separate class system under the hood.`,
    tags: ['Prototypes', 'Inheritance', 'OOP'],
  },
  {
    id: 'js-4',
    category: 'JavaScript',
    question: 'How does V8 manage memory, and how do memory leaks occur in modern JavaScript?',
    answer: `V8 uses a **generational Garbage Collector** based on Mark-and-Sweep:
- **Young Generation** (Scavenger GC) — short-lived objects, fast minor collections
- **Old Generation** (Mark-Sweep-Compact) — long-lived objects, slower major collections

Modern GC handles circular references correctly, but leaks still happen via:
1. **Forgotten DOM references** — JS variable holds a removed DOM node
2. **Uncleared event listeners or \`setInterval\`s**
3. **Large objects trapped in closures**
4. **Unbounded caches** — Maps/Sets that grow forever

**Senior-level pattern:** Use \`WeakMap\` or \`WeakSet\` to attach metadata to objects without preventing their GC.`,
    tags: ['GC', 'Memory Leaks', 'V8', 'WeakMap'],
  },
  {
    id: 'js-5',
    category: 'JavaScript',
    question: 'Explain `this` binding — how does it differ between arrow functions and regular functions?',
    answer: `In a **regular function**, \`this\` is determined by the call site:
- \`obj.method()\` → \`this\` = \`obj\`
- \`func()\` → \`this\` = global object (or \`undefined\` in strict mode)
- \`new Func()\` → \`this\` = new instance
- \`func.call(ctx)\` → \`this\` = \`ctx\`

**Arrow functions** do NOT have their own \`this\`. They lexically capture \`this\` from their enclosing context at definition time. You cannot override an arrow function's \`this\` with \`bind\`, \`call\`, or \`apply\`.

This makes arrow functions the right choice for callbacks inside class methods, and wrong choice for object methods where you need \`this\` to refer to the object.`,
    tags: ['this', 'Arrow Functions', 'bind/call/apply'],
  },
  {
    id: 'js-6',
    category: 'JavaScript',
    question: 'What are the architectural differences between ESM and CommonJS?',
    answer: `**CommonJS (\`require\`/\`module.exports\`):**
- Synchronous and dynamic — resolved at runtime
- Modules can be conditionally required (\`if (condition) require(...))\`)
- Static analysis is hard → tree-shaking is impossible
- Designed for Node.js where all files are local

**ES Modules (\`import\`/\`export\`):**
- Asynchronous and **static** — the engine builds the full dependency graph and parses before executing
- Import paths must be static literals
- Enables tree-shaking (dead code elimination) in bundlers like Vite/webpack
- Supports Top-Level Await
- Node runs ESM in strict mode by default

The static nature of ESM is what makes modern bundling and optimization possible.`,
    tags: ['ESM', 'CommonJS', 'Modules', 'Tree-shaking'],
  },

  // ── System Design ─────────────────────────────────────────────────────────
  {
    id: 'sd-1',
    category: 'System Design',
    question: 'How would you design a rate limiter for a public API?',
    answer: `Three main algorithms, each with different trade-offs:

1. **Token Bucket** — A bucket holds N tokens, refilling at a fixed rate. Each request costs 1 token. Allows short bursts while enforcing an average rate. Used by AWS, Stripe. ✅ **My recommendation for most APIs.**

2. **Fixed Window Counter** — Count requests per fixed time window. Simplest, but has a burst problem at window boundaries: a user can make 2× the limit in 2 seconds by firing at 11:59:59 and 12:00:01.

3. **Sliding Window Log** — Store timestamps of every request. Most accurate, but expensive (stores every timestamp).

**Implementation:** Use Redis with a Lua script for atomic check-and-decrement. Key by user ID or IP. Return \`429\` with \`Retry-After\`, \`X-RateLimit-Remaining\`, and \`X-RateLimit-Reset\` headers.`,
    tags: ['Rate Limiting', 'Token Bucket', 'Redis', 'HTTP 429'],
  },
  {
    id: 'sd-2',
    category: 'System Design',
    question: 'Why use Redis instead of in-memory storage for rate limiting?',
    answer: `In production, API servers are **horizontally scaled** behind a load balancer. An in-memory counter on Server 1 knows nothing about requests hitting Server 2. Each server would allow its own full quota, defeating the purpose entirely.

Redis is a shared, fast, in-memory store all servers can read/write to. It also survives individual server restarts.

**The trade-off:** Every request now has a network hop (~0.1ms on a LAN) to Redis. This is negligible compared to actual API processing time.

**Redis HA:** In production, use Redis Sentinel (automatic failover) or Redis Cluster. If Redis goes down, you choose: fail-open (allow all traffic) or fail-closed (block all traffic) depending on your protection requirements.`,
    tags: ['Redis', 'Distributed State', 'Horizontal Scaling'],
  },
  {
    id: 'sd-3',
    category: 'System Design',
    question: 'How would you scale an API that\'s getting too much traffic for one server?',
    answer: `The standard first step: **horizontal scaling behind a load balancer**.

1. Run multiple identical instances of the API (Docker containers)
2. Put a load balancer in front (Nginx, AWS ALB, HAProxy)
3. The load balancer distributes traffic across instances

**Critical precondition — statelessness:** App servers cannot store session data or files in local memory. State must be in shared storage (Redis for sessions, S3 for files). If you can't make the service stateless, you need sticky sessions (anti-pattern) or must redesign.

**Load balancing algorithms:**
- **Round-robin** — blindly alternates. Works well if request durations are uniform.
- **Least-connections** — routes to the instance with fewest active connections. Better for variable-duration requests.`,
    tags: ['Load Balancing', 'Nginx', 'Horizontal Scaling', 'Statelessness'],
  },
  {
    id: 'sd-4',
    category: 'System Design',
    question: 'How would you design a system where a user action triggers a slow downstream process?',
    answer: `Use the **producer-consumer pattern** with a message queue:

1. API endpoint validates the request and publishes a message to RabbitMQ/SQS
2. Returns \`202 Accepted\` immediately (user never waits)
3. A separate **worker** consumes messages and does the slow work asynchronously

**Why not background threads?**
- A thread dies if the process crashes — work is lost permanently
- Can't scale workers independently from the API
- Doesn't survive deploys

**Failure handling:** Retry with exponential backoff (1s, 5s, 30s). After N retries, move to a **Dead-Letter Queue** for inspection instead of silently dropping or looping forever.

**Scaling:** Run more worker instances when queues back up — the API never needs to change.`,
    tags: ['Message Queues', 'RabbitMQ', 'Producer-Consumer', 'DLQ'],
  },
  {
    id: 'sd-5',
    category: 'System Design',
    question: 'Explain serverless computing and when you wouldn\'t choose it.',
    answer: `**Serverless (e.g. AWS Lambda):** You deploy function code, the cloud provider manages everything else — provisioning, scaling, patching, OS. Pay per invocation, not per idle hour.

**Cold starts:** When Lambda hasn't run recently, it spins up a fresh environment. This adds latency (100ms–1s). Mitigations: smaller packages, faster runtimes (Python/Node > JVM), Provisioned Concurrency (pre-warmed instances).

**When NOT to use serverless:**
1. **Steady high traffic** — constant traffic makes per-invocation pricing more expensive than a container running 24/7
2. **Long-running processes** — Lambda max timeout is 15 minutes
3. **Fine-grained runtime control** — need specific kernel, GPU access, or custom system libraries`,
    tags: ['Serverless', 'Lambda', 'Cold Starts', 'Trade-offs'],
  },
  {
    id: 'sd-6',
    category: 'System Design',
    question: 'What is the difference between a message queue and a pub-sub system?',
    answer: `**Message Queue (Point-to-Point):** Each message is consumed by exactly **one** consumer. Multiple workers compete for messages — great for distributing work. RabbitMQ queues and AWS SQS work this way.

**Pub-Sub:** Each message is delivered to **all** subscribers. Great for broadcasting events — e.g., an \`order.created\` event notifies inventory, email, and analytics services simultaneously.

RabbitMQ can do both depending on exchange type:
- \`direct\` / \`topic\` exchanges → queue-like (one consumer)
- \`fanout\` exchange → pub-sub (all consumers)

Kafka is fundamentally log-based pub-sub: all consumers can read all messages, each maintaining their own offset.`,
    tags: ['Message Queue', 'Pub-Sub', 'RabbitMQ', 'Kafka'],
  },
  {
    id: 'sd-7',
    category: 'System Design',
    question: 'Why is consistent hashing better than key % N for a distributed cache?',
    answer: `**Naive modulo (\`hash(key) % N\`)** remaps ~80% of keys when you add or remove a single server. This is because the modulus changes globally — almost every key lands on a different server, causing a cache stampede (every client misses cache simultaneously and hammers the database).

**Consistent hashing** maps both servers and keys onto a circular hash space (0 to 2³²−1). A key is assigned to the first server found clockwise from its hash position. When a server is added/removed, only the keys in the arc between the changed server and its neighbor are affected — roughly **1/N** of keys, not 80%.

**Virtual nodes** solve the uneven distribution problem. With only 4 physical servers, the hash positions might cluster, leaving large gaps. By hashing each server 150 times with suffixes (\`"server-1#0"\`, \`"server-1#1"\`, ...), you scatter 600 points evenly around the ring, giving near-uniform key distribution.

**Real-world usage:** DynamoDB, Cassandra, memcached client libraries, CDN edge routing.`,
    tags: ['Consistent Hashing', 'Virtual Nodes', 'Distributed Cache', 'Sharding'],
  },

  {
    id: 'sd-8',
    category: 'System Design',
    question: 'How is a circuit breaker different from a retry mechanism?',
    answer: `**Retries** assume a failure is transient (e.g., a network blip). They keep trying. But if the downstream service is genuinely overloaded, retrying makes things *worse* by hammering an already-struggling system, causing cascading failures.

A **Circuit Breaker** detects when a service is genuinely struggling (by tracking the failure rate) and **stops trying completely** for a cooldown period (the OPEN state). It fails fast so the caller doesn't waste threads/connections waiting on timeouts.

Once the cooldown expires, it enters a **HALF_OPEN** state, letting exactly *one* request through to test if the service has recovered. If yes, it closes the circuit. If no, it trips open again.`,
    tags: ['Circuit Breaker', 'Resilience', 'Fail Fast', 'Cascading Failures'],
  },
  {
    id: 'sd-9',
    category: 'System Design',
    question: 'What is IDOR and how do you prevent it in a REST API?',
    answer: `**IDOR (Insecure Direct Object Reference)** is an authorization vulnerability where an API relies solely on a user-provided ID to access a resource without checking if the user actually owns that resource.

For example, if User A calls \`DELETE /expenses/42\`, and the backend just runs \`DELETE FROM expenses WHERE id=42\`, User A just deleted User B's expense.

**Prevention:** Never trust the client ID alone. Always combine it with the authenticated session context (e.g., from a JWT). The safe query looks like:
\`DELETE FROM expenses WHERE id=42 AND user_id = <current_user_id_from_token>\`.`,
    tags: ['Security', 'IDOR', 'Authorization', 'OWASP'],
  },

  {
    id: 'sd-10',
    category: 'System Design',
    question: 'What is "configuration drift" and how does Infrastructure as Code (IaC) catch it?',
    answer: `**Configuration drift** happens when real-world infrastructure changes independently of your source code (e.g., an engineer manually clicking a checkbox in the AWS console to fix a fire, but forgetting to update the Terraform code).

This is dangerous because the source of truth is lost, and the next automated deployment might overwrite the manual fix, causing an outage.

**How IaC catches it:** Tools like Terraform maintain a **state file** that maps your code to real resources. When you run \`terraform plan\`, it compares:
1. What you want (your \`.tf\` code)
2. What Terraform last knew about (state file)
3. What actually exists right now (live AWS API)

If the live API differs from your code, the \`plan\` output will flag it as a change waiting to happen. Running \`plan\` continuously in CI acts as a drift-detection alarm.`,
    tags: ['Terraform', 'IaC', 'Configuration Drift', 'State Management'],
  },

  {
    id: 'sd-11',
    category: 'System Design',
    question: 'What happens internally in Kubernetes when a pod crashes?',
    answer: `The core mechanic of Kubernetes is the **reconciliation loop** (or control loop).

1. A controller (like a \`ReplicaSet\` backing a \`Deployment\`) continuously compares the **Desired State** (what you wrote in YAML, e.g., \`replicas: 3\`) against the **Actual State** (what is currently running).
2. When a pod crashes or is deleted, the Actual State drops to 2.
3. The controller sees this mismatch (\`2 < 3\`) and issues commands to the scheduler to spin up a replacement pod to close the gap.

This is fundamentally different from a script that just runs a container once. The loop runs forever, constantly self-healing the cluster.`,
    tags: ['Kubernetes', 'Orchestration', 'Self-Healing', 'Control Loop'],
  },

  {
    id: 'sd-12',
    category: 'System Design',
    question: 'Why use a separate message queue (like RabbitMQ) instead of a background thread in the API process?',
    answer: `While a background thread in the API server is easier to write, it fails in production for three reasons:

1. **Lost Work:** If the API process crashes, is restarted, or scales down during a deploy, all background threads die and the work is lost forever. Queues persist messages to disk.
2. **Backpressure & Scaling:** If the background task is slow (e.g., generating a PDF), 1,000 incoming requests will overwhelm the API server's CPU/memory, taking down the entire web server. With a queue, the API server stays fast, and you can independently scale the consumers (workers) to churn through the backlog.
3. **Failures & Retries:** Queues natively support dead-lettering (moving persistently failing messages to a DLQ for manual inspection) instead of throwing exceptions into the void.`,
    tags: ['Message Queues', 'RabbitMQ', 'Decoupling', 'Background Tasks'],
  },
  {
    id: 'sd-13',
    category: 'System Design',
    question: 'Why do we need virtual nodes in consistent hashing?',
    answer: `Without virtual nodes, a small number of real servers will land at random points on the hash ring, leading to highly uneven arc lengths between them. This means some servers will receive a massive share of the keys while others sit idle.

**The Fix:** Give each physical server multiple "virtual" positions on the ring (e.g., 100 replicas named \`serverA-0\` to \`serverA-99\`).
This smooths out the distribution statistically, similar to how flipping a coin 100 times gets you closer to a 50/50 split than flipping it 3 times.

Virtual nodes also make **heterogeneous clusters** easy: if Server B has twice the RAM of Server A, just give it 200 virtual nodes instead of 100.`,
    tags: ['Consistent Hashing', 'Virtual Nodes', 'Load Balancing', 'Distributed Systems'],
  },
  {
    id: 'sd-14',
    category: 'System Design',
    question: 'Why check a token before deleting a Redis lock key instead of just deleting it?',
    answer: `When using a distributed lock with a TTL (e.g., \`SET lock:resource token NX PX 5000\`), your process might take longer than 5 seconds to finish its work. 

If that happens:
1. Your lock expires.
2. Process B acquires the lock for the same resource.
3. Your process finally finishes its work and calls \`DEL lock:resource\`.

If you just run \`DEL\`, you will delete **Process B's lock**, leaving the resource unprotected. By checking that the value matches your unique token (usually via a Lua script for atomicity) before deleting, you ensure you only release a lock that you still own.`,
    tags: ['Distributed Locking', 'Redis', 'Race Conditions', 'Atomicity'],
  },
  {
    id: 'sd-15',
    category: 'System Design',
    question: 'What\'s the difference between blue-green and canary deployments?',
    answer: `Both achieve zero-downtime deployments, but their risk profiles differ:

- **Blue-Green** is an instant, 100% traffic cutover between two fully provisioned, parallel environments. If something goes wrong, you instantly rollback (switch back to blue).
- **Canary** shifts a small percentage of traffic (e.g., 5%) to the new version while monitoring for errors or latency spikes. If it's stable, you slowly ramp up to 100%.

Canary minimizes the "blast radius" of a bad release since only 5% of users see it, but deployments take much longer. Blue-Green is fast but affects 100% of users immediately if there's a bug.`,
    tags: ['Deployments', 'Blue-Green', 'Canary', 'CI/CD'],
  },
  {
    id: 'sd-16',
    category: 'System Design',
    question: 'How does Kubernetes\' Horizontal Pod Autoscaler (HPA) decide when to scale?',
    answer: `The HPA controller periodically queries the **metrics-server** (usually every 15 seconds) to fetch live CPU and memory usage for all pods in the target Deployment.

It compares the actual usage against the **requested** amount (not the limit). For example, if your pod requests \`100m\` of CPU and the HPA target is \`50%\`, the HPA wants the pod to average \`50m\` usage.

If average usage spikes to \`150m\` (150%), the HPA scales the replicas up to bring the per-pod average back down to 50%. 

**Crucial caveat:** If a pod does not explicitly declare resource \`requests\` in its YAML, the HPA has no denominator to calculate a percentage against, and autoscaling will completely fail to trigger.`,
    tags: ['Kubernetes', 'HPA', 'Autoscaling', 'metrics-server'],
  },
  {
    id: 'sd-17',
    category: 'System Design',
    question: 'What\'s the difference between logs, metrics, and traces?',
    answer: `They are the three pillars of observability, each with a specific role:

1. **Logs:** Discrete events with rich context (\`"User X failed to login due to bad password"\`). Great for deep debugging, but terrible for seeing the big picture.
2. **Metrics:** Aggregated numbers over time (\`"500 errors per second"\`). They are cheap to store and perfect for dashboarding and triggering automated alerts.
3. **Traces:** The causal timeline of a single request across a distributed system. They tell you exactly *where* the time went (\`"The request took 2s total; 1.8s was spent in the Inventory Service's DB"\`).`,
    tags: ['Observability', 'Logs', 'Metrics', 'Traces'],
  },
  {
    id: 'sd-18',
    category: 'System Design',
    question: 'How does trace context get passed from one microservice to another over HTTP?',
    answer: `Through standardized HTTP headers, most commonly the W3C **\`traceparent\`** header.

When Service A calls Service B, the instrumentation library (like OpenTelemetry) intercepts the outbound HTTP request and injects the current \`trace_id\` and the current \`span_id\` into the headers. 

Service B's web framework intercepts the incoming request, reads the \`traceparent\` header, and uses it to start a new "child" span under the same global trace ID. This is called **Context Propagation**.`,
    tags: ['Distributed Tracing', 'traceparent', 'Context Propagation', 'OpenTelemetry'],
  },
  {
    id: 'sd-19',
    category: 'System Design',
    question: 'At scale, you can\'t trace every single request — how do you handle that?',
    answer: `You use **Sampling**, saving only a representative fraction of traces to reduce overhead and storage costs.

1. **Head-based sampling:** A coin is flipped at the very beginning of the request (e.g., 5% chance). That decision is propagated downstream so all services agree to trace or ignore that request. It's cheap, but you might miss rare errors.
2. **Tail-based sampling:** 100% of traces are temporarily buffered in a collector (like Jaeger or an OTEL collector). A decision is made *after* the request finishes — e.g., keep the trace if an error occurred or if it was unusually slow, otherwise discard it. It guarantees you capture the interesting outliers, but requires massive memory/compute in the collector.`,
    tags: ['Distributed Tracing', 'Sampling', 'System Design'],
  },

  // ── React & Angular ───────────────────────────────────────────────────────
  {
    id: 'react-1',
    category: 'React & Angular',
    question: 'What is the difference between debouncing and throttling?',
    answer: `Both rate-limit function execution but trigger differently:

**Debounce** — delays execution until activity *stops* for a period. Timer resets on every new event. Perfect for search-as-you-type (fire API only after the user pauses).

**Throttle** — executes at most once per interval, regardless of how many events fire. Good for scroll/resize handlers where you want periodic updates.

\`\`\`
User types:  r - e - a - c - t - [pause 400ms]
Debounce:    [reset][reset][reset][reset]  → fires ONCE with 'react'
Throttle:    [fire 'r'] ... [fire 'rea'] ... [fire 'react']
\`\`\`

Rule of thumb: debounce for "wait until they stop," throttle for "fire at most X times per second."`,
    tags: ['Debounce', 'Throttle', 'Performance'],
  },
  {
    id: 'react-2',
    category: 'React & Angular',
    question: 'Why use IntersectionObserver instead of a scroll event listener for infinite scroll?',
    answer: `**Scroll listeners** fire on every pixel of scrolling — potentially 60+ times per second. If you read element positions (\`getBoundingClientRect()\`) inside the handler, you force synchronous layout recalculation (layout thrashing), causing jank.

**IntersectionObserver** is browser-optimized and asynchronous:
- Uses internal compositor-level tracking — **zero main thread work** during normal scrolling
- Only fires when a target element's visibility *actually changes*
- Built-in threshold control (fire at 10% visible, 50% visible, etc.)
- Clean cleanup via \`observer.disconnect()\`

The only reason to use a scroll listener is for continuous position data (e.g., parallax). For "has the user reached the bottom?" IntersectionObserver is strictly better.`,
    tags: ['IntersectionObserver', 'Performance', 'Infinite Scroll'],
  },
  {
    id: 'react-3',
    category: 'React & Angular',
    question: 'How do you avoid memory leaks in useEffect?',
    answer: `Always return a **cleanup function** from \`useEffect\`. React calls it before the effect re-runs (on dependency change) and on unmount.

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort(); // cleanup cancels in-flight request
}, [url]);

useEffect(() => {
  const observer = new IntersectionObserver(callback);
  observer.observe(ref.current);
  return () => observer.disconnect(); // cleanup
}, []);
\`\`\`

Without cleanup: timers, observers, and subscriptions keep running after unmount, referencing stale state or trying to update a destroyed component.

React StrictMode intentionally mounts → unmounts → remounts in development to surface these leaks.`,
    tags: ['useEffect', 'Memory Leaks', 'Cleanup', 'AbortController'],
  },
  {
    id: 'react-4',
    category: 'React & Angular',
    question: 'What is the difference between switchMap, mergeMap, concatMap, and exhaustMap?',
    answer: `All four are RxJS higher-order mapping operators — they handle what happens when a new outer emission arrives while an inner observable is still running:

| Operator | Behavior | Best for |
|----------|----------|----------|
| \`switchMap\` | **Cancels** the previous inner observable | Search-as-you-type (always want latest) |
| \`mergeMap\` | Runs all **concurrently**, no cancellation | Independent parallel requests |
| \`concatMap\` | **Queues** — one at a time in order | Ordered sequential operations |
| \`exhaustMap\` | **Ignores** new emissions while one is active | Form submit (prevent double-submit) |

The \`switchMap\` / \`mergeMap\` distinction is the most common Angular interview trap. Without \`switchMap\` in a search box, you can get a slow old response overwriting a newer correct one — a silent stale-data bug.`,
    tags: ['RxJS', 'switchMap', 'Angular', 'Observables'],
  },
  {
    id: 'react-5',
    category: 'React & Angular',
    question: 'When would you reach for Pinia/Vuex instead of just component state?',
    answer: `Component state (\`ref\`/\`reactive\`) is the right default when state is truly local to one component and its direct children.

Use **Pinia** when:
1. Multiple unrelated components need the same data (e.g., a Kanban board where Column A and Column B both need the cards list)
2. State needs to survive component unmount/remount cycles
3. Mutation logic is complex enough to benefit from centralized, named, testable actions

**Why not prop drilling?** Beyond 2 component levels, prop drilling becomes a maintenance burden. Pinia gives you testable actions, Vue DevTools integration, and TypeScript autocompletion that prop drilling can't match.

**Normalization tip:** Store entities by ID in a flat map (\`cards: { 'c1': {...} }\`), not nested inside parent arrays. Moving a card between columns becomes two cheap array ID operations instead of deep object manipulation.`,
    tags: ['Pinia', 'Vue', 'State Management', 'Normalization'],
  },
  {
    id: 'react-6',
    category: 'React & Angular',
    question: 'What is a memory leak risk with RxJS subscriptions, and how do you avoid it?',
    answer: `If you call \`.subscribe()\` manually without cleanup, the subscription stays active even after the component is destroyed. The callback keeps firing (potentially causing errors or preventing GC).

**Three solutions:**

1. **\`async\` pipe** (best) — Angular auto-subscribes and auto-unsubscribes when the component is destroyed. Cleanest, declarative.
   \`\`\`html
   {{ results$ | async }}
   \`\`\`

2. **\`takeUntilDestroyed()\`** (Angular 16+) — pipes the observable to complete on destroy.
   \`\`\`ts
   this.results$.pipe(takeUntilDestroyed()).subscribe(...)
   \`\`\`

3. **Manual cleanup in \`ngOnDestroy\`:**
   \`\`\`ts
   private sub = Subscription.EMPTY;
   ngOnDestroy() { this.sub.unsubscribe(); }
   \`\`\``,
    tags: ['RxJS', 'Memory Leaks', 'Angular', 'Subscriptions'],
  },
  {
    id: 'react-7',
    category: 'React & Angular',
    question: 'How would you scale a WebSocket chat server to multiple instances?',
    answer: `The core problem: each server instance only knows about its own in-memory connection list. A message received on Server 1 won't reach clients connected to Server 2.

**Solution — Redis pub/sub as a broadcast layer:**

1. When Server 1 receives a message from User A, it publishes to a Redis channel
2. All server instances are subscribed to that channel
3. Each instance receives the published message and broadcasts to their local connected clients

This decouples the message broadcasting from the WebSocket server instances, making horizontal scaling possible without any state synchronization between servers.

**In production:** Use Redis Cluster for the pub/sub layer to avoid a single point of failure on the broadcast mechanism.`,
    tags: ['WebSockets', 'Redis Pub/Sub', 'Scaling', 'Real-time'],
  },
  {
    id: 'react-10',
    category: 'React & Angular',
    question: 'Why must you clean up a WebSocket connection in a React useEffect return function?',
    answer: `If you open a WebSocket connection inside a \`useEffect\` but don't close it in the cleanup return function, the connection stays alive even after the component unmounts.

**Why this is a problem:**
1. **Memory / Resource Leaks:** The browser keeps the socket open, consuming server resources.
2. **Ghost Subscriptions:** If you remount the component (or navigate away and back), a *new* socket is opened. Now you have multiple active connections listening to events, leading to duplicate state updates and UI bugs.
3. **React 18 Strict Mode:** React intentionally mounts, unmounts, and remounts components in development specifically to expose these exact missing-cleanup bugs.

**The Fix:**
\`\`\`ts
useEffect(() => {
  const ws = new WebSocket(url);
  // ... setup ...
  return () => {
    ws.close();
    // also clear any pending reconnect timeouts here!
  };
}, []);
\`\`\``,
    tags: ['React', 'useEffect', 'WebSockets', 'Memory Leaks'],
  },
  {
    id: 'react-11',
    category: 'React & Angular',
    question: 'Why normalize state in a frontend store (like Pinia/Redux) instead of nesting objects?',
    answer: `Normalization means storing entities in a flat dictionary by ID (e.g., \`cards: { 'c1': {...} }\`), and using arrays of IDs to represent relationships (e.g., \`column.cardIds = ['c1', 'c2']\`).

**Why this is better than nesting (\`column.cards = [{...}]\`):**
1. **O(1) Updates:** If you need to edit Card C1, you just update \`state.cards['c1']\`. With nested state, you have to deep-search through all columns to find it.
2. **Moving items is cheap:** In a drag-and-drop board, moving a card between columns just means splicing the ID string out of one array and into another. No deep object manipulation.
3. **No duplicate data:** If a user or label belongs to multiple cards, normalization ensures there is only one source of truth. If you update the label color, it instantly updates everywhere.`,
    tags: ['State Management', 'Pinia', 'Redux', 'Normalization'],
  },
  {
    id: 'react-12',
    category: 'React & Angular',
    question: 'How do you efficiently render a list of 100,000 items without freezing the browser?',
    answer: `By using **DOM Virtualization** (also called windowing). Instead of rendering 100,000 DOM nodes (which crashes the browser), you only render the ~20 items that fit on the user's screen.

**How it works:**
1. Create an outer scrollable container with a fixed height.
2. Inside it, create a "phantom" inner div whose height is set to \`totalItems * itemHeight\`. This tricks the browser into showing a proportionally correct scrollbar.
3. Listen to the \`scroll\` event to track \`scrollTop\`.
4. Calculate which items are visible: \`startIndex = Math.floor(scrollTop / itemHeight)\`.
5. Slice the array of data to only render those items, and absolutely position each one at \`top: index * itemHeight\`.

As the user scrolls, the array slice changes, but the total number of DOM nodes stays constant (e.g. 20).`,
    tags: ['Vue', 'React', 'Virtual Scroll', 'Performance'],
  },
  {
    id: 'react-13',
    category: 'React & Angular',
    question: 'When would you reach for useReducer over useState?',
    answer: `You should use \`useReducer\` when state transitions are complex, interdependent, or involve multiple related values changing together. 

For example, in an undo/redo system (the Memento pattern), you have three intertwined states: \`past\`, \`present\`, and \`future\`. 
When you undo, you must pop from \`past\`, overwrite \`present\`, and push to \`future\` simultaneously. Doing this with three separate \`useState\` setters inside a click handler gets tangled fast. \`useReducer\` centralizes this logic into a single, testable, atomic transition.`,
    tags: ['React', 'useReducer', 'State Management', 'Design Patterns'],
  },
  {
    id: 'react-14',
    category: 'React & Angular',
    question: 'Reactive Forms vs. Template-driven forms in Angular — what\'s the real difference?',
    answer: `**Template-driven forms** are declarative (using \`ngModel\` in HTML) and asynchronous under the hood. They are simpler for small, static forms, but hard to unit test because the form model is created implicitly by Angular's directives.

**Reactive Forms** build an explicit, synchronous form model in TypeScript (\`FormGroup\`, \`FormControl\`). You create the instances in code and bind them to the HTML. 

Reactive forms are much better for:
- **Dynamic forms:** Generating fields based on a JSON schema at runtime.
- **Complex validation:** Validating fields against each other (e.g., password matching).
- **Unit testing:** You can test the form logic synchronously without rendering the DOM.`,
    tags: ['Angular', 'Reactive Forms', 'Architecture', 'Validation'],
  },
  {
    id: 'react-15',
    category: 'React & Angular',
    question: 'What is an HTTP Interceptor in Angular, and what are common real-world use cases?',
    answer: `An **HTTP Interceptor** is a function (or class in older Angular versions) that sits between your app and the \`HttpClient\`. It catches every outgoing request and incoming response.

You use interceptors for cross-cutting concerns that apply globally, rather than repeating code in every service.

**Common use cases:**
- **Authentication:** Automatically attaching a JWT Bearer token to the headers of every request.
- **Loading states:** Toggling a global loading spinner when a request starts, and turning it off when it finishes.
- **Global error handling:** Catching \`401 Unauthorized\` responses to automatically redirect the user to the login page, or logging \`500\` errors to Sentry.
- **Caching:** Intercepting GET requests and returning cached data from memory instead of hitting the network.`,
    tags: ['Angular', 'HttpClient', 'Interceptors', 'Architecture'],
  },
  {
    id: 'react-16',
    category: 'React & Angular',
    question: 'How do you prevent multiple simultaneous refresh-token calls if several API requests fail with 401 at the same time?',
    answer: `If three API calls fail simultaneously with a \`401 Unauthorized\`, you don't want three separate \`refreshToken()\` calls racing each other. 

To solve this, use a shared flag and an RxJS \`Subject\` in your interceptor:
1. When the first 401 hits, check \`isRefreshing\`. If \`false\`, set it to \`true\` and start the API call to refresh the token.
2. If another 401 hits while \`isRefreshing\` is \`true\`, do **not** trigger a new refresh. Instead, queue the request by subscribing to a \`refreshTokenSubject\` using \`filter(token => token !== null)\` and \`take(1)\`.
3. Once the active refresh call completes, update the \`refreshTokenSubject\` with the new token. All queued requests will instantly receive it, attach it to their headers, and retry.
4. Set \`isRefreshing\` back to \`false\`.`,
    tags: ['Angular', 'RxJS', 'Interceptors', 'Authentication'],
  },
  {
    id: 'react-17',
    category: 'React & Angular',
    question: 'What is the difference between an Observable and a Promise?',
    answer: `**Promises** resolve once with a single value, and their execution cannot be cancelled.

**Observables** can emit multiple values over time (a stream). They are "lazy", meaning they don't do any work until something subscribes to them. Crucially, they are **cancellable** — you can unsubscribe at any point to stop receiving data and cancel underlying network requests.`,
    tags: ['Angular', 'RxJS', 'Promises', 'Observables'],
  },
  {
    id: 'react-18',
    category: 'React & Angular',
    question: 'Why is unsubscribing important in Angular, and what patterns prevent leaks?',
    answer: `If a component creates a manual RxJS subscription (e.g., to an infinite stream or an event listener) and doesn't unsubscribe when the component is destroyed, that subscription remains active in memory. This causes memory leaks and bug-inducing double executions if the component is re-created later.

**Best Practices:**
- Use the **\`async\` pipe** (\`obs$ | async\`) in templates. It automatically subscribes and safely unsubscribes on destroy.
- Use the **\`takeUntil(this.destroy$)\` pattern**. You create a Subject that emits in \`ngOnDestroy()\`, and pipe your subscriptions through it to kill them cleanly.`,
    tags: ['Angular', 'RxJS', 'Memory Leaks', 'takeUntil', 'Async Pipe'],
  },
  {
    id: 'react-19',
    category: 'React & Angular',
    question: 'What is the difference between Subject, BehaviorSubject, and ReplaySubject?',
    answer: `- **\`Subject\`**: Has no memory of past values. If you subscribe *after* a value was emitted, you miss it. Useful for simple events (like a click stream).
- **\`BehaviorSubject\`**: Always holds exactly one current value. Any new subscriber immediately receives this "latest" value upon subscribing. Useful for state management (like a user profile object).
- **\`ReplaySubject\`**: Can replay a configurable number of past values to new subscribers. Useful when you want to buffer historical events for late-arriving listeners.`,
    tags: ['Angular', 'RxJS', 'Subject', 'State Management'],
  },
  {
    id: 'react-20',
    category: 'React & Angular',
    question: 'What is the difference between switchMap, mergeMap, concatMap, and exhaustMap?',
    answer: `- **\`switchMap\`**: Cancels the previous inner observable and switches to the new one. Best for search-as-you-type or polling where only the latest request matters.
- **\`mergeMap\`**: Runs all inner observables in parallel. Best for firing off multiple independent saves or fetches.
- **\`concatMap\`**: Queues inner observables in order, waiting for one to finish before starting the next. Best when order matters (e.g., sequentially saving chunks of a file).
- **\`exhaustMap\`**: Ignores new emissions while an inner observable is in progress. Best for preventing double form submits (e.g., ignore rapid button clicks until the first API call finishes).`,
    tags: ['Angular', 'RxJS', 'Operators', 'switchMap'],
  },
  {
    id: 'react-21',
    category: 'React & Angular',
    question: 'What is a hot vs. cold observable?',
    answer: `- **Cold Observable**: Starts producing values *only* when subscribed to. Each subscriber gets its own independent execution. (e.g., an \`HttpClient\` GET request — it fires a new network request for every subscriber).
- **Hot Observable**: Produces values regardless of whether there are subscribers, and all subscribers share the same stream of data. (e.g., a stream of \`mousemove\` events, or a \`BehaviorSubject\` holding live crypto prices).`,
    tags: ['Angular', 'RxJS', 'Hot vs Cold', 'Observables'],
  },
  {
    id: 'react-22',
    category: 'React & Angular',
    question: 'How is RxJS similar to how message queues work in backend systems?',
    answer: `Both are built around the concept of handling a stream of events asynchronously over time, decoupling the **producer** of events from the **consumer**. 

In backend systems, a service produces messages to a Kafka or SQS queue, and a worker consumer pulls and processes them. In the frontend, the DOM or an API produces events, and RxJS acts as the stream/queue, letting you map, filter, or combine those events before a component consumes them. Both architectures allow systems to remain responsive under heavy asynchronous load.`,
    tags: ['Angular', 'RxJS', 'System Design', 'Event-Driven'],
  },

  // ── Vue ──────────────────────────────────────────────────────────────────
  {
    id: 'vue-1',
    category: 'Vue',
    question: 'What is the difference between a computed property and a method in Vue?',
    answer: `**Computed properties** are cached based on their reactive dependencies. They will only re-evaluate when some reactive data they depend on changes. 

**Methods** re-run their logic every single time the component re-renders, regardless of whether their inputs changed. 

Use \`computed\` for derived state (like filtering a list or calculating a total) to avoid unnecessary recalculations, and use \`methods\` for actions or event handlers (like submitting a form or clicking a button).`,
    tags: ['Vue 3', 'Computed', 'Methods', 'Performance'],
  },
  {
    id: 'vue-2',
    category: 'Vue',
    question: 'Why extract logic into a composable instead of writing it directly in the component?',
    answer: `Composables (Vue 3's version of React Hooks) allow you to extract stateful logic out of a component. 
- **Reusability**: You can share the exact same logic (like mouse tracking, fetching data, or live timers) across multiple components without mixins or higher-order components.
- **Organization**: You can group related code together instead of scattering it across \`data\`, \`methods\`, and \`mounted\` hooks.
- **Testing**: Composables can be imported and tested in isolation without needing to mount a full component.`,
    tags: ['Vue 3', 'Composition API', 'Composables', 'Architecture'],
  },
  {
    id: 'vue-3',
    category: 'Vue',
    question: 'How do you avoid memory leaks with timers or subscriptions in a component?',
    answer: `Always pair a "start" with a "stop". If you call \`setInterval\` or subscribe to a WebSocket in \`onMounted\` (or inside a composable's setup phase), you must explicitly clear it (e.g., \`clearInterval\`) in the \`onUnmounted\` lifecycle hook. 

If you forget, that interval continues running in the background indefinitely even after the user navigates away from the component, wasting memory and CPU (a memory leak).`,
    tags: ['Vue 3', 'Lifecycle', 'Memory Leaks', 'onUnmounted'],
  },
  {
    id: 'vue-4',
    category: 'Vue',
    question: 'How is Vue\'s reactivity system different from React\'s?',
    answer: `**Vue** uses a proxy-based reactive state model. When you read a reactive property in a template or computed property, Vue tracks that dependency. When you mutate the property directly (e.g., \`state.count++\`), Vue precisely updates only the components and DOM nodes that rely on it.

**React** does not track individual property access. State is immutable, so you must explicitly call a setter (e.g., \`setCount(c + 1)\`). By default, React then re-renders the *entire component tree* from that point downwards, relying on a Virtual DOM diff to figure out what changed, which often requires manual memoization (\`useMemo\`, \`React.memo\`) to optimize.`,
    tags: ['Vue 3', 'React', 'Reactivity', 'Virtual DOM'],
  },
  {
    id: 'vue-5',
    category: 'Vue',
    question: 'What\'s the difference between `watch` and `watchEffect` in Vue 3?',
    answer: `**\`watch\`** requires you to explicitly specify the reactive sources you want to observe. It gives you access to both the old and new values. This makes it perfect for cases where you want precise control, like a debounced search field.

**\`watchEffect\`** automatically tracks any reactive dependencies accessed synchronously inside its callback. It's more concise but less explicit, meaning it might re-run on changes you didn't intend to track if you're not careful.`,
    tags: ['Vue 3', 'watch', 'watchEffect', 'Reactivity'],
  },
  {
    id: 'vue-6',
    category: 'Vue',
    question: 'How do you prevent a race condition where multiple async validation calls are in flight?',
    answer: `If a user types quickly, the network response for "ab" might arrive *after* the response for "abc", incorrectly overwriting the fresh UI with stale data.

To fix this, use an **\`AbortController\`**. Store the controller instance, and whenever a new request is triggered, call \`.abort()\` on the previous controller before creating a new one. In your \`catch\` block, ignore errors named \`AbortError\`.`,
    tags: ['Vue 3', 'Async', 'Race Conditions', 'AbortController'],
  },
  {
    id: 'vue-7',
    category: 'Vue',
    question: 'Explain debouncing vs. throttling.',
    answer: `**Debounce**: Waits for a pause in activity before executing. For example, search-as-you-type or form validation shouldn't fire on every keystroke, but only after the user stops typing for 400ms.

**Throttle**: Ensures a function executes at most once per fixed time interval, regardless of activity. For example, tracking scroll position or window resizing shouldn't fire 1000 times a second, but instead at a steady rate of every 100ms.`,
    tags: ['JavaScript', 'Debounce', 'Throttle', 'Performance'],
  },
  {
    id: 'vue-8',
    category: 'Vue',
    question: 'How do Vue composables compare to React hooks? Any gotchas?',
    answer: `Both extract reusable stateful logic into functions. 

The biggest gotcha/difference is that **React hooks must follow the "Rules of Hooks"** (cannot be called conditionally or in loops) because React tracks them by call order on every render. 

**Vue composables** are only called once during the component's \`setup()\` phase. Vue relies on its Proxy-based reactivity system to track changes, so there are no strict rules about call order, making them generally easier to reason about.`,
    tags: ['Vue 3', 'React Hooks', 'Composables', 'Reactivity'],
  },
  {
    id: 'vue-9',
    category: 'Vue',
    question: 'What is the difference between `ref` and `reactive` in Vue 3?',
    answer: `**\`ref\`** can wrap any value type (primitives like strings/numbers, or objects). You must access and mutate its value using \`.value\` in script (though it unwraps automatically in templates).

**\`reactive\`** only works on object types (objects, arrays, Map, Set). You interact with it directly without \`.value\`. 

Rule of thumb: use \`ref\` for most things to be consistent, and \`reactive\` for logically grouped state objects that you always use together.`,
    tags: ['Vue 3', 'ref', 'reactive', 'State'],
  },
  {
    id: 'vue-10',
    category: 'Vue',
    question: 'Explain the stale-while-revalidate (SWR) caching pattern and its trade-offs.',
    answer: `**Stale-while-revalidate** is a caching strategy where you instantly return cached (potentially stale) data to the UI, while simultaneously kicking off a background request to fetch fresh data. Once the fresh data arrives, you silently update the cache and the UI.

**Trade-off:** You prioritize *perceived performance* (instant UI) over perfect accuracy. This is great for a feed or a dashboard, but inappropriate for a checkout page where showing an outdated bank balance or inventory count could lead to user errors.`,
    tags: ['Caching', 'SWR', 'Performance', 'UX'],
  },
  {
    id: 'vue-11',
    category: 'Vue',
    question: 'Why use exponential backoff instead of fixed-interval retries when an API fails?',
    answer: `If a server is overloaded and dropping requests, thousands of clients retrying at the exact same fixed interval (e.g., every 1 second) will create a **Thundering Herd** problem, further overloading the already struggling server.

**Exponential backoff** spreads out the retries (e.g., 500ms, then 1s, then 2s) and usually adds a bit of randomness (jitter). This gives the server breathing room to recover and spreads the retry traffic over time.`,
    tags: ['System Design', 'Exponential Backoff', 'Retries', 'API'],
  },
  {
    id: 'vue-12',
    category: 'Vue',
    question: 'How does Vue\'s reactivity system work under the hood?',
    answer: `Vue 3 uses ES6 **Proxies**. When you wrap an object in \`reactive()\` or \`ref()\`, Vue returns a Proxy.

When a component renders, it reads properties from that Proxy. The Proxy's \`get\` trap records that the component "depends on" this specific property. 
When you mutate the property later, the Proxy's \`set\` trap fires, looks up all the components that depended on it, and triggers them to re-render. This dependency tracking is entirely automatic and highly granular.`,
    tags: ['Vue 3', 'Reactivity', 'Proxies', 'Under the Hood'],
  },
  {
    id: 'vue-13',
    category: 'Vue',
    question: 'Why use a state management library like Pinia instead of just passing props?',
    answer: `Passing props is fine for parent-to-child data. But when state needs to be shared across deeply nested components or distant siblings (e.g., three separate Kanban columns that all need the master card list), you run into **Prop Drilling** — passing data through components that don't need it, just to get it where it belongs.

Pinia extracts that shared state into a global store. Any component can read or write to it directly, acting as a single source of truth. It also gives you Vue DevTools integration to time-travel debug state mutations.`,
    tags: ['Vue 3', 'Pinia', 'State Management', 'Prop Drilling'],
  },
  {
    id: 'vue-14',
    category: 'Vue',
    question: 'How would you optimize a Vue component that renders 10,000 items (like a giant list or Kanban board)?',
    answer: `You should use **DOM Virtualization** (e.g., using a library like \`vue-virtual-scroller\`). 

Instead of generating 10,000 \`<div>\` elements (which will crash or severely lag the browser), virtualization only renders the handful of items currently visible in the viewport, plus a small buffer. As the user scrolls, it recycles the DOM nodes, swapping out the data inside them.`,
    tags: ['Vue 3', 'Performance', 'Virtualization', 'Large Lists'],
  },

  // ── Python ───────────────────────────────────────────────────────────────
  {
    id: 'python-1',
    category: 'JavaScript & Python', // we can reuse JavaScript for now or change it later. Wait, let's look at categories array at the bottom of the file
    question: 'Why use exponential backoff instead of retrying immediately upon failure?',
    answer: `When a downstream service (like a database or an external API) fails, it's often because it's **overloaded**. 

If your task queue immediately retries the failed job, you are effectively DDoS-ing an already struggling service, creating a **retry storm**. This can turn a minor slow-down into a full outage.

**Exponential backoff** (e.g., waiting 2s, 4s, 8s, 16s...) spaces out the retries. This gives the downstream system crucial breathing room to recover, while still guaranteeing your task will eventually be processed.`,
    tags: ['Python', 'asyncio', 'Task Queue', 'Resilience', 'Retry Storm'],
  },

  // ── DSA ──────────────────────────────────────────────────────────────────
  {
    id: 'dsa-1',
    category: 'DSA',
    question: 'Walk me through how an LRU Cache works internally.',
    answer: `An LRU Cache combines two data structures to achieve O(1) for both get and put:
- **HashMap** — maps keys to linked list nodes for O(1) lookup
- **Doubly Linked List** — maintains access order (head = MRU, tail = LRU)

**On \`get(key)\`:** Look up the node, move it to the head (mark as recently used), return value.

**On \`put(key, value)\`:** If key exists, update and move to head. If new and at capacity: remove the tail node from both the list AND the dict (this is why we store the key inside the node — needed for O(1) dict deletion), then insert the new node at head.

**Sentinel nodes:** Dummy head and tail nodes so every real node always has valid \`.prev\` and \`.next\` — no null checks needed at boundaries.`,
    tags: ['LRU Cache', 'HashMap + DLL', 'O(1)', 'Sentinel Nodes'],
  },
  {
    id: 'dsa-2',
    category: 'DSA',
    question: 'What is the time complexity of a Trie, and why is it used for autocomplete?',
    answer: `**Time complexity:** O(L) for insert, search, and prefix lookup — where L is the word length, completely independent of how many words are stored.

**Why Trie over a hash set:**
- Hash set gives O(1) exact word lookup but cannot efficiently answer "give me all words starting with 'app'" — you'd scan every word: O(N × L)
- Trie traverses to the 'app' node in O(L), then all completions are the sub-tree below it — only exploring the relevant portion

**Autocomplete implementation:** Walk down to the prefix node, then run DFS from there collecting all words where \`is_end_of_word = True\`.

**At scale (Google-style):** Each Trie node caches the top-K most frequent completions. Avoids running full DFS on massive sub-trees for common short prefixes like "a" or "th".`,
    tags: ['Trie', 'Autocomplete', 'O(L)', 'DFS'],
  },
  {
    id: 'dsa-3',
    category: 'DSA',
    question: 'Explain min-heap insert and extractMin from scratch.',
    answer: `A heap is a complete binary tree stored as a flat array. Index math:
- Parent of index \`i\`: \`(i-1) // 2\`
- Left child: \`2i + 1\`, Right child: \`2i + 2\`

**\`insert(val)\`:** Append to end of array, then **bubble up** — swap with parent while smaller than parent. O(log n).

**\`extractMin()\`:** Save root (the minimum). Move the last element to index 0, shrink the array, then **bubble down** — swap with the *smaller* of the two children until the heap property holds. O(log n).

**Building a heap from scratch:** Inserting N elements one-by-one = O(n log n). But \`heapify\` (sifting down from the middle) = O(n). Why? Half the nodes are leaves (0 swaps), a quarter need 1 swap — the geometric series sums to O(n).`,
    tags: ['Heap', 'Binary Tree', 'Bubble Up/Down', 'O(log n)'],
  },
  {
    id: 'dsa-4',
    category: 'DSA',
    question: 'Walk me through Kahn\'s algorithm for topological sort.',
    answer: `Topological sort orders nodes in a DAG so every edge points from an earlier to a later node. Only possible on a **Directed Acyclic Graph** — cycles make it impossible.

**Kahn's BFS algorithm:**
1. Build adjacency list + compute **in-degree** (incoming edges count) for every node
2. Seed a queue with all nodes whose in-degree = 0 (no prerequisites)
3. While queue not empty: pop a node → add to result → for each neighbor, decrement its in-degree → if it hits 0, enqueue it
4. **Cycle detection:** If result length < total node count, a cycle exists (some nodes were never unblocked)

**Time complexity:** O(V + E) — each vertex and edge processed exactly once.

**Real-world uses:** npm dependency resolution, Make build files, database migration ordering, CI/CD pipeline stage ordering.`,
    tags: ["Kahn's Algorithm", 'Topological Sort', 'DAG', 'Cycle Detection'],
  },
  {
    id: 'dsa-5',
    category: 'DSA',
    question: 'What is Union-Find and why do we need both path compression and union by rank?',
    answer: `**Union-Find (Disjoint Set Union)** answers "are these two elements in the same group?" in near-O(1) time, even as elements are incrementally grouped together. Perfect for online connectivity problems.

**\`find(x)\`:** Follow parent pointers to the root. **With path compression:** re-point every node on the path directly to the root — flattening the tree as a side effect. Future \`find\` calls on those nodes are instant.

**\`union(x, y)\`:** Find both roots. **With union by rank:** attach the smaller tree under the root of the larger one, keeping trees shallow from the start.

**Why both optimizations:**
- Union by rank prevents building tall trees during merges
- Path compression heals existing tall trees lazily during lookups
- Either alone gives O(log n). Together: **O(α(n))** — the inverse Ackermann function, effectively constant for any real input size.`,
    tags: ['Union-Find', 'Path Compression', 'Union by Rank', 'O(α(n))'],
  },
  {
    id: 'dsa-6',
    category: 'DSA',
    question: 'Given a list of meeting intervals, find the minimum number of meeting rooms needed.',
    answer: `**Approach: Greedy + Min-Heap**

1. Sort meetings by **start time** (process in chronological order)
2. Push the end time of the first meeting into a min-heap (heap tracks when rooms free up)
3. For each subsequent meeting:
   - If \`heap.min() <= meeting.start\`: the room that frees up soonest is available → \`extractMin()\` and push new end time (reuse the room)
   - Else: all rooms are occupied → push a new end time (new room needed)
4. **Answer:** final heap size = minimum rooms required

**Why a heap:** We constantly need "which room frees up soonest?" — that's exactly what \`extractMin()\` answers in O(log n), instead of scanning all rooms in O(n).

**Example:** \`[[0,30],[5,10],[15,20]]\` → 2 rooms. Meeting [5,10] overlaps with [0,30] (needs new room). Meeting [15,20] can reuse the room freed at 10.`,
    tags: ['Heap', 'Interval Scheduling', 'Greedy', 'Meeting Rooms II'],
  },
  {
    id: 'react-8',
    category: 'React & Angular',
    question: 'What is Teleport in Vue 3 and when would you use it?',
    answer: `\`<Teleport to="body">\` renders a component's output at a different point in the DOM tree while keeping it logically in its original place in the component tree. The component still receives props, emits events, and participates in the parent's lifecycle normally.

**When to use it:**
- **Modals / dialogs** — a parent with \`overflow: hidden\` or a low \`z-index\` can visually clip or bury nested overlays
- **Tooltips / popovers** — need to escape layout constraints
- **Command palettes** — must render on top of everything regardless of where the trigger lives

**The alternative (hacking z-index everywhere)** leads to z-index wars and brittle CSS. Teleport solves this structurally — the DOM output lives at \`<body>\` level, so no parent can clip it.

**Important:** always pair with \`role="dialog"\`, \`aria-modal="true"\`, focus trapping, and Escape-to-close for accessibility.`,
    tags: ['Vue 3', 'Teleport', 'Modals', 'Accessibility'],
  },
  {
    id: 'react-9',
    category: 'React & Angular',
    question: 'What problem do Angular Signals solve compared to Zone.js and RxJS?',
    answer: `**Zone.js issue:** Zone.js monkey-patches browser APIs (like \`setTimeout\` and DOM events) to trigger change detection across the *entire* component tree whenever anything happens. This is wasteful.

**RxJS issue:** RxJS is built for complex asynchronous streams, but using it for simple synchronous state (like a shopping cart total) requires heavy boilerplate (\`BehaviorSubject\`, \`combineLatest\`, \`| async\`).

**Signals solve both:**
1. **Fine-grained reactivity:** A signal tells Angular exactly what changed and where it's used, allowing Angular to update *only* that specific part of the DOM, skipping the rest of the component tree entirely.
2. **Synchronous simplicity:** Signals provide a much simpler API (\`signal()\`, \`computed()\`, \`effect()\`) for state that doesn't involve complex async events.`,
    tags: ['Angular 18', 'Signals', 'Zone.js', 'Reactivity'],
  },
  {
    id: 'dsa-7',
    category: 'DSA',
    question: "Walk me through Dijkstra's algorithm and why it doesn't work with negative edges.",
    answer: `Dijkstra finds the shortest path from a source to all other nodes in a weighted graph with **non-negative** edge weights.

**Algorithm:**
1. Initialize \`distances[start] = 0\`, all others = ∞
2. Push \`(0, start)\` onto a min-heap
3. Pop the smallest \`(dist, node)\`. If already finalized, skip. Otherwise mark it finalized.
4. For each neighbor: if \`dist + edge_weight < distances[neighbor]\`, update and push \`(new_dist, neighbor)\`
5. Repeat until heap is empty

**Why the greedy choice is safe:** Since all edges are non-negative, once a node has the smallest tentative distance among all unvisited nodes, no future path through a more-expensive node could ever beat it.

**Why negative edges break it:** A negative edge could reduce the cost to an already-finalized node, violating the invariant. Use **Bellman-Ford** (O(VE)) for graphs with negative weights.

**Time complexity:** O((V + E) log V) with a binary heap. O(V²) with a plain array scan — actually faster on very dense graphs where E ≈ V².`,
    tags: ['Dijkstra', 'Shortest Path', 'Min-Heap', 'Greedy Invariant'],
  },
  {
    id: 'dsa-13',
    category: 'DSA',
    question: 'Why doesn\'t plain Dijkstra work for the "Cheapest Flights Within K Stops" problem?',
    answer: `Dijkstra's algorithm is greedy: it finalizes the shortest distance to a node the moment it pops it from the priority queue. 

**The Flaw with Constraints:** Dijkstra assumes that once a node's cost is finalized, no other path to it could ever be better. However, a cheaper overall path might exceed the stop limit (K), while a slightly more expensive path uses fewer stops. Dijkstra has no mechanism to reconsider a node based on the *number of edges* used.

**The Fix:** You must modify the priority queue to sort by \`cost\`, but you must ALSO track \`stops\` in the queue. Alternatively, you can drop Dijkstra entirely and use a level-by-level BFS (Bellman-Ford style relaxation), relaxing all edges up to \`K+1\` times. Each round naturally represents one hop.`,
    tags: ['Dijkstra', 'Bellman-Ford', 'Graph Algorithms', 'LeetCode Variants'],
  },
  {
    id: 'dsa-8',
    category: 'DSA',
    question: 'How do you solve the "Number of Islands" problem and what are the trade-offs between DFS and BFS?',
    answer: `The problem asks to count connected components of \`1\`s (land) in a 2D grid.

**Algorithm:** Iterate over every cell in the grid. Whenever you find an unvisited \`1\`, you've found a new island (increment counter). Then, use a traversal (BFS or DFS) to "sink" the entire island (mark all connected \`1\`s as visited or flip them to \`0\`) so they aren't double-counted later.

**DFS vs BFS Trade-offs:**
- **DFS (Recursive):** Much less code. However, the call stack grows up to O(rows × cols) in the worst case (a grid that is entirely land). On very large grids, this causes a Stack Overflow.
- **BFS (Iterative with Queue):** Slightly more boilerplate. Uses an explicit queue (\`collections.deque\`) which lives on the heap, completely avoiding the Stack Overflow risk, though it still takes O(rows × cols) memory worst-case.

**Time/Space:** O(rows × cols) time (each cell visited a constant number of times) and O(rows × cols) space worst-case.

**Other problems in this pattern:** Flood Fill, Rotting Oranges (multi-source BFS), Surrounded Regions, Max Area of Island.`,
    tags: ['Graph Traversal', 'BFS', 'DFS', 'Flood Fill', '2D Grid'],
  },
  {
    id: 'dsa-9',
    category: 'DSA',
    question: 'How do you find the sliding window maximum in O(N) time instead of O(N*K)?',
    answer: `The naive approach (scanning the window of size K for every step) takes O(N*K) time, which is too slow for large windows.

**The O(N) solution uses a Monotonic Deque (Double-Ended Queue):**
1. We store **indices** in the deque (so we know when they fall out of the window).
2. We maintain a strictly decreasing invariant: the values corresponding to the indices in the deque are always strictly decreasing.
3. For each new element:
   - Pop elements from the **back** of the deque if they are smaller than the new element (they are useless because the new element is both larger and more recent, so the older ones can never be the max again).
   - Push the new element's index to the **back**.
   - Pop the **front** of the deque if its index has fallen out of the current sliding window.
4. The **front** of the deque is always the maximum for the current window.

**Why is it O(N) and not O(N*K)?** Although there's a \`while\` loop inside the \`for\` loop, each element is pushed into the deque at most once and popped at most once over the entire run. Therefore, the total number of deque operations is bounded by 2N, making the amortized time O(1) per element, or O(N) overall.`,
    tags: ['Sliding Window', 'Monotonic Deque', 'Amortized Analysis', 'O(N)'],
  },
  {
    id: 'dsa-10',
    category: 'DSA',
    question: 'How do you reconstruct the actual sequence from an LCS DP table, and how does this relate to git diff?',
    answer: `The Longest Common Subsequence (LCS) DP table \`dp[i][j]\` stores the *length* of the LCS up to index \`i\` in string A and \`j\` in string B.

**To reconstruct the actual sequence:**
Start at the bottom-right of the table (\`dp[m][n]\`) and backtrack:
1. If \`A[i-1] == B[j-1]\`: The characters match! This character is part of the LCS. Move diagonally up-left to \`dp[i-1][j-1]\`.
2. If they don't match: Look at the cell above (\`dp[i-1][j]\`) and the cell to the left (\`dp[i][j-1]\`). Move in the direction of the larger value (tracing the path that gave the maximum length).

**Relation to git diff:**
A diff tool compares *lines*, not characters. By running LCS on lines:
- The matched lines (diagonal moves) are **unchanged** context.
- Moving up (\`i-1\`) means a line existed in A but not in the LCS → it was **removed** (\`-\`).
- Moving left (\`j-1\`) means a line existed in B but not in the LCS → it was **added** (\`+\`).

*(Note: Real \`git diff\` uses Myers' algorithm for better performance and human-readable output, but it solves the exact same fundamental sequence-alignment problem).*`,
    tags: ['Dynamic Programming', 'LCS', 'Backtracking', 'Git Diff'],
  },
  {
    id: 'dsa-11',
    category: 'DSA',
    question: 'Why do we need both Path Compression AND Union by Rank in a Disjoint Set (Union-Find)?',
    answer: `Union-Find is used for fast connectivity queries (e.g. "are these two nodes in the same network?").

The basic implementation of finding a root can degenerate into a linked list O(N) if we get an unlucky sequence of merges. We fix this with two optimizations:

1. **Path Compression (flattens during \`find\`):** Every time we walk up the tree to find the root, we re-point all nodes along the path directly to the root. This keeps the tree flat *after* a lookup.
2. **Union by Rank (balances during \`union\`):** When merging two groups, we always attach the smaller tree under the root of the bigger tree. This keeps the tree shallow *from the start*.

**Why both?** Path compression only fixes the tree when you call \`find\`. If you do N \`union\` operations before doing any \`find\`, you could still build an O(N) chain and blow up the stack on the first \`find\`. Union by rank prevents the chain from ever forming in the first place.

Together, they guarantee that operations run in **O(α(N)) amortized time**, where α is the inverse Ackermann function (which is ≤ 5 for any number in the observable universe, making it effectively O(1)).`,
    tags: ['Union-Find', 'Disjoint Set', 'Path Compression', 'Amortized O(1)'],
  },
  {
    id: 'dsa-12',
    category: 'DSA',
    question: 'How do you design an LFU (Least Frequently Used) Cache in O(1) time?',
    answer: `Unlike LRU which only tracks recency, LFU must track both frequency *and* recency (as a tie-breaker). A single hashmap isn't enough.

**The O(1) Solution requires three HashMaps:**
1. \`key_to_val\`: Maps key → value.
2. \`key_to_freq\`: Maps key → current frequency.
3. \`freq_to_keys\`: Maps frequency → an \`OrderedDict\` of keys that currently have this frequency.
*(We also maintain a \`min_freq\` integer to instantly know which frequency bucket to evict from).*

**Why OrderedDict for \`freq_to_keys\`?**
When multiple keys have the same lowest frequency, we must evict the *least recently used* among them. An \`OrderedDict\` gives us O(1) removal of specific keys (when they are promoted to a higher frequency bucket) AND O(1) popping of the oldest key (for eviction tie-breaking).

**On \`get(key)\` or \`put(key, value)\`:**
We look up the key's current frequency, delete it from \`freq_to_keys[old_freq]\`, and insert it into \`freq_to_keys[new_freq]\`. If the old bucket becomes empty and it was the \`min_freq\`, we increment \`min_freq\`. No scanning or sorting is ever required.`,
    tags: ['LFU Cache', 'OrderedDict', 'O(1) Design', 'Multiple HashMaps'],
  },
  {
    id: 'dsa-14',
    category: 'DSA',
    question: 'Why use a Fenwick Tree instead of a simple prefix-sum array when values change often?',
    answer: `A simple prefix-sum array allows for **O(1) range queries** but requires **O(N) time for point updates**, because updating one element means you must recalculate every prefix sum that comes after it. 

If updates happen frequently, this O(N) cost becomes a massive bottleneck.

**The Fenwick Tree (Binary Indexed Tree)** solves this by storing partial sums using a clever bit-manipulation trick (\`i & -i\`). This drops the update time from O(N) to **O(log N)**, while keeping query time at **O(log N)**. It offers a perfect balance for real-time analytics where both updates and queries happen constantly.`,
    tags: ['Fenwick Tree', 'Prefix Sums', 'O(log N)', 'Bit Manipulation'],
  },
  {
    id: 'dsa-15',
    category: 'DSA',
    question: 'Segment Tree vs. Binary Indexed Tree (Fenwick Tree) — what\'s the trade-off?',
    answer: `Both are O(log N) for point updates and range queries, but they solve slightly different scopes of problems:

**Fenwick Tree (BIT):**
- Much simpler to code and uses less memory (array of size N).
- Very fast constant factors due to bit manipulation.
- **Limitation:** Strictly limited to *invertible* operations (like Sum or XOR) because computing a range query relies on prefix subtraction: \`query(L, R) = query(R) - query(L-1)\`. You can't easily do a Range Max query with a basic BIT.

**Segment Tree:**
- More complex to code and uses more memory (array of size 4N).
- **Advantage:** Highly general-purpose. It computes answers by combining distinct segments rather than subtracting prefixes. This allows it to handle non-invertible operations (Min, Max, GCD).
- **Advantage:** Readily supports *Lazy Propagation* for true O(log N) range updates (updating many elements at once).`,
    tags: ['Segment Tree', 'Fenwick Tree', 'Range Queries', 'Data Structures'],
  },
  {
    id: 'dsa-16',
    category: 'DSA',
    question: 'How do you design a data structure that supports adding numbers and finding the median efficiently?',
    answer: `You can solve this using the **Two-Heaps** pattern to achieve \`O(log N)\` inserts and \`O(1)\` median queries.

1. Maintain a **Max-Heap** to store the lower half of the numbers.
2. Maintain a **Min-Heap** to store the upper half of the numbers.

**Insert logic:**
Always push the new number into the Max-Heap (the lower half). To guarantee that every number in the lower half is truly $\\le$ every number in the upper half, immediately pop the top of the Max-Heap and push it into the Min-Heap. 

Finally, balance their sizes: if the Min-Heap has more elements than the Max-Heap, pop the Min-Heap and push back to the Max-Heap. This ensures the Max-Heap always has either the exact same number of elements or exactly one more.

**Find Median:**
- If the heaps are equal in size (even total), the median is the average of both tops.
- If the Max-Heap is larger (odd total), the median is simply the top of the Max-Heap.`,
    tags: ['Two-Heaps', 'Median', 'Streaming Data', 'O(log N)'],
  },
  {
    id: 'dsa-17',
    category: 'DSA',
    question: 'Walk me through why the two-pointer approach works for Trapping Rain Water.',
    answer: `The water trapped above any column is determined by the minimum of the highest walls to its left and right. 

In the two-pointer approach, we maintain a \`left_max\` and \`right_max\`. If the wall at the left pointer is shorter than the wall at the right pointer, we know that \`left_max\` is the limiting factor for the left pointer's water capacity. We don't need to know the exact highest wall on the right, just that it's *at least* as tall as our right pointer, which is already taller than our left side.

Thus, we safely calculate the trapped water for the left pointer and move it inward. This invariant guarantees we never miscalculate.`,
    tags: ['Two-Pointer', 'Invariants', 'Greedy', 'O(1) Space'],
  },
  {
    id: 'dsa-18',
    category: 'DSA',
    question: 'What is the brute-force complexity for Trapping Rain Water, and how do you optimize it?',
    answer: `1. **Brute Force (O(n²))**: For every column, manually scan all the way to the left to find the max, and all the way to the right to find the max.
2. **Precomputed Arrays (O(n) time, O(n) space)**: Do one pass left-to-right to build an array of \`left_max\` values, and one pass right-to-left to build an array of \`right_max\` values. Then do a final pass to calculate water.
3. **Two Pointers (O(n) time, O(1) space)**: Instead of storing arrays, just maintain two running max variables from both ends and process whichever side is currently bounded by the smaller max.`,
    tags: ['Algorithm Design', 'Optimization', 'Time/Space Complexity'],
  },
  {
    id: 'dsa-19',
    category: 'DSA',
    question: 'How does Trapping Rain Water relate to Container With Most Water?',
    answer: `Both problems use the inward-moving two-pointer pattern based on height constraints, but they optimize for different things:

- **Container With Most Water** looks for the *single best pair* of walls to maximize area (\`width × min(height)\`).
- **Trapping Rain Water** sums up trapped water *at every single intermediate position*, bounded by the running maximums on each side.`,
    tags: ['Two-Pointer', 'Pattern Recognition', 'Comparisons'],
  },
  {
    id: 'dsa-20',
    category: 'DSA',
    question: 'How would you extend Trapping Rain Water to a 2D grid (Trapping Rain Water II)?',
    answer: `You generalize the two-pointer boundary into a perimeter of cells around the grid using a **Min-Heap (Priority Queue)**.

You start by pushing all boundary cells into the heap. You always pop the cell with the lowest height (just like moving the smaller of the two pointers). For its unvisited neighbors, the water level is constrained by this cell's height. You calculate any trapped water, mark them visited, push them into the heap with their updated effective boundary height, and repeat. This is essentially a specialized BFS (Dijkstra-like) from the outside in.`,
    tags: ['Graphs', 'BFS', 'Min-Heap', '2D Grids'],
  },
  {
    id: 'dsa-21',
    category: 'DSA',
    question: 'Walk me through merging k sorted lists — what is your approach and its time complexity?',
    answer: `1. Initialize a **Min-Heap** of size \`k\`.
2. Push the *first* element from each of the \`k\` lists into the heap. Store it as a tuple: \`(value, list_index, element_index)\`.
3. Pop the smallest item from the heap and add it to your output.
4. Using the \`list_index\` and \`element_index\` from the popped item, fetch the *next* element from that specific list and push it into the heap.
5. Repeat until the heap is empty.

**Time Complexity:** \`O(N log k)\`, where \`N\` is the total number of elements across all lists. Each of the \`N\` elements is pushed and popped from a heap of size \`k\` exactly once.`,
    tags: ['K-Way Merge', 'Min-Heap', 'Priority Queue', 'O(N log k)'],
  },
  {
    id: 'dsa-22',
    category: 'DSA',
    question: 'Why use a heap for k sorted lists instead of just concatenating everything and sorting?',
    answer: `Concatenating and sorting ignores the fact that each list is *already sorted*. 

A full re-sort costs **\`O(N log N)\`**. 
The heap approach costs **\`O(N log k)\`**.

When \`k\` is small relative to \`N\` (e.g., merging 5 log files containing a billion lines each), \`O(N log 5)\` is astronomically faster than \`O(N log 1,000,000,000)\`.`,
    tags: ['Time Complexity', 'Optimization', 'Sorting', 'K-Way Merge'],
  },
  {
    id: 'dsa-23',
    category: 'DSA',
    question: 'How would you merge k sorted files if they were too large to fit in memory?',
    answer: `This requires an **External Merge Sort**.

Instead of loading all files into memory, you open file streams for each of the \`k\` files. You read just one line (or a small chunk) from each file into the heap. As you pop the smallest item from the heap and stream it directly to an output file, you read the next single line from that specific input file's stream.

The memory footprint remains completely bounded to \`O(k)\` (just the heap and small stream buffers), allowing you to merge files vastly larger than your available RAM.`,
    tags: ['System Design', 'External Sort', 'Streaming', 'Memory Constraints'],
  },
  {
    id: 'dsa-24',
    category: 'DSA',
    question: 'Where does the k-way merge pattern show up in real distributed systems?',
    answer: `It is foundational to processing ordered data at scale:

1. **Log Aggregation:** Stitching together chronological logs from multiple independent servers.
2. **Databases:** The final step of an external sort, or merging query results from multiple sharded/partitioned database nodes (Scatter-Gather).
3. **Kafka/Event Streams:** A consumer reading ordered events from multiple partitions needs a k-way merge to process them in global chronological order.
4. **Distributed Tracing:** Assembling a single timeline of spans from multiple microservices.`,
    tags: ['System Design', 'Distributed Systems', 'Log Aggregation', 'Kafka'],
  },
  {
    id: 'dsa-25',
    category: 'DSA',
    question: 'Implement a Trie with insert, search, and startsWith methods. What is the time complexity?',
    answer: `**Time Complexity:** \`O(L)\` for all three operations, where \`L\` is the length of the word. This is independent of how many millions of words are stored in the Trie.

**Implementation detail:** Each \`TrieNode\` holds a dictionary of children and an \`isEndOfWord\` boolean flag. When searching, if you exhaust the characters of the target word but \`isEndOfWord\` is false, it means the word is only a prefix of another word, and you must return false.`,
    tags: ['Trie', 'Prefix Tree', 'O(L)', 'Data Structures'],
  },
  {
    id: 'dsa-26',
    category: 'DSA',
    question: 'How does a Trie compare to a Hash Set for storing a dictionary of words?',
    answer: `Both provide **\`O(L)\`** time complexity for looking up a word (where \`L\` is word length). 

**Hash Set advantages:** Simpler to implement, uses less memory (usually), and is built into most languages.
**Trie advantages:** The killer feature is the **\`startsWith(prefix)\`** query. A Hash Set cannot efficiently find all words starting with "app"; it would have to scan every single word in the dictionary. A Trie does this trivially in \`O(prefix_length)\`. Tries also easily support retrieving alphabetical ordering.`,
    tags: ['Trie', 'Hash Set', 'Comparisons', 'Prefix Search'],
  },
  {
    id: 'dsa-27',
    category: 'DSA',
    question: 'How would you design an autocomplete feature for a search engine with millions of queries?',
    answer: `A basic Trie works, but at scale you need:

1. **Ranking:** Nodes must store frequency or weight, so \`getSuggestions\` sorts by popularity, not just alphabetically.
2. **Caching:** Cache the top 10 results for very common prefixes (like "how", "what") in Redis or memory, bypassing the Trie traversal entirely.
3. **Offline processing:** Don't update the Trie in real time. Process search logs asynchronously in a MapReduce pipeline and periodically swap out a new, read-only Trie on the frontend servers.
4. **Sharding:** If the Trie is too large for one machine, shard it by the first character (e.g., Server A holds prefixes a-m, Server B holds n-z).`,
    tags: ['System Design', 'Autocomplete', 'Trie', 'Scaling'],
  },
  {
    id: 'dsa-28',
    category: 'DSA',
    question: 'What is the space complexity tradeoff of a Trie, and how do you optimize it?',
    answer: `A standard Trie can be extremely memory-hungry due to the overhead of node objects and pointer dictionaries for *every single character*. A long, unbranched word like "hippopotamus" creates 12 separate nodes.

To optimize this, you use a **Compressed Trie (or Radix Tree)**. In a Radix Tree, any node with only one child is merged with its child. So the entire suffix "ippopotamus" would be stored in a single node, massively reducing memory overhead.`,
    tags: ['Trie', 'Space Complexity', 'Radix Tree', 'Optimization'],
  },
];

// ─── Category config ──────────────────────────────────────────────────────────
const categories: Category[] = ['All', 'JavaScript', 'Python', 'System Design', 'React & Angular', 'Vue', 'DSA'];

const categoryStyles: Record<Exclude<Category, 'All'>, string> = {
  'JavaScript':    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'JavaScript & Python': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Python':        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'System Design': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'React & Angular': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Vue':           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'DSA':           'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// ─── Simple markdown-ish formatter ───────────────────────────────────────────
function formatAnswer(text: string) {
  // Split into paragraphs and render
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-gray-900 dark:text-white mt-3 first:mt-0">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
      return <li key={i} className="ml-4 text-gray-700 dark:text-gray-300">{line.replace(/^[-\d]+[.)]\s/, '')}</li>;
    }
    if (line.startsWith('```')) return null;
    if (line.startsWith('|')) return null; // skip table rows (handled separately)
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1')}</p>;
  });
}

// ─── Accordion Card ───────────────────────────────────────────────────────────
function QACard({ qa }: { qa: QA }) {
  const [open, setOpen] = useState(false);
  const style = categoryStyles[qa.category];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${style}`}>{qa.category}</span>
            {qa.tags.slice(0, 3).map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t}</span>
            ))}
          </div>
          <p className="font-medium text-gray-900 dark:text-white leading-snug">{qa.question}</p>
        </div>
        <span className="text-gray-400 mt-0.5 text-lg select-none">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <div className="font-mono text-xs text-gray-400 mb-3">Strong Answer →</div>
          <div className="space-y-1 text-sm">{formatAnswer(qa.answer)}</div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Interview() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = activeCategory === 'All'
    ? qas
    : qas.filter((q) => q.category === activeCategory);

  const counts: Record<Category, number> = {
    All: qas.length,
    JavaScript: qas.filter((q) => q.category === 'JavaScript').length,
    'JavaScript & Python': qas.filter((q) => q.category === 'JavaScript & Python').length,
    Python: qas.filter((q) => q.category === 'Python').length,
    'System Design': qas.filter((q) => q.category === 'System Design').length,
    'React & Angular': qas.filter((q) => q.category === 'React & Angular').length,
    Vue: qas.filter((q) => q.category === 'Vue').length,
    DSA: qas.filter((q) => q.category === 'DSA').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {qas.length} senior-level Q&As covering language mechanics, system design patterns,
          frontend architecture, and data structures. Each answer is structured for a real interview setting.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat} <span className="opacity-60 ml-1">({counts[cat]})</span>
          </button>
        ))}
      </div>

      {/* Q&A List */}
      <div className="space-y-3">
        {filtered.map((qa) => (
          <QACard key={qa.id} qa={qa} />
        ))}
      </div>

      {/* Footer note */}
      <div className="text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
        Source notes: <Link to="/learning" className="underline hover:text-gray-900 dark:hover:text-white">Engineering Notebook</Link> ·
        Raw markdown in <code className="text-xs">docs/interview/</code>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Category = 'All' | 'JavaScript' | 'JavaScript & Python' | 'Python' | 'System Design' | 'React & Angular' | 'DSA';

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
];

// ─── Category config ──────────────────────────────────────────────────────────
const categories: Category[] = ['All', 'JavaScript', 'Python', 'System Design', 'React & Angular', 'DSA'];

const categoryStyles: Record<Exclude<Category, 'All'>, string> = {
  'JavaScript':    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'JavaScript & Python': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Python':        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'System Design': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'React & Angular': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
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

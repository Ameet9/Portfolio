# Garbage Collection & Memory Leaks in JavaScript

## 1. What is it?
Garbage Collection (GC) is an automated memory management process that identifies and frees up memory allocated to objects that are no longer needed or accessible by the program. A memory leak occurs when a program continuously allocates memory but fails to release it because the GC cannot determine that the memory is no longer needed (usually due to unintentional lingering references).

## 2. Why does it exist?
In low-level languages like C or C++, engineers must manually allocate and deallocate memory (`malloc` and `free`). This manual management is prone to human error, leading to severe bugs like use-after-free, double-free, and memory leaks. Garbage collection exists to abstract away memory management, allowing developers to focus on application logic while the runtime automatically reclaims unused memory, improving developer velocity and application stability.

## 3. How does it work?
JavaScript runtimes (like V8) use an algorithm called **Mark-and-Sweep** for garbage collection.
1. **Roots:** The runtime identifies a set of "roots" (e.g., global objects, active execution context variables).
2. **Mark Phase:** The GC traverses the object graph starting from these roots. Every object it can reach is marked as "alive".
3. **Sweep Phase:** Any memory occupied by objects not marked as "alive" is reclaimed by the runtime.

Modern V8 (Node.js/Chrome) uses a **Generational Garbage Collector** (Orinoco project):
- **Young Generation (Nursery/Intermediate):** Where new objects are allocated. GC runs frequently here (Minor GC) because most objects die young. It uses a copying algorithm (Scavenger).
- **Old Generation:** Objects that survive multiple Minor GCs are promoted here. GC runs less frequently (Major GC) using Mark-Sweep-Compact algorithms to reduce memory fragmentation.

## 4. Real-world analogy
Imagine a busy restaurant. The tables represent memory. 
- Manual memory management is like customers having to clean their own tables before they leave. If they forget, the table remains dirty and unusable forever.
- Garbage collection is like having bussers (the GC). They scan the restaurant, look for tables where customers have paid and left (unreachable objects), and clean them up so new customers can sit. A memory leak happens if a customer leaves their coat on the chair; the busser thinks the customer is coming back (a lingering reference) and leaves the table alone.

## 5. Real-world example
Single Page Applications (SPAs) are prime candidates for memory leaks. When a user navigates from a "Dashboard" view to a "Settings" view, the Dashboard components are destroyed. However, if the Dashboard registered a global event listener (`window.addEventListener('resize', ...)`) and didn't remove it upon destruction, the listener retains a reference to the Dashboard component. The GC cannot clean up the Dashboard, causing a memory leak every time the user visits that view.

## 6. Production example
In a Node.js backend server, memory leaks often occur in caching mechanisms or connection pools. If you implement an in-memory cache using a standard `Map` or `Object` and continuously add data without a TTL (Time-To-Live) or size eviction policy, the cache will grow indefinitely until the Node process crashes with an `Out Of Memory` (OOM) error.

## 7. Minimal implementation
Here is the smallest example of a memory leak via a lingering closure:

```javascript
let theThing = null;
let replaceThing = function () {
  let originalThing = theThing;
  // A closure is created that holds a reference to originalThing
  let unused = function () {
    if (originalThing)
      console.log("hi");
  };
  
  // theThing is replaced, but the old theThing is kept alive 
  // by the lexical environment of the new closure!
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log("message");
    }
  };
};

// Running this repeatedly will consume all memory
setInterval(replaceThing, 1000);
```

## 8. Production implementation
To prevent memory leaks in production caches, use `WeakMap` or implement an LRU (Least Recently Used) cache. `WeakMap` does not prevent its keys from being garbage collected.

```typescript
// Good: Using WeakMap to attach metadata to DOM elements without leaking
class TooltipManager {
  private tooltips = new WeakMap<HTMLElement, { text: string }>();

  addTooltip(element: HTMLElement, text: string) {
    this.tooltips.set(element, { text });
    element.addEventListener('mouseenter', this.show);
  }

  // If the DOM element is removed from the document and has no other references,
  // the entry in the WeakMap is automatically garbage collected!
  
  private show = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const tooltipData = this.tooltips.get(target);
    if (tooltipData) {
      console.log(`Showing tooltip: ${tooltipData.text}`);
    }
  }
}
```

## 9. Failure scenarios
Common causes of memory leaks in JavaScript:
1. **Accidental Global Variables:** Missing `var/let/const` creates properties on the global object which never die.
2. **Forgotten Timers/Intervals:** An active `setInterval` holding references to objects.
3. **Closures:** Keeping outer scope variables alive longer than necessary.
4. **Detached DOM Elements:** Removing a node from the DOM tree but keeping it in a JavaScript variable.

## 10. Debugging
To debug memory leaks:
1. **Chrome DevTools -> Memory Tab:** 
   - Take Heap Snapshots before and after an action (like routing in an SPA).
   - Compare snapshots to see what objects were allocated but not freed (Delta view).
2. **Node.js:**
   - Start node with `--inspect`.
   - Connect Chrome DevTools to the Node process.
   - Use `process.memoryUsage()` to log memory consumption trends over time.

## 11. Performance
Garbage Collection is not free. 
- **Stop-the-World:** During Major GCs, JavaScript execution is paused. If a GC pause takes > 16ms, it causes frame drops (jank) in the browser UI.
- **Memory Bloat:** High memory usage causes the OS to page memory to disk (swap), heavily degrading performance. 
- Modern V8 mitigates this with concurrent marking and parallel sweeping, but large object graphs still incur high GC overhead.

## 12. Security
**Denial of Service (DoS):** An attacker can intentionally trigger memory leaks by sending specific payloads that cause the server to allocate memory it never frees. Once the Node.js process hits the heap limit (default ~1.4GB on 64-bit systems), it crashes, denying service to legitimate users.

## 13. Alternatives
- **Manual Memory Management (C, C++, Zig):** Developer calls `malloc`/`free`. Highest performance, highest risk.
- **Ownership Model (Rust):** The compiler checks lifetimes and inserts memory freeing code at compile time. No GC pauses, memory safe.
- **Automatic Reference Counting (Swift):** Keeps a count of references to an object. Frees immediately when count reaches zero. Cannot handle cyclic references without weak pointers.

## 14. Trade-offs
| Strategy | Pros | Cons |
|---|---|---|
| Garbage Collection (JS, Java, C#) | Memory safe, fast developer velocity, handles cyclic references. | Unpredictable pauses, higher memory footprint. |
| Manual Management (C, C++) | Deterministic performance, low memory footprint. | Memory leaks, segfaults, use-after-free bugs. |
| Ownership (Rust) | Zero-cost abstractions, no GC pauses, memory safe. | Steep learning curve, strict compiler rules. |

## 15. Senior-level thinking
Seniors know that while JS is garbage collected, they still manage memory via architecture.
- **Object Pooling:** In high-frequency allocation scenarios (like game loops or heavy data streams), continuously creating and destroying objects thrashes the GC. Seniors use Object Pools to reuse a pre-allocated set of objects.
- **Memory constraints in Serverless:** Lambda functions have strict memory limits. A small leak that takes days to crash a persistent server will quickly OOM a Lambda that is kept warm and reused for multiple invocations.
- **V8 Engine awareness:** Understanding hidden classes and inline caching to write GC-friendly code (e.g., initializing object properties in the same order so V8 can reuse hidden classes rather than allocating new ones).

## 16. Interview questions
- **Beginner:** What is garbage collection in JavaScript?
- **Intermediate:** How do closures cause memory leaks? Explain mark-and-sweep.
- **Senior:** Describe V8's generational garbage collection. How would you diagnose and fix a memory leak in a Node.js production server?

## 17. Follow-up questions
- *After explaining mark-and-sweep:* "How does mark-and-sweep handle cyclic references compared to reference counting?"
- *After mentioning Heap Snapshots:* "What is a 'Detached DOM Tree' in a heap snapshot, and why is it problematic?"
- *After explaining WeakMap:* "Can you iterate over the keys of a WeakMap? Why or why not?"

## 18. Strong answer
*Question: How do you diagnose a memory leak in Node.js?*
**Strong Answer:** "First, I'd monitor the production metrics (like DataDog or Prometheus) looking for a saw-tooth memory graph that never returns to its baseline. To diagnose, I'd trigger a heap snapshot generation in production using `v8.getHeapSnapshot()` or an APM tool, taking one at baseline and another after the memory has grown. I'd load these into Chrome DevTools and look at the 'Comparison' view, filtering by 'Retained Size' to find the objects hogging memory. Often, this points to un-cleared event listeners, a growing array used as a cache, or a dangling closure. I'd then fix the code by implementing explicit cleanup, TTLs on caches, or using WeakMaps where appropriate."

## 19. Common mistakes
- **Trusting the GC too much:** Thinking "I don't need to worry about memory in JS."
- **Misunderstanding `delete`:** Using the `delete` keyword on object properties disables V8 optimization (hidden classes) and makes things slower. It's often better to set the property to `null` if you want it garbage collected, rather than using `delete`.
- **Not cleaning up after React `useEffect`:** Failing to return a cleanup function in `useEffect` when setting up intervals or subscriptions.

## 20. Practical exercise
Create a simple HTML page with a button that adds elements to a global array. 
1. Open Chrome DevTools Memory tab.
2. Take a snapshot.
3. Click the button 100 times.
4. Take another snapshot.
5. Find your array in the snapshot comparison view. 
6. Now, change the code to empty the array after 50 clicks. Observe how the memory is reclaimed in the next snapshot.

## 21. System-design connection
In distributed systems, memory leaks in a single microservice can cause cascading failures. If a Node.js pod in Kubernetes runs out of memory, the Kubelet will kill it (OOMKilled). While Kubernetes is restarting the pod, traffic shifts to the remaining pods. If those pods are also close to their memory limit, the sudden influx of traffic causes them to OOM crash as well, taking down the entire service. Therefore, setting proper memory `requests` and `limits` in Kubernetes, coupled with health checks, is critical to containing the blast radius of a memory leak.

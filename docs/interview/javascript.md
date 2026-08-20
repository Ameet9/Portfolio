# JavaScript Interview Notes

> Comprehensive interview preparation for Senior JavaScript positions, focusing on language mechanics, memory management, and concurrency.

## Core Mechanics

### 1. The Event Loop & Concurrency
**Question:** Explain how JavaScript handles asynchronous operations despite being single-threaded.
**Strong Answer:** "JS uses an Event Loop concurrency model. The V8 engine has a single Call Stack. When an async operation (like `fetch` or `setTimeout`) is called, it's offloaded to the Web APIs (in browser) or libuv (in Node). Once complete, the callback is pushed to a queue. There are two queues: the Microtask Queue (Promises, `queueMicrotask`, `process.nextTick`) and the Macrotask Queue (`setTimeout`, I/O, UI rendering). When the Call Stack is empty, the Event Loop empties the *entire* Microtask queue first, then executes exactly *one* Macrotask, and repeats. This prevents blocking the main thread while maintaining deterministic execution."

**Follow-up:** What happens if a microtask continually schedules other microtasks?
**Answer:** "It creates an infinite microtask loop, which will block the Event Loop indefinitely. The engine will never reach the macrotask queue or the rendering phase, effectively freezing the UI. This is why you must be careful with recursive Promise chains."

### 2. Closures and Memory
**Question:** What is a closure, and what are its practical use cases and risks?
**Strong Answer:** "A closure is formed when a function retains access to its lexical scope, even when that function is executed outside its original scope. In V8, when a function references a variable from an outer scope, that variable is moved from the stack to the heap to persist. Practical uses include data privacy (emulating private methods before ES2022 private fields), currying, and memoization. The main risk is memory leaks: if the closure is attached to a long-lived object (like a DOM event listener or a global cache) and holds a reference to a large object in its lexical environment, that large object cannot be garbage collected."

### 3. Prototypes and Inheritance
**Question:** How does prototypical inheritance differ from classical inheritance?
**Strong Answer:** "Classical inheritance defines classes as blueprints, and instances are copies of those blueprints. Prototypal inheritance, which JS uses, is about *live object linkage*. Objects inherit directly from other objects via the hidden `[[Prototype]]` property (accessible via `__proto__` or `Object.getPrototypeOf`). When you access a property, the engine traverses this prototype chain. If the prototype is mutated dynamically at runtime, all linked objects immediately reflect the change. ES6 `class` syntax is just syntactic sugar over this prototype chain linkage."

## Memory & Performance

### 4. Garbage Collection
**Question:** How does V8 manage memory, and how do memory leaks occur in modern JS?
**Strong Answer:** "V8 uses a generational Garbage Collector based on the Mark-and-Sweep algorithm. Objects start in the 'Young Generation' (Scavenger GC, fast, minor collections). If they survive, they are moved to the 'Old Generation' (Mark-Sweep-Compact GC, slower, major collections). Modern JS prevents circular reference leaks, but leaks still happen through: 1) Forgotten DOM references (a JS variable holding a removed DOM node), 2) Uncleared event listeners or `setInterval`s, 3) Large objects trapped in closures, and 4) Unbounded caches. Using `WeakMap` or `WeakSet` is a senior-level pattern to attach metadata to objects without preventing their garbage collection."

### 5. `this` Binding
**Question:** Determine the value of `this` in various contexts (Arrow functions vs normal functions).
**Strong Answer:** "In a normal function, `this` is determined by *how* the function is called (the call site). If called as a method (`obj.method()`), it's the object. If called standalone (`func()`), it's the global object (or `undefined` in strict mode). If called with `new`, it's the newly created instance. Arrow functions, however, do not have their own `this` binding. They lexically capture `this` from their enclosing execution context at the time they are *defined*. You cannot override an arrow function's `this` using `bind`, `call`, or `apply`."

## Advanced Patterns

### 6. Throttling vs Debouncing
**Question:** Explain the difference and implement a debounce function.
**Strong Answer:** "Debounce groups a sudden burst of events into a single execution after a specified quiet period (e.g., search autocomplete, waiting for the user to stop typing). Throttle guarantees execution of a function at a regular interval over time, no matter how many times it fires (e.g., scroll event listeners, resizing). 
A debounce implementation:
```javascript
function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}
```"

### 7. ES Modules (ESM) vs CommonJS (CJS)
**Question:** What are the architectural differences between ESM and CJS?
**Strong Answer:** "CommonJS (`require`/`module.exports`) is synchronous and dynamic. Dependencies are resolved at runtime, making static analysis difficult. It was designed for server-side (Node) where files are local. ES Modules (`import`/`export`) are asynchronous and static. The engine builds a dependency graph and parses everything *before* execution. This static nature allows for tree-shaking (dead code elimination) by bundlers like Webpack or Vite. Additionally, ESM uses Top-Level Await, and Node runs ESM in strict mode by default."

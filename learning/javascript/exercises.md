# JavaScript Practical Exercises

> A collection of challenging, senior-level implementation exercises to solidify deep JavaScript knowledge. Do not use external libraries for any of these.

## Exercise 1: Advanced Promise Polyfill

**Task:** Implement a fully compliant `Promise.allSettled` and `Promise.race` polyfill from scratch, assuming only the base `Promise` constructor exists.

**Constraints:**
- Must handle iterables properly (not just arrays).
- Must handle empty iterables according to the spec.
- Must execute concurrently, not sequentially.

## Exercise 2: Memoization with Cache Expiration & WeakMap

**Task:** Create an advanced `memoize` function wrapper.

**Constraints:**
- It should cache the results of the provided function.
- It should support a `ttl` (Time To Live) in milliseconds. If the cache expires, the function must be re-run.
- If the arguments to the function are objects, it must use a `WeakMap` internally to prevent memory leaks if the objects are garbage collected elsewhere.
- It must handle variable lengths of arguments.

## Exercise 3: Custom Event Emitter with Wildcards

**Task:** Build an `EventEmitter` class (similar to Node.js's), but with support for hierarchical wildcard subscriptions.

**Example usage:**
```javascript
const emitter = new EventEmitter();

// Should fire for 'user.login' and 'user.logout'
emitter.on('user.*', (data) => console.log(data));

// Should fire for any event
emitter.on('*', (data) => console.log('Global logger', data));

emitter.emit('user.login', { id: 123 });
```

**Constraints:**
- Implement `on`, `off`, `once`, and `emit`.
- Handlers must run synchronously.
- Handle error isolation (if one listener throws, others should still run).

## Exercise 4: Deep Object Proxy Observer

**Task:** Create an `observe` function that takes an object and a callback. It should return a deeply reactive version of the object. If any nested property is added, modified, or deleted, the callback should fire.

**Constraints:**
- Must use ES6 `Proxy`.
- Must handle deeply nested objects and arrays.
- The callback should receive the `path` of the changed property (e.g., `'user.address.zipCode'`), the `oldValue`, and the `newValue`.

## Exercise 5: Asynchronous Task Scheduler / Concurrency Limiter

**Task:** Build a `TaskScheduler` class that manages asynchronous tasks with a strict concurrency limit.

**Example usage:**
```javascript
const scheduler = new TaskScheduler(2); // Max 2 concurrent tasks

scheduler.add(() => fetch('/api/user/1')).then(console.log);
scheduler.add(() => fetch('/api/user/2')).then(console.log);
scheduler.add(() => fetch('/api/user/3')).then(console.log); // Queued until 1 or 2 finishes
```

**Constraints:**
- It must immediately start tasks up to the concurrency limit.
- As soon as a task finishes, the next queued task must start.
- `add()` must return a Promise that resolves/rejects with the actual task's result.
- Must not cause a stack overflow if millions of fast, synchronous tasks are added (watch out for recursive `then` calls).

## Exercise 6: Recreate React's `useState` (Closure Challenge)

**Task:** Create a standalone rendering loop function that provides a `useState`-like hook.

**Constraints:**
- You must demonstrate how closures store state between function calls.
- `useState` must return `[value, setter]`.
- Calling the setter must trigger a re-execution of the "component" function.
- Support multiple `useState` calls in the same component.

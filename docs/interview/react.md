# React Interview Notes â€” Custom Hooks, Performance, & Patterns

## Custom Hooks & Debouncing

### Q1: "What's the difference between debouncing and throttling?"

**Strong Answer:**
"Both are rate-limiting techniques for function execution, but they work differently:

- **Debounce** delays execution until activity *stops* for a specified period. If new activity happens before the delay expires, the timer resets. Perfect for search-as-you-type: we only fire the API call after the user pauses typing (e.g., 400ms of silence).

- **Throttle** ensures a function executes at most once per interval, regardless of how many times it's triggered. Good for scroll/resize handlers where you want periodic updates, not silence-based triggering.

```
User types:  r - e - a - c - t - [pause 400ms]
Debounce:    [---reset---reset---reset---reset---] â†’ fires ONCE with 'react'
Throttle:    [fire 'r'] ---- [fire 'rea'] ---- [fire 'react']
```

I'd use debounce for search inputs and throttle for scroll position tracking."

---

### Q2: "Why did you use IntersectionObserver instead of an onScroll listener for infinite scroll?"

**Strong Answer:**
"Performance. Scroll event listeners fire on *every* pixel of scrolling â€” potentially 60+ times per second. Each handler execution can force synchronous layout recalculation if you read element positions (e.g., `getBoundingClientRect()`), causing jank.

IntersectionObserver is browser-optimized and asynchronous. It uses internal compositor-level tracking and only fires a callback when a target element's visibility *actually changes* relative to a root. This means:
1. Zero main-thread work during normal scrolling
2. No need for manual `getBoundingClientRect()` calculations
3. Built-in threshold control (fire at 10% visible, 50% visible, etc.)
4. Proper cleanup via `observer.disconnect()`

The only time I'd use a scroll listener instead is if I need continuous position data (e.g., a parallax effect), but for 'has the user reached the bottom?' IntersectionObserver is strictly better."

---

### Q3: "How do you avoid a memory leak in a useEffect that sets a timeout or listens to an event?"

**Strong Answer:**
"Always return a cleanup function from `useEffect`. React calls this cleanup:
1. Before the effect re-runs (when dependencies change)
2. When the component unmounts

```tsx
useEffect(() => {
  const timer = setTimeout(() => doSomething(), 1000);
  return () => clearTimeout(timer);  // cleanup
}, [dependency]);

useEffect(() => {
  const observer = new IntersectionObserver(callback);
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();  // cleanup
}, []);
```

Without cleanup, the timer/observer continues running after unmount, referencing stale state or trying to update an unmounted component. In development with StrictMode, React intentionally mounts â†’ unmounts â†’ remounts to help catch these leaks early."

---

### Q4: "How would you handle out-of-order API responses?"

**Strong Answer:**
"This is a real problem with debounced search. If the user types 'rea' â†’ waits â†’ types 'react', two API calls fire. If the 'react' response arrives *before* the 'rea' response (due to network variance), the UI would briefly show correct results, then overwrite them with stale 'rea' results.

Two solutions:

1. **AbortController** (preferred): Create a new AbortController for each request, and abort the previous one in the useEffect cleanup:
```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => { if (e.name !== 'AbortError') throw e; });
  return () => controller.abort();
}, [debouncedQuery]);
```

2. **Request ID tracking**: Increment a counter on each request; only update state if the response's ID matches the latest counter value. Simpler but doesn't actually cancel the network request (wastes bandwidth)."

---

### Q5: "Why extract this into a custom hook instead of writing the logic inline?"

**Strong Answer:**
"Three reasons:
1. **Reusability** â€” `useDebounce` can be used in any component needing debounced values (search bars, form validation, auto-save). Without the hook, you'd copy-paste the useState + useEffect + setTimeout pattern everywhere.
2. **Separation of concerns** â€” The component focuses on *what* to render; the hook encapsulates *when* a value should update. This makes both easier to read and modify independently.
3. **Testability** â€” You can unit test the hook in isolation using `renderHook` from React Testing Library, without needing to render any UI component. This is much faster and more reliable than testing through the full UI."

---

## Custom Hooks & Pagination Patterns

### Q6: "What is a custom hook, and when would you write one?"

**Strong Answer:**
"A custom hook is simply a JavaScript function whose name starts with `use` and that calls other React hooks internally. It allows you to extract and reuse stateful logic across multiple components.

I write custom hooks when I notice multiple components needing the same non-visual behavior. For example: `useInfiniteScroll`, `useLocalStorage`, `useWindowSize`, or `useAuth`. By extracting this logic, the components stay focused on *rendering*, while the hook handles the *behavior*."

---

### Q7: "How would you prevent duplicate API calls if the sentinel element triggers the observer twice quickly?"

**Strong Answer:**
"This is a common issue with `IntersectionObserver` — rapid scrolling can fire the callback multiple times before the first API request finishes.

You must guard the fetch logic with an `isLoading` state (either a state variable or a `useRef`). Before fetching, check `if (isLoading) return;`. Set it to true when the fetch starts, and false in a `finally` block when it ends. This ensures only one page is requested at a time."

---

### Q8: "How is infinite scroll different from pagination with 'Next' buttons?"

**Strong Answer:**
"From an API and data-fetching perspective, they are identical. Both rely on offset/limit or cursor-based paginated endpoints.

The difference is purely UX and trigger mechanism. Standard pagination uses a manual click event to replace the current list of items. Infinite scroll uses an automatic scroll event (or IntersectionObserver) to *append* to the current list of items. Appending is critical — if you replace the list, the user loses their scroll position and the UX breaks."


---

## RxJS & Angular Patterns

### Q9: "What is the difference between switchMap, mergeMap, concatMap, and exhaustMap?"

**Strong Answer:**
"These are all RxJS higher-order mapping operators — they each take a value from an outer observable and map it to an inner observable. The difference is in how they handle a new outer emission arriving while an inner observable is still in flight.

- switchMap: Cancels the previous inner observable and starts a new one. Best for search-as-you-type — you always want the latest result, not a stale old one.
- mergeMap: Runs all inner observables concurrently without cancellation. Good for independent parallel requests.
- concatMap: Queues emissions. Each inner observable must complete before the next one starts. Good for ordered operations like chained API calls.
- exhaustMap: Ignores new emissions while one inner observable is still active. Perfect for form submission buttons — it prevents double-submitting if the user clicks twice."

---

### Q10: "What is a memory leak risk with RxJS subscriptions, and how do you avoid it?"

**Strong Answer:**
"If you call `.subscribe()` manually without ever calling `.unsubscribe()`, the subscription remains active even after the component is destroyed. The callback will keep firing (and trying to update destroyed component state), which can cause errors and prevent garbage collection.

Solutions:
1. The async pipe (`| async` in templates) — Angular automatically subscribes and unsubscribes when the component is destroyed. This is the cleanest approach.
2. `takeUntilDestroyed()` (Angular 16+) — pipes the observable to complete automatically when the component is destroyed.
3. Store the Subscription in a variable and call `this.sub.unsubscribe()` inside `ngOnDestroy()`."

---

## WebSockets & Real-Time Patterns

### Q11: "WebSockets vs. polling vs. Server-Sent Events — when would you use each?"

**Strong Answer:**
"These are three different solutions to the 'push data to the browser' problem, with different trade-offs:

- **Polling** — The client repeatedly asks the server 'anything new?' on a timer (e.g. every 3s). Simple to implement with a normal REST endpoint, but wasteful: most requests return nothing. Use it only when real-time latency doesn't matter and implementation simplicity does.

- **Server-Sent Events (SSE)** — A persistent HTTP connection where the server can push events to the client, but the client cannot send data back over the same connection. Perfect for one-directional feeds: live scores, stock price updates, log streaming. Simpler than WebSockets and automatically reconnects.

- **WebSockets** — A persistent, full-duplex (bidirectional) connection. Either side can send data at any time. Necessary for chat apps, collaborative editing, or multiplayer games where the client also sends frequent data. More complex to implement and scale."

---

### Q12: "How would you scale a WebSocket chat server to multiple instances?"

**Strong Answer:**
"This is the core challenge. Each server instance only knows about its own in-memory list of connected clients. If user A sends a message and lands on Server 1, but user B is connected to Server 2, B never receives the message.

The fix is a **pub/sub broadcast layer** shared between all server instances. Redis pub/sub is the standard solution: when Server 1 receives a message from user A, it publishes the message to a Redis channel. All server instances are subscribed to that channel, so each one receives the published message and broadcasts it to their local connected clients."

---

## Vue / Frontend State Management

### Q13: "When would you reach for Pinia instead of just component state?"

**Strong Answer:**
"Component state (ref/reactive) is the right default when state is truly local to one component and its direct children. Pinia is the right move when:
1. Multiple unrelated components need to read or mutate the same data (e.g., a Kanban board where Column A and Column B both need the cards list).
2. State needs to survive component unmount/remount cycles.
3. The mutation logic is complex enough to benefit from being centralized, named, and independently testable \u2014 a Pinia action is much easier to unit test than an event emitted three levels deep through components."

---

### Q14: "Why normalize state instead of nesting objects?"

**Strong Answer:**
"Nested state creates two problems:
1. **Expensive updates**: if cards are nested inside columns as full objects, moving a card means finding and splicing the object out of one column's array and pushing it into another \u2014 O(n) search operations on nested structures.
2. **Duplication risk**: if the same card is referenced in multiple places (e.g., a 'favorites' view), you have two copies that can drift out of sync.

Normalization fixes both: store cards by ID in a flat lookup object (`cards: { 'c1': {...} }`), and have columns only store arrays of IDs. Moving a card is now two cheap array operations: splice one ID out, push it into another. This is the same reasoning as database normalization \u2014 avoid storing the same fact in two places."

---

### Q15: "What is optimistic UI, and what is the risk?"

**Strong Answer:**
"Optimistic UI means updating the local state immediately when a user takes an action \u2014 before the server has confirmed the operation succeeded \u2014 to make the app feel instant.

The risk: the server might reject the operation (validation error, network failure, conflict). You must handle this failure case by rolling back the UI to its previous state and showing the user an error. If you don't handle rollback, the UI lies \u2014 it shows a state that doesn't match reality.

The pattern: snapshot state before the action, apply the optimistic update, wait for the server response. On failure, restore the snapshot."

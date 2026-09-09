# React Interview Notes — Custom Hooks, Performance, & Patterns

## Custom Hooks & Debouncing

### Q1: "What's the difference between debouncing and throttling?"

**Strong Answer:**
"Both are rate-limiting techniques for function execution, but they work differently:

- **Debounce** delays execution until activity *stops* for a specified period. If new activity happens before the delay expires, the timer resets. Perfect for search-as-you-type: we only fire the API call after the user pauses typing (e.g., 400ms of silence).

- **Throttle** ensures a function executes at most once per interval, regardless of how many times it's triggered. Good for scroll/resize handlers where you want periodic updates, not silence-based triggering.

```
User types:  r - e - a - c - t - [pause 400ms]
Debounce:    [---reset---reset---reset---reset---] → fires ONCE with 'react'
Throttle:    [fire 'r'] ---- [fire 'rea'] ---- [fire 'react']
```

I'd use debounce for search inputs and throttle for scroll position tracking."

---

### Q2: "Why did you use IntersectionObserver instead of an onScroll listener for infinite scroll?"

**Strong Answer:**
"Performance. Scroll event listeners fire on *every* pixel of scrolling — potentially 60+ times per second. Each handler execution can force synchronous layout recalculation if you read element positions (e.g., `getBoundingClientRect()`), causing jank.

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

Without cleanup, the timer/observer continues running after unmount, referencing stale state or trying to update an unmounted component. In development with StrictMode, React intentionally mounts → unmounts → remounts to help catch these leaks early."

---

### Q4: "How would you handle out-of-order API responses?"

**Strong Answer:**
"This is a real problem with debounced search. If the user types 'rea' → waits → types 'react', two API calls fire. If the 'react' response arrives *before* the 'rea' response (due to network variance), the UI would briefly show correct results, then overwrite them with stale 'rea' results.

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
1. **Reusability** — `useDebounce` can be used in any component needing debounced values (search bars, form validation, auto-save). Without the hook, you'd copy-paste the useState + useEffect + setTimeout pattern everywhere.
2. **Separation of concerns** — The component focuses on *what* to render; the hook encapsulates *when* a value should update. This makes both easier to read and modify independently.
3. **Testability** — You can unit test the hook in isolation using `renderHook` from React Testing Library, without needing to render any UI component. This is much faster and more reliable than testing through the full UI."

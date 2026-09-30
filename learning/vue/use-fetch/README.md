# Vue 3 `useFetch` Composable

This project demonstrates a robust, production-ready `useFetch` composable in Vue 3. It utilizes the Composition API to create a reactive data-fetching layer with advanced capabilities.

## Key Concepts

1. **SWR Pattern (Stale-While-Revalidate)**: The composable uses a module-level `Map` to cache API responses. When a previously fetched URL is requested again, the cached (stale) data is returned instantly while a background request (revalidate) is triggered to fetch fresh data.
2. **Ref vs Reactive**: In Vue 3, `ref` is used for single primitive or object values, requiring `.value` access. `reactive` is used for objects. This project uses `ref` for `data`, `error`, and `isFetching` to easily unpack them from the composable and replace the entire object reference upon successful fetch. We also use `MaybeRefOrGetter` (or `toValue()`) to support passing reactive URL references to the composable.
3. **Exponential Backoff**: When a fetch fails, the composable retries up to 3 times, exponentially increasing the wait time between attempts (e.g., 1s, 2s, 4s). This prevents overwhelming a struggling server.
4. **AbortController**: Used to cancel in-flight HTTP requests if the URL changes before the fetch completes, or if the component unmounting triggers `onCleanup`. This prevents memory leaks and race conditions (where an older, slower request overwrites a newer request).

## Architecture

- `src/composables/useFetch.ts`: The core composable logic containing reactive state, caching, fetching, retries, and cancellation.
- `src/App.vue`: The UI layer consuming the composable. It allows changing the URL to test caching, cancellation, and deliberate breaking of the URL to observe the retry logic.

## How to Run

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open your browser to the local URL provided.

## Interview Q&A

**Q: Why use a module-level variable for cache instead of putting it inside the composable?**
A: A module-level variable is instantiated once when the module is imported. This allows the cache to be shared across multiple components that import and use `useFetch`. If it were inside the composable function, every component would get its own isolated cache, defeating the purpose of a global SWR cache.

**Q: Explain how `watchEffect` and `onCleanup` help prevent race conditions in this composable.**
A: `watchEffect` automatically tracks reactive dependencies (like the `url` computed property). When the URL changes, the `watchEffect` callback is re-run. Before it re-runs, the `onCleanup` callback from the *previous* execution is called. In our composable, `onCleanup` triggers `controller.abort()`. This cancels the in-flight fetch request of the old URL. So, if a user clicks "Next" rapidly 5 times, the first 4 requests are aborted, and only the 5th request resolves and updates the state.

**Q: How does exponential backoff improve system resilience?**
A: If a server is down or overloaded, immediately retrying a failed request repeatedly can exacerbate the issue (a "thundering herd" problem). Exponential backoff adds a progressively longer delay between retries, giving the server time to recover.

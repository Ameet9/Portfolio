# React Hooks Mini-Library

This project is a demonstration of how to build and integrate custom React hooks into a robust application. It features a searchable, infinitely-scrolling GitHub repository explorer.

## Why Custom Hooks Matter

Custom hooks are a foundational pattern in React that provide several critical benefits:
1. **Reusability**: Encapsulate complex logic (like debounce timers or IntersectionObservers) and reuse it across multiple components without duplicating code.
2. **Separation of Concerns**: Keep UI components focused on rendering by extracting data fetching, state management, and side effects into hooks.
3. **Testability**: Independent hooks are easier to test in isolation without rendering complex UI hierarchies.

## Custom Hooks in this Project

### 1. `useDebounce`

**Purpose:** Prevents rapid-fire operations (like API calls) while a user is typing.

**How it works:**
```text
User types "r"  -> Timer starts (500ms)
User types "re" -> Previous timer cancelled. New timer starts (500ms)
User types "rea"-> Previous timer cancelled. New timer starts (500ms)
[500ms elapses] -> Debounced value updates to "rea" -> API call triggered
```
By delaying the update of the search query until the user stops typing for 500ms, we drastically reduce API requests and avoid rate limits.

### 2. `useInfiniteScroll`

**Purpose:** Automatically loads the next page of results as the user scrolls to the bottom of the list.

**Architecture Decision (IntersectionObserver vs Scroll Events):**
We use `IntersectionObserver` instead of listening to window `scroll` events.
- **Scroll Events** fire synchronously on the main thread, dozens of times a second. They require manual calculations of viewport height and element positions, which are prone to bugs and cause UI jank.
- **IntersectionObserver** delegates the visibility calculation to the browser, which processes it asynchronously off the main thread. It is significantly more performant and requires less code.

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features
- **AbortController:** Stale API requests are automatically aborted if a new search starts before the previous one finishes.
- **Strict TypeScript:** Full type safety for API responses and component props.
- **Error Handling:** Graceful error states and empty results handling.

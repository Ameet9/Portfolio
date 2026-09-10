# Infinite Scroll with React Custom Hook

This project demonstrates a reusable `useInfiniteScroll` custom hook in React, built using TypeScript and Vite. It fetches data from the JSONPlaceholder API.

## Why IntersectionObserver over Scroll Event Listeners?

Traditionally, infinite scrolling was implemented by attaching an event listener to the window's `scroll` event. This approach has a major drawback: the scroll event fires hundreds of times per second, which can cause severe performance issues (jank) on the main thread if the handler isn't carefully debounced or throttled.

`IntersectionObserver` is a modern Web API designed specifically for this use case. It allows you to configure a callback that is executed asynchronously whenever a target element (often called a "sentinel" or "loader") intersects with a specified ancestor element or the viewport. This is far more performant because the browser optimizes the intersection calculations off the main thread.

## Hook Composition and Cleanup

The `useInfiniteScroll` hook is designed for maximum reusability:
- It takes a callback function (`onIntersect`) that should be triggered when the sentinel element comes into view.
- It returns a `ref` that you attach to the sentinel element in your JSX.
- Internally, it manages the lifecycle of the `IntersectionObserver`. It establishes the observer when the component mounts or the target changes, and crucially, it **disconnects** the observer when the element unmounts or before a new observer is created. This prevents memory leaks and ensures that detached elements aren't still being monitored.

## How to Run It

Since this project is set up with Vite:

1.  Make sure you have Node.js installed.
2.  Navigate to the project directory: `cd d:\Portfolio\learning\react\infinite-scroll`
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run dev`

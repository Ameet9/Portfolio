# Live Market Ticker Dashboard

A real-time market ticker dashboard built using Vue 3 Composition API and Vite.

## Overview
This project displays a simulated real-time stock ticker, illustrating the use of Vue 3 Composables for state management, component lifecycles, and reactivity.

## Architecture
- **Vue 3 Composition API**: Used for concise and reusable logic.
- **Composables (`useTicker`)**: Encapsulates the state (stocks list) and behavior (setInterval) independent of the view, allowing any component to reuse this live-data logic.
- **Sparklines**: Dynamically generated SVG `<polyline>` elements mapping historical data to graph coordinates.

## How to run
1. Navigate to the directory: `cd d:\Portfolio\learning\vue\market-ticker`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Key Concepts
- **Vue 3 Composition API vs Options API**: The Composition API provides better logic reuse (via composables) and type inference compared to the Options API.
- **`computed` vs methods**: Methods re-evaluate on every render. `computed` properties are cached based on their reactive dependencies, making them more performant.
- **`onUnmounted` for cleanup**: Prevents memory leaks. Without clearing the `setInterval` in `onUnmounted`, the background task would continue running even if the component is destroyed.

## Interview Q&A

**Q: Why use the Composition API over the Options API?**
A: Composition API groups logic by feature rather than lifecycle hooks (data, methods, mounted). It makes code easier to read and enables extracting logic into reusable composables (like our `useTicker`), solving the limitations of mixins from Vue 2.

**Q: Explain the difference between `computed` and `methods`. When would you use one over the other?**
A: `computed` properties are cached based on their reactive dependencies and only re-evaluate when those dependencies change. `methods` run every time a re-render occurs. Use `computed` for derived state, and `methods` for event handlers or logic that takes parameters.

**Q: Why is `onUnmounted` important in this dashboard?**
A: Our composable sets up a `setInterval`. If the component consuming `useTicker` is removed from the DOM, the interval will continue to execute, leading to memory leaks and errors. `onUnmounted` allows us to run `clearInterval` exactly when the component is torn down.

**Q: How do you build the sparkline using SVG?**
A: We store the last 20 price points in an array. Using a helper function, we normalize these values against the min and max to calculate X and Y coordinates within an SVG viewBox, passing the resulting string to the `points` attribute of a `<polyline>`.

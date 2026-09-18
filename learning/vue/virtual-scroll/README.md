# Vue.js Virtual Scroll List

## Overview
This project demonstrates a virtual scroll list in Vue 3. It efficiently renders a list of 10,000 items by only rendering the DOM nodes that are currently visible within the scrolling container, plus a small buffer. 

## Architecture
- **Vue 3 (Composition API)**: Provides a declarative way to track `scrollTop` and compute visible boundaries.
- **Virtualization Logic**:
  - `viewport`: The outer container with fixed height and `overflow-y: auto`. This element listens for the `@scroll` event.
  - `list-phantom`: An invisible inner div with a total height equal to `totalItems * itemHeight`. This provides the correct scrollbar dimensions.
  - `list-content`: A div that holds the visible items. It is translated vertically (`translateY`) based on the current scroll position so that it aligns correctly in the viewport.

## How to Run
1. Navigate to the project directory: `cd d:\Portfolio\learning\vue\virtual-scroll`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Key Concepts
### Why Virtualization?
A naive implementation using `v-for` to render 10,000 items would create 10,000 DOM nodes simultaneously. This causes massive memory consumption, slow rendering times, and a highly unresponsive UI (jank). The browser struggles to recalculate styles and layout for so many elements at once.

Virtualization solves this by reducing the DOM node count drastically. Instead of 10,000 items, the DOM only contains roughly the number of items that fit on screen (e.g., 20) plus a small buffer (e.g., 5). The visible slice of data is updated dynamically as the user scrolls, creating the illusion of a massive list while keeping DOM operations minimal and constant.

### The Power of Computed Properties
Vue's `computed` properties make virtualization extremely efficient. The `visibleItems` computed property automatically slices the massive array based on `startIndex` and `endIndex`. Because it reacts instantly to changes in `scrollTop` (which updates `startIndex` and `endIndex`), Vue automatically diffs and re-renders only the necessary changes. The array slice operation is fast, and re-rendering a 20-item list takes virtually zero time compared to managing 10,000 nodes.

## Interview Q&A

**Q: How does a virtual scroller handle dynamic item heights?**
A: This implementation assumes fixed row heights for simplicity and performance (`startIndex = Math.floor(scrollTop / itemHeight)`). If heights are dynamic, the problem is harder. You would typically need to maintain an array of cached heights and positions for each item, update them as items render, and use binary search to determine the `startIndex` based on the current `scrollTop`.

**Q: Why do we need the phantom div?**
A: Without the phantom div, the scroll container would only know about the handful of rendered DOM nodes, meaning the scrollbar would reflect a tiny list. The phantom div fakes the total height of all 10,000 items, forcing the browser to create a scrollbar with the correct proportions and scroll range.

**Q: What is the purpose of the buffer?**
A: The buffer renders a few extra items above and below the currently visible viewport. This ensures that when the user scrolls quickly, there's no momentary blank space before Vue has a chance to render the newly visible items.

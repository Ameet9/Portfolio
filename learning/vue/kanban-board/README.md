# Vue 3 Kanban Board

A lightweight, performant Kanban board built with Vue 3, Vite, and Pinia. This project demonstrates state management, component composition, and HTML5 drag-and-drop APIs.

## Architecture & State Management
- **Vue 3 (Composition API)**: Provides a reactive, scalable architecture.
- **Pinia**: Centralized state management replacing traditional prop drilling.
  - State is normalized: columns store references (`cardIds`) to a dictionary of cards.
  - `$subscribe`: Used to persist the entire state to `localStorage` automatically on every mutation.
- **HTML5 Native Drag and Drop**: Avoids heavy external drag-and-drop libraries, relying on native `draggable`, `@dragstart`, `@drop`, and `@dragover.prevent`.

## How to Run
1. Navigate to the project directory
2. Run `npm install`
3. Run `npm run dev`

## Key Concepts & Interview Q&A

**Q: How does Vue's reactivity system work compared to React?**
A: Vue uses Proxies to intercept property access and track dependencies dynamically. When a reactive property is read during a component's render, Vue tracks it. When it mutates, Vue triggers an update. React relies on immutable state and manual dependency arrays (like `useEffect`), scheduling re-renders via `setState`.

**Q: Why use Pinia instead of prop drilling?**
A: Prop drilling (passing state down multiple layers of components) leads to tightly coupled components and makes refactoring difficult. Pinia provides a globally accessible store, so deeply nested components can read or mutate state directly without intermediate components needing to know about it.

**Q: Explain the native HTML5 drag and drop API.**
A: The HTML5 DnD API involves setting the `draggable="true"` attribute on elements you want to move. Key events include `dragstart` (where you set data using `event.dataTransfer.setData`), `dragover` (must call `event.preventDefault()` to allow dropping), and `drop` (where you read data via `event.dataTransfer.getData`).

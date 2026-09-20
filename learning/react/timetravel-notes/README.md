# React TimeTravel Notes

A simple notes application demonstrating how to build an undo/redo "time travel" feature using React's `useReducer` and the Memento pattern.

## Architecture

This project is built with React and Vite. It utilizes `useReducer` to manage the complex state required for a history mechanism (undo/redo), and a debounced `useState` for live typing to optimize performance and prevent the history from recording every single keystroke.

## How to Run

1. Open a terminal in the project directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

## Key Concepts

### `useReducer` vs `useState` for Complex State

When managing state that relies on multiple sub-values (like `past`, `present`, and `future`) that must update in sync, `useReducer` is often preferable to `useState`.
If we used `useState` for each array and the present string, an undo action would require updating three separate state variables, potentially causing multiple renders or race conditions. `useReducer` allows us to encapsulate the logic for transitioning between these complex states into a single, predictable function.

### The Memento Pattern

The Memento design pattern provides the ability to restore an object to its previous state (undo via rollback). In this app, our `past` array acts as a collection of Mementos (snapshots of the `present` state). When we undo, we pop the most recent Memento from the `past` and set it as the new `present`.

### Clearing the `future` Array on Edit

When a user undoes some actions (moving states to the `future` array) and then types new text (creates a new edit), the existing `future` is no longer valid because a new timeline has diverged. If we didn't clear the `future` array, redoing would apply changes that overwrite the user's new timeline with an unrelated, stale timeline. 

### Why Debouncing is Necessary

If we dispatched an `EDIT` action on every `onChange` event (every keystroke), the `past` array would fill up with thousands of single-character changes. Hitting "Undo" would undo a single character at a time, which is not how users expect text editors to work.
Debouncing waits for a pause in typing (e.g., 500ms) before committing the current text to the history. This ensures that words or phrases are grouped into meaningful "chunks" for the undo/redo functionality.

## Interview Q&A

**Q: How do you handle race conditions or frequent updates in React when building text editors?**
A: You use debouncing or throttling. In React, you typically hold the raw, frequent updates in a local `useState` (so the UI updates instantly) and use a `useEffect` with a timeout to propagate the value to the heavier state/store after the user stops typing.

**Q: Can we implement this with just `useState`?**
A: Yes, you can maintain a single state object `{ past: [], present: '', future: [] }` and update it with `setState`. However, as the logic for `UNDO`, `REDO`, and `EDIT` grows more complex, writing out `setState((prev) => ({...}))` becomes cumbersome. `useReducer` keeps the component clean and the business logic testable.

**Q: Why not store the entire state history instead of just the present string?**
A: For a simple text app, storing strings is fine. But for large applications, storing full copies of the state can be memory-intensive. Libraries like Immer can help by using structural sharing, or we can use the Command pattern (storing the diffs/actions instead of the whole state).

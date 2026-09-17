# Vue 3 Command Palette

An elegant, accessible, and fast command palette for Vue 3 applications, modeled after tools like macOS Spotlight or Raycast.

## Overview

This project implements a globally accessible Command Palette using Vue 3 Composition API. Pressing `Ctrl+K` or `Cmd+K` from anywhere in the app reveals a modal allowing users to search and execute a predefined list of actions.

## Architecture

- **Composable Pattern**: Core logic is encapsulated within `useCommandPalette.js`. This manages state (search query, selected index, open/closed status), holds the command list, and houses the fuzzy search and navigation logic.
- **Component Presentation**: `CommandPalette.vue` is a dumb presentation component (mostly) that handles styling, transitions, and user interactions, emitting events to the composable via `App.vue`.
- **Teleport**: The palette is teleported to the `body` tag so it renders on top of the entire DOM, unaffected by parent CSS `overflow: hidden` or `z-index` stacking contexts.

## How to Run

1. Make sure you have Node.js installed.
2. Open a terminal in this directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to the local URL provided (usually `http://localhost:5173`).

## Key Concepts

- **Composition API**: Allows separating concerns logically rather than by component lifecycle hooks.
- **Teleport**: `<Teleport to="body">` ensures the modal backdrop covers the entire viewport.
- **Global Event Listeners**: Listening on the `window` object requires setup in `onMounted` and cleanup in `onUnmounted` to prevent memory leaks.
- **Fuzzy Matching**: A custom subsequence search algorithm enables finding matches even if characters are separated, such as typing "db" to find "Dashboard".
- **Keyboard-driven UI**: Users can navigate the entire interface using just the arrow keys and Enter.

## Interview Q&A

**1. Why use `<Teleport>` for modals/palettes?**
Using `<Teleport>` moves the actual DOM elements to the end of the `<body>` tag. This solves common CSS problems where parent elements with `overflow: hidden`, `position: relative`, or low `z-index` inadvertently clip or hide the modal. 

**2. How do you prevent memory leaks with global event listeners in Vue?**
Whenever you use `window.addEventListener()` inside a component, you must also call `window.removeEventListener()` in the `onUnmounted` lifecycle hook, passing the exact same function reference.

**3. Explain how fuzzy matching works in this implementation.**
The custom `fuzzyMatch` function checks if the query characters appear in the target string in the correct order, but not necessarily consecutively (subsequence matching). It uses two pointers to iterate through the text and query. If characters match, the query pointer advances. A match is found if the query pointer reaches the end of the query string.

**4. How is focus management handled?**
The search input needs focus as soon as the palette opens so the user can start typing immediately. This is achieved using a template `ref` on the input, and watching the `isOpen` prop. When `isOpen` becomes true, `nextTick()` is used to wait for the DOM to update, and then `.focus()` is called on the input ref.

**5. How does arrow key navigation work with categorized lists?**
The data structure is a flat array (`filteredCommands`). This allows a simple modulo-based increment/decrement for `selectedIndex`. To display categories, a computed property (`groupedCommands`) transforms the flat array into grouped sections for the template, while preserving the global index for each item so that the visual "selected" state remains synchronized with the flat list's selected index.

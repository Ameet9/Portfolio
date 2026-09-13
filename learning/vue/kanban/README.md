# Vue 3 Kanban Board

A complete drag-and-drop Kanban board built with Vue 3 and Pinia.

## Features
- **Composition API**: Uses Vue 3's `<script setup>` syntax.
- **Pinia State Management**: Centralized store for columns and cards.
- **Normalized State**: Cards and columns are normalized to avoid deep nesting.
- **Drag-and-Drop**: Native HTML5 drag-and-drop implementation.
- **Undo Functionality**: Keeps history of state snapshots to revert actions.
- **Local Storage Persistence**: Automatically saves board state to `localStorage`.

## Why State Normalization Matters
In this project, the Pinia store normalizes state into a flat `cards` object and an array of `columns` that hold arrays of `cardIds`.

Benefits:
1. **Performance**: Moving a card involves a simple array splice to update IDs, avoiding deep cloning of nested card objects.
2. **Simplified Lookups**: Fetching a card by its ID is an O(1) operation (`cards[cardId]`).
3. **Easier Updates**: When a card's content changes, it only needs to be updated in one place (the flat `cards` map).

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

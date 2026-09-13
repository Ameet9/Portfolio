<template>
  <header class="header">
    <h1>Kanban Board</h1>
    <button 
      class="undo-btn" 
      @click="store.undo()" 
      :disabled="store.history.length === 0"
    >
      Undo
    </button>
  </header>
  
  <main class="board">
    <Column 
      v-for="column in store.columns" 
      :key="column.id" 
      :columnId="column.id" 
    />
  </main>
</template>

<script setup>
import { useKanbanStore } from './stores/kanban'
import Column from './components/Column.vue'

const store = useKanbanStore()
</script>

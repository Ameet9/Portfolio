<template>
  <div class="app-container">
    <h1>Vue 3 Command Palette</h1>
    <p class="hint">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>Cmd</kbd> + <kbd>K</kbd> to open the command palette.</p>
    <button @click="toggle" class="btn">Open Command Palette</button>

    <CommandPalette
      :is-open="isOpen"
      v-model:query="query"
      v-model:selected-index="selectedIndex"
      :grouped-commands="groupedCommands"
      @close="close"
      @execute="executeSelected"
      @move-down="moveDown"
      @move-up="moveUp"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import CommandPalette from './components/CommandPalette.vue'
import { useCommandPalette } from './composables/useCommandPalette.js'

const {
  query,
  selectedIndex,
  isOpen,
  groupedCommands,
  moveDown,
  moveUp,
  executeSelected,
  close,
  toggle
} = useCommandPalette()

// Global Keyboard Listener
function handleKeydown(e) {
  // Toggle on Ctrl+K or Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault() // prevent default browser behavior
    toggle()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hint {
  color: #888;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

kbd {
  background-color: #333;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 0.9rem;
  color: #fff;
  border: 1px solid #555;
  box-shadow: 0 2px 0 #111;
}

.btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #45a049;
}
</style>

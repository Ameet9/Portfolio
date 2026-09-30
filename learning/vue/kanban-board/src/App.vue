<template>
  <div class="app-container">
    <header>
      <h1>Vue 3 Kanban Board</h1>
    </header>
    <main>
      <Board />
    </main>
  </div>
</template>

<script setup lang="ts">
import Board from './components/Board.vue';
import { useKanbanStore, setupKanbanSubscription } from './store/kanban';

const store = useKanbanStore();
setupKanbanSubscription(store);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  padding: 1rem;
  background: #333;
  color: #fff;
}
main {
  flex: 1;
  overflow-x: auto;
  padding: 1rem;
}
</style>

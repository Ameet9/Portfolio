<template>
  <div class="board">
    <Column 
      v-for="col in store.columns" 
      :key="col.id" 
      :column="col"
    />
  </div>
</template>

<script setup lang="ts">
import Column from './Column.vue';
import { useKanbanStore } from '../store/kanban';

const store = useKanbanStore();
</script>

<style scoped>
.board {
  display: flex;
  gap: 1rem;
  height: 100%;
  align-items: flex-start;
}
</style>

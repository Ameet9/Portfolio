<template>
  <div 
    class="card" 
    draggable="true" 
    @dragstart="onDragStart"
  >
    {{ card.title }}
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { type Card as CardType } from '../store/kanban';

const props = defineProps({
  card: {
    type: Object as PropType<CardType>,
    required: true
  },
  columnId: {
    type: String,
    required: true
  }
});

function onDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: props.card.id,
      fromColId: props.columnId
    }));
  }
}
</script>

<style scoped>
.card {
  background: #fff;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  cursor: grab;
}
.card:active {
  cursor: grabbing;
}
</style>

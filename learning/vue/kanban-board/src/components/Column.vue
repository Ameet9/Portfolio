<template>
  <div 
    class="column" 
    @dragover.prevent 
    @drop.prevent="onDrop"
  >
    <h2>{{ column.title }}</h2>
    <div class="cards">
      <Card 
        v-for="cardId in column.cardIds" 
        :key="cardId" 
        :card="store.cards[cardId]" 
        :columnId="column.id"
      />
    </div>
    <div class="add-card">
      <input 
        v-model="newTitle" 
        @keyup.enter="addNewCard"
        placeholder="Add a card..." 
      />
      <button @click="addNewCard">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import Card from './Card.vue';
import { useKanbanStore, type Column as ColumnType } from '../store/kanban';

const props = defineProps({
  column: {
    type: Object as PropType<ColumnType>,
    required: true
  }
});

const store = useKanbanStore();
const newTitle = ref('');

function addNewCard() {
  if (newTitle.value.trim()) {
    store.addCard(props.column.id, newTitle.value.trim());
    newTitle.value = '';
  }
}

function onDrop(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain');
  if (data) {
    const { cardId, fromColId } = JSON.parse(data);
    if (fromColId !== props.column.id) {
      store.moveCard(cardId, fromColId, props.column.id);
    }
  }
}
</script>

<style scoped>
.column {
  background: #ebecf0;
  border-radius: 4px;
  width: 300px;
  min-height: 200px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}
h2 {
  font-size: 1rem;
  margin: 0.5rem;
}
.cards {
  flex: 1;
  min-height: 50px;
}
.add-card {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.add-card input {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-card button {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}
</style>

<template>
  <div 
    class="column" 
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop="onDrop"
  >
    <h2>{{ column.title }}</h2>
    
    <div class="cards">
      <Card 
        v-for="cardId in column.cardIds" 
        :key="cardId" 
        :cardId="cardId" 
        :columnId="columnId"
      />
    </div>

    <div class="add-card">
      <input 
        type="text" 
        v-model="newCardTitle" 
        placeholder="+ Add a card..." 
        @keyup.enter="handleAddCard"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKanbanStore } from '../stores/kanban'
import Card from './Card.vue'

const props = defineProps({
  columnId: {
    type: String,
    required: true
  }
})

const store = useKanbanStore()
const column = computed(() => store.columns.find(c => c.id === props.columnId))

const isDragOver = ref(false)
const newCardTitle = ref('')

const onDrop = (event) => {
  isDragOver.value = false
  const cardId = event.dataTransfer.getData('cardId')
  const fromColumnId = event.dataTransfer.getData('fromColumnId')
  
  if (cardId && fromColumnId) {
    store.moveCard(cardId, fromColumnId, props.columnId)
  }
}

const handleAddCard = () => {
  if (newCardTitle.value.trim()) {
    store.addCard(props.columnId, newCardTitle.value)
    newCardTitle.value = ''
  }
}
</script>

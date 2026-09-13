<template>
  <div 
    class="card" 
    draggable="true" 
    @dragstart="onDragStart"
  >
    <h3>{{ card.title }}</h3>
    <p v-if="card.description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useKanbanStore } from '../stores/kanban'

const props = defineProps({
  cardId: {
    type: String,
    required: true
  },
  columnId: {
    type: String,
    required: true
  }
})

const store = useKanbanStore()
const card = computed(() => store.cards[props.cardId])

const onDragStart = (event) => {
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('cardId', props.cardId)
  event.dataTransfer.setData('fromColumnId', props.columnId)
}
</script>

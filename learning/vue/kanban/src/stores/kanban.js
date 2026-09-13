import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useKanbanStore = defineStore('kanban', () => {
  // State is NORMALIZED.
  // Instead of deeply nested objects (e.g., columns containing cards),
  // we keep cards in a flat dictionary and columns only store references (IDs) to cards.
  // WHY NORMALIZED:
  // - Moving a card is just an array splice on column.cardIds, avoiding deep object copying.
  // - Looking up a card by ID is O(1) instead of searching through all columns.
  // - Simplifies history/undo because state updates are shallow and scoped.
  
  const columns = ref([
    { id: 'todo', title: 'To Do', cardIds: ['c1', 'c2'] },
    { id: 'inprogress', title: 'In Progress', cardIds: ['c3'] },
    { id: 'done', title: 'Done', cardIds: [] }
  ])

  const cards = ref({
    'c1': { id: 'c1', title: 'Set up project', description: 'Scaffold Vue app' },
    'c2': { id: 'c2', title: 'Design store', description: 'Normalize state' },
    'c3': { id: 'c3', title: 'Build Card component', description: 'Draggable' }
  })

  const history = ref([]) // Stack of previous states for undo

  // Save snapshot of current state to history
  const saveSnapshot = () => {
    history.value.push({
      columns: JSON.parse(JSON.stringify(columns.value)),
      cards: JSON.parse(JSON.stringify(cards.value))
    })
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('kanban-state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        columns.value = parsed.columns
        cards.value = parsed.cards
      } catch (e) {
        console.error('Failed to parse kanban state from localStorage', e)
      }
    }
  }

  const persist = () => {
    localStorage.setItem('kanban-state', JSON.stringify({
      columns: columns.value,
      cards: cards.value
    }))
  }

  // Watch for changes and persist automatically
  watch([columns, cards], () => {
    persist()
  }, { deep: true })

  const moveCard = (cardId, fromColumnId, toColumnId) => {
    if (fromColumnId === toColumnId) return // No move needed

    saveSnapshot()

    const fromCol = columns.value.find(c => c.id === fromColumnId)
    const toCol = columns.value.find(c => c.id === toColumnId)

    if (fromCol && toCol) {
      // Remove from old column
      fromCol.cardIds = fromCol.cardIds.filter(id => id !== cardId)
      // Add to new column
      toCol.cardIds.push(cardId)
    }
  }

  const undo = () => {
    if (history.value.length === 0) return

    const previousState = history.value.pop()
    columns.value = previousState.columns
    cards.value = previousState.cards
  }

  const addCard = (columnId, title) => {
    if (!title.trim()) return

    saveSnapshot()

    const newId = 'c' + Date.now()
    cards.value[newId] = { id: newId, title: title.trim(), description: '' }
    
    const col = columns.value.find(c => c.id === columnId)
    if (col) {
      col.cardIds.push(newId)
    }
  }

  // Initial load
  loadFromStorage()

  return {
    columns,
    cards,
    history,
    moveCard,
    undo,
    addCard
  }
})

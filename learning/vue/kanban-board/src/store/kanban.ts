import { defineStore } from 'pinia'

export interface Card {
  id: string;
  title: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

interface State {
  columns: Column[];
  cards: Record<string, Card>;
}

export const useKanbanStore = defineStore('kanban', {
  state: (): State => {
    const saved = localStorage.getItem('kanban-store');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing localStorage", e);
      }
    }
    return {
      columns: [
        { id: 'todo', title: 'To Do', cardIds: ['c1'] },
        { id: 'in-progress', title: 'In Progress', cardIds: [] },
        { id: 'done', title: 'Done', cardIds: [] }
      ],
      cards: {
        'c1': { id: 'c1', title: 'Initial task' }
      }
    };
  },
  actions: {
    addCard(columnId: string, title: string) {
      const id = 'c' + Date.now();
      this.cards[id] = { id, title };
      const column = this.columns.find(c => c.id === columnId);
      if (column) {
        column.cardIds.push(id);
      }
    },
    moveCard(cardId: string, fromColId: string, toColId: string, toIndex?: number) {
      const fromCol = this.columns.find(c => c.id === fromColId);
      const toCol = this.columns.find(c => c.id === toColId);
      if (!fromCol || !toCol) return;

      const idx = fromCol.cardIds.indexOf(cardId);
      if (idx === -1) return;

      fromCol.cardIds.splice(idx, 1);
      
      if (toIndex !== undefined) {
        toCol.cardIds.splice(toIndex, 0, cardId);
      } else {
        toCol.cardIds.push(cardId);
      }
    }
  }
});

// Setup subscriber logic to save to localStorage
export function setupKanbanSubscription(store: ReturnType<typeof useKanbanStore>) {
  store.$subscribe((mutation, state) => {
    localStorage.setItem('kanban-store', JSON.stringify(state));
  });
}

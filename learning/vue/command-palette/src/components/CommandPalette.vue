<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="cmdk-overlay" @click="close" role="dialog" aria-modal="true">
        <div class="cmdk-modal" @click.stop>
          <input
            ref="inputRef"
            type="text"
            v-model="query"
            class="cmdk-input"
            placeholder="Type a command or search..."
            @keydown.down.prevent="moveDown"
            @keydown.up.prevent="moveUp"
            @keydown.enter.prevent="executeSelected"
            @keydown.esc.prevent="close"
          />
          
          <div class="cmdk-results">
            <div v-if="groupedCommands.length === 0" class="cmdk-empty">
              No results found for "{{ query }}"
            </div>
            
            <div v-for="group in groupedCommands" :key="group.category" class="cmdk-group">
              <div class="cmdk-category">{{ group.category }}</div>
              <div
                v-for="item in group.items"
                :key="item.id"
                class="cmdk-item"
                :class="{ 'is-selected': selectedIndex === item.globalIndex }"
                @click="executeItem(item)"
                @mouseenter="selectedIndex = item.globalIndex"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  query: { type: String, required: true },
  selectedIndex: { type: Number, required: true },
  groupedCommands: { type: Array, required: true }
})

const emit = defineEmits([
  'update:query', 
  'update:selectedIndex', 
  'close', 
  'execute', 
  'move-down', 
  'move-up'
])

const inputRef = ref(null)

// Focus input when opened
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    inputRef.value?.focus()
  }
})

// Sync query back to parent
const query = computed({
  get: () => props.query,
  set: (val) => emit('update:query', val)
})

const selectedIndex = computed({
  get: () => props.selectedIndex,
  set: (val) => emit('update:selectedIndex', val)
})

function close() {
  emit('close')
}

function moveDown() {
  emit('move-down')
}

function moveUp() {
  emit('move-up')
}

function executeSelected() {
  emit('execute')
}

function executeItem(item) {
  selectedIndex.value = item.globalIndex
  executeSelected()
}
</script>

<script>
import { computed } from 'vue'
export default {
  name: 'CommandPalette'
}
</script>

<style scoped>
.cmdk-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 9999;
}

.cmdk-modal {
  width: 100%;
  max-width: 600px;
  background-color: #242424;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
}

.cmdk-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 1.1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #333;
  color: #fff;
  outline: none;
  box-sizing: border-box;
}

.cmdk-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.cmdk-empty {
  padding: 24px;
  text-align: center;
  color: #888;
}

.cmdk-group {
  margin-bottom: 8px;
}

.cmdk-category {
  padding: 8px 20px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  font-weight: 600;
}

.cmdk-item {
  padding: 12px 20px;
  cursor: pointer;
  color: #ccc;
  transition: background-color 0.1s;
}

.cmdk-item.is-selected {
  background-color: #3a3a3a;
  color: #fff;
}
</style>

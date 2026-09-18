<template>
  <div class="virtual-scroll-container">
    <h1>Vue Virtual Scroll List</h1>
    <!-- Outer viewport container with fixed height and overflow auto -->
    <div class="viewport" @scroll="onScroll" ref="viewport">
      <!-- Phantom div to fake the total height of all items -->
      <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
      <!-- Content container that shifts vertically based on scroll -->
      <div class="list-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="list-item"
          :style="{ height: itemHeight + 'px', lineHeight: itemHeight + 'px' }"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const items = ref([]);
const itemHeight = 35; // Fixed height of each item
const containerHeight = 500; // Height of the scrollable container
const buffer = 5; // Extra items to render above/below viewport to prevent blank spaces

// Generate 10,000 items on mount
onMounted(() => {
  const newItems = [];
  for (let i = 0; i < 10000; i++) {
    newItems.push({ id: i, text: `Item ${i}` });
  }
  items.value = newItems;
});

const scrollTop = ref(0);
const viewport = ref(null);

// Update scrollTop on scroll event
const onScroll = (e) => {
  scrollTop.value = e.target.scrollTop;
};

// Total height of the virtual list
const totalHeight = computed(() => items.value.length * itemHeight);

// Calculate start index based on scroll position
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / itemHeight);
  return Math.max(0, index - buffer);
});

// Calculate end index based on visible area
const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  return Math.min(items.value.length - 1, startIndex.value + visibleCount + 2 * buffer);
});

// Slice the full array to get only the visible items
const visibleItems = computed(() => {
  return items.value.slice(startIndex.value, endIndex.value + 1);
});

// Calculate vertical offset to correctly position the visible items
const offsetY = computed(() => {
  return startIndex.value * itemHeight;
});
</script>

<style scoped>
.virtual-scroll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}

.viewport {
  width: 300px;
  height: 500px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}

.list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.list-item {
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  background: white;
}

.list-item:hover {
  background: #f0f0f0;
}
</style>

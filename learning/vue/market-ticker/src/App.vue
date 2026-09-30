<template>
  <div class="dashboard">
    <h1>Live Market Ticker</h1>
    
    <div class="controls">
      <button @click="togglePause">
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
    </div>

    <div class="grid">
      <div v-for="stock in stocks" :key="stock.symbol" class="card">
        <div class="header">
          <h2>{{ stock.symbol }}</h2>
          <span :class="getPriceClass(stock)">
            ${{ stock.price.toFixed(2) }}
            <span v-if="getChange(stock) > 0">▲</span>
            <span v-else-if="getChange(stock) < 0">▼</span>
            <span v-else>−</span>
          </span>
        </div>
        
        <div class="sparkline-container">
          <svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              fill="none"
              :stroke="getChange(stock) >= 0 ? '#4caf50' : '#f44336'"
              stroke-width="2"
              :points="getPolylinePoints(stock.history)"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTicker, type Stock } from './composables/useTicker';

const { stocks, isPaused, pause, resume } = useTicker();

const togglePause = () => {
  if (isPaused.value) {
    resume();
  } else {
    pause();
  }
};

const getChange = (stock: Stock) => {
  if (stock.history.length < 2) return 0;
  const current = stock.history[stock.history.length - 1];
  const prev = stock.history[stock.history.length - 2];
  return current - prev;
};

const getPriceClass = (stock: Stock) => {
  const change = getChange(stock);
  if (change > 0) return 'text-green';
  if (change < 0) return 'text-red';
  return '';
};

// Calculate SVG polyline points based on history
const getPolylinePoints = (history: number[]) => {
  if (history.length === 0) return '';
  
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1; // prevent div by 0
  
  // viewBox is 0 0 100 30
  // Map index to X (0 to 100)
  // Map value to Y (30 to 0) -> inverted because SVG Y goes down
  
  const stepX = 100 / Math.max(19, history.length - 1);
  
  return history.map((val, index) => {
    const x = index * stepX;
    const normalizedY = (val - min) / range;
    const y = 30 - (normalizedY * 30);
    return `${x},${y}`;
  }).join(' ');
};
</script>

<style scoped>
.dashboard {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.text-green {
  color: #4caf50;
  font-weight: bold;
}

.text-red {
  color: #f44336;
  font-weight: bold;
}

.sparkline-container {
  width: 100%;
  height: 30px;
  margin-top: 10px;
}

.sparkline {
  width: 100%;
  height: 100%;
}
</style>

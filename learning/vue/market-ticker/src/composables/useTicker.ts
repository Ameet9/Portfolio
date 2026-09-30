import { ref, onUnmounted } from 'vue';

export interface Stock {
  symbol: string;
  price: number;
  history: number[];
}

export function useTicker() {
  const stocks = ref<Stock[]>([
    { symbol: 'AAPL', price: 150.0, history: [150.0] },
    { symbol: 'GOOGL', price: 2800.0, history: [2800.0] },
    { symbol: 'MSFT', price: 300.0, history: [300.0] },
    { symbol: 'AMZN', price: 3400.0, history: [3400.0] },
    { symbol: 'TSLA', price: 700.0, history: [700.0] },
  ]);

  const isPaused = ref(false);
  let intervalId: number | null = null;

  const tick = () => {
    if (isPaused.value) return;

    stocks.value.forEach((stock) => {
      // Nudge price by -1% to +1%
      const change = (Math.random() - 0.5) * 0.02;
      const newPrice = stock.price * (1 + change);
      
      stock.price = parseFloat(newPrice.toFixed(2));
      
      // Keep only the last 20 history points for sparkline
      stock.history.push(stock.price);
      if (stock.history.length > 20) {
        stock.history.shift();
      }
    });
  };

  const start = () => {
    if (intervalId === null) {
      intervalId = window.setInterval(tick, 1000);
    }
  };

  const pause = () => {
    isPaused.value = true;
  };

  const resume = () => {
    isPaused.value = false;
  };

  start();

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  return {
    stocks,
    isPaused,
    pause,
    resume
  };
}

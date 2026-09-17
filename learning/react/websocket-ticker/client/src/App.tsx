import { useRef, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

type TickerData = Record<string, number>;

function App() {
  const { status, latestData } = useWebSocket<TickerData>('ws://localhost:8080');
  
  // Ref to store previous prices to determine if price went up or down
  const previousPrices = useRef<TickerData>({});
  const flashingRows = useRef<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    if (latestData) {
      const newFlashing: Record<string, 'up' | 'down'> = {};
      for (const ticker in latestData) {
        const currentPrice = latestData[ticker];
        const previousPrice = previousPrices.current[ticker];
        
        if (previousPrice !== undefined) {
          if (currentPrice > previousPrice) {
            newFlashing[ticker] = 'up';
          } else if (currentPrice < previousPrice) {
            newFlashing[ticker] = 'down';
          }
        }
      }
      flashingRows.current = newFlashing;
      previousPrices.current = latestData;
    }
  }, [latestData]);

  return (
    <div className="container">
      <h1>Live Tickers</h1>
      <div className={`status-badge ${status}`}>
        Status: {status === 'open' ? 'Live' : status === 'connecting' ? 'Reconnecting...' : 'Closed'}
      </div>

      <div className="ticker-grid">
        <div className="ticker-header">
          <span>Ticker</span>
          <span>Price</span>
        </div>
        {!latestData && status === 'connecting' && <div className="loading">Waiting for data...</div>}
        {latestData && Object.entries(latestData).map(([ticker, price]) => {
          const flashClass = flashingRows.current[ticker] || '';
          
          return (
            <div key={ticker} className={`ticker-row flash-${flashClass}`}>
              <span className="ticker-name">{ticker}</span>
              <span className="ticker-price">${price.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';

export interface Stock {
  symbol: string;
  price: number;
  lastPrice: number;
  trend: 'up' | 'down' | 'flat';
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // 8 fake stocks
  private stocks: Stock[] = [
    { symbol: 'AAPL', price: 150.0, lastPrice: 150.0, trend: 'flat' },
    { symbol: 'GOOGL', price: 2800.0, lastPrice: 2800.0, trend: 'flat' },
    { symbol: 'MSFT', price: 300.0, lastPrice: 300.0, trend: 'flat' },
    { symbol: 'AMZN', price: 3400.0, lastPrice: 3400.0, trend: 'flat' },
    { symbol: 'TSLA', price: 700.0, lastPrice: 700.0, trend: 'flat' },
    { symbol: 'META', price: 330.0, lastPrice: 330.0, trend: 'flat' },
    { symbol: 'NFLX', price: 500.0, lastPrice: 500.0, trend: 'flat' },
    { symbol: 'NVDA', price: 220.0, lastPrice: 220.0, trend: 'flat' }
  ];

  // Holds the current state of stocks in a BehaviorSubject
  private stocksSubject = new BehaviorSubject<Stock[]>(this.stocks);

  constructor() {
    // fluctuate prices every 2 seconds
    interval(2000).subscribe(() => {
      this.fluctuatePrices();
    });
  }

  // Exposed observable for components
  getStocks(): Observable<Stock[]> {
    return this.stocksSubject.asObservable();
  }

  private fluctuatePrices(): void {
    const updatedStocks = this.stocks.map(stock => {
      // Random fluctuation between -2 and 2
      const change = (Math.random() * 4) - 2;
      const newPrice = Math.max(0.01, stock.price + change);
      
      let trend: 'up' | 'down' | 'flat' = 'flat';
      if (newPrice > stock.price) {
        trend = 'up';
      } else if (newPrice < stock.price) {
        trend = 'down';
      }

      return {
        ...stock,
        lastPrice: stock.price,
        price: newPrice,
        trend
      };
    });

    this.stocks = updatedStocks;
    this.stocksSubject.next(this.stocks);
  }
}

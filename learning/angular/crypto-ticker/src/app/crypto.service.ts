import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,dogecoin&order=market_cap_desc&per_page=10&page=1&sparkline=false';

  constructor(private http: HttpClient) {}

  getCryptoStream(): Observable<CryptoData[]> {
    // timer(0, 5000) emits immediately, then every 5000ms
    return timer(0, 5000).pipe(
      switchMap(() => this.http.get<CryptoData[]>(this.apiUrl).pipe(
        catchError(err => {
          console.error('API failed, falling back to mock data', err);
          return of(this.getMockData());
        })
      ))
    );
  }

  private getMockData(): CryptoData[] {
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 60000 + (Math.random() * 1000 - 500) },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3000 + (Math.random() * 100 - 50) },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.15 + (Math.random() * 0.02 - 0.01) }
    ];
  }
}

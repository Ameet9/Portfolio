import { Component, OnInit } from '@angular/core';
import { CryptoService, CryptoData } from './crypto.service';
import { Observable } from 'rxjs';
import { startWith, pairwise, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

export interface CryptoDisplay extends CryptoData {
  trend: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  cryptoStream$!: Observable<CryptoDisplay[]>;

  constructor(private cryptoService: CryptoService) {}

  ngOnInit() {
    this.cryptoStream$ = this.cryptoService.getCryptoStream().pipe(
      // Provide an initial empty array so pairwise has a previous value to emit with the first real emission
      startWith([] as CryptoData[]),
      // Pairwise groups the previous and current emissions as an array: [prev, curr]
      pairwise(),
      map(([prev, curr]) => {
        return curr.map(coin => {
          const prevCoin = prev.find(p => p.id === coin.id);
          let trend: 'up' | 'down' | 'flat' = 'flat';
          
          if (prevCoin) {
            if (coin.current_price > prevCoin.current_price) {
              trend = 'up';
            } else if (coin.current_price < prevCoin.current_price) {
              trend = 'down';
            }
          }
          
          return {
            ...coin,
            trend
          };
        });
      })
    );
  }
}

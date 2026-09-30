import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { StockService, Stock } from './stock.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  
  // Exposes filtered stocks for async pipe in the template
  filteredStocks$!: Observable<Stock[]>;

  private destroy$ = new Subject<void>();

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    const stocks$ = this.stockService.getStocks();
    
    // Listen to input changes, adding debounce and distinctUntilChanged
    const search$ = this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$), // Clean up on destroy
      startWith(''),            // Initial empty string
      debounceTime(300),        // Wait 300ms pause in events
      distinctUntilChanged()    // Only if filter text changed
    );

    // Combine stock updates and search query updates
    this.filteredStocks$ = combineLatest([stocks$, search$]).pipe(
      map(([stocks, searchTerm]) => {
        const term = (searchTerm || '').toLowerCase();
        return stocks.filter(stock => stock.symbol.toLowerCase().includes(term));
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

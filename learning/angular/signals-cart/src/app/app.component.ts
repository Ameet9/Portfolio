import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, Product } from './cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cartService = inject(CartService);

  availableProducts: Product[] = [
    { id: 1, name: 'Angular Signals Book', price: 29.99 },
    { id: 2, name: 'TypeScript Course', price: 49.99 },
    { id: 3, name: 'RxJS Masterclass', price: 39.99 }
  ];
  
  discountInput = '';

  addToCart(product: Product) {
    this.cartService.addItem(product);
  }

  removeFromCart(productId: number) {
    this.cartService.removeItem(productId);
  }

  updateQuantity(productId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value)) {
      this.cartService.updateQty(productId, value);
    }
  }

  applyDiscount() {
    this.cartService.applyDiscount(this.discountInput);
  }
}

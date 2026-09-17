import { Injectable, signal, computed, effect } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signals
  cartItems = signal<CartItem[]>([]);
  discountCode = signal<string>('');

  // Computed signals
  subtotal = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
  });

  tax = computed(() => {
    return this.subtotal() * 0.10; // 10% tax
  });

  discountAmount = computed(() => {
    const code = this.discountCode().trim().toLowerCase();
    if (code === 'save10') {
      return this.subtotal() * 0.10; // 10% discount
    }
    return 0;
  });

  total = computed(() => {
    return this.subtotal() + this.tax() - this.discountAmount();
  });

  constructor() {
    // Load from local storage on initialization
    const savedCart = localStorage.getItem('signals_cart');
    if (savedCart) {
      try {
        this.cartItems.set(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
      }
    }

    const savedDiscount = localStorage.getItem('signals_discount');
    if (savedDiscount) {
      this.discountCode.set(savedDiscount);
    }

    // Effect to sync cart to local storage whenever it changes
    effect(() => {
      localStorage.setItem('signals_cart', JSON.stringify(this.cartItems()));
      localStorage.setItem('signals_discount', this.discountCode());
    });
  }

  addItem(product: Product) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.id === product.id);
      if (existingItem) {
        return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...product, quantity: 1 }];
    });
  }

  removeItem(productId: number) {
    this.cartItems.update(items => items.filter(i => i.id !== productId));
  }

  updateQty(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cartItems.update(items => items.map(i => i.id === productId ? { ...i, quantity } : i));
  }

  applyDiscount(code: string) {
    this.discountCode.set(code);
  }
}

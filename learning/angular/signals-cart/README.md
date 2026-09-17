# Angular Signals-Powered Shopping Cart

This project demonstrates how to build a reactive shopping cart in Angular using **Angular Signals**.

## Architecture

This application consists of a standalone `AppComponent` and a `CartService`. The state of the shopping cart is entirely managed by Angular Signals instead of RxJS observables. 

- **State Management**: `CartService` stores the list of items in the cart and a discount code.
- **Derived State**: Computed signals are used for subtotal, tax, discount amount, and total price. These automatically re-evaluate when their dependencies change.
- **Side Effects**: An `effect()` is registered in the service constructor to automatically sync the cart state with `localStorage` whenever any signal changes.

## How to Run

1. Open a terminal in the project directory.
2. Run `npm install` to install the dependencies.
3. Run `npm start` (or `ng serve`) to start the development server.
4. Open your browser and navigate to `http://localhost:4200/` (or whichever port Angular assigns).

## Angular Signals vs RxJS

- **Synchronous vs Asynchronous**: Signals always hold a synchronous, current value. RxJS Observables model a stream of values over time that can be async.
- **Automatic Dependency Tracking**: Signals automatically track which other signals they depend on (`computed()`). Observables require explicit operators like `combineLatest` or `withLatestFrom`.
- **Glitch-free Execution**: Signals guarantee that you never see intermediate, inconsistent states (glitch-free).
- **No Subscriptions**: Signals do not require you to subscribe/unsubscribe to read their values, preventing memory leaks and simplifying components. RxJS requires careful subscription management (e.g., `async` pipe, `unsubscribe()`).

## Key Concepts

- **`signal()`**: Creates a writable signal that holds a value.
- **`computed()`**: Creates a declarative, read-only signal that derives its value from other signals.
- **`effect()`**: A function that runs whenever one or more tracked signals change. It is meant for side effects like logging, DOM manipulation, or saving to `localStorage`.
- **`set()` vs `update()`**: 
  - `.set()` replaces the current value completely.
  - `.update()` computes a new value based on the previous value (e.g., adding an item to an array).

## Interview Q&A

**1. What is an Angular Signal?**
A Signal is a wrapper around a value that notifies interested consumers when that value changes. Signals can contain any value, from simple primitives to complex data structures.

**2. How does `computed()` work?**
`computed()` creates a read-only signal that derives its value from one or more other signals. It is lazily evaluated (only calculates when its value is read) and memoized (caches the result until its dependencies change).

**3. What is the difference between `set` and `update`?**
- `set(value)` directly replaces the value of a writable signal with a new value.
- `update(fn)` takes a callback function that receives the current value and returns a new value, which is useful when the next state depends on the previous state.

**4. When should you use `effect()`?**
`effect()` should be used for operations that must happen as a side effect of a signal changing, and that do not update other signals. Common use cases include syncing data to `localStorage`, custom DOM manipulation, or sending analytics events.

**5. How do Signals improve performance compared to Zone.js?**
Signals give Angular granular knowledge of exactly which parts of the application state have changed and which components depend on them. This allows Angular to update only the specific components that need to change, without having to check the entire component tree like Zone.js does.

# Live Crypto Ticker Dashboard

## Overview
A real-time cryptocurrency dashboard built with Angular 18 that fetches and displays the current prices of popular cryptocurrencies, using RxJS for data stream management.

## Architecture
- **Component (`AppComponent`)**: Responsible for presenting the stream of data. It transforms the incoming data using `pairwise` to determine price trends (up/down/flat) compared to the previous tick.
- **Service (`CryptoService`)**: Uses `HttpClient` and RxJS `timer` + `switchMap` to poll a public API (or fallback mock) every 5 seconds.
- **Async Pipe**: The component template subscribes directly to the observable stream using `| async`, ensuring clean and memory-leak-free subscription management.

## How to Run
1. Navigate to the project directory: `cd d:\Portfolio\learning\angular\crypto-ticker\`
2. Run `npm install` to install dependencies.
3. Run `npm start` (or `ng serve`) to start the development server.
4. Navigate to `http://localhost:4200/`.

## Key Concepts

### RxJS Mapping Operators
- **`switchMap`**: Maps each value to an inner observable, subscribes to it, and **cancels** the previous subscription if a new value arrives. Perfect for HTTP requests where you only care about the latest response (e.g., polling, search typeahead).
- **`mergeMap`**: Maps to an inner observable and **merges** all concurrent subscriptions. Use this when you want all requests to complete and don't care about order (e.g., saving multiple independent files).
- **`concatMap`**: Maps to an inner observable and processes them **sequentially**, waiting for each to complete before starting the next. Ideal when order matters (e.g., strict sequence of database updates).

### Hot vs Cold Observables
- **Cold Observables**: The data producer is created *inside* the observable upon subscription. Each subscriber gets its own independent execution. (e.g., `HttpClient.get()` or a simple `timer()`).
- **Hot Observables**: The data producer exists *outside* the observable. Multiple subscribers share the same stream of data. (e.g., DOM events like button clicks, or subjects).

### Async Pipe
The `async` pipe (`| async`) subscribes to an `Observable` or `Promise` directly in the template and returns the latest value emitted. 
**Benefits**:
- **Automatic Cleanup**: Unsubscribes automatically when the component is destroyed, preventing memory leaks.
- **Immutability**: Encourages declarative, reactive programming by avoiding manual `.subscribe()` and mutable state variables in the component class.
- **Change Detection**: Automatically triggers change detection when a new value is emitted, even if the `ChangeDetectionStrategy` is `OnPush`.

## Interview Q&A
**Q: Why use `switchMap` for a polling ticker instead of `mergeMap`?**
A: If the network is slow and a previous HTTP request takes longer than the 5-second interval, `mergeMap` would let multiple requests run concurrently. This could lead to race conditions where an older request resolves *after* a newer one, displaying stale data. `switchMap` cancels any pending previous request when a new tick occurs, guaranteeing only the most recent request's result is used.

**Q: How do you determine if the price went up or down?**
A: We use the RxJS `pairwise()` operator. By providing an initial empty array (`startWith([])`), `pairwise` emits the previous and current emissions as an array: `[previous, current]`. We then map over this tuple, compare the current prices with the previous prices by matching the coin IDs, and assign a `trend` of 'up' or 'down'.

**Q: What happens if the API rate-limits us?**
A: The service uses `catchError` inside the `switchMap`. If the HTTP request fails, we catch the error, log it, and return a fallback mock data observable using `of(getMockData())`. The stream continues without breaking the overall polling loop because the error is caught on the inner observable.

# Real-Time Stock Ticker Dashboard

A Real-Time Stock Ticker Dashboard built with Angular 18 and RxJS. It displays a simulated list of stocks with prices that update every 2 seconds. The app includes a real-time search box to filter stocks by symbol.

## Architecture

- **StockService**: Acts as the data source, simulating real-time WebSocket or Server-Sent Events (SSE) updates using RxJS `interval` and maintaining state with a `BehaviorSubject`.
- **AppComponent**: Subscribes to the stock updates and search input changes. It uses RxJS operators to combine, filter, and debounce the data before rendering. The component leverages Standalone features.

## How to Run

1. Open your terminal in the project directory (`d:\Portfolio\learning\angular\stock-ticker\`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:4200`.

## Key Concepts

- **RxJS `interval`**: Used in `StockService` to trigger price fluctuations every 2000 milliseconds.
- **RxJS `BehaviorSubject`**: Holds the current state of the stocks. It requires an initial value and emits its current value to any new subscribers, making it perfect for state management.
- **RxJS `debounceTime`**: Used on the search input's `valueChanges` observable. It waits for 300ms of silence from the user before emitting the latest value, reducing unnecessary filtering computations.
- **RxJS `distinctUntilChanged`**: Ensures the observable only emits when the search term actually changes, ignoring identical consecutive values.
- **The `async` Pipe**: Used in the HTML template (`filteredStocks$ | async`). It automatically subscribes to an observable in the component and unwraps the data for rendering. Crucially, it also automatically unsubscribes when the component is destroyed, preventing memory leaks.
- **The `takeUntil` Pattern**: Used in the component's `ngOnInit` to manually unsubscribe from the `valueChanges` observable. A `Subject` (`destroy$`) emits a value in `ngOnDestroy`, signaling `takeUntil` to complete the subscription.

## Interview Q&A

**Q: What is a `BehaviorSubject` and how is it different from a regular `Subject`?**
A: A `BehaviorSubject` requires an initial value and always stores the latest value emitted. When a new observer subscribes, it immediately receives the current stored value. A regular `Subject` does not store the current value; subscribers only receive values emitted *after* they have subscribed.

**Q: Why use `debounceTime` on a search input?**
A: `debounceTime` delays processing until the user has stopped typing for a specified duration (e.g., 300ms). This prevents firing an event, API call, or expensive computation for every single keystroke, significantly improving performance and reducing processing overhead.

**Q: Explain the `takeUntil` pattern in Angular components.**
A: The `takeUntil` pattern is used to manage manual RxJS subscriptions and prevent memory leaks. We create a `Subject` (often called `destroy$`). In our observable pipeline, we add `takeUntil(this.destroy$)`. In the component's `ngOnDestroy` lifecycle hook, we call `this.destroy$.next()` and `this.destroy$.complete()`. This signals the observable to complete and unsubscribe when the component is destroyed.

**Q: Why is the `async` pipe preferred over manual subscriptions in templates?**
A: The `async` pipe handles subscription and unsubscription automatically. It makes the code cleaner by removing the need for manual subscription logic in the component class, and it eliminates the risk of memory leaks because it guarantees unsubscription when the component is destroyed. It also triggers change detection automatically when new data arrives.

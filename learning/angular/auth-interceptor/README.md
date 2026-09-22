# Angular Auto-Refreshing Auth Interceptor

This project demonstrates a production-ready HTTP Interceptor for Angular that automatically refreshes an expired access token using a refresh token, and robustly handles concurrent requests using an RxJS lock (`BehaviorSubject`).

## Architecture & Concepts

### 1. Functional Interceptors
Angular 15+ introduced functional interceptors (`HttpInterceptorFn`). They provide a cleaner, function-based approach instead of classes. We register them in `main.ts` using `provideHttpClient(withInterceptors([...]))`.

### 2. Concurrent Token Refresh Locking
When a user opens a page, multiple HTTP requests might fire simultaneously. If the access token is expired, all requests will independently fail with a 401. Without a lock, the app would spam the `refreshToken` API for every failed request.

**How it works:**
- A global boolean `isRefreshing` tracks if a refresh is already in progress.
- A `BehaviorSubject` tracks the newly issued token state.
- **First 401 request:** Flips `isRefreshing = true`, pauses, and makes the API call to refresh the token.
- **Subsequent 401 requests:** Notice `isRefreshing === true`. They queue up using `filter` on the `BehaviorSubject` waiting for a non-null token, then `take(1)` and resume with the new token.

### 3. RxJS Operators Used
- `catchError`: Intercepts the 401 `HttpErrorResponse`.
- `switchMap`: Cancels any previous inner observable and switches to the new token refresh observable or retry request observable.
- `filter`: Pauses the queued requests until the `refreshTokenSubject` emits a non-null value (meaning refresh finished).
- `take(1)`: Completes the queued observable after getting the new token so it doesn't leak memory or trigger again.

## How to Run

1. `npm install`
2. `npm start`
3. Open `http://localhost:4200`
4. Click **1. Login** (this will store a mock short-lived token).
5. Click **2. Fetch Data**. This fires 3 API requests simultaneously.
6. Watch the UI logs. You will see:
   - All 3 fail initially and are intercepted by the `authInterceptor`.
   - Only ONE refresh API call is made.
   - All 3 wait.
   - Once refreshed, all 3 resume and succeed with the new token.

## Interview Q&A

**Q: Why use a `BehaviorSubject` instead of a regular `Subject` for locking?**  
A: A `Subject` only emits values triggered *after* subscription. If a request fails right as the refresh finishes, it might subscribe to the `Subject` a millisecond too late and hang forever. A `BehaviorSubject` holds the "current" value, ensuring that late subscribers instantly get the newly fetched token.

**Q: How would you handle a failed refresh token (e.g., the refresh token itself is expired)?**  
A: Inside the `catchError` of the `refreshToken()` observable, we clear the local storage (logout) and redirect the user to the login page using the Angular Router. We then rethrow the error to ensure the failed streams terminate properly.

**Q: Why do we clone the HTTP request in the interceptor?**  
A: Angular `HttpRequest` objects are immutable. This prevents side-effects and bugs where a request gets modified mid-flight or upon retries. To change a header (like updating the Authorization bearer token), you must `.clone()` it.

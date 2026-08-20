# Browser APIs (DOM, Fetch, Web Storage, etc.)

## 1. What is it?
Browser APIs (Application Programming Interfaces) are constructs built into the web browser that expose data from the browser and surrounding computer environment, allowing JavaScript to perform complex operations. They are not part of the core JavaScript language (ECMAScript) itself, but rather bindings provided by the browser environment (like Chrome's V8 + Blink) to interact with the underlying OS, network, and document rendering engine. Common APIs include the Document Object Model (DOM), Fetch API, Web Storage (localStorage/sessionStorage), Web Workers, Service Workers, and Geolocation.

## 2. Why does it exist?
Without Browser APIs, JavaScript would be purely a computational language with no way to interact with the user or the outside world. Browser APIs exist to bridge the gap between the isolated JavaScript runtime and the browser's capabilities. They allow developers to:
- Dynamically manipulate the UI (DOM API)
- Make asynchronous network requests without page reloads (Fetch API)
- Persist user data across sessions (Web Storage/IndexedDB)
- Access hardware capabilities like cameras or GPS (MediaDevices, Geolocation)
- Run background tasks (Web Workers)

## 3. How does it work?
Browser APIs are implemented in lower-level languages (like C++ or Rust) within the browser's engine. The browser exposes a JavaScript interface (bindings) via the global `window` object. 

When JavaScript calls a Browser API (e.g., `document.createElement('div')` or `fetch('/api/data')`), the V8 engine delegates the execution to the browser's internal systems (like the Blink rendering engine or the network stack). 

For asynchronous APIs (like Fetch or `setTimeout`), the browser uses the Event Loop. The API call is handed off to a Web API thread. Once the background task completes, a callback or Promise resolution is pushed to the Task Queue or Microtask Queue, which the Event Loop eventually pulls back onto the main JavaScript call stack.

## 4. Real-world analogy
Think of the JavaScript runtime as a skilled chef (the brain) in a kitchen, and the Browser APIs as the kitchen appliances (oven, fridge, blender). The chef alone can only think about recipes (logic). To actually bake a cake, the chef needs to interact with the oven (Browser API). The oven operates on its own mechanics (C++ internals) but has a control panel (JavaScript bindings) the chef can use to set the temperature and time.

## 5. Real-world example
A modern single-page application (SPA) like Gmail relies heavily on Browser APIs:
- **DOM API**: Rendering the inbox, updating the UI when a new email arrives without reloading the page.
- **Fetch/XHR**: Polling or using Server-Sent Events to get new emails.
- **IndexedDB**: Caching emails locally so the app loads instantly on subsequent visits and works offline.
- **Service Workers**: Intercepting network requests and handling push notifications.

## 6. Production example
In a production e-commerce site, tracking a user's shopping cart state often involves a mix of Browser APIs:
- User clicks "Add to Cart" (DOM Event Listener).
- App makes an API call to reserve inventory (Fetch API).
- App saves a backup of the cart state locally to prevent data loss on accidental refresh (localStorage).
- The cart UI updates to reflect the new item count (DOM manipulation).

## 7. Minimal implementation
```javascript
// DOM API: Update a button
const button = document.querySelector('#submit-btn');
button.textContent = 'Loading...';

// Fetch API: Get data
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Web Storage: Save data
    localStorage.setItem('lastTodo', JSON.stringify(data));
  });
```

## 8. Production implementation
```typescript
interface UserProfile {
  id: string;
  name: string;
  theme: 'light' | 'dark';
}

class UserProfileManager {
  private static STORAGE_KEY = 'app_user_profile';
  private static API_URL = '/api/v1/profile';

  /**
   * Fetches the user profile, falling back to local storage if network fails.
   */
  static async loadProfile(): Promise<UserProfile> {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);

      const response = await fetch(this.API_URL, {
        headers: { 'Accept': 'application/json' },
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profile: UserProfile = await response.json();
      this.cacheProfile(profile);
      this.applyTheme(profile.theme);
      return profile;

    } catch (error) {
      console.warn('Network fetch failed, falling back to cache:', error);
      const cached = this.getCachedProfile();
      if (cached) {
         this.applyTheme(cached.theme);
         return cached;
      }
      throw new Error('Could not load profile from network or cache.');
    }
  }

  private static cacheProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      // Handle QuotaExceededError or disabled cookies
      console.error('Failed to cache profile in localStorage', e);
    }
  }

  private static getCachedProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static applyTheme(theme: 'light' | 'dark'): void {
    // DOM API manipulation
    document.documentElement.setAttribute('data-theme', theme);
  }
}
```

## 9. Failure scenarios
- **Fetch API**: Network timeouts, DNS failures, CORS errors, or the server returning 5xx/4xx status codes. Fetch only rejects Promises on network failures, not on HTTP error statuses (like 404 or 500).
- **Web Storage**: `QuotaExceededError` if localStorage is full (typically 5MB limit). Storage APIs throw exceptions if the user has disabled third-party cookies or is in strict incognito modes.
- **DOM API**: Memory leaks from forgetting to remove Event Listeners (`removeEventListener`) on unmounted DOM nodes (zombie elements). XSS vulnerabilities if inserting untrusted content via `innerHTML`.

## 10. Debugging
- **Network Panel (DevTools)**: Essential for debugging Fetch/XHR. Inspect request headers, payloads, response bodies, and timing.
- **Application/Storage Panel (DevTools)**: Inspect, edit, and clear `localStorage`, `sessionStorage`, cookies, and IndexedDB.
- **Elements Panel**: Inspect the live DOM tree, see applied styles, and track DOM mutations.
- **Performance Panel**: Debug Main Thread blocking issues (jank) caused by expensive DOM manipulations or synchronous API calls.

## 11. Performance
- **DOM Manipulation**: Very expensive. Reading from and writing to the DOM sequentially can cause "Layout Thrashing" (forced synchronous layout). E.g., querying `element.offsetHeight` right after setting `element.style.height` forces the browser to recalculate layouts immediately.
- **Storage**: `localStorage` is synchronous and blocks the main thread. Frequent reading/writing of large JSON objects hurts performance. IndexedDB is asynchronous and better for large data.
- **Fetch**: Use `AbortController` to cancel unnecessary requests (e.g., when a user types rapidly in a typeahead search).

## 12. Security
- **XSS (Cross-Site Scripting)**: The DOM API `innerHTML` can execute injected scripts. Always use `textContent` or sanitize input using DOMPurify before inserting HTML.
- **CORS (Cross-Origin Resource Sharing)**: Fetch APIs respect CORS policies to prevent malicious scripts from reading data from other domains.
- **Web Storage**: `localStorage` is accessible by any script running on the page, making it highly vulnerable to XSS. Never store sensitive tokens (like JWTs) in localStorage. Use HttpOnly cookies instead.

## 13. Alternatives
- **Fetch Alternatives**: Axios (wrapper around XHR, provides automatic JSON parsing, request cancellation, interceptors).
- **DOM Alternatives**: Virtual DOM libraries (React, Vue) or fine-grained reactivity frameworks (Solid.js, Svelte) abstract away raw DOM API calls.
- **Web Storage Alternatives**: IndexedDB for complex/large data, OPFS (Origin Private File System) for file-like storage, HttpOnly cookies for session tokens.

## 14. Trade-offs
- **Fetch vs Axios**: Fetch is built-in (no bundle size cost) but requires boilerplate for error handling (checking `response.ok`), JSON parsing, and timeouts. Axios is heavier but feature-rich.
- **localStorage vs IndexedDB**: localStorage is simple and synchronous, perfect for small preferences (e.g., theme choice). IndexedDB is complex and asynchronous, suitable for offline data syncing and large blobs.
- **Raw DOM vs React/VDOM**: Raw DOM is the fastest if carefully optimized but scales poorly in developer experience and maintainability for complex UIs. VDOM adds overhead but provides a declarative, maintainable mental model.

## 15. Senior-level thinking
Seniors understand that Browser APIs represent the boundary of the application context. Crossing this boundary (e.g., JS to DOM, or JS to Network) is where performance bottlenecks, security vulnerabilities, and unpredictable side effects occur. 
- **Abstraction**: Encapsulate Browser APIs behind interfaces. Don't scatter `localStorage.getItem` or raw `fetch` calls everywhere. Centralize them so you can easily swap implementations, add logging, or mock them during tests.
- **Resilience**: Assume Browser APIs might fail. The user's connection might drop mid-fetch, storage might be full, or an extension might block the API. Use progressive enhancement and robust error handling.

## 16. Interview questions
- **Beginner**: What is the difference between `localStorage` and `sessionStorage`?
- **Intermediate**: Why doesn't `fetch()` reject the Promise when it receives a 404 or 500 error, and how do you handle it?
- **Senior**: Explain "Layout Thrashing" in the context of the DOM API. How would you diagnose and fix it?

## 17. Follow-up questions
- *For the Fetch question*: If `fetch` doesn't reject on 500, how would you implement a retry mechanism that wraps `fetch`? How would you cancel an in-flight request?
- *For the Layout Thrashing question*: How does `requestAnimationFrame` help in batching DOM updates?

## 18. Strong answer
*On Layout Thrashing*: Layout thrashing occurs when JavaScript writes to the DOM and then immediately reads a layout property (like `offsetWidth` or `scrollTop`) before the browser has a chance to naturally paint the frame. This forces the browser to recalculate the layout synchronously, stalling the main thread. 
To fix it, we must separate DOM reads and writes. We should read all necessary layout properties first, cache them, and then perform all writes in a batch. If the logic is complex, we can use `requestAnimationFrame` to schedule writes for the next render frame, or use libraries like `fastdom` that coordinate read/write batches automatically.

## 19. Common mistakes
- Not checking `response.ok` in Fetch and assuming a resolved Promise means a successful API response.
- Memory leaks from not cleaning up intervals (`setInterval`) or global event listeners when a UI component is destroyed.
- Overusing `localStorage` for large datasets, which blocks the UI thread because it's synchronous.
- Relying on `JSON.parse(localStorage.getItem('key'))` without a try-catch block; corrupted storage data will crash the script.

## 20. Practical exercise
Build a robust API client wrapper using the Fetch API. Requirements:
1. It must automatically parse JSON responses.
2. It must throw an error for non-2xx HTTP status codes.
3. It must support timeouts via `AbortController`.
4. It must implement an exponential backoff retry mechanism for 5xx errors or network failures.

## 21. System-design connection
In frontend system design, Browser APIs dictate the architecture of offline-first applications and Progressive Web Apps (PWAs). Service Workers act as a proxy layer, intercepting network requests to serve assets from the Cache API. IndexedDB acts as the local source of truth, synchronizing with the backend database via WebSockets or polling when the Network API (`navigator.onLine`) detects a restored connection. Understanding the storage limits, security boundaries, and concurrency models of these APIs is fundamental to designing reliable web clients.

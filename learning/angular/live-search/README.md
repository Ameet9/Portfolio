# Angular Live Search

This is a modern Angular standalone application demonstrating how to build a robust live search feature using RxJS.

## Features

- **Angular 18 Standalone Components**: No `NgModule`s used, promoting a more streamlined and modern architecture.
- **Reactive Forms**: Uses `FormControl` to seamlessly stream user input changes.
- **GitHub Users API**: Real-time searching of GitHub users.
- **Loading & Empty States**: Feedback is provided while searching or when no results are found.
- **Error Handling**: Graceful fallback if the API rate limits or errors.

## The Power of RxJS in Live Search

Building a live search without RxJS typically involves manual timeouts and complicated cancellation logic. With RxJS, we can declaratively handle this using a few powerful operators:

### `debounceTime(300)`
Delays the emission of values until 300 milliseconds have passed without any new input. This ensures we don't spam the API with a request for every single keystroke.

### `distinctUntilChanged()`
Only emits when the current value is different from the last. If a user types "foo", deletes the "o", and types "o" again within the debounce window, it won't trigger an unnecessary API call.

### `switchMap()` vs `mergeMap()` (Crucial Difference)
We use `switchMap` instead of `mergeMap` for handling the API requests. 
- **`mergeMap`** would fire off requests concurrently and process their responses as they arrive. This can lead to race conditions where an older request resolves *after* a newer request, displaying stale data.
- **`switchMap`** automatically **cancels** the previous inner observable (the previous HTTP request) if a new value arrives. This guarantees that the final rendered result always matches the latest search query.

## Running the App

1. Run `npm install` to install dependencies.
2. Run `npm start` to run the development server.
3. Open `http://localhost:4200/`.

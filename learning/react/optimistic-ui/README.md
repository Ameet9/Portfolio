# React Optimistic UI Demo

## Overview
This project demonstrates **Optimistic UI** in React. When a user interacts with the app (e.g., liking a post), the UI updates immediately, assuming the server request will succeed. If the request fails, the UI "rolls back" to its previous state and alerts the user. This provides a fast, snappy feel, independent of network latency.

## Architecture
- **React + Vite**: Fast modern frontend setup.
- **Custom Hook (`useOptimisticMutation`)**: A reusable hook that takes a mutation function, applies an optimistic update via an `onMutate` callback (which returns the previous state), executes the mutation, and triggers an `onError` rollback if it fails.
- **Race Condition Handling**: Uses `AbortController` combined with a unique `mutationId` to ignore outdated responses if the user spam-clicks a button.

## How to Run
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## Key Concepts

### Optimistic UI
Updating the UI *before* the server confirms the change. We assume success, giving the user instant feedback.

### Eventual Consistency
The idea that the client's state and the server's state might be temporarily out of sync, but they will "eventually" match up once the network request resolves (either succeeding or rolling back).

### Rollbacks
If the server rejects the action (e.g., due to an error or validation failure), the UI must smoothly revert back to the previous state so the user doesn't see incorrect data.

### Race Conditions
When a user clicks a button rapidly (e.g., liking and unliking), multiple network requests fire. The responses might come back out of order. We handle this by assigning a unique ID to the action and aborting/ignoring older pending requests for that ID.

## Interview Q&A

**Q: Why use Optimistic UI?**
A: It significantly improves perceived performance. Users don't have to wait for loading spinners on every small action (like a "like" button or checking a todo item).

**Q: What happens if an optimistic update fails?**
A: We must roll back the UI to the state it was in before the update and notify the user (e.g., via a toast notification) so they know the action didn't stick.

**Q: How do you handle race conditions in optimistic updates?**
A: You can use mechanisms like `AbortController` to cancel in-flight requests if a new one is triggered for the same resource, or maintain a request version/timestamp to ignore responses from stale requests.

**Q: When should you NOT use Optimistic UI?**
A: For high-stakes actions like processing payments, deleting critical data, or actions where server validation is complex and highly likely to fail.

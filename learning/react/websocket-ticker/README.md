# React Auto-Reconnecting WebSocket Ticker

## Overview
This project demonstrates a React frontend connected to a Python WebSocket server that broadcasts live ticker prices. It showcases handling persistent real-time connections, graceful error recovery using exponential backoff with jitter, and handling React 18's strict mode lifecycle correctly.

## Architecture
- **Server**: A Python script using `asyncio` and `websockets` libraries to broadcast random stock price updates every second.
- **Client**: A React app built with Vite and TypeScript. It utilizes a custom hook (`useWebSocket`) to manage the WebSocket connection, state, and auto-reconnection logic. The UI flashes green or red based on price movements.

## How to Run

### Server
1. Navigate to the `server` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python server.py`

### Client
1. Navigate to the `client` directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Key Concepts

### WebSockets vs Polling vs SSE
- **Polling**: Client repeatedly requests data at intervals. High overhead due to HTTP headers on every request.
- **Server-Sent Events (SSE)**: Unidirectional (server to client) event stream over HTTP. Great for simple updates like stock prices, but doesn't support client-to-server messaging well.
- **WebSockets**: Full-duplex, bidirectional communication over a single TCP connection. Lowest latency and overhead after the initial handshake. Ideal for real-time applications requiring frequent two-way updates.

### Exponential Backoff with Jitter & The "Thundering Herd" Problem
When a server crashes or restarts, all connected clients immediately disconnect. If they all try to reconnect at exactly the same time, the sudden spike in connection requests can overwhelm the server, causing it to crash again (the "thundering herd" problem). 
To prevent this, we use **exponential backoff** (increasing the delay between each failed attempt: 1s, 2s, 4s...) and add **jitter** (a small random delay). This randomizes the reconnection times, smoothing out the load on the server.

### React 18 Strict Mode Cleanup
In React 18 development mode, `useEffect` hooks run twice (mount, unmount, remount) to help find side effects. If we don't properly clean up the WebSocket connection in the `useEffect` return function, we end up with multiple open connections or memory leaks. 
```javascript
return () => {
    clearTimeout(reconnectTimeoutRef.current);
    wsRef.current.onclose = null; // Prevent the auto-reconnect logic from firing on deliberate unmount
    wsRef.current.close();
};
```

## Interview Q&A

**1. Why use a custom hook for WebSockets?**
A custom hook encapsulates the complex connection, reconnection, and state management logic, keeping the UI components clean and reusable across different parts of the application.

**2. How do you detect if a WebSocket connection drops?**
The WebSocket API provides an `onclose` event handler that fires when the connection is lost or closed. This is the ideal place to trigger reconnection logic.

**3. Why is jitter important in exponential backoff?**
Jitter prevents the "thundering herd" problem by desynchronizing client reconnection attempts. Without it, clients that disconnected simultaneously would reconnect simultaneously, potentially overwhelming the server.

**4. How do you track previous values in React to compare them with new values?**
The `useRef` hook is perfect for storing previous values because updating a ref doesn't trigger a re-render. We can save the `latestData` in a ref inside a `useEffect` after we've done our comparisons.

**5. What is the difference between `WebSocket.close()` and dropping the network?**
`WebSocket.close()` initiates a clean closing handshake with the server, while dropping the network causes an abrupt termination without notifying the server immediately (until a timeout or ping/pong failure occurs). Both will eventually trigger `onclose` on the client, but an abrupt drop might take longer to detect.

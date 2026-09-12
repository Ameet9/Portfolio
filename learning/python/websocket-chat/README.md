# FastAPI Real-Time Chat Room

This project demonstrates how to build a real-time, multi-user chat application using WebSockets with FastAPI. All connected clients receive messages instantly without needing to refresh the page.

## Real-time Web Technologies

When building real-time applications, you have a few choices for how the client and server communicate:

*   **Polling (Short/Long):** The client repeatedly asks the server, "Do you have any new data?". This is simple but inefficient, wasting bandwidth and server resources. Long polling holds the request open until data is available, which is better but still has overhead.
*   **Server-Sent Events (SSE):** A unidirectional connection where the server pushes data to the client. Great for notifications or live feeds (like stock tickers), but not suitable for two-way communication like a chat room.
*   **WebSockets:** A full-duplex, bidirectional communication channel over a single, long-held TCP connection. Both the client and server can send messages to each other independently at any time. This is the ideal choice for a chat room because it provides low-latency, real-time message exchange with minimal overhead.

## Architecture: The ConnectionManager

To handle WebSockets in FastAPI, we use a `ConnectionManager` pattern. 
Since HTTP is stateless, the server needs a way to keep track of who is currently connected via WebSockets. The `ConnectionManager` is a singleton-like class that maintains a list of active `WebSocket` objects in memory. 

When a user sends a message, the server receives it and then uses the manager's `broadcast` method to iterate through the list of active connections and send the message to everyone.

## Scaling WebSockets

This in-memory `ConnectionManager` works perfectly for a single server instance. However, if your application grows and you need to deploy multiple instances of your FastAPI app (e.g., behind a load balancer), the in-memory lists won't be shared. A user connected to Instance A won't receive messages from a user connected to Instance B.

To scale this to multiple instances, you would typically use a message broker like **Redis** with its **Pub/Sub** (Publish/Subscribe) feature. 
1. When a user sends a message to Instance A, Instance A publishes it to a Redis channel.
2. All instances (A, B, C) are subscribed to that Redis channel.
3. When they receive the message from Redis, they each broadcast it to their respective connected clients.

## How to Run and Test

1.  **Install requirements:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run the server:**
    ```bash
    uvicorn main:app --reload
    ```
    The `--reload` flag is useful for development as it restarts the server when you make code changes.
3.  **Test the chat:**
    *   Open your web browser and go to `http://localhost:8000`.
    *   Open a **second tab or a different browser** and also navigate to `http://localhost:8000`.
    *   Type a message in one window and hit send. You will see it appear instantly in both windows!

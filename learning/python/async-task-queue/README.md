# Async Task Queue

A high-performance asynchronous task queue implemented in Python using `asyncio` and `FastAPI`. This project demonstrates the Producer-Consumer pattern, concurrency in Python, and robust error handling mechanisms like exponential backoff.

## Architecture

*   **Producer:** FastAPI endpoints (`POST /tasks`) that enqueue tasks.
*   **Consumer:** Background `asyncio` worker tasks that pull from the queue.
*   **Broker:** An in-memory `asyncio.Queue`.
*   **Storage:** An in-memory dictionary acting as the task state database.

## Key Concepts

1.  **asyncio.Queue:** A queue specifically designed to work safely with async routines. It coordinates between the FastAPI routes (producers) and the background workers (consumers) seamlessly without blocking the event loop.
2.  **Producer/Consumer Pattern:** Decouples task submission from task execution. FastAPI quickly accepts requests and queues them (producer), while workers pick them up when they have capacity (consumer).
3.  **Exponential Backoff:** When a task fails, workers wait for progressively longer intervals (e.g., $2^1$, $2^2$, $2^3$ seconds) before retrying. This prevents overwhelming downstream services during transient outages.
4.  **Graceful Shutdown:** FastAPI's Lifespan context manager is used to spawn workers on startup and cleanly cancel (`task.cancel()`) and await them on shutdown.

## How to Run

1.  **Create a Virtual Environment (Optional but recommended):**
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```

2.  **Install Dependencies:**
    ```powershell
    pip install -r requirements.txt
    ```

3.  **Start the Server:**
    ```powershell
    uvicorn main:app --reload
    ```

4.  **Run the Load Test (in another terminal):**
    ```powershell
    python test_load.py
    ```

## Interview Q&A

**Q: Why use `asyncio.Queue` over a standard list or `queue.Queue`?**
A: Standard lists are not thread-safe or async-safe. `queue.Queue` blocks the thread when waiting for items, which would freeze the `asyncio` event loop. `asyncio.Queue` uses `await queue.get()`, which gracefully yields control back to the event loop until an item is available.

**Q: How does the server shut down cleanly while tasks are running?**
A: We use FastAPI's lifespan events. During shutdown, we call `.cancel()` on the worker `asyncio.Task` objects. This raises an `asyncio.CancelledError` inside the worker loop, which we catch, allowing us to perform cleanup before exiting.

**Q: What happens if the server crashes before a task is completed?**
A: Because this implementation uses in-memory storage (the `task_store` dict and `asyncio.Queue`), all pending and processing tasks are lost on crash. In a production scenario, you would replace the in-memory queue with Redis or RabbitMQ, and the dictionary with a persistent database (e.g., PostgreSQL).

**Q: How is backoff implemented without blocking other tasks?**
A: We use `await asyncio.sleep(backoff)` which yields the thread back to the event loop. Other workers continue processing, and the main server remains responsive to HTTP requests while the specific task waits for its retry window.

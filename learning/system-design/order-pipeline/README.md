# RabbitMQ Order Pipeline

This project demonstrates the concept of **producer-consumer decoupling** using RabbitMQ. 
An API (producer) accepts orders quickly and queues them, while a separate worker (consumer) processes them asynchronously.

## Architecture

```text
+----------+      POST /orders     +-----------+                     +------------+                     +-------------+
|          | --------------------> |           |                     |            |                     |             |
|  Client  |                       | FastAPI   | -- Publish Msg ---> |  RabbitMQ  | -- Consume Msg ---> |   Worker    |
|          | <--- 202 Accepted --- | Producer  |                     |  (Queue)   |                     | (Processor) |
+----------+                       +-----------+                     +------------+                     +-------------+
                                                                          |
                                                                    (Dead Letters)
                                                                          |
                                                                          v
                                                                   +-------------+
                                                                   | orders.dlq  |
                                                                   +-------------+
```

## Why Decouple?
Decoupling producers from consumers offers several advantages:
- **Resilience**: If the worker is down, the API can still accept orders (they are stored in the queue).
- **Scalability**: You can scale the API and workers independently based on their respective loads.
- **Responsiveness**: The API responds immediately (HTTP 202) instead of blocking until the order is processed, improving the user experience.

## Dead-Letter Queue (DLQ)
When a worker encounters an unrecoverable error while processing a message, it negatively acknowledges (nack) the message without requeuing. RabbitMQ then routes these failed messages to a Dead-Letter Queue (`orders.dlq`). This allows developers to inspect, debug, and potentially retry failed messages later without blocking the main pipeline or losing data.

## How to Run

1. Make sure you have Docker and Docker Compose installed.
2. Run the following command to start the services:
   ```bash
   docker compose up --build -d
   ```

## How to Test

1. **Check API Health**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Submit an Order**:
   ```bash
   curl -X POST http://localhost:8000/orders \
        -H "Content-Type: application/json" \
        -d '{"item": "Laptop", "quantity": 1, "customer": "Alice"}'
   ```
   You should receive a `202 Accepted` response with an `order_id`.

3. **Check the RabbitMQ Management UI**:
   - Open [http://localhost:15672](http://localhost:15672) in your browser.
   - Login with `guest` / `guest`.
   - Go to the **Queues** tab to see the `orders` and `orders.dlq` queues.
   - Submit a few more orders to observe the queue counts. Some orders (~20%) will randomly fail in the worker and end up in the DLQ.

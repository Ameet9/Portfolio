# Distributed Tracing with OpenTelemetry + Jaeger

This project demonstrates distributed tracing across multiple microservices using OpenTelemetry for instrumentation and Jaeger for trace storage and visualization.

## Overview
In a microservices architecture, a single user request can touch dozens of services. When something goes wrong or latency is high, it's difficult to pinpoint the culprit without distributed tracing. 
This project sets up two services (`order-service` and `inventory-service`). The `order-service` calls the `inventory-service` over HTTP. OpenTelemetry automatically propagates trace context across this HTTP boundary.

## Architecture

1. **Order Service (FastAPI)**: Exposes a `POST /order` endpoint. Makes an HTTP call to the Inventory Service.
2. **Inventory Service (FastAPI)**: Exposes a `GET /stock/{item}` endpoint with simulated latency.
3. **Jaeger**: The backend tracing system that collects, stores, and serves traces via a UI.

## How to Run

1. Make sure you have Docker and Docker Compose installed.
2. Start the services:
   ```bash
   docker-compose up --build
   ```
3. Generate some traffic:
   ```bash
   curl -X POST http://localhost:8002/order -H "Content-Type: application/json" -d '{"item":"laptop","quantity":1}'
   ```
4. View traces in Jaeger: Open `http://localhost:16686` in your browser, select `order-service` in the "Service" dropdown, and click "Find Traces".

## Key Concepts

### Trace & Span
- **Trace**: Represents a single logical operation, like processing a user request, distributed across multiple services. It consists of a tree of spans.
- **Span**: A single unit of work within a trace. It has a start time, end time, name, and attributes.

### Context Propagation (traceparent)
When `order-service` makes an HTTP request to `inventory-service`, OpenTelemetry's HTTP instrumentation automatically injects tracing context into the HTTP headers (specifically, the W3C `traceparent` header). The `inventory-service` reads this header to join the existing trace rather than starting a new one.

Format of `traceparent`: `00-<trace_id>-<span_id>-<trace_flags>`

### Auto-Instrumentation
Notice that we barely wrote any tracing code! By running our apps with `opentelemetry-instrument`, OpenTelemetry automatically hooks into FastAPI and HTTPX to generate spans and propagate context. We only added a custom span in `order-service` to demonstrate custom attributes.

## Interview Q&A

**Q: How do you trace a request across multiple microservices?**
A: By using a distributed tracing system like OpenTelemetry. We generate a unique Trace ID at the entry point of our system (e.g., API Gateway). As the request travels between services via HTTP or message queues, we propagate this Trace ID in headers (like the W3C `traceparent` header). Each service generates its own Spans (units of work) linked to this Trace ID, and sends them asynchronously to a backend like Jaeger or DataDog.

**Q: What is the overhead of distributed tracing?**
A: Generating spans, keeping track of context, and exporting data introduces CPU and memory overhead. To mitigate this, we typically use **sampling**. We might only sample 1% or 5% of requests. We export trace data asynchronously so it doesn't block the main application thread.

**Q: What is the difference between tracing, metrics, and logging?**
A:
- **Logging**: Detailed events happening in an application (e.g., "User 123 logged in"). High cardinality, useful for deep debugging.
- **Metrics**: Aggregated numerical data over time (e.g., CPU usage, request rate, error rate). Low cardinality, great for alerting and dashboards.
- **Tracing**: Follows the lifecycle of a single request across multiple services. Essential for finding latency bottlenecks and understanding microservice dependencies.

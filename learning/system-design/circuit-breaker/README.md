# Circuit Breaker Pattern

## Overview
The Circuit Breaker pattern is used to detect failures and encapsulate the logic of preventing a failure from constantly recurring during maintenance, temporary external system failure, or unexpected system difficulties. Instead of continuously trying and failing (which can consume resources like threads, network connections, and time), a circuit breaker fails fast and allows the system to degrade gracefully.

## Architecture & State Machine

The Circuit Breaker operates as a state machine with three main states:

```text
       Success (reset)
      ┌───────────────┐
      │               ▼
  ┌───────┐       ┌────────┐
  │ CLOSED│       │HALF_OPEN│
  └───────┘       └────────┘
      │               ▲
      │ Failures >=   │ Cooldown period
      │ Threshold     │ elapsed
      ▼               │
   ┌──────┐           │
   │ OPEN │───────────┘
   └──────┘
```

- **CLOSED**: Requests flow freely. If requests fail, a counter is incremented. If the counter reaches a specified threshold, the circuit transitions to the OPEN state.
- **OPEN**: Requests fail immediately (fail-fast) without attempting the operation. After a cooldown period, the circuit transitions to HALF_OPEN.
- **HALF_OPEN**: Allows a limited number of requests (often just one) to pass through to test if the underlying issue is resolved. If successful, it goes back to CLOSED. If it fails, it goes back to OPEN.

## How to Run

1. **Start the Flaky Service:**
   ```powershell
   python flaky_service.py
   ```
   (Runs on port 5001)

2. **Run without Circuit Breaker:**
   ```powershell
   python client_no_protection.py
   ```
   *Notice how each failed request takes a long time (e.g., 5 seconds due to timeout), blocking the client thread.*

3. **Run with Circuit Breaker:**
   ```powershell
   python client_with_breaker.py
   ```
   *Notice the fail-fast behavior. When the circuit trips (OPEN), subsequent calls immediately throw a `CircuitOpenError` (saving 5 seconds per call). The system then provides fallback data.*

4. **Run tests:**
   ```powershell
   pytest test_circuit_breaker.py
   ```

## Comparison: Without vs With Circuit Breaker

| Feature | Without Circuit Breaker | With Circuit Breaker |
|---------|-------------------------|----------------------|
| **Latency during failure** | High (waits for timeout on every request) | Low (fails fast after circuit opens) |
| **Resource Utilization** | High (threads blocked waiting) | Low (threads immediately freed) |
| **Recovery** | Continues hammering the failing service | Gives the failing service time to recover |
| **User Experience** | Slow, unresponsive | Fast failure, graceful degradation (fallback) |

## Interview Q&A

**1. What problem does the Circuit Breaker pattern solve?**
It prevents a system from repeatedly attempting an operation that is likely to fail, saving system resources (like threads and network connections) and preventing cascading failures across microservices.

**2. How does the HALF_OPEN state work?**
After a cooldown period in the OPEN state, the breaker transitions to HALF_OPEN. It allows a single test request to pass through. If it succeeds, the service is deemed healthy (transitions to CLOSED). If it fails, the service is still unhealthy (transitions back to OPEN and resets the cooldown timer).

**3. Why do we need a fail-fast mechanism?**
Fail-fast prevents the client from blocking while waiting for a timeout on a service that is known to be failing. This frees up resources immediately and allows for graceful degradation (like returning cached data).

**4. Can you have different types of exceptions trip the breaker?**
Yes. In a production system, you usually want timeouts, connection refused, and HTTP 5xx errors to trip the breaker, but HTTP 4xx errors (client errors like 404 or 400) should NOT trip the breaker, as they indicate a problem with the request, not the service health.

**5. How is this different from a retry mechanism?**
A retry mechanism (like Exponential Backoff) attempts to overcome transient failures by trying again. A circuit breaker prevents attempts when the system determines that the failure is not transient, protecting the downstream service from being overwhelmed. They are often used together (Retry wraps Circuit Breaker).

## Real-world Usage
- **Hystrix** (Netflix - deprecated but pioneered the pattern)
- **Resilience4j** (Java, popular replacement for Hystrix)
- **Polly** (.NET)
- **Istio / Envoy** (Service mesh layer, allows implementing circuit breaking without changing application code)

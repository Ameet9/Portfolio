# Bulkhead Pattern Simulation

## Overview
This project demonstrates the Bulkhead pattern, a resilience pattern used in software architecture to prevent a failure in one part of a system from cascading and taking down the entire system. 

## Architecture & The Ship Analogy
The term "Bulkhead" comes from shipbuilding. A ship's hull is divided into isolated, watertight compartments (bulkheads). If the ship strikes an iceberg and one compartment floods, the bulkheads contain the water, preventing the entire ship from sinking.

In system design, this means allocating separate resources (like thread pools or connection pools) for different services or components. If one service becomes slow or fails (like our `payment_service`), it only exhausts its dedicated resource pool. Other fast, healthy services (like our `inventory_service`) continue to operate normally because they use a separate pool.

## Difference from Circuit Breaker
- **Bulkhead Pattern:** Focuses on *isolation*. It limits the resources a component can consume so it doesn't starve others.
- **Circuit Breaker:** Focuses on *fast failure*. It stops calls to a failing component entirely to give it time to recover and prevent wasting time on inevitable timeouts. (A basic Circuit Breaker is included in `bulkhead.py` for the payment service).

## Little's Law
Little's Law (`L = λW`) states that the long-term average number of customers in a stationary system (`L`) is equal to the long-term average effective arrival rate (`λ`) multiplied by the average time a customer spends in the system (`W`).
In the context of the Bulkhead pattern, if the processing time (`W`) for a downstream service spikes, the number of in-flight requests (`L`) will increase proportionally for a given request rate. Without a bulkhead, this quickly consumes all available threads/connections, starving other services.

## How to Run
Prerequisites: Python 3.x
Navigate to the directory in PowerShell:
```powershell
cd d:\Portfolio\learning\system-design\bulkhead-pattern\
```

Run the naive simulation (no bulkhead):
```powershell
python naive.py
```
*Notice how the fast inventory service calls get delayed because the slow payment service calls consume threads and cause queuing.*

Run the bulkhead simulation:
```powershell
python bulkhead.py
```
*Notice how the inventory service calls finish almost instantly because they have a dedicated thread pool, while the payment service calls are isolated.*

## Interview Q&A
**Q: When should you use the Bulkhead pattern?**
A: When you have multiple components sharing limited resources (like threads, memory, or connection pools) and one component's performance degradation could impact others. It's essential in microservices architectures calling multiple external APIs.

**Q: How do you size the bulkheads (thread pools)?**
A: By analyzing the normal traffic load and latency for each service, and applying Little's Law. You also need to consider the criticality of the service. You can use stress testing to refine these numbers.

# Saga Pattern Simulation

## Overview
This project is a Python-based simulation of the **Saga Pattern**, a design pattern commonly used in distributed systems and microservices to manage long-running transactions and ensure data consistency without relying on distributed transactions (like Two-Phase Commit).

In a Saga, a long-running transaction is broken down into a series of local transactions. If any local transaction fails, the Saga executes a series of **compensating transactions** to undo the changes made by the preceding successful transactions.

## Architecture
This project implements the **Orchestration-based Saga** pattern.
- `services.py`: Contains simulated microservice functions (Create Order, Charge Payment, Reserve Inventory) and their respective compensating functions (Cancel Order, Refund Payment, Release Inventory). It maintains a simple global state.
- `orchestrator.py`: Implements a `SagaOrchestrator` that coordinates the workflow, maintains a stack of completed operations, and triggers compensations in reverse order upon failure. It also logs execution traces.
- `main.py`: Drives the simulation with two scenarios:
  1. A successful end-to-end flow.
  2. A failed flow (due to insufficient inventory), demonstrating the rollback/compensation mechanism.

## How to Run
Ensure you have Python 3 installed. No external dependencies are required.

```powershell
# Navigate to the project directory
cd d:\Portfolio\learning\system-design\saga-pattern\

# Run the simulation
python main.py
```
Check the `saga_execution.json` file generated in the directory to see the detailed execution and compensation logs.

## Key Concepts

### Orchestration vs Choreography
- **Orchestration (implemented here)**: A central coordinator (the orchestrator) tells the participating services what local transactions to execute. It manages the saga's state and workflow.
- **Choreography**: Each participating service produces and listens to events, deciding if an action should be taken. There is no central coordinator.

### Eventual Consistency
The Saga pattern does not provide ACID (Atomicity, Consistency, Isolation, Durability) guarantees across the entire distributed system instantaneously. Instead, it provides **eventual consistency**. The system might briefly be in an intermediate, partially updated state, but it will eventually reach a consistent state (either fully completed or fully rolled back) once the Saga finishes.

### Idempotency
Compensating transactions must be **idempotent**. Because of potential network retries or failures, a service might receive a request to rollback the same transaction multiple times. It must ensure that applying the compensation once has the same effect as applying it multiple times.

## Interview Q&A

**Q: Why use the Saga pattern instead of Two-Phase Commit (2PC)?**
A: 2PC locks resources across services until the transaction commits or aborts, creating bottlenecks and reducing availability. Sagas use local transactions, meaning no extended locks, which dramatically increases throughput and scalability in microservice architectures.

**Q: What is a compensating transaction?**
A: It is an operation designed to undo the effects of a previously committed local transaction. For example, if a "Charge Credit Card" transaction succeeds but a subsequent step fails, a "Refund Credit Card" compensating transaction is issued.

**Q: What happens if a compensating transaction fails?**
A: This is a critical failure scenario. The system must retry the compensation. To support this, compensating transactions must be idempotent. If repeated retries fail, it may require manual intervention, logging alerts, or administrative reconciliation (often placed in a Dead Letter Queue).

**Q: When would you choose Choreography over Orchestration?**
A: Choreography is better for simple workflows with few participants (e.g., 2-4 services), as it avoids a single point of failure and coordinator bottleneck. Orchestration is preferred for complex workflows involving many services, as it makes the flow easier to understand, test, and monitor, and prevents cyclical dependencies.

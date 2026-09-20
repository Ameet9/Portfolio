# Distributed Locking Project

This project demonstrates the need for and implementation of a distributed lock using Redis.

## Overview

When multiple users try to book the same ticket or seat simultaneously, a race condition can occur if they both read that the seat is "available" before either writes it as "booked". This is a classic check-then-act problem. In a multi-instance microservices environment, simple in-memory locks like `threading.Lock()` are insufficient, necessitating a distributed lock.

## Architecture

- **FastAPI**: Serves two endpoints, one vulnerable to race conditions (`/book/naive`), and one protected by a Redis distributed lock (`/book/safe`).
- **Redis**: Used as the centralized lock manager.
- **Test Script**: Uses `asyncio` to hammer both endpoints concurrently.

## How to Run

1. Start the services:
   ```powershell
   docker-compose up --build -d
   ```
2. Run the test script (requires `aiohttp`):
   ```powershell
   pip install aiohttp
   python test_race.py
   ```
3. Observe the output. The naive endpoint will likely allow multiple "successful" bookings for `seat_1`, while the safe endpoint will strictly allow only one for `seat_2`.

## Key Concepts

### The Check-Then-Act Race Condition
If thread A checks `if seat == available`, then thread B checks `if seat == available`, both evaluate to true. Both then proceed to act (`seat = booked`), overwriting each other and potentially causing business logic failures (like double-booking).

### Why `threading.Lock()` Fails Across Instances
An in-memory lock like Python's `threading.Lock()` only synchronizes threads within the same process. In a microservices architecture, you will have multiple instances of your application running in different processes, containers, or servers. They do not share memory, so an in-memory lock cannot synchronize them.

### How `SET NX PX` Works
To acquire the lock in Redis safely without a race condition, we use a single atomic command:
`SET lock_key unique_token NX PX 5000`
- `NX`: Set only if the key does **N**ot e**X**ist. (Prevents multiple clients from acquiring).
- `PX 5000`: Set a time-to-live of 5000 milliseconds. (Prevents deadlocks if the client crashes while holding the lock).

### Why the Lua Script is Needed for Release
When releasing a lock, a client must only release *its own* lock. If client A acquires the lock, but takes too long to process, the TTL might expire. Client B then acquires the lock. If client A then blindly calls `DEL lock_key`, it will accidentally delete client B's lock! 
To prevent this, the client checks if the value of the lock matches the unique token it used to acquire it. Because `GET` and `DEL` are two separate commands, another client could theoretically slip in between them. A Lua script executes atomically in Redis, ensuring the check and delete happen as a single uninterrupted operation.

### Redlock Algorithm
While the `SET NX` method works well for a single Redis node, if that node fails, the lock state is lost. For high-availability, Redis author Antirez proposed the **Redlock** algorithm, which involves acquiring the lock on a majority of independent Redis nodes (e.g., at least 3 out of 5).

## Interview Q&A

**Q: What happens if the Redis server crashes while a lock is held?**
A: If using a single Redis node, the lock state is lost. If another client tries to acquire the lock after Redis restarts (or fails over to a replica asynchronously), it might succeed while the original client still thinks it holds the lock. To mitigate this, use Redlock with multiple independent nodes.

**Q: Why do we use a UUID token as the lock value?**
A: To uniquely identify the owner of the lock. This ensures that a client only releases the lock if it still owns it, preventing it from accidentally deleting a lock that has expired and been acquired by another client.

**Q: How do you handle lock expiration if the process takes longer than the TTL?**
A: You can implement a "watchdog" mechanism. A background thread periodically extends the TTL of the lock (e.g., every `TTL / 3` seconds) as long as the process is still running. When the process finishes, it stops the watchdog and releases the lock.

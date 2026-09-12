# Redis-Backed Rate Limiter

This project demonstrates a distributed rate limiter using the Token Bucket algorithm, backed by Redis.

## Overview

A rate limiter controls the rate of traffic sent by a client or a service. In a distributed environment with multiple application servers, an in-memory rate limiter per server is insufficient because it doesn't track global request counts. By using Redis as a centralized datastore, we ensure consistent rate limiting across all instances of the application.

## The Token Bucket Algorithm

The Token Bucket algorithm works as follows:
- A bucket is assigned to each user/IP with a maximum capacity of tokens.
- Tokens are added to the bucket at a fixed rate (e.g., 10 tokens per minute).
- When a request arrives, it checks if the bucket has enough tokens.
- If there are enough tokens, the request is processed, and a token is consumed.
- If the bucket is empty, the request is dropped (HTTP 429 Too Many Requests).

```text
    [ Token Refill ] -- (Fixed Rate) --> [ Bucket (Max Capacity) ]
                                                |
    [ Incoming Request ] ---------------------> |
                                                |
                                        [ Has Tokens? ]
                                        /             \
                                     Yes               No
                                     /                   \
                            [ Process Request ]    [ Drop Request (429) ]
                            [ Consume Token   ]
```

## Why Redis?

If we stored the token bucket state in-memory (e.g., in a Python dictionary), each application server would have its own independent state. A user could bypass the rate limit by hitting different servers. Redis provides a fast, centralized key-value store. By using a Lua script in Redis, we can atomically check and update the token bucket state, avoiding race conditions in a distributed system.

## How to Run

1. Ensure Docker and Docker Compose are installed.
2. Clone this repository and navigate to the project directory.
3. Run the application:
   ```bash
   docker-compose up --build
   ```
4. Test the API:
   ```bash
   curl http://localhost:5000/data
   ```
   If you exceed the limit, you will receive a `429 Too Many Requests` response.

# gRPC Microservices Implementation

This project demonstrates a basic gRPC implementation in Python, featuring a microservice for inventory management.

## Overview
gRPC (gRPC Remote Procedure Calls) is an open-source high-performance RPC framework developed by Google. It uses HTTP/2 for transport and Protocol Buffers (Protobuf) as its interface description language (IDL) and underlying message interchange format.

### Architecture
- **Inventory Server**: A gRPC server (`inventory_server.py`) that manages stock levels and implements the `Inventory` service defined in Protobuf.
- **Order Client**: A gRPC client (`order_client.py`) that communicates with the server to check stock and subscribe to stock updates.

## How to Run

1.  **Install Dependencies:**
    This requires `grpcio` and `grpcio-tools`.
    ```bash
    pip install -r requirements.txt
    ```

2.  **Generate gRPC Code (if modifying proto):**
    The Python code from `.proto` is already generated (`inventory_pb2.py`, `inventory_pb2_grpc.py`). If you modify `inventory.proto`, regenerate them:
    ```bash
    python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. inventory.proto
    ```

3.  **Start the Server:**
    ```bash
    python inventory_server.py
    ```

4.  **Run the Client:**
    In a separate terminal:
    ```bash
    python order_client.py
    ```

## Key Concepts

### gRPC vs REST
| Feature | gRPC | REST |
| :--- | :--- | :--- |
| **Protocol** | HTTP/2 | HTTP/1.1 (mostly) |
| **Payload Format** | Protocol Buffers (Binary) | JSON (Text) |
| **API Contract** | Strict (Protobuf IDL) | Loose (OpenAPI/Swagger) |
| **Streaming** | Bidirectional, Client, Server | Client-to-server only (WebSockets needed for more) |
| **Performance** | High (binary packing, multiplexing) | Slower (text parsing, connection overhead) |
| **Browser Support**| Requires gRPC-Web proxy | Native |

### Protocol Buffers (Protobuf)
Protobuf is a method of serializing structured data. It's language-agnostic and platform-neutral.
- **Smaller & Faster**: Binary format is more compact than JSON and faster to serialize/deserialize.
- **Strong Typing**: Fields have explicit types (e.g., `int32`, `string`), preventing type mismatch bugs.
- **Code Generation**: Compilers (`protoc`) generate data access classes automatically.

### The 4 Streaming Types in gRPC
gRPC supports four types of service methods:
1.  **Unary RPCs**: Client sends one request, server sends one response (like typical HTTP/REST). (Implemented in `CheckStock`)
2.  **Server Streaming RPCs**: Client sends one request, server sends a stream of responses. (Implemented in `WatchStock`)
3.  **Client Streaming RPCs**: Client sends a stream of requests, server sends one response.
4.  **Bidirectional Streaming RPCs**: Both client and server send a stream of messages independently.

### Backward Compatibility
Protobuf makes schema evolution easy without breaking existing clients:
- **Rule 1**: Never change the numeric tags for existing fields.
- **Rule 2**: You can add new fields (old clients ignore them, new clients receive default values if not sent).
- **Rule 3**: You can delete fields (just reserve the tag number so it's never accidentally reused).

### Security (mTLS)
In production, gRPC relies heavily on TLS for security.
- **TLS (Transport Layer Security)**: Encrypts data in transit. Server proves its identity to the client.
- **mTLS (Mutual TLS)**: Both the server AND the client prove their identities to each other using certificates. This is crucial for zero-trust microservice architectures.

## Interview Q&A

**Q: When would you choose gRPC over REST?**
**A:** I would choose gRPC for internal microservice-to-microservice communication where low latency, high throughput, and strict API contracts are required. It's ideal for polyglot environments where generating client libraries automatically saves time. I'd stick to REST for public-facing APIs (due to native browser support) or when interacting with third-party systems that only support REST.

**Q: How do you handle authentication in gRPC?**
**A:** The standard approach is using Interceptors (middleware) to check credentials. This is often done using metadata (similar to HTTP headers) to pass Bearer tokens (like JWTs). For service-to-service authentication, mutual TLS (mTLS) is the industry standard.

**Q: How does HTTP/2 make gRPC faster?**
**A:** HTTP/2 supports multiplexing, meaning multiple requests and responses can be sent concurrently over a single TCP connection without blocking each other (Head-of-Line blocking issue in HTTP/1.1). It also uses header compression (HPACK) and supports server push and true bidirectional streaming.

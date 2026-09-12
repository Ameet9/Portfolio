# Serverless Notes API

This project demonstrates a serverless REST API using LocalStack to simulate AWS Lambda, API Gateway, and DynamoDB locally.

## What is Serverless?
Serverless architecture allows you to build and run applications without thinking about servers. The cloud provider dynamically manages the allocation and provisioning of servers.
- **AWS Lambda**: A compute service that lets you run code without provisioning or managing servers. It executes your code only when needed and scales automatically.
- **Amazon API Gateway**: A fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale. It acts as the "front door" for applications to access data, business logic, or functionality from your backend services.

In a typical setup, an HTTP request hits the API Gateway, which triggers a Lambda function. The Lambda function processes the request, optionally interacts with a database (like DynamoDB), and returns a response through the API Gateway.

## Cold Starts
A "cold start" occurs when an AWS Lambda function is invoked after not being used for an extended period, or when scaling up to handle more concurrent requests. The cloud provider needs to allocate resources, initialize the execution environment, and load your code before executing the function. This can introduce latency (delay) to the initial request.
- **Why they matter**: For APIs requiring strict low-latency responses, cold starts can be a significant issue. Strategies to mitigate include using Provisioned Concurrency or keeping functions "warm" via scheduled pings.

## How to Run with LocalStack
1. Ensure you have Docker and Docker Compose installed.
2. Start the LocalStack environment:
   ```bash
   docker compose up -d
   ```
3. Run the deployment script to create resources in LocalStack:
   ```bash
   ./deploy/setup.sh
   ```

## Testing with cURL
*Assuming API Gateway exposes endpoint on http://localhost:4566/...*

**Create a note:**
```bash
curl -X POST http://localhost:4566/restapis/<api-id>/test/_user_request_/notes -H "Content-Type: application/json" -d '{"title": "My Note", "body": "This is a note."}'
```

**List notes:**
```bash
curl -X GET http://localhost:4566/restapis/<api-id>/test/_user_request_/notes
```

## Trade-offs
| Aspect | Serverless (Lambda) | Containers (ECS/EKS) | Virtual Machines (EC2) |
|---|---|---|---|
| **Management** | Zero server management | Manage orchestration & scaling | Manage OS, patching, scaling |
| **Scaling** | Automatic, per-request | Scaling rules based on metrics | Manual or auto-scaling groups |
| **Pricing** | Pay per invocation & duration | Pay for resources allocated | Pay for instance uptime |
| **Latency** | Cold starts possible | Predictable (once running) | Predictable |
| **Use Case** | Event-driven, variable workloads | Consistent workloads, microservices | Legacy apps, tight OS control |

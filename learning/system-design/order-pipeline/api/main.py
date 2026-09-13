import json
import uuid
import os
from fastapi import FastAPI, status, HTTPException
from pydantic import BaseModel
import pika

app = FastAPI(title="Order Pipeline API")

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")

class OrderRequest(BaseModel):
    item: str
    quantity: int
    customer: str

def get_rabbitmq_channel():
    """
    Establish a connection to RabbitMQ.
    In a production app, we would manage the connection pool more robustly.
    """
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        
        # We declare the queue here as well to ensure it exists if the API starts before the worker
        # Setting up DLQ arguments so if messages are rejected they go to orders.dlq
        args = {
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": "orders.dlq"
        }
        channel.queue_declare(queue="orders", durable=True, arguments=args)
        # Also declare the DLQ just in case
        channel.queue_declare(queue="orders.dlq", durable=True)
        
        return connection, channel
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        raise HTTPException(status_code=503, detail="Message broker unavailable")

@app.post("/orders", status_code=status.HTTP_202_ACCEPTED)
def create_order(order: OrderRequest):
    """
    Accepts an order and queues it for asynchronous processing.
    
    WHY HTTP 202 Accepted?
    Instead of processing the order synchronously (which might take time, 
    like contacting inventory or payment gateways), we return 202 to tell 
    the client: "We got it, we'll work on it." This decouples the fast API 
    from the slow processing logic.
    """
    order_id = str(uuid.uuid4())
    
    # Prepare message payload
    message = {
        "order_id": order_id,
        "item": order.item,
        "quantity": order.quantity,
        "customer": order.customer
    }
    
    connection, channel = get_rabbitmq_channel()
    
    try:
        # Publish to the default exchange with the routing key being the queue name
        channel.basic_publish(
            exchange="",
            routing_key="orders",
            body=json.dumps(message),
            # Make message persistent so it survives broker restarts
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
            )
        )
    finally:
        connection.close()

    return {"status": "queued", "order_id": order_id}

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok"}

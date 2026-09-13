import pika
import os
import json
import time
import random

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")

def process_order(ch, method, properties, body):
    """
    Callback function to process incoming messages.
    """
    message = json.loads(body)
    order_id = message.get("order_id", "UNKNOWN")
    print(f"[x] Received order {order_id} for {message.get('customer')}")
    
    try:
        # Simulate time-consuming task
        time.sleep(2)
        
        # Simulate a random failure ~20% of the time
        if random.random() < 0.2:
            raise Exception("Simulated processing failure (e.g., payment declined or inventory out of stock)")
            
        print(f"[v] Successfully processed order {order_id}")
        
        # WHY manual ack?
        # Acknowledging manually ensures that if this worker crashes during processing,
        # the message isn't lost. RabbitMQ will requeue it for another worker.
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"[!] Error processing order {order_id}: {e}")
        
        # WHY DLQ and not silent drop?
        # If we silently drop or auto-ack on failure, we lose the order data.
        # By negatively acknowledging (nack) and setting requeue=False, RabbitMQ 
        # routes the message to the configured Dead-Letter Queue (DLQ).
        # We can later inspect the DLQ, fix the root cause, and replay messages.
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    print("Worker starting up, connecting to RabbitMQ...")
    # Wait for RabbitMQ to be fully ready (simple backoff for demo)
    time.sleep(5)
    
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()

    # Declare the Dead-Letter Queue
    channel.queue_declare(queue="orders.dlq", durable=True)

    # Declare the main queue and link it to the DLQ
    args = {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "orders.dlq"
    }
    channel.queue_declare(queue="orders", durable=True, arguments=args)

    # Prefetch count ensures we only get 1 message at a time, 
    # ensuring fair dispatch if we have multiple workers.
    channel.basic_qos(prefetch_count=1)
    
    channel.basic_consume(queue="orders", on_message_callback=process_order)

    print("[*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()

if __name__ == "__main__":
    main()

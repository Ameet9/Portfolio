import time
import random

def call_inventory_service(req_id: int):
    """Fast service simulation."""
    time.sleep(random.uniform(0.01, 0.05))
    return f"Inventory-{req_id}: Success"

def call_payment_service(req_id: int):
    """Flaky service simulation."""
    if random.random() < 0.2:
        time.sleep(10.0)
    else:
        time.sleep(random.uniform(2.0, 5.0))
    return f"Payment-{req_id}: Success"

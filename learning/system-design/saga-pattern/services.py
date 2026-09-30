import logging

# Set up simple logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('services')

# Global state for simulation
state = {
    "orders": {},
    "payments": {},
    "inventory": {
        "item_A": 10
    }
}

def reset_state():
    state["orders"].clear()
    state["payments"].clear()
    state["inventory"]["item_A"] = 10
    logger.info("System state reset to defaults.")

def create_order(order_id, item, quantity):
    logger.info(f"Executing create_order: {order_id} for {quantity}x {item}")
    state["orders"][order_id] = {"status": "CREATED", "item": item, "quantity": quantity}
    return True

def cancel_order(order_id, item, quantity):
    logger.info(f"Compensating cancel_order: {order_id}")
    if order_id in state["orders"]:
        state["orders"][order_id]["status"] = "CANCELLED"
    return True

def charge_payment(order_id, amount):
    logger.info(f"Executing charge_payment: {amount} for {order_id}")
    state["payments"][order_id] = {"status": "CHARGED", "amount": amount}
    return True

def refund_payment(order_id, amount):
    logger.info(f"Compensating refund_payment: {amount} for {order_id}")
    if order_id in state["payments"]:
        state["payments"][order_id]["status"] = "REFUNDED"
    return True

def reserve_inventory(order_id, item, quantity):
    logger.info(f"Executing reserve_inventory: {quantity}x {item} for {order_id}")
    current_stock = state["inventory"].get(item, 0)
    if current_stock < quantity:
        raise Exception(f"Insufficient stock for {item}. Requested: {quantity}, Available: {current_stock}")
    state["inventory"][item] -= quantity
    return True

def release_inventory(order_id, item, quantity):
    logger.info(f"Compensating release_inventory: {quantity}x {item} for {order_id}")
    state["inventory"][item] = state["inventory"].get(item, 0) + quantity
    return True

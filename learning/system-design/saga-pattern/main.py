import logging
from orchestrator import SagaOrchestrator
from services import (
    create_order, cancel_order,
    charge_payment, refund_payment,
    reserve_inventory, release_inventory,
    reset_state, state
)

def print_separator(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def print_state():
    print(f"Current State: {state}\n")

def run_scenario(scenario_name, item, quantity, amount):
    print_separator(scenario_name)
    print_state()
    
    order_id = "ORD-123"
    
    orchestrator = SagaOrchestrator()
    
    orchestrator.add_step(
        execute_fn=create_order,
        compensate_fn=cancel_order,
        kwargs={"order_id": order_id, "item": item, "quantity": quantity}
    )
    
    orchestrator.add_step(
        execute_fn=charge_payment,
        compensate_fn=refund_payment,
        kwargs={"order_id": order_id, "amount": amount}
    )
    
    orchestrator.add_step(
        execute_fn=reserve_inventory,
        compensate_fn=release_inventory,
        kwargs={"order_id": order_id, "item": item, "quantity": quantity}
    )
    
    success, message = orchestrator.run()
    
    if success:
        print(f"\n[✓] {scenario_name} finished successfully!")
    else:
        print(f"\n[✗] {scenario_name} failed: {message}")
        print("Compensation transactions should have run.")
        
    print_state()

if __name__ == "__main__":
    # Setup root logger
    logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
    
    # 1. Successful scenario
    # Item A has 10 stock, asking for 2. Will succeed.
    run_scenario("SCENARIO 1: Successful Order Flow", item="item_A", quantity=2, amount=100.0)
    
    reset_state()
    
    # 2. Failure scenario
    # Item A has 10 stock, asking for 20. Inventory reservation will fail.
    run_scenario("SCENARIO 2: Failure Flow (Insufficient Inventory)", item="item_A", quantity=20, amount=1000.0)

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from simulation import call_inventory_service, call_payment_service

def main():
    print("Starting Naive Simulation (Shared Thread Pool)")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {}
        # Fire 5 payment calls (slow)
        for i in range(5):
            futures[executor.submit(call_payment_service, i)] = ("Payment", time.time())
            
        # Fire 25 inventory calls (fast)
        for i in range(25):
            futures[executor.submit(call_inventory_service, i)] = ("Inventory", time.time())
            
        inventory_latencies = []
        payment_latencies = []
        
        for future in as_completed(futures):
            job_type, enqueue_time = futures[future]
            try:
                res = future.result()
                latency = time.time() - enqueue_time
                if job_type == "Inventory":
                    inventory_latencies.append(latency)
                else:
                    payment_latencies.append(latency)
                print(f"Completed: {res} (Latency: {latency:.2f}s)")
            except Exception as e:
                print(f"Error: {e}")
                
    if inventory_latencies:
        print(f"\nAverage Inventory Latency: {sum(inventory_latencies)/len(inventory_latencies):.2f}s")
    if payment_latencies:
        print(f"Average Payment Latency: {sum(payment_latencies)/len(payment_latencies):.2f}s")

if __name__ == "__main__":
    main()

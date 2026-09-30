import time
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from simulation import call_inventory_service, call_payment_service

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=15):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED, OPEN, HALF_OPEN

    def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit Breaker is OPEN")

        try:
            res = func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failures = 0
            return res
        except Exception as e:
            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.failure_threshold:
                self.state = "OPEN"
            raise e

circuit_breaker = CircuitBreaker()

def call_payment_with_cb(req_id):
    return circuit_breaker.call(call_payment_service, req_id)

def main():
    print("Starting Bulkhead Simulation (Isolated Thread Pools)")
    
    inventory_executor = ThreadPoolExecutor(max_workers=8)
    payment_executor = ThreadPoolExecutor(max_workers=2)
    
    futures = {}
    
    # Fire 5 payment calls
    for i in range(5):
        futures[payment_executor.submit(call_payment_with_cb, i)] = ("Payment", time.time())
        
    # Fire 25 inventory calls
    for i in range(25):
        futures[inventory_executor.submit(call_inventory_service, i)] = ("Inventory", time.time())
        
    inventory_latencies = []
    payment_latencies = []
    
    for future in as_completed(futures):
        job_type, enqueue_time = futures[future]
        try:
            # using a timeout
            res = future.result(timeout=12.0)
            latency = time.time() - enqueue_time
            if job_type == "Inventory":
                inventory_latencies.append(latency)
            else:
                payment_latencies.append(latency)
            print(f"Completed: {res} (Latency: {latency:.2f}s)")
        except TimeoutError:
            print(f"Timeout for {job_type}")
        except Exception as e:
            print(f"Error for {job_type}: {e}")
            
    inventory_executor.shutdown()
    payment_executor.shutdown()
    
    if inventory_latencies:
        print(f"\nAverage Inventory Latency: {sum(inventory_latencies)/len(inventory_latencies):.2f}s")
    if payment_latencies:
        print(f"Average Payment Latency: {sum(payment_latencies)/len(payment_latencies):.2f}s")

if __name__ == "__main__":
    main()

import time
import requests
from circuit_breaker import CircuitBreaker, CircuitOpenError

def make_request(timeout):
    url = "http://localhost:5001/data"
    # We raise an exception for bad status codes so the breaker counts them as failures
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    return response.json()

def fallback_function():
    return {"data": "Fallback data - cached or default", "status": "fallback"}

def main():
    print("--- Calling service WITH Circuit Breaker ---")
    
    # Initialize breaker: 3 failures trip it, wait 5 seconds before trying again
    breaker = CircuitBreaker(failure_threshold=3, cooldown_period=5, timeout=2)
    
    # Make sure failure mode is toggled on for demonstration
    try:
        requests.post("http://localhost:5001/toggle-failure")
        print("Toggled failure mode ON.")
    except Exception:
        print("Make sure flaky_service.py is running!")
        return

    total_start = time.time()
    
    for i in range(20):
        print(f"\nRequest {i+1}/20 [State: {breaker.state.name}]:")
        start_time = time.time()
        
        try:
            # We call the breaker's call method, passing our function
            result = breaker.call(make_request)
            duration = time.time() - start_time
            print(f"Success in {duration:.2f}s: {result}")
            
        except CircuitOpenError as e:
            duration = time.time() - start_time
            print(f"Fail-Fast in {duration:.2f}s: {e}")
            print(f"Fallback triggered: {fallback_function()}")
            
        except Exception as e:
            duration = time.time() - start_time
            print(f"Error in {duration:.2f}s: {e}")
            print(f"Fallback triggered: {fallback_function()}")
            
        # Add a small delay between requests so we can observe the cooldown period
        time.sleep(1)
            
    total_time = time.time() - total_start
    print(f"\nTotal execution time: {total_time:.2f}s")
    
    # Toggle back
    requests.post("http://localhost:5001/toggle-failure")

if __name__ == "__main__":
    main()

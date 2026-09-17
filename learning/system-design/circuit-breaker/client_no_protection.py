import time
import requests

def call_flaky_service():
    url = "http://localhost:5001/data"
    try:
        start_time = time.time()
        # Set a timeout so we don't wait forever, but it's still slow
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        duration = time.time() - start_time
        return response.json(), duration
    except requests.exceptions.RequestException as e:
        duration = time.time() - start_time
        raise Exception(f"Failed after {duration:.2f}s: {e}")

def main():
    print("--- Calling service WITHOUT Circuit Breaker ---")
    total_start = time.time()
    
    # Make sure failure mode is toggled on for demonstration
    try:
        requests.post("http://localhost:5001/toggle-failure")
        print("Toggled failure mode ON.")
    except Exception:
        print("Make sure flaky_service.py is running!")
        return

    for i in range(20):
        print(f"\nRequest {i+1}/20:")
        try:
            result, duration = call_flaky_service()
            print(f"Success in {duration:.2f}s: {result}")
        except Exception as e:
            print(f"Error: {e}")
            
    total_time = time.time() - total_start
    print(f"\nTotal execution time: {total_time:.2f}s")
    
    # Toggle back
    requests.post("http://localhost:5001/toggle-failure")

if __name__ == "__main__":
    main()

import time
import random
from stream_tracker import PriceStreamTracker

def run_demo():
    print("Starting Live Price Stream Dashboard...")
    print("Tracking 5-tick rolling maximum\n")
    
    k = 5
    tracker = PriceStreamTracker(k)
    
    # Simulate a stream of 15 prices
    prices = [round(random.uniform(10.0, 100.0), 2) for _ in range(15)]
    
    for i, price in enumerate(prices):
        print(f"[Tick {i:02d}] New Price: ${price:>5.2f}", end="")
        
        max_price = tracker.add_price(price)
        
        if max_price is not None:
            print(f"  --> Rolling {k}-Tick Max: ${max_price:>5.2f}")
        else:
            print("  --> Buffering...")
            
        time.sleep(0.2)

if __name__ == "__main__":
    run_demo()

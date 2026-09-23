import random
from median_tracker import MedianTracker

def simulate_traffic():
    """
    Simulate API request latency to demonstrate why percentiles (median)
    are a more robust metric than the mean (average).
    """
    tracker = MedianTracker()
    total_time = 0.0
    
    print("Starting latency simulation...")
    print("Scenario: 95% requests are fast (10-50ms), 5% hit network spikes (500-2000ms)")
    print("-" * 65)
    print(f"{'Requests':<10} | {'Running Average':<20} | {'Running Median (p50)':<20}")
    print("-" * 65)
    
    # Simulate 1000 requests
    for i in range(1, 1001):
        # 95% of the time, latency is between 10ms and 50ms
        # 5% of the time, we hit a pause or network spike (500ms to 2000ms)
        if random.random() < 0.95:
            latency = random.uniform(10, 50)
        else:
            latency = random.uniform(500, 2000)
        
        tracker.add_num(latency)
        total_time += latency
        
        # Print stats every 100 requests
        if i % 100 == 0:
            avg_latency = total_time / i
            med_latency = tracker.find_median()
            print(f"{i:<10} | {avg_latency:<17.2f} ms | {med_latency:<17.2f} ms")

if __name__ == "__main__":
    simulate_traffic()

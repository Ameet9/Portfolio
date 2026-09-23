# Real-Time Median Tracker

This project implements a Real-Time Median Tracker using the Two-Heaps (priority queue) algorithm. It is frequently used in systems that need to analyze telemetry, network latency, or financial data streams where recalculating percentiles on the fly is essential.

## Overview
Calculating the running median of a sequence of numbers usually requires sorting the numbers, which operates in O(n log n) time. For data streams, doing this per insertion is highly inefficient. 

The Two-Heaps approach allows us to find the running median in **O(1)** time while inserting new elements in **O(log n)** time.

## Architecture & Balancing Logic
The data structure splits the input stream into two halves:
1. **`lower_half`**: A Max-Heap containing the smaller half of the numbers. (Implemented in Python by negating values, since `heapq` is a Min-Heap by default).
2. **`upper_half`**: A Min-Heap containing the larger half of the numbers.

### Insertion Logic
When `add_num` is called:
1. We always add the number to the `lower_half` (Max-Heap).
2. **Value balancing**: If the largest number in the `lower_half` is greater than the smallest number in the `upper_half`, we pop it from the `lower_half` and push it to the `upper_half`.
3. **Size balancing**: We maintain the property that the heaps have equal sizes, or the `lower_half` has exactly one more element than the `upper_half`. If they violate this, we shift an element from one heap to another.

### Finding the Median
- If `len(lower_half) > len(upper_half)`, the total number of elements is odd, and the median is simply the top of `lower_half`.
- If sizes are equal, the total is even, and the median is the average of the tops of both heaps.

## Time Complexity
- **`add_num(num)`**: O(log n) – pushing and popping from heaps takes logarithmic time.
- **`find_median()`**: O(1) – simply inspecting the top of the heaps is constant time.
- **Space Complexity**: O(n) to store all incoming numbers in the heaps.

## Why Percentiles over Averages?
The included script `simulate_latency.py` demonstrates why median (p50 latency) is vastly superior to mean (average) latency in tracking system health.
- Averages are highly susceptible to outliers. A few slow network spikes (e.g., 2000ms latency) will drastically skew the average response time.
- The Median represents the typical user experience. If the median is 20ms, it means 50% of your users experienced 20ms or faster.

## How to Run

1. Navigate to the project directory:
   ```powershell
   cd d:\Portfolio\learning\dsa\median-tracker\
   ```
2. Run the latency simulation:
   ```powershell
   python simulate_latency.py
   ```
3. Run the unit tests (Requires pytest):
   ```powershell
   pytest test_median_tracker.py
   ```

## Interview Q&A

**Q: How would you optimize this if 99% of the stream was integers from 0 to 100?**
*A: Instead of heaps, we could maintain an array of size 101 to count frequencies (bucket sort/counting sort approach). Finding the median would be O(1) space and O(1) time iterating through the array up to a count of n/2.*

**Q: How does this scale in a distributed system where data arrives at different machines?**
*A: Storing every single element across massive fleets isn't feasible. In production systems like Datadog or Prometheus, we use data sketches (like t-digest or HDRHistogram). These probabilistic data structures estimate percentiles very accurately with a strict memory bound and O(1) merge times across servers.*

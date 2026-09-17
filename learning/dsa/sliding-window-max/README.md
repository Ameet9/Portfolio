# Sliding Window Maximum / Monotonic Deque

## Overview
This project demonstrates the implementation of the "Sliding Window Maximum" problem using a Monotonic Deque. It features both a brute force solution and an optimal O(n) amortized solution, along with a simulated real-world stream tracker.

## Architecture
- `brute_force.py`: A naive approach calculating the maximum of each subarray explicitly.
- `monotonic_deque.py`: An optimal approach using a double-ended queue.
- `stream_tracker.py`: An object-oriented adaptation processing a stream of real-time data.
- `demo.py`: A live console dashboard simulating incoming stream data.
- `test_sliding_window.py`: Unit tests covering common cases and edge cases.

## How to Run
```bash
# Run the demo
python demo.py

# Run tests
pytest test_sliding_window.py
```

## Key Concepts
### Why deque over array/stack?
A deque (double-ended queue) is used because we need efficient O(1) operations at *both* ends of our data structure:
- We remove "expired" elements from the **front**.
- We remove smaller, useless elements from the **back**.
Standard stacks only allow operations at one end, and arrays would require O(n) time to remove elements from the front.

### Time and Space Complexity
- **Time Complexity:** O(n) - Although there is a `while` loop nested inside a `for` loop, every element is pushed into the deque at most once and popped at most once. Thus, the total number of operations across the entire loop is bounded by 2n.
- **Space Complexity:** O(k) - The deque will store at most `k` elements at any given time (the size of our window).

### Amortized Complexity Explanation
The term "amortized O(1)" for each insertion means that while a single insertion *might* trigger a while loop that pops many elements, the *average* cost over time remains O(1). Because an element can only be popped once, a heavy O(k) operation on one step is "paid for" by earlier O(1) operations, keeping the total time across all elements strictly linear.

## Interview Q&A

**1. Why store indices instead of values?**
We need to know when an element has fallen outside the current window `[i - k + 1, i]`. Values don't tell us their position in the stream, but indices allow us to easily check if the element at the front of the deque has expired (`dq[0] < i - k + 1`).

**2. Why pop smaller elements from the back?**
If a new element is larger than previous elements in our window, those previous smaller elements can *never* be the maximum in this or any future window because the new element is both larger and will stay in the window longer. We discard them to maintain a strictly decreasing sequence.

**3. What is a Monotonic Deque?**
A Monotonic Deque is a double-ended queue whose elements are strictly increasing or strictly decreasing. In this problem, it's strictly decreasing, meaning the largest element is always at the front, and the elements get smaller towards the back.

**4. Why is the time complexity O(n) if there is a nested loop?**
Because the inner loop doesn't do a full scan of `n` or `k`. It only pops elements that were already pushed. Since an element is pushed exactly once and popped at most once, the total operations across all iterations sum up to 2n, making it O(n) overall.

**5. How would you handle a streaming scenario where `n` is infinite?**
Instead of keeping a full array of data, we would store tuples of `(index, value)` inside our deque, just like the `PriceStreamTracker` does in this project. We process one element at a time and only keep a rolling state of maximum size `k`.

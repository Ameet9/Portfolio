# Fenwick Tree (Binary Indexed Tree)

## Overview
A Fenwick Tree or Binary Indexed Tree (BIT) is a data structure that can efficiently update elements and calculate prefix sums in an array of numbers. It balances the time complexity of both operations to `O(log N)`.

## Why Naive Prefix-Sum Array Fails for Frequent Updates
In a naive prefix-sum array:
- **Querying** a prefix sum is `O(1)` (very fast).
- **Updating** an element requires updating all subsequent prefix sums, which takes `O(N)` time.

If an application requires both frequent updates and frequent range queries, the naive approach becomes a bottleneck. The Fenwick Tree solves this by making both updates and queries `O(log N)`.

## Architecture & Implementation
The core idea is to represent an integer as a sum of powers of 2. Each node in the Fenwick Tree stores the sum of a specific range of elements. 

### How `i & -i` Isolates the Lowest Set Bit
In two's complement representation, `-i` is calculated by inverting all bits of `i` and adding `1`. 
When you perform a bitwise AND between `i` and `-i` (`i & -i`), all bits above the lowest set bit become `0`, isolating the lowest set bit itself.
Example for `i = 10` (binary `1010`):
- `-10` is `0110` (in 4-bit representation)
- `1010 & 0110` = `0010` (which is `2`).

### Update: Walking Upward
To add a value to index `i`, we update the node at `i` and then **walk upward** to update all ranges that encompass `i`. We find the next node to update by adding the lowest set bit: `i += i & -i`.

### Query: Walking Downward
To get the prefix sum up to index `i`, we accumulate the value at node `i` and **walk downward** to process the preceding ranges that make up the complete prefix. We find the next node by subtracting the lowest set bit: `i -= i & -i`.

## How to Run Tests
Make sure `pytest` is installed and run:
```powershell
pytest test_fenwick.py
```

## Key Concepts
- **1-based Indexing**: Fenwick trees are usually 1-indexed to make the bitwise operations work correctly (since index 0 would result in an infinite loop for updates).
- **Space Complexity**: `O(N)`, same as the original array.
- **Time Complexity**: `O(log N)` for both `update` and `query`.

## Fenwick Tree vs Segment Tree
| Feature | Fenwick Tree | Segment Tree |
|---------|--------------|--------------|
| Code Complexity | Very simple, concise | More complex |
| Memory | `O(N)` (exactly size N) | `O(N)` (usually 4N array) |
| Operations | Usually limited to invertible operations (like sum, xor) | Highly versatile (max, min, sum, etc.) |
| Constant Factors | Smaller, typically faster | Larger, slightly slower in practice |

## Interview Q&A

**Q: Can a Fenwick Tree handle Range Minimum Queries (RMQ)?**
A: Not efficiently in the standard implementation. Fenwick Trees rely on the operation being invertible (like subtraction for addition) to compute range queries `[l, r]` as `prefix[r] - prefix[l-1]`. `min` and `max` are not invertible. You'd typically use a Segment Tree or Sparse Table for RMQ.

**Q: How do you build a Fenwick Tree in O(N) time?**
A: Instead of calling `update` `N` times (which is `O(N log N)`), you can initialize the array, and then loop through each node `i` from `1` to `N`, adding its value to its immediate parent `i + (i & -i)`. This takes `O(N)` time.

**Q: What is a typical use case?**
A: Real-time analytics, such as maintaining page view counts over sliding time windows, or dynamically counting inversions in an array. Our `PageViewCounter` class demonstrates the time-series histogram use case.

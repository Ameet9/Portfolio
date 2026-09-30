# Stock Span Analyzer (Monotonic Stack)

## Overview
This project implements the "Online Stock Span" problem using a Monotonic Stack to achieve amortized O(1) time complexity per `next()` operation (overall O(n) for n elements). It also includes the related "Next Greater Element" problem which utilizes the same pattern.

## Architecture & Key Concepts
### Monotonic Stack Pattern
A monotonic stack is a stack whose elements are monotonically increasing or decreasing. In the Stock Span problem, we use a strictly decreasing monotonic stack. 
When a new price comes in, we pop all elements from the stack that are less than or equal to the current price. The number of popped elements (plus their previously accumulated spans) gives the span for the current price. 
Since each element is pushed and popped at most once, the time complexity is amortized O(1) per call, making it highly efficient.

### Amortized O(n) Analysis
In `StockSpannerFast`, the `while` loop might seem like it could take O(n) time for a single call. However, across `n` total calls, every price is pushed onto the stack exactly once and popped at most once. Therefore, the total number of stack operations across `n` calls is bounded by `2n`. The time complexity is thus O(n) for `n` operations, yielding an amortized O(1) time per operation.

### Comparison to Deque
A stack only requires operations at one end (LIFO). A deque (Double Ended Queue) allows operations at both ends. For finding the next greater/smaller element or the stock span, we only need to look at the most recently added items that violate our condition, which naturally aligns with a stack. Using a deque would be overkill and wouldn't provide any performance benefits.

### Property-Testing against an Oracle
The `benchmark.py` acts as a test harness. It uses property-based testing principles by generating a sequence of random inputs and verifying that the optimized implementation (`StockSpannerFast`) behaves exactly identically to an unquestionable brute-force oracle (`StockSpannerNaive`).

## How to Run
Prerequisites: Python 3 installed.
```powershell
# Run the benchmark and tests
python benchmark.py

# Run the next greater element script
python next_greater.py
```

## Interview Q&A
**Q: Why does the stack approach yield O(n) instead of O(n^2)?**
A: Because each element is pushed onto the stack exactly once and popped at most once. The `while` loop runs at most `n` times in total over all `n` calls to `next()`, not `n` times per call.

**Q: Could we use an array instead of a stack?**
A: A stack is typically implemented using an array (like a Python `list`) under the hood. The key is restricting operations to `append` and `pop` from the end to maintain O(1) time complexity. 

**Q: How do you handle duplicate prices?**
A: The problem usually defines span as consecutive days with price <= today's price. Our condition `self.stack[-1][0] <= price` naturally pops duplicate prices and accumulates their spans correctly.

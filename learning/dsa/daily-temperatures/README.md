# Daily Temperatures

## Overview
This project solves the "Daily Temperatures" problem, where given an array of temperatures, the goal is to calculate the number of days you have to wait until a warmer temperature. If there is no future day for which this is possible, the answer is 0.

## Architecture & Implementation
We provide two implementations:
- **Brute Force (`brute_force`)**: $O(n^2)$ time complexity. For each temperature, it scans the rest of the array to find the next greater element.
- **Monotonic Stack (`daily_temperatures_fast`)**: $O(n)$ time complexity. This uses a stack to keep track of the indices of temperatures that haven't yet found a warmer future day. The temperatures corresponding to the indices in the stack are strictly monotonically decreasing (from bottom to top). 

## How to Run
Prerequisites: Python 3.x installed.

To run the CLI tool:
```powershell
python cli.py 73 74 75 71 69 72 76 73
```
Or interactively:
```powershell
python cli.py
```

To run the tests:
```powershell
python test_cases.py
```

## Key Concepts
- **Monotonic Stack**: A stack whose elements are always sorted (monotonically increasing or decreasing). For this problem, we maintain a decreasing stack of indices.
- **Amortized $O(n)$ Analysis**: Even though there is a `while` loop inside the `for` loop in the fast approach, every element is pushed to the stack exactly once and popped at most once. Thus, the inner loop runs at most $n$ times across all iterations of the outer loop, yielding an amortized time complexity of $O(1)$ per element, or $O(n)$ overall.

## Comparison to Monotonic Deque
While a monotonic stack is ideal for finding the *next greater element* (where order and recency matter, but we only process in one direction), a **monotonic deque** (double-ended queue) is generally used for sliding window problems (like "Sliding Window Maximum"). A stack only allows operations at one end, whereas a deque allows removing outdated elements from the front while maintaining monotonicity at the back.

## Related Problems
- **Online Stock Span**: Similar next-greater-element logic but looking backwards.
- **Trapping Rain Water**: Uses a monotonic stack or two-pointer approach to find bounding heights.
- **Next Greater Element I & II**: Direct applications of monotonic stacks.

## Interview Q&A
**Q: Why use a stack instead of just iterating?**
A: Iterating leads to repeated work, $O(n^2)$ time in the worst case (like a strictly decreasing array). A stack remembers elements that are still waiting for a warmer day, allowing us to resolve them efficiently in $O(n)$ time.

**Q: Does the stack store temperatures or indices?**
A: It stores indices. We need to calculate the distance (number of days) between the current day and the day of the warmer temperature, which requires the indices.

**Q: Can this be done in $O(1)$ extra space?**
A: If the output array doesn't count towards extra space, we can iterate from right to left and use the output array itself to jump to the next possible warmer day, achieving $O(1)$ auxiliary space. However, the stack method is generally more intuitive for interviews.

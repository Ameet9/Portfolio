# Trapping Rain Water

## Overview
This project visualizes and solves the classic "Trapping Rain Water" algorithmic problem. Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

## Architecture
- `brute_force.py`: O(n^2) implementation.
- `two_pointer.py`: O(n) time, O(1) space optimal two-pointer implementation.
- `visualizer.py`: A script that runs the algorithm on a sample array and prints an ASCII art visualizer of the elevation map (using `#` for walls and `~` for trapped water).
- `benchmark.py`: Compares brute force vs two-pointer on a large array (5000 elements) to demonstrate the performance difference.

## How to Run
Navigate to the project directory and run the scripts using Python:
```powershell
python visualizer.py
python benchmark.py
```

## Key Concepts

- **Brute Force:** 
  For each element, we find the maximum height to its left and right. The water trapped on top of it is `min(max_left, max_right) - height`. Time complexity is O(n^2) because we scan the array for each element to find the maxes.

- **Precomputed Array (Dynamic Programming):** 
  By precomputing the `max_left` and `max_right` for each element in O(n) time and storing them in two arrays, we can reduce the time complexity to O(n). However, the space complexity increases to O(n) to store these arrays.

- **Two Pointer:** 
  Using two pointers from both ends, we maintain the maximum heights seen so far (`left_max` and `right_max`). Since the water trapped depends on the smaller of the two maximums, we can safely compute the trapped water for the side with the smaller max and move its pointer inward. This achieves optimal O(n) time complexity and O(1) space complexity.

## Interview Q&A

**Q: Can we solve this problem in O(1) space?**
A: Yes, the two-pointer approach achieves O(1) space while maintaining O(n) time complexity by updating the max heights dynamically from both ends without storing precomputed maxes in arrays.

**Q: Why does the two-pointer approach work?**
A: The amount of water trapped depends on the minimum of the maximum heights on both sides. By keeping track of `left_max` and `right_max` and advancing the pointer pointing to the smaller max, we guarantee that the minimum of the two maxes is correct for the current element, because the other side has an equal or larger max.

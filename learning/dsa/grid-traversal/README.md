# Number of Islands

## Overview
The **Number of Islands** problem is a classic algorithmic challenge in grid traversal. Given an `m x n` 2D binary grid representing a map of `'1'`s (land) and `'0'`s (water), the task is to return the number of islands.
An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

## Architecture & Concepts
We implement three different variants to solve the problem:
1. **DFS (Depth-First Search)**: `islands_dfs.py`
2. **BFS (Breadth-First Search)**: `islands_bfs.py`
3. **No-Modify BFS**: `islands_no_modify.py`

### DFS vs BFS Trade-offs
- **DFS**:
  - Easier to write recursively.
  - Less code.
  - **Risk**: Stack overflow on very large grids or long winding islands due to recursion limits.
- **BFS**:
  - Requires a Queue data structure (e.g., `collections.deque`).
  - Iterative, avoids deep call stacks.
  - Safer for massive grids, immune to recursion depth limits.

### The Flood-Fill Pattern Family
This grid traversal technique is part of a broader family of problems:
- Rotting Oranges (multi-source BFS)
- Surrounded Regions (boundary-initiated flood fill)
- Max Area of Island (counting cells during flood fill)
- Word Search (DFS with backtracking)

## Complexity
- **Time Complexity**: `O(rows * cols)` - In the worst case, we visit every cell in the grid.
- **Space Complexity**: `O(rows * cols)` worst case - For the recursive call stack in DFS, the queue in BFS, or the visited set in the no-modify variant.

## Visual Example
```
Standard 3 Islands
🟢 🟢 🌊 🌊 🌊
🟢 🟢 🌊 🌊 🌊
🌊 🌊 🟢 🌊 🌊
🌊 🌊 🌊 🟢 🟢
```
This grid contains **3 islands**.

## How to Run

Run the interactive demo to see timings and visual outputs:
```powershell
python demo.py
```

Run tests using pytest:
```powershell
pytest test_islands.py
```

## Interview Q&A

1. **Why does the order of boundary checks matter in DFS?**
   If you check `grid[r][c] == 0` before checking `r < 0` or `r >= rows`, it will throw an `IndexError` when the search goes out of bounds. Always check indices before accessing the array.

2. **Why do we "sink" the island (change 1s to 0s) as we go?**
   By marking visited cells as 0, we prevent infinite loops and ensure we don't count the same piece of land twice. It essentially acts as our "visited" state without needing extra memory.

3. **What is the trade-off of the `no_modify` approach?**
   Mutating the input grid uses `O(1)` auxiliary space for tracking visited cells, but it destroys the original data. If the grid is used by other parts of the system or is read-only, you must use a separate `visited` set, which costs `O(rows * cols)` extra memory.

4. **Why use `collections.deque` for BFS instead of a list?**
   Python lists are arrays under the hood. Removing from the front of a list `pop(0)` is an `O(N)` operation because all subsequent elements must shift. `deque` is a doubly linked list, making `popleft()` an `O(1)` operation.

5. **When is BFS strictly better than DFS for this problem?**
   When the grid is extremely large (e.g., 10,000 x 10,000) and contains snake-like islands that could cause deep recursion. Python has a default recursion limit (usually 1000), and deep DFS will result in a `RecursionError`. BFS handles this gracefully by allocating memory on the heap instead of the call stack.

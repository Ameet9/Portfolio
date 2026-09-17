from typing import List

def count_islands_dfs(grid: List[List[int]]) -> int:
    """
    Counts the number of islands using Depth-First Search (DFS).
    Modifies the grid in-place by marking visited land (1) as water (0).
    """
    if not grid or not grid[0]:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r: int, c: int):
        # Boundary checks MUST happen in this order:
        # 1. Check if row or col is out of bounds (r < 0, r >= rows, etc.)
        # 2. Check if the cell is water or already visited (grid[r][c] == 0)
        # If we check grid[r][c] before boundary, we get IndexError!
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
            return

        # Sink the island cell to mark it as visited and prevent infinite loops.
        # This modifies the grid in-place, which is very space-efficient O(1) extra memory,
        # but destroys the original data.
        grid[r][c] = 0

        # Traverse 4 directions
        dfs(r + 1, c) # down
        dfs(r - 1, c) # up
        dfs(r, c + 1) # right
        dfs(r, c - 1) # left

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                # Found an unvisited piece of land, start a new island
                islands += 1
                dfs(r, c)
                
    return islands

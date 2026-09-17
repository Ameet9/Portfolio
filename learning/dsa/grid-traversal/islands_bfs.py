from typing import List
from collections import deque

def count_islands_bfs(grid: List[List[int]]) -> int:
    """
    Counts the number of islands using Breadth-First Search (BFS).
    Modifies the grid in-place by marking visited land (1) as water (0).
    """
    if not grid or not grid[0]:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0

    def bfs(start_r: int, start_c: int):
        # Use collections.deque for O(1) popleft operations
        # BFS avoids deep recursion, preventing stack overflow on large grids.
        # This is especially important for massive serpentine islands.
        q = deque([(start_r, start_c)])
        
        # Mark as visited as soon as we enqueue to prevent duplicate processing
        grid[start_r][start_c] = 0
        
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while q:
            r, c = q.popleft()
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                
                # Check bounds and if it's unvisited land
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    # Enqueue unvisited neighbor
                    q.append((nr, nc))
                    # Mark visited immediately to prevent adding the same cell multiple times
                    grid[nr][nc] = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                islands += 1
                bfs(r, c)
                
    return islands

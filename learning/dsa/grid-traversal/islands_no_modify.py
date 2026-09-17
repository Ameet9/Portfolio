from typing import List, Set, Tuple
from collections import deque

def count_islands_no_modify(grid: List[List[int]]) -> int:
    """
    Variant that does not modify the input grid.
    Instead, it uses a separate visited set.
    Trade-off: 
      - Preserves input data (good for APIs where input shouldn't be mutated).
      - Uses O(rows * cols) extra memory for the visited set.
    """
    if not grid or not grid[0]:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0
    visited: Set[Tuple[int, int]] = set()

    def bfs(start_r: int, start_c: int):
        q = deque([(start_r, start_c)])
        visited.add((start_r, start_c))
        
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while q:
            r, c = q.popleft()
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in visited:
                    q.append((nr, nc))
                    visited.add((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in visited:
                islands += 1
                bfs(r, c)
                
    return islands

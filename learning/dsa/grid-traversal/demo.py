import time
from grid_utils import (
    pretty_print, copy_grid, 
    GRID_3_ISLANDS, ALL_WATER, ALL_LAND, 
    DIAGONAL_TOUCHING, SINGLE_CELL_LAND, SINGLE_CELL_WATER, LARGE_GRID
)
from islands_dfs import count_islands_dfs
from islands_bfs import count_islands_bfs
from islands_no_modify import count_islands_no_modify

def run_demo():
    test_cases = [
        ("Standard 3 Islands", GRID_3_ISLANDS),
        ("All Water", ALL_WATER),
        ("All Land", ALL_LAND),
        ("Diagonal Touching", DIAGONAL_TOUCHING),
        ("Single Cell Land", SINGLE_CELL_LAND),
        ("Single Cell Water", SINGLE_CELL_WATER)
    ]
    
    for name, grid in test_cases:
        print(f"--- {name} ---")
        pretty_print(grid)
        
        # Grid mutation warnings
        g_dfs = copy_grid(grid)
        g_bfs = copy_grid(grid)
        
        start_time = time.perf_counter()
        res_dfs = count_islands_dfs(g_dfs)
        t_dfs = time.perf_counter() - start_time
        
        start_time = time.perf_counter()
        res_bfs = count_islands_bfs(g_bfs)
        t_bfs = time.perf_counter() - start_time
        
        start_time = time.perf_counter()
        res_no_mod = count_islands_no_modify(grid)
        t_no_mod = time.perf_counter() - start_time
        
        print(f"DFS: {res_dfs} islands (took {t_dfs:.6f}s)")
        print(f"BFS: {res_bfs} islands (took {t_bfs:.6f}s)")
        print(f"No-Mod: {res_no_mod} islands (took {t_no_mod:.6f}s)\n")
        assert res_dfs == res_bfs == res_no_mod, "Mismatch in results!"

    # Stress Test
    print("--- Large Grid Stress Test (50x50 Checkerboard) ---")
    g_large1 = copy_grid(LARGE_GRID)
    g_large2 = copy_grid(LARGE_GRID)
    start_time = time.perf_counter()
    ans1 = count_islands_dfs(g_large1)
    t1 = time.perf_counter() - start_time
    
    start_time = time.perf_counter()
    ans2 = count_islands_bfs(g_large2)
    t2 = time.perf_counter() - start_time
    
    print(f"Large Grid DFS: {ans1} islands (took {t1:.6f}s)")
    print(f"Large Grid BFS: {ans2} islands (took {t2:.6f}s)")

if __name__ == "__main__":
    run_demo()

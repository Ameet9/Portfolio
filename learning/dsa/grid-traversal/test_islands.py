import pytest
from grid_utils import (
    copy_grid, GRID_3_ISLANDS, ALL_WATER, ALL_LAND, 
    DIAGONAL_TOUCHING, SINGLE_CELL_LAND, SINGLE_CELL_WATER
)
from islands_dfs import count_islands_dfs
from islands_bfs import count_islands_bfs
from islands_no_modify import count_islands_no_modify

@pytest.fixture
def test_grids():
    return [
        (GRID_3_ISLANDS, 3),
        (ALL_WATER, 0),
        (ALL_LAND, 1),
        (DIAGONAL_TOUCHING, 2),
        (SINGLE_CELL_LAND, 1),
        (SINGLE_CELL_WATER, 0)
    ]

def test_dfs(test_grids):
    for grid, expected in test_grids:
        assert count_islands_dfs(copy_grid(grid)) == expected

def test_bfs(test_grids):
    for grid, expected in test_grids:
        assert count_islands_bfs(copy_grid(grid)) == expected

def test_identical_results(test_grids):
    for grid, _ in test_grids:
        dfs_grid = copy_grid(grid)
        bfs_grid = copy_grid(grid)
        assert count_islands_dfs(dfs_grid) == count_islands_bfs(bfs_grid)

def test_no_modify_preserves_input():
    grid = copy_grid(GRID_3_ISLANDS)
    original_grid = copy_grid(GRID_3_ISLANDS)
    
    assert count_islands_no_modify(grid) == 3
    assert grid == original_grid  # Ensure input was not mutated

def test_empty_grid():
    assert count_islands_dfs([]) == 0
    assert count_islands_dfs([[]]) == 0
    assert count_islands_bfs([]) == 0
    assert count_islands_bfs([[]]) == 0
    assert count_islands_no_modify([]) == 0
    assert count_islands_no_modify([[]]) == 0

def test_single_row_col():
    row_grid = [[1, 0, 1, 1, 0, 1]]
    assert count_islands_dfs(copy_grid(row_grid)) == 3
    
    col_grid = [[1], [0], [1], [1], [0], [1]]
    assert count_islands_bfs(copy_grid(col_grid)) == 3

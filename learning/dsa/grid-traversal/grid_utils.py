import copy
from typing import List

def pretty_print(grid: List[List[int]]) -> None:
    for row in grid:
        line = ""
        for val in row:
            if val == 1:
                line += "🟢 " # Land
            else:
                line += "🌊 " # Water
        print(line)
    print()

def copy_grid(grid: List[List[int]]) -> List[List[int]]:
    return copy.deepcopy(grid)

# Test Grids
GRID_3_ISLANDS = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1]
]

ALL_WATER = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]

ALL_LAND = [
    [1, 1],
    [1, 1]
]

DIAGONAL_TOUCHING = [
    [1, 0],
    [0, 1]
]

SINGLE_CELL_LAND = [[1]]
SINGLE_CELL_WATER = [[0]]

LARGE_GRID = [[1 if (i+j)%2 == 0 else 0 for j in range(50)] for i in range(50)]

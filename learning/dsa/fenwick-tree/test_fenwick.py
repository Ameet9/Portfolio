import random
import pytest
from fenwick_tree import FenwickTree

def test_fenwick_tree_basic():
    ft = FenwickTree(10)
    
    # Array initially: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ft.update(1, 5)
    ft.update(3, 2)
    ft.update(5, 7)
    
    # Prefix sums
    assert ft.query(1) == 5
    assert ft.query(2) == 5  # No update at 2, so same as query(1)
    assert ft.query(3) == 7  # 5 + 2
    assert ft.query(4) == 7
    assert ft.query(5) == 14 # 5 + 2 + 7
    
    # Range queries
    assert ft.range_query(2, 5) == 9 # sum of indices 2,3,4,5 => 0 + 2 + 0 + 7
    assert ft.range_query(1, 5) == 14

def test_fenwick_tree_random_brute_force():
    n = 100
    arr = [0] * n
    ft = FenwickTree(n)
    
    # Apply random updates
    for _ in range(100):
        idx = random.randint(1, n)
        val = random.randint(-50, 50)
        
        # Update our brute force array (0-indexed)
        arr[idx - 1] += val
        
        # Update Fenwick tree (1-indexed)
        ft.update(idx, val)
        
    # Verify prefix sums
    current_sum = 0
    for i in range(1, n + 1):
        current_sum += arr[i - 1]
        assert ft.query(i) == current_sum
        
    # Verify range queries with random ranges
    for _ in range(100):
        l = random.randint(1, n)
        r = random.randint(l, n)
        
        # Brute force sum slice
        expected_sum = sum(arr[l - 1:r])
        
        assert ft.range_query(l, r) == expected_sum

def test_out_of_bounds_range_query():
    ft = FenwickTree(5)
    ft.update(1, 10)
    assert ft.range_query(3, 2) == 0 # l > r

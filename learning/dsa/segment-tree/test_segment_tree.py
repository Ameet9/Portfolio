"""
Unit tests for SegmentTree comparing against brute-force approach.
"""
import pytest
import random
from segment_tree import SegmentTree
from stock_tracker import StockPriceTracker

def test_segment_tree_sum():
    # Generate random array
    random.seed(42)
    n = 100
    data = [random.randint(1, 1000) for _ in range(n)]
    
    # Initialize SegmentTree for range sum queries
    tree = SegmentTree(data, merge_func=lambda x, y: x + y, default_val=0)
    
    # Test initial queries
    for _ in range(50):
        l = random.randint(0, n - 1)
        r = random.randint(l, n - 1)
        
        tree_res = tree.query(l, r)
        brute_res = sum(data[l:r+1])
        
        assert tree_res == brute_res, f"Sum mismatch for range [{l}, {r}]"
        
    # Test updates and queries
    for _ in range(50):
        # Update
        idx = random.randint(0, n - 1)
        val = random.randint(1, 1000)
        data[idx] = val
        tree.update(idx, val)
        
        # Query
        l = random.randint(0, n - 1)
        r = random.randint(l, n - 1)
        
        tree_res = tree.query(l, r)
        brute_res = sum(data[l:r+1])
        
        assert tree_res == brute_res, f"Sum mismatch after update for range [{l}, {r}]"


def test_stock_tracker_max():
    # Initial stock prices for 10 days
    prices = [100, 105, 95, 110, 115, 108, 120, 118, 125, 130]
    tracker = StockPriceTracker(prices)
    
    # Query maximum price between day 2 and day 5 (95, 110, 115, 108) -> max is 115
    assert tracker.get_max_price(2, 5) == 115
    
    # Update price at day 3 to 135
    tracker.update_price(3, 135)
    
    # Query maximum price between day 2 and day 5 (95, 135, 115, 108) -> max is 135
    assert tracker.get_max_price(2, 5) == 135
    
    # Query overall max
    assert tracker.get_max_price(0, 9) == 135
    
    # Brute force testing on random stock prices
    random.seed(99)
    random_prices = [random.randint(50, 500) for _ in range(50)]
    random_tracker = StockPriceTracker(random_prices)
    
    for _ in range(50):
        # Point update
        day = random.randint(0, 49)
        new_p = random.randint(50, 500)
        random_prices[day] = new_p
        random_tracker.update_price(day, new_p)
        
        # Query
        l = random.randint(0, 49)
        r = random.randint(l, 49)
        
        tree_max = random_tracker.get_max_price(l, r)
        brute_max = max(random_prices[l:r+1])
        
        assert tree_max == brute_max, f"Max mismatch after update for range [{l}, {r}]"

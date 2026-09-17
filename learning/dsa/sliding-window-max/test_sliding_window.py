import pytest
from brute_force import sliding_window_max_brute
from monotonic_deque import sliding_window_max

def test_standard_case():
    prices = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    expected = [3, 3, 5, 5, 6, 7]
    assert sliding_window_max_brute(prices, k) == expected
    assert sliding_window_max(prices, k) == expected

def test_strictly_increasing():
    prices = [1, 2, 3, 4, 5]
    k = 2
    expected = [2, 3, 4, 5]
    assert sliding_window_max_brute(prices, k) == expected
    assert sliding_window_max(prices, k) == expected

def test_strictly_decreasing():
    prices = [5, 4, 3, 2, 1]
    k = 2
    expected = [5, 4, 3, 2]
    assert sliding_window_max_brute(prices, k) == expected
    assert sliding_window_max(prices, k) == expected

def test_k_equals_one():
    prices = [1, 3, -1, 5]
    k = 1
    expected = [1, 3, -1, 5]
    assert sliding_window_max_brute(prices, k) == expected
    assert sliding_window_max(prices, k) == expected

def test_k_equals_length():
    prices = [1, 3, -1, 5]
    k = 4
    expected = [5]
    assert sliding_window_max_brute(prices, k) == expected
    assert sliding_window_max(prices, k) == expected

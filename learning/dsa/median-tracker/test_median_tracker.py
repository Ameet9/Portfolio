import random
import pytest
from median_tracker import MedianTracker

def test_median_against_brute_force():
    """
    Compare the Two-Heaps MedianTracker against a brute-force sorted list approach
    over 1000 random floating point insertions.
    """
    tracker = MedianTracker()
    nums = []
    
    for _ in range(1000):
        # Generate a random latency
        num = random.uniform(0, 1000)
        tracker.add_num(num)
        nums.append(num)
        
        # Brute force sorted median
        nums.sort()
        n = len(nums)
        if n % 2 == 1:
            expected_median = nums[n // 2]
        else:
            expected_median = (nums[n // 2 - 1] + nums[n // 2]) / 2.0
        
        # Verify the tracking median is correct (allowing for floating point precision)
        assert abs(tracker.find_median() - expected_median) < 1e-7

def test_empty_tracker():
    """
    Test edge cases when finding median on an empty stream.
    """
    tracker = MedianTracker()
    with pytest.raises(ValueError):
        tracker.find_median()

def test_single_element():
    tracker = MedianTracker()
    tracker.add_num(42)
    assert tracker.find_median() == 42.0

def test_two_elements():
    tracker = MedianTracker()
    tracker.add_num(10)
    tracker.add_num(20)
    assert tracker.find_median() == 15.0

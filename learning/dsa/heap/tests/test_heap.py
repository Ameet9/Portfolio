"""
Tests for MinHeap and Meeting Rooms II.
"""
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from min_heap import MinHeap
from meeting_rooms import min_meeting_rooms

def test_min_heap_basic():
    heap = MinHeap()
    assert heap.is_empty() == True
    
    heap.insert(5)
    assert heap.peek() == 5
    assert len(heap) == 1
    
    heap.insert(3)
    assert heap.peek() == 3
    
    heap.insert(7)
    assert heap.peek() == 3
    
    assert heap.extract_min() == 3
    assert heap.peek() == 5
    
    assert heap.extract_min() == 5
    assert heap.extract_min() == 7
    
    assert heap.is_empty() == True

def test_min_heap_sort():
    heap = MinHeap()
    elements = [10, 4, 1, 9, 7, 3, 2, 8, 5, 6]
    for el in elements:
        heap.insert(el)
        
    sorted_elements = []
    while not heap.is_empty():
        sorted_elements.append(heap.extract_min())
        
    assert sorted_elements == sorted(elements)

def test_min_meeting_rooms():
    # Test case 1: Overlapping meetings
    assert min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2
    
    # Test case 2: Non-overlapping meetings
    assert min_meeting_rooms([[7, 10], [2, 4]]) == 1
    
    # Test case 3: Empty intervals
    assert min_meeting_rooms([]) == 0
    
    # Test case 4: Single interval
    assert min_meeting_rooms([[1, 5]]) == 1
    
    # Test case 5: Multiple rooms needed
    assert min_meeting_rooms([[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]) == 4

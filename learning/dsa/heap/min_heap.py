"""
Min-Heap implementation backed by a list.
"""
from typing import Any

class MinHeap:
    """
    A Min-Heap data structure.
    
    A min-heap is a complete binary tree where the value of each node is less than
    or equal to the values of its children. This implementation uses an array (list)
    where:
    - Left child index: 2i + 1
    - Right child index: 2i + 2
    - Parent index: (i - 1) // 2
    """
    def __init__(self) -> None:
        self.heap: list[Any] = []

    def __len__(self) -> int:
        return len(self.heap)

    def is_empty(self) -> bool:
        """Return True if the heap is empty, False otherwise."""
        return len(self.heap) == 0

    def peek(self) -> Any:
        """
        Return the minimum element without removing it.
        
        Returns:
            The minimum element.
            
        Raises:
            IndexError: If the heap is empty.
        """
        if self.is_empty():
            raise IndexError("peek from an empty heap")
        return self.heap[0]

    def insert(self, val: Any) -> None:
        """
        Insert a value into the heap.
        
        Args:
            val: The value to insert.
        """
        self.heap.append(val)
        self._bubble_up(len(self.heap) - 1)

    def extract_min(self) -> Any:
        """
        Remove and return the minimum element from the heap.
        
        Returns:
            The minimum element.
            
        Raises:
            IndexError: If the heap is empty.
        """
        if self.is_empty():
            raise IndexError("extract_min from an empty heap")
        
        if len(self.heap) == 1:
            return self.heap.pop()
            
        min_val = self.heap[0]
        # Move the last element to the root and bubble it down
        self.heap[0] = self.heap.pop()
        self._bubble_down(0)
        
        return min_val

    def _bubble_up(self, index: int) -> None:
        """
        Restore the heap property by moving the element at index up the tree.
        
        Args:
            index: The index of the element to bubble up.
        """
        parent_index = (index - 1) // 2
        
        while index > 0 and self.heap[index] < self.heap[parent_index]:
            # Swap with parent
            self.heap[index], self.heap[parent_index] = self.heap[parent_index], self.heap[index]
            index = parent_index
            parent_index = (index - 1) // 2

    def _bubble_down(self, index: int) -> None:
        """
        Restore the heap property by moving the element at index down the tree.
        
        Args:
            index: The index of the element to bubble down.
        """
        length = len(self.heap)
        
        while True:
            left_child_index = 2 * index + 1
            right_child_index = 2 * index + 2
            smallest = index
            
            if left_child_index < length and self.heap[left_child_index] < self.heap[smallest]:
                smallest = left_child_index
                
            if right_child_index < length and self.heap[right_child_index] < self.heap[smallest]:
                smallest = right_child_index
                
            if smallest != index:
                # Swap with the smallest child
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break

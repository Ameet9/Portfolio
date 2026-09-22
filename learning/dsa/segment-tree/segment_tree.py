"""
Segment Tree implementation for range queries and point updates.
Supports operations like range sum, range min, range max.
"""
from typing import Callable, List, Optional

class SegmentTree:
    def __init__(self, data: List[int], merge_func: Callable[[int, int], int], default_val: int):
        """
        Initialize the Segment Tree.
        
        Args:
            data: The initial array of values.
            merge_func: Function to merge two child nodes (e.g., sum, min, max).
            default_val: Identity element for the merge_func (e.g., 0 for sum, inf for min).
        """
        self.n = len(data)
        self.merge = merge_func
        self.default_val = default_val
        
        if self.n > 0:
            # The tree can take up to 4*N space
            self.tree = [self.default_val] * (4 * self.n)
            self.build(data, 0, 0, self.n - 1)
        else:
            self.tree = []

    def build(self, data: List[int], node: int, start: int, end: int):
        """
        Recursively build the segment tree.
        """
        if start == end:
            # Leaf node will have a single element
            self.tree[node] = data[start]
        else:
            mid = (start + end) // 2
            left_child = 2 * node + 1
            right_child = 2 * node + 2
            
            # Build left and right children
            self.build(data, left_child, start, mid)
            self.build(data, right_child, mid + 1, end)
            
            # Current node is the merge of its children
            self.tree[node] = self.merge(self.tree[left_child], self.tree[right_child])

    def update(self, index: int, value: int):
        """
        Update the value at a specific index in the original array.
        """
        if self.n == 0:
            return
        self._update_recursive(0, 0, self.n - 1, index, value)

    def _update_recursive(self, node: int, start: int, end: int, index: int, value: int):
        if start == end:
            # Leaf node, update the value
            self.tree[node] = value
        else:
            mid = (start + end) // 2
            left_child = 2 * node + 1
            right_child = 2 * node + 2
            
            if start <= index <= mid:
                # If index is in the left child, recurse on left child
                self._update_recursive(left_child, start, mid, index, value)
            else:
                # If index is in the right child, recurse on right child
                self._update_recursive(right_child, mid + 1, end, index, value)
                
            # Update current node after children are updated
            self.tree[node] = self.merge(self.tree[left_child], self.tree[right_child])

    def query(self, l: int, r: int) -> int:
        """
        Query the range [l, r] (inclusive).
        """
        if self.n == 0 or l > r or l < 0 or r >= self.n:
            return self.default_val
        return self._query_recursive(0, 0, self.n - 1, l, r)

    def _query_recursive(self, node: int, start: int, end: int, l: int, r: int) -> int:
        # If the range represented by the node is completely outside the query range
        if r < start or end < l:
            return self.default_val
            
        # If the range represented by the node is completely inside the query range
        if l <= start and end <= r:
            return self.tree[node]
            
        # Otherwise, partial overlap, query both children
        mid = (start + end) // 2
        left_child = 2 * node + 1
        right_child = 2 * node + 2
        
        left_res = self._query_recursive(left_child, start, mid, l, r)
        right_res = self._query_recursive(right_child, mid + 1, end, l, r)
        
        return self.merge(left_res, right_res)

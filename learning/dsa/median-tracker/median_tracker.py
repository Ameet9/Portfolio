import heapq

class MedianTracker:
    """
    Real-Time Median Tracker using the Two-Heaps pattern.
    Maintains a running median of a stream of numbers.
    """
    def __init__(self):
        # max-heap (invert signs in Python) for the lower half of numbers
        self.lower_half = []
        # min-heap for the upper half of numbers
        self.upper_half = []

    def add_num(self, num: float) -> None:
        """
        Adds a number into the data structure.
        Time Complexity: O(log n)
        """
        # Add to lower half first
        heapq.heappush(self.lower_half, -num)
        
        # 1. Balance values: The largest in lower_half must be <= smallest in upper_half
        if self.lower_half and self.upper_half and (-self.lower_half[0] > self.upper_half[0]):
            val = -heapq.heappop(self.lower_half)
            heapq.heappush(self.upper_half, val)
        
        # 2. Balance sizes: lower_half can have at most 1 more element than upper_half
        if len(self.lower_half) > len(self.upper_half) + 1:
            val = -heapq.heappop(self.lower_half)
            heapq.heappush(self.upper_half, val)
        elif len(self.upper_half) > len(self.lower_half):
            val = heapq.heappop(self.upper_half)
            heapq.heappush(self.lower_half, -val)

    def find_median(self) -> float:
        """
        Returns the median of current data stream.
        Time Complexity: O(1)
        """
        if not self.lower_half:
            raise ValueError("No numbers added yet.")
        
        # If total number of elements is odd, lower_half has the extra element
        if len(self.lower_half) > len(self.upper_half):
            return float(-self.lower_half[0])
        # If even, average the top of both heaps
        else:
            return (-self.lower_half[0] + self.upper_half[0]) / 2.0

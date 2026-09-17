from collections import deque

class PriceStreamTracker:
    """
    Simulates a real-world streaming metrics service using a monotonic deque.
    Processes one price at a time and returns the max of the last k prices.
    """
    def __init__(self, k: int):
        self.k = k
        # Stores tuples of (index, price) since we don't have a fixed array
        self.dq = deque()
        self.current_index = 0
        
    def add_price(self, price: float) -> float | None:
        """
        Adds a new price from the stream.
        Returns the maximum price of the last k elements if the window is full, otherwise None.
        """
        if self.k == 0:
            return None
            
        # 1. Remove expired elements from the front
        if self.dq and self.dq[0][0] < self.current_index - self.k + 1:
            self.dq.popleft()
            
        # 2. Maintain monotonic decreasing invariant
        while self.dq and self.dq[-1][1] <= price:
            self.dq.pop()
            
        # 3. Add the new price with its stream index
        self.dq.append((self.current_index, price))
        
        self.current_index += 1
        
        # 4. Return current max if window is full
        if self.current_index >= self.k:
            return self.dq[0][1]
            
        return None

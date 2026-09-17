from collections import deque

def sliding_window_max(prices: list[float], k: int) -> list[float]:
    """
    Optimized implementation of sliding window maximum using a monotonic deque.
    Time Complexity: O(n) - each element is pushed and popped at most once.
    Space Complexity: O(k) - the deque stores at most k elements.
    """
    if not prices or k == 0:
        return []
    
    # We store INDICES in the deque, not the actual values.
    # Why? We need to know when an element "expires" (falls out of the window).
    # If we only stored values, we wouldn't know its position.
    dq = deque()
    result = []
    
    for i, price in enumerate(prices):
        # 1. Pop expired indices from the front
        # If the index at the front of the deque is out of the current window [i - k + 1, i]
        if dq and dq[0] < i - k + 1:
            dq.popleft()
            
        # 2. Maintain the strictly decreasing value invariant
        # We pop smaller values from the back because they are useless.
        # A smaller value that comes BEFORE the current value `price` can NEVER 
        # be the maximum in any future window, because `price` is both larger and comes later.
        while dq and prices[dq[-1]] <= price:
            dq.pop()
            
        # 3. Add the current element's index
        dq.append(i)
        
        # 4. Record the result if we have processed at least k elements
        # (i.e., we have formed the first full window)
        if i >= k - 1:
            # The maximum of the current window is always at the front of the deque
            result.append(prices[dq[0]])
            
    return result

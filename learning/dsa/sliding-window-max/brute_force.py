def sliding_window_max_brute(prices: list[float], k: int) -> list[float]:
    """
    Brute force implementation of sliding window maximum.
    Time Complexity: O(n*k) - for every window of size k, we scan all k elements.
    Space Complexity: O(1) excluding the output array.
    """
    if not prices or k == 0:
        return []
    
    n = len(prices)
    if k > n:
        return [max(prices)]
        
    result = []
    # Loop over all possible window starting positions
    for i in range(n - k + 1):
        # We slice the array and find the maximum inside the window.
        # This is the slow part: we are recalculating the max from scratch
        # for each window instead of reusing work from the previous window.
        window_max = max(prices[i:i+k])
        result.append(window_max)
        
    return result

def trap_brute_force(height):
    """
    Brute force approach to Trapping Rain Water.
    Time Complexity: O(n^2)
    Space Complexity: O(1)
    
    For each bar, we find the maximum height to its left and the maximum height to its right.
    The water trapped above it is min(max_left, max_right) - height[i].
    """
    if not height:
        return 0
        
    n = len(height)
    ans = 0
    
    for i in range(n):
        left_max = 0
        right_max = 0
        
        # Find maximum element on its left
        for j in range(i, -1, -1):
            left_max = max(left_max, height[j])
            
        # Find maximum element on its right
        for j in range(i, n):
            right_max = max(right_max, height[j])
            
        ans += min(left_max, right_max) - height[i]
        
    return ans

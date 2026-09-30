def trap_two_pointer(height):
    """
    Two-pointer approach to Trapping Rain Water.
    Time Complexity: O(n)
    Space Complexity: O(1)
    
    We use two pointers, one at the beginning and one at the end of the array.
    We maintain the maximum heights seen so far from the left and right.
    Since water trapped depends on the smaller of the two max heights,
    we can process the side with the smaller max and move its pointer inward.
    """
    if not height:
        return 0
        
    left = 0
    right = len(height) - 1
    
    left_max = height[left]
    right_max = height[right]
    
    ans = 0
    
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            ans += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            ans += right_max - height[right]
            
    return ans

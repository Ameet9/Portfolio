from typing import List

def next_greater_element(nums1: List[int], nums2: List[int]) -> List[int]:
    """
    Finds the next greater element for each element in nums1, which is a subset of nums2.
    Uses a monotonic decreasing stack.
    """
    next_greater = {}
    stack = []
    
    # Process nums2 from left to right
    for num in nums2:
        # While stack is not empty and current number is greater than stack's top
        while stack and stack[-1] < num:
            smaller_num = stack.pop()
            next_greater[smaller_num] = num
        
        # Push current number onto stack
        stack.append(num)
        
    # For remaining elements in stack, there is no next greater element
    for num in stack:
        next_greater[num] = -1
        
    # Build result for nums1 based on the mapping
    return [next_greater[num] for num in nums1]

# Example usage:
if __name__ == "__main__":
    nums1 = [4, 1, 2]
    nums2 = [1, 3, 4, 2]
    print(f"nums1 = {nums1}, nums2 = {nums2}")
    print(f"Next Greater Element: {next_greater_element(nums1, nums2)}")

def visualize(height):
    """
    Visualizes the elevation map and trapped water using ASCII art.
    '#' is used for walls and '~' is used for trapped water.
    """
    n = len(height)
    if n == 0:
        print("Empty elevation map.")
        return
        
    # Precompute water levels for accurate visualization
    left_max = [0] * n
    right_max = [0] * n
    
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(height[i], left_max[i-1])
        
    right_max[-1] = height[-1]
    for i in range(n-2, -1, -1):
        right_max[i] = max(height[i], right_max[i+1])
        
    water = [0] * n
    for i in range(n):
        water[i] = min(left_max[i], right_max[i]) - height[i]
        
    max_h = max(height)
    if max_h == 0:
        print("Flat ground, no water can be trapped.")
        return
        
    print(f"Input Array: {height}\n")
    print("Elevation Map Visualization:\n")
    
    # Print from top down
    for row in range(max_h, 0, -1):
        line = ""
        for i in range(n):
            if height[i] >= row:
                line += "# " # Wall
            elif height[i] + water[i] >= row:
                line += "~ " # Trapped Water
            else:
                line += "  " # Empty space
        print(line)
        
    # Print ground layer
    print("- " * n)
    print(f"\nTotal Water Trapped: {sum(water)} units")

if __name__ == "__main__":
    test_case = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
    visualize(test_case)

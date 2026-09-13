from typing import List
from union_find import UnionFind

def count_friend_circles(matrix: List[List[int]]) -> int:
    """
    Solves the 'Friend Circles' (or 'Number of Provinces') problem.
    
    Given an n x n matrix where matrix[i][j] = 1 if the ith and jth students
    are direct friends, and 0 otherwise, find the total number of friend circles.
    A friend circle is a group of students who are direct or indirect friends.
    
    This is essentially finding the number of connected components in an
    undirected graph.
    
    Args:
        matrix: An n x n adjacency matrix representing friendships.
        
    Returns:
        int: The number of friend circles.
    """
    if not matrix:
        return 0
        
    n = len(matrix)
    uf = UnionFind(n)
    
    for i in range(n):
        for j in range(i + 1, n):  # We only need to check the upper triangle
            if matrix[i][j] == 1:
                uf.union(i, j)
                
    return uf.component_count()

if __name__ == "__main__":
    # Example usage
    friends_matrix = [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1]
    ]
    # Students 0 and 1 are friends, student 2 has no friends.
    # Total friend circles = 2
    circles = count_friend_circles(friends_matrix)
    print(f"Friend circles: {circles}")

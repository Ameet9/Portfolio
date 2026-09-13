class UnionFind:
    """
    A Disjoint Set Union (DSU) or Union-Find data structure.
    
    This data structure solves the dynamic connectivity problem, allowing us to:
    1. Determine which subset a particular element is in.
    2. Join two subsets into a single subset.
    
    It uses two key optimizations:
    - Path Compression: Flattens the structure of the tree whenever `find` is called,
      ensuring that nodes point directly to the root. This keeps the tree very flat.
    - Union by Rank: Attaches the smaller tree to the root of the larger tree during `union`.
      This prevents the tree from becoming a long chain.
      
    Together, these optimizations yield an amortized time complexity of O(α(N)) per operation,
    where α is the inverse Ackermann function, which grows so slowly it is effectively < 5 
    for any practical value of N.
    """

    def __init__(self, n: int):
        """
        Initializes the Union-Find data structure with `n` elements.
        
        Args:
            n (int): The number of elements (0 to n-1).
        """
        self.parent = list(range(n))
        # rank represents the upper bound of the height of the tree
        self.rank = [0] * n
        # size keeps track of the number of elements in each set
        self.size = [1] * n
        self._component_count = n

    def find(self, x: int) -> int:
        """
        Finds the root of the set that element `x` belongs to.
        Applies path compression to keep the tree flat.
        
        Path compression works by making every node on the path from `x` to the root
        point directly to the root. This speeds up future `find` operations.
        
        Args:
            x (int): The element to find.
            
        Returns:
            int: The root (representative) of the set containing `x`.
        """
        if self.parent[x] != x:
            # Path compression: point directly to the root
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        """
        Unions the sets containing elements `x` and `y`.
        Applies union by rank to maintain balanced trees.
        
        Union by rank attaches the tree with the smaller rank to the root of the
        tree with the larger rank. If ranks are equal, one tree is arbitrarily
        attached to the other, and its rank is incremented.
        
        Args:
            x (int): An element in the first set.
            y (int): An element in the second set.
            
        Returns:
            bool: True if `x` and `y` were in different sets and are now merged,
                  False if they were already in the same set.
        """
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False  # Already in the same set

        # Union by rank: attach smaller rank tree under root of higher rank tree
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
            self.size[root_y] += self.size[root_x]
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
            self.size[root_x] += self.size[root_y]
        else:
            self.parent[root_y] = root_x
            self.size[root_x] += self.size[root_y]
            self.rank[root_x] += 1

        self._component_count -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """
        Checks if elements `x` and `y` belong to the same set.
        
        Args:
            x (int): The first element.
            y (int): The second element.
            
        Returns:
            bool: True if `x` and `y` are connected, False otherwise.
        """
        return self.find(x) == self.find(y)

    def component_count(self) -> int:
        """
        Gets the total number of disjoint sets (components).
        
        Returns:
            int: The number of components.
        """
        return self._component_count

    def component_size(self, x: int) -> int:
        """
        Gets the size of the set containing element `x`.
        
        Args:
            x (int): The element whose component size to query.
            
        Returns:
            int: The number of elements in the set containing `x`.
        """
        root = self.find(x)
        return self.size[root]

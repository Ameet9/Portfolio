class FenwickTree:
    """
    A Fenwick Tree (Binary Indexed Tree) implementation for efficient
    updates and prefix sum queries.
    Uses 1-based indexing.
    """
    def __init__(self, size: int):
        """
        Initialize the Fenwick Tree with a given size.
        The tree array is 1-indexed, so we allocate size + 1 elements.
        """
        self.size = size
        self.tree = [0] * (size + 1)

    def update(self, i: int, delta: int) -> None:
        """
        Add `delta` to the element at index `i`.
        This operation cascades the update upwards in the tree.
        `i & -i` extracts the lowest set bit of `i`.
        """
        while i <= self.size:
            self.tree[i] += delta
            # Move to the next node by adding the lowest set bit
            i += i & -i

    def query(self, i: int) -> int:
        """
        Compute the prefix sum from index 1 up to index `i`.
        This operation cascades the query downwards in the tree.
        """
        total = 0
        while i > 0:
            total += self.tree[i]
            # Move to the parent node by subtracting the lowest set bit
            i -= i & -i
        return total

    def range_query(self, l: int, r: int) -> int:
        """
        Compute the sum of elements in the inclusive range [l, r].
        """
        if l > r:
            return 0
        return self.query(r) - self.query(l - 1)

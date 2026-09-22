# Segment Tree Project

This project demonstrates the implementation and application of a Segment Tree data structure. It includes a generic Segment Tree that can be customized with different merge functions (e.g., sum, min, max) and a practical wrapper class `StockPriceTracker` to efficiently query the maximum stock price over a period.

## Architecture

The project consists of the following components:
- `segment_tree.py`: Contains the `SegmentTree` class which handles the core logic for building the tree, updating values, and querying ranges.
- `stock_tracker.py`: Contains the `StockPriceTracker` class which uses the `SegmentTree` to perform range max queries on stock prices.
- `test_segment_tree.py`: Contains test cases using `pytest` to verify the accuracy of the Segment Tree against brute-force calculations.

## How to Run

1. Ensure you have Python and `pytest` installed.
2. Navigate to the project directory:
   ```powershell
   cd d:\Portfolio\learning\dsa\segment-tree\
   ```
3. Run the tests:
   ```powershell
   pytest test_segment_tree.py -v
   ```

## Key Concepts

### Why Naive Prefix-Sum Array Fails for Frequent Updates
A prefix-sum array allows answering range sum queries in $O(1)$ time, which is very fast. However, if the underlying array needs to be updated frequently, a prefix-sum array becomes inefficient. Updating a single element in a prefix-sum array requires updating all subsequent prefix sums, taking $O(N)$ time. 
A Segment Tree provides a balanced compromise, allowing both updates and range queries in $O(\log N)$ time.

### The 4*N Array Structure and Recursive Nature
A Segment Tree is a full binary tree. If the original array has size $N$, the segment tree will have at most $4 \times N$ nodes. 
- The root node represents the entire range $[0, N-1]$.
- Its left child represents the first half of the range, and the right child represents the second half.
- This recursive subdivision continues until we reach the leaves, which represent individual elements of the original array.
- In an array representation of the tree (0-indexed), the left child of a node at index `i` is at `2 * i + 1` and the right child is at `2 * i + 2`.

### Lazy Propagation (Concept)
For range updates (updating all elements in a range $[L, R]$ by a certain value), updating each leaf node individually would take $O(N)$ time. Lazy Propagation is an optimization technique where updates are delayed or "lazily" applied. Instead of immediately updating all descendant nodes, we store the update information in the current node and only push it down to children when necessary (when a query or further update visits that part of the tree). This keeps range updates at $O(\log N)$ time.

### Segment Tree vs. Fenwick Tree (Binary Indexed Tree)
- **Flexibility**: Segment Trees can easily support a wide variety of queries (sum, min, max, gcd) whereas Fenwick Trees are generally limited to reversible operations (like sum, xor).
- **Space**: Segment Trees require $O(N)$ space (usually an array of size $4N$), while Fenwick Trees require exactly an array of size $N$.
- **Complexity**: Both have $O(\log N)$ time complexity for updates and queries, but Fenwick Trees typically have smaller constant factors and are easier to implement in fewer lines of code.

## Interview Q&A

**Q: What is the time complexity of building a Segment Tree?**
A: Building the tree takes $O(N)$ time because each node in the tree is computed exactly once, and there are roughly $2N$ nodes in the tree.

**Q: How do you handle range queries that partially overlap with a node's range?**
A: The query function recursively traverses the children. It splits the query and merges the results from the left and right children.

**Q: Can we use a Segment Tree for Range Minimum Queries (RMQ)?**
A: Yes, by passing `min` as the merge function and `infinity` as the default value (identity element), the Segment Tree can seamlessly handle RMQ.

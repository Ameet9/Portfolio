# Union-Find (Disjoint Set Union)

This project provides a professional, production-ready implementation of the Union-Find (also known as Disjoint Set Union or DSU) data structure.

## What Union-Find Solves

Union-Find is designed to solve the **Incremental Connectivity** problem efficiently. It allows us to manage a set of elements partitioned into a number of disjoint (non-overlapping) subsets.

The core operations are:
1. **Find**: Determine which subset a particular element belongs to. This can be used for determining if two elements are in the same subset.
2. **Union**: Join two subsets into a single subset.

This is highly useful for algorithms like Kruskal's Minimum Spanning Tree, checking for cycles in an undirected graph, and determining connected components.

## Key Optimizations

A naive implementation of Union-Find can result in trees degenerating into long chains, leading to $O(N)$ time complexity per operation. We use two powerful heuristics to bring the amortized time complexity down to near $O(1)$ — specifically $O(\alpha(N))$ where $\alpha$ is the inverse Ackermann function.

### 1. Path Compression
When `find` is called, we traverse up the tree to find the root. Path compression flattens the tree by making every visited node point directly to the root.

**Before Path Compression:**
```text
      0 (root)
     /
    1
   /
  2
 /
3 (searching for root of 3)
```

**After Path Compression:**
```text
      0 (root)
    / | \
   1  2  3
```
Next time we call `find(3)`, it will take $O(1)$ time because 3 points directly to 0.

### 2. Union by Rank
When merging two sets with `union`, we always attach the root of the shorter tree to the root of the taller tree. This guarantees that the height of the tree only increases when we merge two trees of the exact same height. It keeps our trees shallow.

### Why BOTH together?
Using just Union by Rank guarantees $O(\log N)$ operations. Using just Path Compression guarantees amortized $O(\log N)$. But using **both** gives us $O(\alpha(N))$, which for all practical values of $N$ (even the number of atoms in the universe) is less than 5. It is effectively $O(1)$.

## Real-world Analogies
- **Friend Circles**: If Alice is friends with Bob, and Bob is friends with Charlie, Alice and Charlie are in the same friend circle (connected component).
- **Network Connectivity**: In a computer network, computers are connected via cables (or routers). If we keep adding cables between pairs of servers, Union-Find quickly tells us if Server A can talk to Server B.
- **Cluster Membership**: In machine learning or image processing, Union-Find can quickly group adjacent pixels or similar data points into distinct clusters.

## Project Structure
- `union_find.py`: The core DSU class with path compression and union by rank.
- `friend_circles.py`: A solution to the classic "Number of Provinces / Friend Circles" problem.
- `network_connectivity.py`: A simulated network monitor wrapping Union-Find to track disjoint networks.
- `tests/test_union_find.py`: Comprehensive test suite verifying correctness, performance edge cases, and path compression behavior.

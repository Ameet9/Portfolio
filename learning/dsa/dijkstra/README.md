# Dijkstra's Flight Route Optimizer

## Overview
This project implements **Dijkstra's Algorithm** to find the shortest (cheapest) paths between nodes in a graph. In our scenario, the graph represents a flight network where nodes are cities and edges are flights with a dollar cost.

Dijkstra's is widely used in routing, mapping (like Google Maps), and network protocols (like OSPF) to find optimal paths efficiently.

## Architecture and Key Concepts

### The Greedy Invariant
Dijkstra's algorithm is greedy: it always explores the cheapest known reachable node next. 
**Why is this safe?** It relies on the invariant that **edge weights are non-negative**. Because costs can never go down, once we extract a node from our min-heap, we know for certain we have found the absolute shortest path to it. Any alternative path going through other unvisited nodes would only add more non-negative cost, making it longer.

### Adjacency List vs. Adjacency Matrix
We use an **Adjacency List** (`dict` of `dict`s in Python: `{node: {neighbor: cost}}`) rather than an Adjacency Matrix (a 2D array).
- **Trade-off:** Adjacency lists are much more space-efficient for *sparse graphs* (like real-world flight networks where most cities aren't directly connected to every other city). A matrix would take `O(V^2)` space and most entries would be "infinity". Adjacency lists take `O(V + E)` space and make iterating over a node's neighbors faster.

### Min-Heap vs Array Scan
We use a **Min-Heap** (`heapq` in Python) to select the next node to visit.
- **Why?** Finding the minimum in an unsorted array takes `O(V)` time. Doing this `V` times leads to `O(V^2)` performance. A min-heap allows us to extract the minimum element in `O(log V)` time, dropping the overall time complexity to `O((V + E) log V)`.

## K-Stops Variant (Cheapest Flights Within K Stops)
This project also includes a LeetCode-style variant: finding the cheapest route with a maximum of `K` stops.
Standard Dijkstra optimization (tracking a single `visited` set) fails here because a path might be more expensive but have *fewer stops*, making it a viable candidate to reach the destination within the stop limit. We modify the algorithm to track the minimum number of stops used to reach each city instead of a simple visited set.

## Time and Space Complexity
- **Time Complexity:** `O((V + E) log V)` where `V` is the number of vertices (cities) and `E` is the number of edges (flights). The `log V` comes from heap operations.
- **Space Complexity:** `O(V + E)` to store the graph, distances, and priority queue.

## How to Run

1. Make sure you have Python 3 installed.
2. Run the interactive demo:
   ```powershell
   python demo.py
   ```
3. Run tests using `pytest` (requires `pip install pytest`):
   ```powershell
   pytest test_dijkstra.py
   ```

## Interview Q&A

**1. What happens if the graph has negative edge weights?**
Dijkstra's algorithm assumes non-negative weights (the greedy invariant). If negative weights exist, a node might be popped from the heap, marked as "shortest path found," but later a cheaper path might be discovered via a negative edge. Bellman-Ford algorithm should be used if negative weights are possible.

**2. Why use a Priority Queue (Min-Heap)?**
To efficiently get the next closest node. It reduces the time complexity of finding the minimum from `O(V)` to `O(log V)`, making the algorithm practical for large graphs.

**3. When would you use BFS instead of Dijkstra?**
If all edge weights are equal (or if it's an unweighted graph), Breadth-First Search (BFS) is better because it finds the shortest path in `O(V + E)` time without the `O(log V)` overhead of a heap.

**4. How does the space complexity change if the graph is dense?**
In a dense graph where `E ≈ V^2`, the space for the priority queue can grow to `O(V^2)` in the worst case (if we don't update keys but push duplicates), and the graph representation also takes `O(V^2)` space. The time complexity becomes `O(V^2 log V)`.

**5. How would you reconstruct the actual path?**
By maintaining a `previous` (or `parent`) dictionary. When we update the shortest distance to `neighbor` from `current`, we record `previous[neighbor] = current`. At the end, we backtrack from the destination node using this dictionary until we reach the start node, then reverse the result.

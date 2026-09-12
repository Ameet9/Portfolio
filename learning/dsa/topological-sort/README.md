# Topological Sort / Build-Order Resolver

This project implements **Topological Sort**, an algorithm designed to linearly order the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge `u -> v`, vertex `u` comes before vertex `v` in the ordering.

Topological sorting is only possible for DAGs (graphs with no cycles). If a cycle exists, there is a circular dependency, which means the tasks cannot be resolved.

## Real-world Use Cases
- **Package Managers**: Resolving dependencies (e.g., `npm`, `pip`).
- **Build Systems**: Determining the order of compilation (e.g., `Make`, `Bazel`).
- **CI/CD Pipelines**: Scheduling jobs based on prerequisites (e.g., build -> test -> deploy).
- **Task Scheduling**: Ordering tasks where certain tasks must be completed before others begin.

## Algorithms Implemented

### 1. Kahn's Algorithm (BFS-based)
Kahn's algorithm approaches the problem iteratively using an in-degree array (or map) and a queue.

**Steps:**
1. Compute the in-degree (number of incoming edges) for every node.
2. Enqueue all nodes with an in-degree of 0 (nodes with no dependencies).
3. While the queue is not empty:
   - Dequeue a node and append it to the topological order.
   - For each neighbor of the dequeued node, decrement its in-degree by 1.
   - If a neighbor's in-degree becomes 0, enqueue it.
4. If the final ordered list doesn't contain all nodes, a cycle exists.

### 2. Depth First Search (DFS-based)
The DFS approach uses a recursive traversal to build the ordering from the bottom up. It employs a 3-color marking scheme to detect cycles.

**Steps:**
1. Mark each node's state:
   - `0`: Unvisited
   - `1`: Visiting (currently in the recursion stack)
   - `2`: Visited (fully processed and added to the result)
2. For each unvisited node, perform a DFS:
   - Mark the current node as Visiting (`1`).
   - Recursively call DFS on all its neighbors. If a neighbor is marked Visiting (`1`), a cycle is detected.
   - Mark the current node as Visited (`2`).
   - Append the node to the topological order.
3. Once all DFS calls are complete, reverse the list to get the final topological order.

from typing import List, Dict, Set
from collections import deque, defaultdict


class CycleDetectedError(Exception):
    """Exception raised when a cycle is detected in the graph."""
    
    def __init__(self, cycle_nodes: List[str] = None):
        self.cycle_nodes = cycle_nodes or []
        msg = "Circular dependency detected"
        if self.cycle_nodes:
            msg += f" involving tasks: {', '.join(self.cycle_nodes)}"
        super().__init__(msg)


class TopologicalSorter:
    """
    A class to perform topological sorting using Kahn's algorithm (BFS)
    or Depth-First Search (DFS).
    """

    def __init__(self) -> None:
        # graph[u] = list of nodes that depend on u
        # To run v, u must be completed first (u -> v).
        # We store u -> [v1, v2, ...]
        self.graph: Dict[str, List[str]] = defaultdict(list)
        # We also want to track all unique nodes we've seen
        self.nodes: Set[str] = set()

    def add_dependency(self, task: str, depends_on: str) -> None:
        """
        Adds a dependency stating that `task` depends on `depends_on`.
        In our graph, this means there is an edge from `depends_on` to `task`.
        """
        self.graph[depends_on].append(task)
        self.nodes.add(task)
        self.nodes.add(depends_on)
        
    def add_node(self, task: str) -> None:
        """Adds a standalone task that has no dependencies."""
        self.nodes.add(task)

    def sort(self) -> List[str]:
        """
        Sorts the nodes topologically using Kahn's Algorithm (BFS).
        
        Returns:
            A list of task names in a valid execution order.
            
        Raises:
            CycleDetectedError: If there is a circular dependency.
        """
        # Step 1: Compute in-degree of all nodes
        in_degree: Dict[str, int] = {node: 0 for node in self.nodes}
        for u in self.graph:
            for v in self.graph[u]:
                in_degree[v] += 1

        # Step 2: Queue all nodes with 0 in-degree
        queue: deque[str] = deque([node for node in self.nodes if in_degree[node] == 0])
        topological_order: List[str] = []

        # Step 3: Process the queue
        while queue:
            current = queue.popleft()
            topological_order.append(current)

            for neighbor in self.graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Step 4: Check for cycles
        if len(topological_order) != len(self.nodes):
            # Find nodes that are stuck in a cycle (in-degree > 0)
            cycle_nodes = [node for node, degree in in_degree.items() if degree > 0]
            raise CycleDetectedError(cycle_nodes)

        return topological_order

    def sort_dfs(self) -> List[str]:
        """
        Sorts the nodes topologically using Depth First Search (DFS).
        Uses a 3-color marking scheme to detect cycles.
        
        Returns:
            A list of task names in a valid execution order.
            
        Raises:
            CycleDetectedError: If there is a circular dependency.
        """
        # states: 0 = unvisited, 1 = visiting, 2 = visited
        state: Dict[str, int] = {node: 0 for node in self.nodes}
        topological_order: List[str] = []
        cycle_path: List[str] = []

        def dfs(node: str) -> bool:
            """
            Returns False if a cycle is detected, True otherwise.
            """
            state[node] = 1
            cycle_path.append(node)

            for neighbor in self.graph[node]:
                if state[neighbor] == 0:
                    if not dfs(neighbor):
                        return False
                elif state[neighbor] == 1:
                    # Found a cycle
                    cycle_path.append(neighbor)
                    return False

            state[node] = 2
            cycle_path.pop()
            # Append post-order
            topological_order.append(node)
            return True

        for node in self.nodes:
            if state[node] == 0:
                if not dfs(node):
                    # We have part of the cycle in cycle_path
                    # Extract just the cycle part
                    cycle_start = cycle_path.index(cycle_path[-1])
                    cycle_nodes = cycle_path[cycle_start:-1]
                    raise CycleDetectedError(cycle_nodes)

        # The DFS appends leaves first, so we reverse it to get correct order
        topological_order.reverse()
        return topological_order

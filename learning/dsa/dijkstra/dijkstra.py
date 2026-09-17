import heapq

def dijkstra(graph: dict, start: str, end: str) -> tuple[float, list[str]]:
    """
    Finds the shortest path between a start and end node using Dijkstra's algorithm.
    
    Args:
        graph: Adjacency list representation of the graph: {node: {neighbor: cost, ...}, ...}
        start: Starting node
        end: Destination node
        
    Returns:
        (total_cost, path) where path is a list of nodes from start to end.
        Returns (float('inf'), []) if no path is found.
    """
    # Track the minimum distance to each node. Initialize all to infinity.
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    
    # Track the best previous node to reconstruct the shortest path later.
    previous = {node: None for node in graph}
    
    # Priority queue (min-heap) to select the next node to visit.
    # We store tuples of (accumulated_cost, current_node).
    # WHY A HEAP? 
    # A min-heap allows us to extract the node with the lowest cost in O(log V) time.
    # If we used a simple array scan, finding the minimum would take O(V) time every step,
    # leading to O(V^2) overall time instead of O((V + E) log V).
    pq = [(0, start)]
    
    # Track visited nodes to avoid redundant processing.
    visited = set()
    
    while pq:
        # Greedily pick the node with the lowest cost so far.
        # WHY IS THIS SAFE?
        # Dijkstra's relies on the invariant that weights are non-negative.
        # Therefore, the first time we pop a node from the min-heap, we have definitively
        # found the absolute shortest path to it. Any other path going through other nodes
        # would only add non-negative costs, making it longer.
        current_cost, current_node = heapq.heappop(pq)
        
        # If we reached our destination, we can stop early.
        if current_node == end:
            break
            
        # If we've already processed this node, skip it.
        # This handles stale, higher-cost entries in the heap.
        if current_node in visited:
            continue
            
        visited.add(current_node)
        
        # Check for negative edges (Dijkstra does not support them)
        for neighbor, weight in graph.get(current_node, {}).items():
            if weight < 0:
                raise ValueError(f"Negative edge weight {weight} detected from {current_node} to {neighbor}")
                
            # If the node is already visited, no need to relax its edges again
            if neighbor in visited:
                continue
                
            new_cost = current_cost + weight
            
            # If we found a cheaper way to reach the neighbor, update it!
            if neighbor not in distances: # Handle disconnected/unknown neighbors implicitly
                distances[neighbor] = float('inf')
                
            if new_cost < distances[neighbor]:
                distances[neighbor] = new_cost
                previous[neighbor] = current_node
                heapq.heappush(pq, (new_cost, neighbor))
                
    # Reconstruct the path
    if distances.get(end, float('inf')) == float('inf'):
        return float('inf'), []
        
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous.get(current)
    
    path.reverse()
    return distances[end], path

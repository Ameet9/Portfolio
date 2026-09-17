import heapq

def cheapest_flights(graph: dict, start: str, end: str, k: int) -> tuple[float, list[str]]:
    """
    Finds the cheapest flight route with at most K stops.
    
    Args:
        graph: Adjacency list representation: {city: {neighbor: cost, ...}, ...}
        start: Starting city
        end: Destination city
        k: Maximum number of stops (e.g., k=0 means direct flight only)
        
    Returns:
        (total_cost, path)
        Returns (float('inf'), []) if no such route exists.
    """
    # Priority queue stores (cost, stops_taken, current_city, path_so_far)
    pq = [(0, 0, start, [start])]
    
    # We cannot use a simple visited set like standard Dijkstra.
    # WHY?
    # In standard Dijkstra, reaching a node with a lower cost guarantees the best path.
    # Here, we might reach a node with a HIGHER cost but FEWER stops. That path might
    # still be viable for reaching the destination within the K-stop limit, whereas
    # the cheaper (but more stops) path might fail.
    # Instead, we track the minimum stops taken to reach a node.
    min_stops = {city: float('inf') for city in graph}
    
    while pq:
        cost, stops, current, path = heapq.heappop(pq)
        
        # If we reached destination, this is the cheapest way (due to min-heap)
        if current == end:
            return cost, path
            
        # If we have taken too many stops, we can't go further from here.
        if stops > k:
            continue
            
        # Optimization: If we've already reached this city with fewer or equal stops
        # we don't need to explore further from here.
        if stops >= min_stops.get(current, float('inf')):
            continue
        min_stops[current] = stops
            
        for neighbor, weight in graph.get(current, {}).items():
            # The next step will have `stops + 1` edges taken
            heapq.heappush(pq, (cost + weight, stops + 1, neighbor, path + [neighbor]))
            
    return float('inf'), []

def build_graph(edges: list[tuple[str, str, float]]) -> dict:
    """
    Builds an adjacency list graph from a list of edges.
    """
    graph = {}
    for src, dst, cost in edges:
        if src not in graph:
            graph[src] = {}
        if dst not in graph:
            graph[dst] = {}
        graph[src][dst] = cost
        
    return graph

def print_graph(graph: dict):
    """Prints the graph nicely."""
    for node, neighbors in graph.items():
        print(f"{node}:")
        for neighbor, cost in neighbors.items():
            print(f"  -> {neighbor} (${cost})")

# Sample 8-city flight network
# Cities: NYC, LAX, ORD, DEN, ATL, SFO, SEA, MIA
FLIGHT_EDGES = [
    ("NYC", "ORD", 150),
    ("NYC", "ATL", 120),
    ("NYC", "MIA", 180),
    ("ORD", "DEN", 130),
    ("ORD", "SEA", 200),
    ("ATL", "MIA", 80),
    ("ATL", "DEN", 160),
    ("MIA", "DEN", 210),
    ("DEN", "LAX", 140),
    ("DEN", "SFO", 150),
    ("DEN", "SEA", 170),
    ("LAX", "SFO", 90),
    ("SEA", "SFO", 110),
    ("SEA", "LAX", 130),
    # Some return flights (not completely symmetric to make it interesting)
    ("SFO", "NYC", 450),
    ("LAX", "NYC", 400),
    ("ORD", "NYC", 160)
]

def get_sample_graph():
    return build_graph(FLIGHT_EDGES)

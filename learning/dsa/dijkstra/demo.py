from flight_graph import get_sample_graph, print_graph
from dijkstra import dijkstra
from cheapest_flights_k_stops import cheapest_flights

def main():
    print("--- Flight Network Graph ---")
    graph = get_sample_graph()
    print_graph(graph)
    print("\n" + "="*40 + "\n")
    
    # 1. Cheapest route from NYC to SFO
    cost, path = dijkstra(graph, "NYC", "SFO")
    print("1. Standard Dijkstra (No restrictions)")
    print(f"Cheapest route NYC -> SFO: {' -> '.join(path)}")
    print(f"Total Cost: ${cost}")
    print("-" * 20)
    
    # 2. Cheapest route from NYC to SEA
    cost, path = dijkstra(graph, "NYC", "SEA")
    print("2. Standard Dijkstra (Different Destination)")
    print(f"Cheapest route NYC -> SEA: {' -> '.join(path)}")
    print(f"Total Cost: ${cost}")
    print("-" * 20)
    
    # 3. Unreachable case
    cost, path = dijkstra(graph, "MIA", "NYC")
    print("3. Unreachable Destination")
    if cost == float('inf'):
        print("No route available from MIA to NYC.")
    print("-" * 20)
    
    # 4. K-stops variant
    k = 1
    cost, path = cheapest_flights(graph, "NYC", "SFO", k)
    print(f"4. K-Stops Constraint (Max {k} stops)")
    if cost != float('inf'):
        print(f"Cheapest route NYC -> SFO with <= {k} stops: {' -> '.join(path)}")
        print(f"Total Cost: ${cost}")
    else:
        print(f"No route found from NYC to SFO with <= {k} stops.")
    print("-" * 20)
    
    k = 2
    cost, path = cheapest_flights(graph, "NYC", "SFO", k)
    print(f"5. K-Stops Constraint (Max {k} stops)")
    if cost != float('inf'):
        print(f"Cheapest route NYC -> SFO with <= {k} stops: {' -> '.join(path)}")
        print(f"Total Cost: ${cost}")
    else:
        print(f"No route found from NYC to SFO with <= {k} stops.")
    print("-" * 20)

if __name__ == "__main__":
    main()

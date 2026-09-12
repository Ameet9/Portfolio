import sys
from topological_sort import TopologicalSorter, CycleDetectedError


def demo_valid_pipeline():
    print("--- Valid Build Pipeline Demo ---")
    sorter = TopologicalSorter()
    
    # dependencies: add_dependency(task, depends_on)
    # The order: depends_on -> task
    sorter.add_dependency("lint", "install deps")
    sorter.add_dependency("test", "install deps")
    sorter.add_dependency("build", "lint")
    sorter.add_dependency("build", "test")
    sorter.add_dependency("docker-build", "build")
    sorter.add_dependency("deploy", "docker-build")
    
    print("Resolving build order using Kahn's algorithm (BFS)...")
    order = sorter.sort()
    print("Build Order:", " -> ".join(order))

    print("\nResolving build order using DFS algorithm...")
    order_dfs = sorter.sort_dfs()
    print("Build Order:", " -> ".join(order_dfs))
    print()


def demo_circular_dependency():
    print("--- Broken Pipeline Demo (Circular Dependency) ---")
    sorter = TopologicalSorter()
    
    # A -> B -> C -> A
    sorter.add_dependency("B", "A")
    sorter.add_dependency("C", "B")
    sorter.add_dependency("A", "C")
    
    print("Attempting to resolve build order...")
    try:
        sorter.sort()
    except CycleDetectedError as e:
        print(f"Error caught (BFS): {e}")
        
    try:
        sorter.sort_dfs()
    except CycleDetectedError as e:
        print(f"Error caught (DFS): {e}")
    print()


if __name__ == "__main__":
    demo_valid_pipeline()
    demo_circular_dependency()

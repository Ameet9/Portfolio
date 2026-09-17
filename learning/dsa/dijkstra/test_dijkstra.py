import pytest
from dijkstra import dijkstra
from cheapest_flights_k_stops import cheapest_flights

@pytest.fixture
def simple_graph():
    return {
        'A': {'B': 1, 'C': 4},
        'B': {'C': 2, 'D': 5},
        'C': {'D': 1},
        'D': {}
    }

def test_basic_shortest_path(simple_graph):
    cost, path = dijkstra(simple_graph, 'A', 'D')
    assert cost == 4
    assert path == ['A', 'B', 'C', 'D']
    
def test_unreachable(simple_graph):
    cost, path = dijkstra(simple_graph, 'D', 'A')
    assert cost == float('inf')
    assert path == []
    
def test_single_node():
    graph = {'A': {}}
    cost, path = dijkstra(graph, 'A', 'A')
    assert cost == 0
    assert path == ['A']
    
def test_multiple_equal_cost_paths():
    graph = {
        'A': {'B': 2, 'C': 2},
        'B': {'D': 2},
        'C': {'D': 2},
        'D': {}
    }
    cost, path = dijkstra(graph, 'A', 'D')
    assert cost == 4
    # Either path is valid
    assert path in (['A', 'B', 'D'], ['A', 'C', 'D'])
    
def test_negative_edge():
    graph = {
        'A': {'B': 5},
        'B': {'C': -2},
        'C': {}
    }
    with pytest.raises(ValueError, match="Negative edge weight"):
        dijkstra(graph, 'A', 'C')

def test_k_stops():
    graph = {
        'A': {'B': 100, 'C': 500},
        'B': {'C': 100}
    }
    # Direct flight is 500. 1-stop flight is 200.
    # Max 0 stops (direct only)
    cost, path = cheapest_flights(graph, 'A', 'C', 0)
    assert cost == 500
    assert path == ['A', 'C']
    
    # Max 1 stop
    cost, path = cheapest_flights(graph, 'A', 'C', 1)
    assert cost == 200
    assert path == ['A', 'B', 'C']

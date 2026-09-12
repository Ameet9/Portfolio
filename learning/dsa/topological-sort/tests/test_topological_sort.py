import pytest
from topological_sort import TopologicalSorter, CycleDetectedError

def test_simple_chain():
    sorter = TopologicalSorter()
    sorter.add_dependency("B", "A")
    sorter.add_dependency("C", "B")
    
    # A -> B -> C
    assert sorter.sort() == ["A", "B", "C"]
    assert sorter.sort_dfs() == ["A", "B", "C"]

def test_diamond():
    sorter = TopologicalSorter()
    # A -> B, A -> C, B -> D, C -> D
    sorter.add_dependency("B", "A")
    sorter.add_dependency("C", "A")
    sorter.add_dependency("D", "B")
    sorter.add_dependency("D", "C")
    
    order = sorter.sort()
    assert order[0] == "A"
    assert order[-1] == "D"
    assert set(order[1:-1]) == {"B", "C"}
    
    order_dfs = sorter.sort_dfs()
    assert order_dfs[0] == "A"
    assert order_dfs[-1] == "D"
    assert set(order_dfs[1:-1]) == {"B", "C"}

def test_cycle_detection():
    sorter = TopologicalSorter()
    # A -> B -> A
    sorter.add_dependency("B", "A")
    sorter.add_dependency("A", "B")
    
    with pytest.raises(CycleDetectedError) as exc_info:
        sorter.sort()
    assert set(exc_info.value.cycle_nodes) == {"A", "B"}
    
    with pytest.raises(CycleDetectedError) as exc_info_dfs:
        sorter.sort_dfs()
    assert set(exc_info_dfs.value.cycle_nodes) == {"A", "B"}

def test_empty_graph():
    sorter = TopologicalSorter()
    assert sorter.sort() == []
    assert sorter.sort_dfs() == []

def test_single_node():
    sorter = TopologicalSorter()
    sorter.add_node("A")
    assert sorter.sort() == ["A"]
    assert sorter.sort_dfs() == ["A"]

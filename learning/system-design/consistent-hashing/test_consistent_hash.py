import pytest
from collections import Counter
from consistent_hash import ConsistentHashRing

def test_key_lookup_consistent():
    ring = ConsistentHashRing(["node_1", "node_2", "node_3"])
    assert ring.get_node("my_key") == ring.get_node("my_key")

def test_add_node_remaps_correct_fraction():
    ring = ConsistentHashRing(["node_1", "node_2", "node_3", "node_4"], num_virtual_nodes=150)
    keys = [f"key{i}" for i in range(5000)]
    
    mapping_before = {k: ring.get_node(k) for k in keys}
    
    ring.add_node("node_5")
    mapping_after = {k: ring.get_node(k) for k in keys}
    
    moved = sum(1 for k in keys if mapping_before[k] != mapping_after[k])
    # Expected ~1/5 (20%). We allow a range between 15% and 25% due to randomness of hash
    assert 750 <= moved <= 1250, f"Expected around 1000 remapped keys, got {moved}"

def test_remove_node_isolation():
    ring = ConsistentHashRing(["node_A", "node_B", "node_C"], num_virtual_nodes=150)
    keys = [f"data{i}" for i in range(2000)]
    
    mapping_before = {k: ring.get_node(k) for k in keys}
    
    ring.remove_node("node_B")
    mapping_after = {k: ring.get_node(k) for k in keys}
    
    # Verify only keys from node_B moved
    for k in keys:
        if mapping_before[k] != "node_B":
            assert mapping_before[k] == mapping_after[k]
        else:
            assert mapping_after[k] in ("node_A", "node_C")

def test_even_distribution():
    nodes = [f"node_{i}" for i in range(5)]
    ring = ConsistentHashRing(nodes, num_virtual_nodes=300)
    
    keys = [f"id_{i}" for i in range(10000)]
    distribution = Counter(ring.get_node(k) for k in keys)
    
    # Each node should have roughly 2000 keys (10000 / 5). Allow +/- 15%
    for node in nodes:
        assert 1700 <= distribution[node] <= 2300, f"{node} had {distribution[node]} keys, which is outside expected range"

def test_empty_ring():
    ring = ConsistentHashRing([])
    assert ring.get_node("any_key") is None

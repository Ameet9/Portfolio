import pytest
from union_find import UnionFind
from friend_circles import count_friend_circles

def test_initial_state():
    uf = UnionFind(5)
    assert uf.component_count() == 5
    for i in range(5):
        assert uf.component_size(i) == 1
        assert uf.find(i) == i

def test_basic_union_and_connectivity():
    uf = UnionFind(5)
    assert uf.union(0, 1) is True
    assert uf.connected(0, 1) is True
    assert uf.connected(0, 2) is False
    assert uf.component_count() == 4
    assert uf.component_size(0) == 2

def test_union_self():
    uf = UnionFind(3)
    assert uf.union(1, 1) is False
    assert uf.component_count() == 3

def test_path_compression():
    uf = UnionFind(5)
    # create a chain 0-1-2-3-4 by unioning roots directly
    # actually, union by rank will balance them. Let's bypass rank to test path compression
    uf.parent = [1, 2, 3, 4, 4] 
    uf.rank = [0, 1, 2, 3, 4]
    
    # finding 0 should compress the path so parent[0] becomes 4
    root = uf.find(0)
    assert root == 4
    assert uf.parent[0] == 4
    assert uf.parent[1] == 4 # 1's path also gets compressed since it was visited

def test_long_chain_collapses():
    uf = UnionFind(10)
    for i in range(9):
        uf.union(i, i+1)
        
    assert uf.component_count() == 1
    assert uf.component_size(0) == 10
    
    # verify path compression after a find
    assert uf.find(0) == uf.find(9)
    # most nodes should now point to the root (which will be determined by rank/merging order)
    root = uf.find(0)
    for i in range(10):
        assert uf.parent[i] == root

def test_component_count_decreases():
    uf = UnionFind(4)
    uf.union(0, 1)
    assert uf.component_count() == 3
    uf.union(2, 3)
    assert uf.component_count() == 2
    uf.union(1, 3)
    assert uf.component_count() == 1

def test_friend_circles_simple():
    matrix = [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1]
    ]
    assert count_friend_circles(matrix) == 2

def test_friend_circles_multiple():
    matrix = [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [0, 1, 1, 1],
        [1, 0, 1, 1]
    ]
    # 0 and 3 are friends.
    # 1 and 2 are friends.
    # 2 and 3 are friends.
    # Therefore, everyone is connected.
    assert count_friend_circles(matrix) == 1

def test_friend_circles_fully_connected():
    matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ]
    assert count_friend_circles(matrix) == 1

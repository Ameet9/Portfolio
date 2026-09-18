import pytest
from lfu_cache import LFUCache

def test_basic_get_put():
    cache = LFUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3)    # evicts key 2
    assert cache.get(2) == -1
    assert cache.get(3) == 3

def test_tie_breaking_evictions():
    cache = LFUCache(3)
    cache.put(1, 10)
    cache.put(2, 20)
    cache.put(3, 30)
    
    # Freqs: 1:1, 2:1, 3:1
    # Access 1 and 3 to increase their freq
    cache.get(1)
    cache.get(3)
    
    # Freqs: 1:2, 2:1, 3:2
    cache.put(4, 40) # evicts key 2
    
    assert cache.get(2) == -1
    assert cache.get(1) == 10
    assert cache.get(3) == 30
    assert cache.get(4) == 40

def test_capacity_zero():
    cache = LFUCache(0)
    cache.put(1, 1)
    assert cache.get(1) == -1

def test_full_cache_eviction_logic():
    cache = LFUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3) # Evicts 2
    assert cache.get(2) == -1
    assert cache.get(3) == 3
    cache.put(4, 4) # Evicts 1
    assert cache.get(1) == -1
    assert cache.get(3) == 3
    assert cache.get(4) == 4

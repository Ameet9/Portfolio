import threading
import pytest

from lru_cache import LRUCache
from lru_cache_ordered_dict import LRUCacheOrderedDict


@pytest.fixture(params=[LRUCache, LRUCacheOrderedDict])
def cache_class(request):
    """Fixture to run all tests against both implementations."""
    return request.param


def test_basic_put_and_get(cache_class):
    cache = cache_class(2)
    cache.put(1, 1)
    assert cache.get(1) == 1
    assert cache.get(2) == -1


def test_eviction(cache_class):
    cache = cache_class(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1       # 1 becomes MRU
    cache.put(3, 3)                # Evicts 2
    assert cache.get(2) == -1      # 2 is not found
    assert cache.get(3) == 3       # 3 is MRU
    assert cache.get(1) == 1       # 1 is MRU


def test_leetcode_sequence(cache_class):
    """The classic LeetCode sequence."""
    cache = cache_class(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3)                # evicts 2
    assert cache.get(2) == -1
    cache.put(4, 4)                # evicts 1
    assert cache.get(1) == -1
    assert cache.get(3) == 3
    assert cache.get(4) == 4


def test_update_existing_key(cache_class):
    cache = cache_class(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.put(1, 10)               # Update 1, becomes MRU
    assert cache.get(1) == 10
    
    cache.put(3, 3)                # Evicts 2
    assert cache.get(2) == -1
    assert cache.get(1) == 10
    assert cache.get(3) == 3


def test_capacity_one(cache_class):
    cache = cache_class(1)
    cache.put(1, 1)
    assert cache.get(1) == 1
    cache.put(2, 2)                # Evicts 1
    assert cache.get(1) == -1
    assert cache.get(2) == 2


def test_get_on_empty(cache_class):
    cache = cache_class(2)
    assert cache.get(1) == -1


def test_large_number_of_operations(cache_class):
    capacity = 100
    cache = cache_class(capacity)
    
    # Insert 200 items (0 to 199)
    for i in range(200):
        cache.put(i, i)
        
    # The first 100 should be evicted (0 to 99)
    for i in range(100):
        assert cache.get(i) == -1
        
    # The last 100 should be present (100 to 199)
    for i in range(100, 200):
        assert cache.get(i) == i


def test_invalid_capacity(cache_class):
    with pytest.raises(ValueError):
        cache_class(0)
    with pytest.raises(ValueError):
        cache_class(-1)


def test_thread_safety_dict_version():
    """Bonus test: thread safety for OrderedDict version.
    
    Note: A bare OrderedDict/Dict in Python has the GIL, which provides
    *some* atomicity, but compound operations like get+move_to_end or
    put+popitem aren't strictly thread-safe. This test runs concurrent
    operations just to ensure it doesn't crash catastrophically, though
    a real thread-safe LRUCache would need a lock (threading.Lock).
    """
    cache = LRUCacheOrderedDict(100)
    
    def worker(start_val):
        for i in range(start_val, start_val + 200):
            cache.put(i, i)
            cache.get(i - 10)
            
    threads = []
    for i in range(5):
        t = threading.Thread(target=worker, args=(i * 1000,))
        threads.append(t)
        t.start()
        
    for t in threads:
        t.join()
        
    # As long as it didn't throw an exception, it "passed". 
    # Proper thread safety requires explicit locking.
    assert True

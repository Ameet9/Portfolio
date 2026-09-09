"""LRU Cache using Python's built-in collections.OrderedDict.

This is a simpler, more Pythonic way to implement an LRU cache in production,
as OrderedDict maintains insertion order. By moving accessed elements to the
end, we can track usage efficiently.

Why learn the manual implementation (HashMap + Doubly Linked List)?
- Interviews: Interviewers want to see you implement the underlying mechanics.
  Using OrderedDict is often considered "cheating" in an interview context because
  the data structure does all the heavy lifting.
- Language limitations: Not all languages have a built-in OrderedDict.
- Custom behavior: A custom implementation gives you full control over eviction
  policies and thread-safety mechanisms.
"""
from collections import OrderedDict


class LRUCacheOrderedDict:
    """Least Recently Used Cache using OrderedDict."""
    
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("Capacity must be strictly positive.")
        self.capacity = capacity
        self.cache: OrderedDict[int, int] = OrderedDict()
    
    def get(self, key: int) -> int:
        """Get the value of the key if it exists, otherwise return -1."""
        if key not in self.cache:
            return -1
        # Move the accessed item to the end (most recently used)
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        """Update the value of the key if it exists, or insert the key-value pair."""
        if key in self.cache:
            # Update value and move to the end (most recently used)
            self.cache[key] = value
            self.cache.move_to_end(key)
        else:
            # Insert the new item
            self.cache[key] = value
            
            # Evict if we exceeded capacity
            if len(self.cache) > self.capacity:
                # popitem(last=False) removes the first inserted item (least recently used)
                self.cache.popitem(last=False)
                
    def __repr__(self) -> str:
        """Visualize the current cache state."""
        state = ' <-> '.join(f"({k}:{v})" for k, v in self.cache.items())
        return f"LRUCacheOrderedDict(capacity={self.capacity}, state=[{state}])"

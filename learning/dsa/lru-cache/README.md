# LRU Cache Implementation

This project contains a complete, production-quality implementation of a **Least Recently Used (LRU) Cache** in Python.

## What is an LRU Cache?
An LRU Cache is a data structure that stores key-value pairs with a fixed capacity. When the cache is full and a new element needs to be inserted, it evicts the **Least Recently Used** item to make room. Accessing or updating an item makes it the **Most Recently Used**.

LRU caches are heavily used in real-world systems to keep frequently accessed data in memory while discarding stale data:
- **Redis** (as an eviction policy)
- **Browser Caches** (storing recently visited pages/images)
- **CDN Edge Caches**
- **Database Buffer Pools**

## The HashMap + Doubly Linked List Approach
To achieve **O(1) time complexity** for both `get` and `put` operations, we must combine two data structures:

1. **HashMap (Dictionary)**: Provides O(1) lookup time to find a node by its key.
2. **Doubly Linked List (DLL)**: Provides O(1) time to add to the front, remove a node, or move a node to the front.

### Why not just use a Dictionary?
While a standard dictionary provides O(1) lookups, it does not efficiently maintain order in a way that allows us to find the least recently used item or update an item's position in O(1) time. (Note: Python's `OrderedDict` does, but relying on it bypasses the core algorithm, which is the point of this implementation).

### Architecture ASCII Diagram
```text
          HashMap (Cache)
         ┌──────┬─────────┐
         │ Key1 │ Node1*  │────────┐
         │ Key2 │ Node2*  │──────┐ │
         │ Key3 │ Node3*  │────┐ │ │
         └──────┴─────────┘    │ │ │
                               │ │ │
      Sentinel                 │ │ │                 Sentinel
       Head                    ▼ ▼ ▼                  Tail
      ┌────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌────┐
NULL ◀│prev│◀───│ prev  │◀───│ prev  │◀───│ prev  │◀───│prev│
      │    │    │ Node3 │    │ Node2 │    │ Node1 │    │    │
      │next│───▶│ next  │───▶│ next  │───▶│ next  │───▶│next│▶ NULL
      └────┘    └───────┘    └───────┘    └───────┘    └────┘
       (MRU)                                            (LRU)
```

### The Sentinel (Dummy) Node Trick
Notice the `Head` and `Tail` sentinel nodes in the diagram. These are dummy nodes that do not contain actual data. They serve a crucial purpose: **eliminating edge cases**. 
Because the head and tail sentinels always exist, we never have to write `if node.prev is None:` or `if node.next is None:` when adding or removing nodes. The real nodes are always sandwiched between the sentinels.

## Time and Space Complexity
- **Time Complexity:** `O(1)` for both `get()` and `put()` operations.
- **Space Complexity:** `O(capacity)` where `capacity` is the maximum number of items the cache can hold. This space is used by the HashMap and the Doubly Linked List nodes.

## Running the Tests
This project includes an alternative `OrderedDict` implementation and comprehensive tests covering both approaches.

To run the tests, use `pytest`:
```bash
pip install pytest
pytest tests/test_lru_cache.py -v
```

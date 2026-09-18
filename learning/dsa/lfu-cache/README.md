# LFU (Least Frequently Used) Cache

## Overview
This project implements an LFU Cache in Python with O(1) time complexity for `get` and `put` operations. 

## Architecture
The cache relies on three hash maps to maintain state and allow O(1) operations:
1. `key_to_val`: Maps a key to its corresponding value.
2. `key_to_freq`: Maps a key to its current access frequency.
3. `freq_to_keys`: Maps a frequency to a collection of keys that currently have this frequency. To resolve ties (when multiple keys have the same frequency and the cache is full), we need to evict the Least Recently Used (LRU) among them. This collection is implemented using Python's `collections.OrderedDict`.

We also maintain a `min_freq` variable to track the current minimum frequency in the cache, allowing us to find the eviction candidates in O(1) time.

## Why OrderedDict?
`collections.OrderedDict` acts as both a Hash Map and a Doubly Linked List under the hood. It allows us to:
- Insert and delete elements in O(1) time.
- Track insertion order, making it perfect for finding the LRU key among elements with the same frequency.
- Pop the oldest element (FIFO) using `popitem(last=False)` in O(1) time.

## Amortized O(1) Analysis
- `get(key)`: Hash map lookups take O(1) time. Bumping the frequency requires removing the key from one `OrderedDict` and inserting it into another, both O(1) operations.
- `put(key, value)`: Inserting a new key or updating an existing one involves hash map operations and potentially evicting the oldest key from `freq_to_keys[min_freq]`. Deletion and insertion are all O(1) thanks to the hashing and doubly linked list structure.

## How to Run
Ensure you have Python 3 installed.

Run the demo script:
```powershell
python demo.py
```

Run tests using pytest:
```powershell
pytest test_lfu_cache.py
```

## Key Concepts
- Constant Time Data Structures
- Least Frequently Used Eviction Strategy
- Tie-breaking with Least Recently Used (LRU)
- Hashing combined with Doubly Linked Lists

## Interview Q&A

**Q: Why do we need `min_freq`?**
A: Without `min_freq`, we would have to iterate over all possible frequencies to find the lowest one during eviction, violating the O(1) requirement. By explicitly tracking it and updating it efficiently, we can locate eviction candidates instantly.

**Q: How does `min_freq` update when an element's frequency increases?**
A: When a key's frequency is bumped, if it was the only key with the current `min_freq` (i.e., `freq_to_keys[min_freq]` becomes empty), `min_freq` is simply incremented by 1.

**Q: Could you use a min-heap instead of this structure?**
A: A min-heap ordered by frequency and then timestamp could find the eviction candidate. However, extracting from a min-heap or updating elements takes O(log N) time, which does not meet the strict O(1) time complexity requirement.

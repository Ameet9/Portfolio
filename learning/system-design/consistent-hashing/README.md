# Consistent Hashing Implementation

This project demonstrates a Python implementation of Consistent Hashing, a distributed systems technique used in systems like DynamoDB, Cassandra, and Memcached to distribute data efficiently while minimizing reorganization when the cluster size changes.

## Overview

In traditional distributed caches or databases, data is often partitioned using the naive modulo approach: `hash(key) % N` where `N` is the number of nodes. 
This works perfectly until the number of nodes changes. When a node is added or removed, `N` changes to `N+1` or `N-1`. This simple mathematical shift changes the target node for almost every single key (~80% in a 4-to-5 node transition).

Consistent Hashing solves this by placing both the nodes and the keys onto an abstract "ring" (usually a circular space of integers from `0` to `2^32 - 1`). To find which node a key belongs to, we hash the key, find its position on the ring, and traverse clockwise until we find the first node.

## Virtual Nodes

A raw consistent hashing ring can result in highly uneven data distribution if physical nodes end up grouped close together by random chance. To fix this, we use **Virtual Nodes**. For each physical node, we generate multiple virtual replicas (e.g., `NodeA#0`, `NodeA#1`, `NodeA#2`...) and place them all on the ring. This interleaves the ownership segments and guarantees a mathematically balanced load distribution.

## Architecture

```text
       [Node A#1] 0
           |
       ---------
      /         \
[Key 3]        [Node C#2]
    /             \
   |               |
[Node B#1]      [Key 1]
   |               |
    \             /
[Key 2]        [Node B#2]
      \         /
       ---------
           |
       [Node A#2]
```
*Keys are assigned to the next node moving clockwise.*

## How to Run

Requirements: Python 3.9+ (Built-in libraries only). Testing requires `pytest`.

```powershell
# 1. Run the Naive Modulo demonstration to see the problem
python naive_modulo.py

# 2. Run the Consistent Hashing demo to see the solution
python demo.py

# 3. Run the unit tests (assuming pytest is installed)
pytest test_consistent_hash.py -v
```

## Interview Q&A

1. **Why does modulo hashing fail at scale?**
   Modulo hashing redistributes `(N-1)/N` fraction of all keys whenever the node count `N` changes. If a cache cluster drops a node, remapping 80-90% of requests to new nodes will cause massive cache misses, heavily spiking the backend database (the "thundering herd" problem), potentially bringing the entire system down.

2. **How does Consistent Hashing minimize data movement?**
   In consistent hashing, adding or removing a node only impacts the key space immediately adjacent to the node on the ring. The rest of the ring is unaffected. When adding a node to a cluster of size `N`, only `1/(N+1)` of keys move.

3. **Why do we use cryptographic hashes like MD5/SHA instead of fast non-crypto hashes?**
   While we don't need the security of a cryptographic hash, hashes like MD5 provide an extremely uniform distribution of outputs, which is critical for balancing the nodes and keys evenly across the ring. MurmurHash is often used in production as a faster alternative that still has good distribution properties.

4. **What problem do Virtual Nodes solve?**
   Virtual nodes solve the uneven data distribution problem. Without them, a small number of nodes might cluster together on the ring by chance, causing one node to handle a huge chunk of the ring. By projecting each physical node as ~100-200 virtual nodes, we interleave their ownership spaces, ensuring an even distribution. Virtual nodes also allow routing more traffic to heterogeneous hardware (give a more powerful server more virtual nodes).

5. **What is the time complexity of adding a node and finding a node?**
   - **Adding/Removing a node:** `O(V log(V*N))` where `V` is the number of virtual nodes and `N` is the number of physical nodes. We compute `V` hashes and insert them into a sorted array (binary search + insert).
   - **Finding a node:** `O(log(V*N))` because we use binary search (`bisect`) on the sorted ring array.
   - **Space complexity:** `O(V*N)` to store the ring array and the hash-to-node mapping.

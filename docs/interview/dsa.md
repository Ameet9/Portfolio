# DSA Interview Notes â€” LRU Cache & Data Structure Design

## LRU Cache

### Q1: "Why not just use an ordered dictionary or array to track recency?"

**Strong Answer:**
"An array requires O(n) shifting to move an item to the front on every access. A plain dict (HashMap) gives O(1) lookup but has no concept of ordering â€” to find the least recently used key, you'd need to scan all entries, which is O(n).

The HashMap + Doubly Linked List combination is the only way to achieve true O(1) for both operations:
- **HashMap**: O(1) lookup of key â†’ node
- **Doubly Linked List**: O(1) removal (given the node reference) and O(1) insertion at the front

Python's `OrderedDict` actually uses this same internal structure (dict + doubly linked list), but interviewers want to see that you understand what's happening under the hood, not just that you can call `move_to_end()`."

---

### Q2: "Walk me through what happens on a cache eviction."

**Strong Answer:**
"When `put(key, value)` is called and the cache is already at capacity:

1. **Identify the LRU node**: It's always `tail.prev` (the node right before the tail sentinel). This is O(1) â€” no scanning needed.

2. **Remove from the dict**: Delete `dict[lru_node.key]`. This is why we store the key *inside* the node â€” without it, we'd need an O(n) reverse lookup to find which dict key maps to this node.

3. **Unlink from the list**: Set `lru_node.prev.next = lru_node.next` and `lru_node.next.prev = lru_node.prev`. O(1).

4. **Insert the new node**: Create a new Node, add it right after the head sentinel (most recently used position), and add it to the dict.

A common mistake is forgetting step 2 â€” removing from the list but not the dict, causing a memory leak and incorrect `get()` results."

---

### Q3: "Why use sentinel/dummy head and tail nodes?"

**Strong Answer:**
"Without sentinels, every linked list operation needs special-case code:
- 'Is the list empty?'
- 'Am I removing the head? Update head pointer.'
- 'Am I removing the tail? Update tail pointer.'
- 'Is this the only node? Set both head and tail to None.'

With sentinels, every real node always has valid `.prev` and `.next` pointers. The removal logic is always just two pointer swaps â€” no conditionals. This eliminates an entire class of null-pointer bugs and makes the code both shorter and less error-prone.

```
Before: head â†” A â†” B â†” C â†” tail  (sentinels are always present)
Remove B: head â†” A â†” C â†” tail     (just relink A.next=C, C.prev=A)
```

This is a general linked list technique worth remembering for any problem â€” it simplifies every operation."

---

### Q4: "How would you make this thread-safe?"

**Strong Answer:**
"For a single-process in-memory cache, wrap `get()` and `put()` with a `threading.Lock`:

```python
def get(self, key):
    with self._lock:
        # ... existing logic
```

This serializes all cache operations. For better read concurrency, you could use a `ReadWriteLock` (multiple readers, exclusive writer), but the complexity is rarely worth it for an in-memory cache.

This is exactly the kind of complexity that pushes production systems toward using a dedicated service like **Redis** instead â€” Redis is single-threaded internally, so all operations are naturally serialized without the application developer worrying about locks. It also provides persistence, replication, and can be shared across multiple server instances."

---

### Q5: "How does this relate to how Redis or a CDN handles eviction at scale?"

**Strong Answer:**
"Same core idea â€” track recency, evict least-recently-used â€” but with important differences at scale:

1. **Redis's Approximated LRU**: Maintaining a perfect global LRU ordering across millions of keys is expensive (each access must update the list). Redis instead samples a configurable number of random keys (default 5, tunable via `maxmemory-samples`) and evicts the least recently used among the samples. This is O(1) regardless of total key count and achieves ~95% accuracy compared to true LRU.

2. **Redis 4.0+ added LFU** (Least Frequently Used) as an alternative policy, which is better for workloads where a key is accessed heavily for a short period then never again (LRU would keep it cached; LFU would let it decay).

3. **CDN Edge Caches** run independent LRU caches per edge node. There's no global ordering â€” a video might be evicted in Tokyo but still cached in Mumbai. This is acceptable because the origin server is the source of truth, and cache coherency at global scale is impractical."

---

## Tries (Prefix Trees) & Autocomplete

### Q6: "What is the time complexity of inserting or searching a word in a Trie, and why?"

**Strong Answer:**
"The time complexity is O(L), where L is the length of the word, independent of how many words are stored in the Trie.

This is because to insert or search for a word, you start at the root and follow exactly one edge per character of the word. If the word has 5 characters, you make 5 node transitions. This is a massive advantage over scanning a list of N words, which takes O(N × L) time."

---

### Q7: "How is a Trie different from a hash set for storing a dictionary of words?"

**Strong Answer:**
"A hash set gives O(1) time complexity for an exact word lookup (`word in my_set`), which is technically faster than a Trie's O(L). 

However, a hash set cannot efficiently answer prefix queries like 'give me all words starting with 'app''. To do that with a hash set, you'd have to iterate through *every single word* in the set and check its prefix, which is O(N × L). A Trie is explicitly built for prefix queries — you traverse to the node representing 'app' in O(L) time, and then all valid completions are just the sub-tree below that node."

---

### Q8: "How would you implement autocomplete for a search bar with millions of entries — would a Trie alone be enough?"

**Strong Answer:**
"A Trie is the correct fundamental data structure, but it's not enough on its own for a Google-scale search bar. 

1. **Ranking**: You need to store a 'frequency' or 'weight' at each terminal node so you can suggest the most popular completions first, not just alphabetically.
2. **Top-K Caching**: To avoid running a full Depth-First Search on a massive sub-tree (e.g., the user types just 'a'), each Trie node can pre-compute and store a list of the Top-5 most popular completions that pass through it.
3. **Distribution**: A single machine's memory might not fit a massive Trie. You'd shard the Trie across multiple servers (e.g., Server 1 handles prefixes a-f, Server 2 handles g-m).
4. **Caching**: Put a CDN or Redis cache in front of the Trie service for the most common prefixes (like 'how to')."

---

### Q9: "What's the space trade-off of a Trie compared to just storing a list of strings?"

**Strong Answer:**
"It's a classic time-vs-space tradeoff. 

On one hand, a Trie compresses space by sharing common prefixes — 'car' and 'cart' share the first three nodes.
On the other hand, each character is now a full node object in memory. In languages like Python or Java, the object overhead (pointers to children, memory allocation headers) often means a Trie uses *more* raw memory than a contiguous flat array of strings. 

If memory is extremely constrained, you might use a more compact variant like a Radix Tree (which merges nodes with single children)."

---

### Q10: "How would you delete a word from a Trie?"

**Strong Answer:**
"Deletion is the trickiest part of a Trie. You can't just delete the nodes, because other words might share that path.

1. Walk down the tree to the final node of the word.
2. Unmark the `is_end_of_word` flag. This logically deletes the word.
3. Then, perform a bottom-up cleanup (often done recursively): if the current node has NO other children, AND is NOT the end of another word, you can safely delete it. You repeat this up the path until you hit a node that has other children or is an end word.

A common mistake is forgetting the bottom-up cleanup, which leaves 'zombie' nodes that waste memory."


---

## Priority Queues & Heaps

### Q11: "Implement a min-heap insert and extractMin from scratch."

**Strong Answer:**
"A heap is a complete binary tree stored as a flat array. The parent of index i is (i-1)//2, left child is 2i+1, right child is 2i+2.

insert(val): Append to the end of the array, then bubble up — repeatedly swap with parent while smaller than parent. O(log n).

extractMin(): Save root (index 0). Move the last element to index 0, pop the end, then bubble down — swap with the smaller of the two children until the heap property holds. O(log n)."

---

### Q12: "Why is building a heap O(n), not O(n log n)?"

**Strong Answer:**
"Inserting n elements one by one is O(n log n). But heapify (bubble down from the middle to the root) is O(n). Half the nodes are leaves with 0 swaps. A quarter need 1 swap. Only the root can need log(n) swaps. The geometric sum of work across all levels converges to O(n) — a counterintuitive but important fact to cite."

---

### Q13: "When would you use a heap instead of sorting?"

**Strong Answer:**
"When you repeatedly access the min/max while the data is continuously changing. Re-sorting after every new element costs O(n log n) per operation. With a heap, you pay O(n) once to build it, then O(log n) per insert or extract. Classic use cases: Dijkstra shortest path, live task schedulers, top-K streaming problems."

---

## Graphs & Topological Sort

### Q14: "What is topological sorting and when is it possible?"

**Strong Answer:**
"Topological sort produces a linear ordering of nodes in a directed graph such that for every directed edge A ? B, node A appears before node B in the ordering. It is ONLY possible on a Directed Acyclic Graph (DAG). If there is a cycle (A ? B ? A), no valid ordering exists because A must come before B, and B must come before A simultaneously — a contradiction."

---

### Q15: "Walk me through Kahn's algorithm."

**Strong Answer:**
"Kahn's algorithm is a BFS-based approach:
1. Build the adjacency list and compute the in-degree (number of incoming edges) for every node.
2. Seed a queue with all nodes whose in-degree is 0 (no prerequisites).
3. While the queue is not empty: pop a node, append it to the result, and for each of its neighbours, decrement their in-degree. If a neighbour's in-degree hits 0, enqueue it.
4. After the loop: if the result list contains all nodes, you have a valid topological order. If it's shorter than the total node count, there is a cycle — some nodes were never unblocked because they were waiting on each other.

Time complexity is O(V + E) — each vertex and edge is processed exactly once."

---

### Q16: "BFS (Kahn's) vs DFS topological sort — any real difference?"

**Strong Answer:**
"Both are O(V+E) and produce a valid topological order, but they differ in a few ways:

- **Kahn's (BFS)** is iterative, easy to reason about, and cycle detection is natural — just check if the output is shorter than the node count. Easier to explain in an interview.

- **DFS-based** tracks three node states (unvisited, in-progress, done). If DFS visits an 'in-progress' node, it has found a back-edge (cycle). It can be written more concisely but relies on recursion, which risks hitting Python's recursion limit on very large graphs."

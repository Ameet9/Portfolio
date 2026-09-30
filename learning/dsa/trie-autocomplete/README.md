# Trie Autocomplete

This project demonstrates a Trie (Prefix Tree) data structure for implementing an efficient autocomplete feature.

## Overview
A **Trie** is a tree-like data structure used to store a dynamic set or associative array where the keys are usually strings. It is highly efficient for retrieving strings that share a common prefix, which makes it the standard choice for **Autocomplete** or **Typeahead** systems.

## Architecture & Implementation
*   `TrieNode`: Represents each character. Contains a dictionary to its children, a boolean `isEndOfWord`, and a `frequency` counter.
*   `Trie`: Holds the root `TrieNode`. Exposes `insert`, `search`, and `get_suggestions` methods.
*   `get_suggestions`: Navigates to the end of the given prefix, then performs a **Depth-First Search (DFS)** to collect all reachable valid words. Finally, it sorts the words by their stored frequency to return the most popular suggestions first.

## Time and Space Complexity
*   **Insert**: 
    *   Time: `O(L)` where `L` is the length of the word.
    *   Space: `O(L)` if all characters form new nodes.
*   **Search**:
    *   Time: `O(L)` where `L` is the length of the word.
    *   Space: `O(1)` as it only traverses existing nodes.
*   **Prefix Suggestion**:
    *   Time: `O(L + N log N)` where `L` is the length of the prefix, and `N` is the number of words matching the prefix (due to sorting by frequency). If we used a Min-Heap of size `K`, we could optimize this to `O(L + V + K log K)` where `V` is the number of vertices in the subtree.
    *   Space: `O(V)` where `V` is the number of nodes visited during DFS to collect the `N` words.

## Tries vs Hash Sets
*   **Hash Sets** are `O(1)` for exact matches, but they **cannot** efficiently answer "give me all words starting with 'app'". You would have to iterate through the entire set `O(N)` where `N` is the total number of words.
*   **Tries** naturally group strings with the same prefix. Finding a prefix is `O(L)`.

## Real-world Use Cases
1.  **Search Engines**: Suggesting popular queries as you type.
2.  **IDE Autocomplete**: Suggesting variable/function names.
3.  **Spell Checkers**: Quickly verifying if a word is valid or suggesting corrections.
4.  **IP Routing (Longest Prefix Match)**: Routers use variations of tries for IP lookups.

## Compressed Tries (Radix Trees)
A standard Trie can be space-inefficient if there are long words with no branches (e.g., "a" -> "p" -> "p" -> "l" -> "e" with no other words starting with "a").
A **Radix Tree** (or Compressed Trie) optimizes space by merging nodes that have only one child. Instead of individual characters, a node can contain a substring (e.g., "apple"). This greatly reduces the space complexity and the number of pointer traversals.

## How to Run
Requires Python 3.x.
```powershell
python demo.py
```
This runs an interactive CLI where you can type prefixes and see the top suggested words ranked by frequency.

## Interview Q&A
**Q1: How would you optimize the autocomplete to always return the top K results quickly?**
A: Instead of traversing the entire subtree every time and sorting all results, we can cache the top K results (or frequencies) at each node during the `insert` operation. This makes fetching suggestions `O(L)` time, at the cost of additional memory `O(K)` per node and slightly slower inserts.

**Q2: What happens if the dataset of words is too large to fit in memory?**
A: We would need a distributed solution. We could partition (shard) the Trie based on the starting character or prefix (e.g., one server handles 'a'-'c', another 'd'-'f'). We could also use a Key-Value store or a specialized inverted index optimized for prefix queries like Elasticsearch.

**Q3: How do you handle typos in the prefix?**
A: We can implement Fuzzy Searching by allowing a certain number of mismatches (edit distance). During the DFS traversal, we explore paths that might differ from the prefix by 1 or 2 characters.

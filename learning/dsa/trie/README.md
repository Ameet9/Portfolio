# Trie (Prefix Tree) Autocomplete

This project implements a Trie data structure from scratch in Python, specifically tailored for an autocomplete engine.

## What is a Trie?

A Trie (pronounced "try", from retrieval) is a tree-like data structure whose nodes store the letters of an alphabet. It is used to store a dynamic set or associative array where the keys are usually strings.

Unlike a binary search tree, no node in the tree stores the key associated with that node; instead, its position in the tree defines the key with which it is associated. All the descendants of a node have a common prefix of the string associated with that node, and the root is associated with the empty string.

### ASCII Representation

For a Trie containing the words "app", "apple", "api", and "bat":

```text
          (root)
         /      \
       'a'      'b'
       /          \
     'p'          'a'
     / \            \
   'p'* 'i'*        't'*
   /
 'l'
 /
'e'*

(* indicates end of word)
```

## Why use a Trie for Autocomplete?

When building an autocomplete engine, you often need to find all words that start with a given prefix. Let's compare a Trie to other data structures:

1.  **Array/List**: Finding all words with a prefix requires scanning the entire array (`O(N * L)` where `N` is number of words and `L` is word length). Even if sorted, binary search takes `O(log N * L)` to find the start, then you still need to collect all matching strings.
2.  **Hash Set/Dict**: Hash maps are great for exact matches (`O(1)`), but terrible for prefix searches. You cannot efficiently find all keys starting with "app" in a standard hash map without iterating over all keys.
3.  **Trie**: Finding the node representing the prefix takes `O(P)` time, where `P` is the length of the prefix. From there, you can perform a Depth First Search (DFS) to find all words starting with that prefix. This is highly efficient and naturally groups words by their prefixes.

## Complexity

*   **Time Complexity**:
    *   `insert(word)`: `O(L)`, where `L` is the length of the word.
    *   `search(word)`: `O(L)`.
    *   `starts_with(prefix)`: `O(P)`, where `P` is the length of the prefix.
    *   `autocomplete(prefix)`: `O(P + V)`, where `P` is prefix length and `V` is the number of nodes in the subtree (representing the results).
*   **Space Complexity**: `O(N * L * C)`, where `N` is the number of words, `L` is the average word length, and `C` is the alphabet size (if using arrays) or actual characters used (if using hash maps for children). Tries can be memory-intensive because each character requires a separate node.

## Project Structure

*   `trie.py`: Contains the `TrieNode` and `Trie` class implementations. Includes methods for insertion, search, prefix checking, autocomplete (with frequency sorting), and deletion.
*   `autocomplete_cli.py`: A simple command-line interface to interact with the Trie and test the autocomplete functionality interactively.
*   `tests/`: Contains pytest unit tests for the Trie implementation.

## Usage

You can run the interactive CLI:

```bash
python autocomplete_cli.py
```

To run the tests:

```bash
pytest tests/
```

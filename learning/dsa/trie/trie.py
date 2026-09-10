"""
Trie (Prefix Tree) implementation for an autocomplete engine.
"""

from typing import List, Dict, Optional

class TrieNode:
    """A node in the Trie structure."""
    def __init__(self):
        # Dictionary mapping a character to a TrieNode
        self.children: Dict[str, 'TrieNode'] = {}
        # Boolean indicating if this node represents the end of a valid word
        self.is_end_of_word: bool = False
        # Frequency/popularity score for autocomplete ranking
        self.frequency: int = 0

class Trie:
    """Trie (Prefix Tree) implementation."""
    
    def __init__(self):
        """Initializes the Trie with a root node."""
        self.root = TrieNode()

    def insert(self, word: str, frequency: int = 0) -> None:
        """
        Inserts a word into the trie.
        
        Args:
            word: The word to insert.
            frequency: The frequency or popularity of the word. Default is 0.
        """
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.frequency = frequency

    def search(self, word: str) -> bool:
        """
        Returns True if the word is in the trie, False otherwise.
        
        Args:
            word: The word to search for.
            
        Returns:
            True if the word is in the trie exactly, False otherwise.
        """
        node = self._find_node(word)
        return node is not None and node.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        """
        Returns True if there is any word in the trie that starts with the given prefix.
        
        Args:
            prefix: The prefix to search for.
            
        Returns:
            True if any word starts with the prefix, False otherwise.
        """
        return self._find_node(prefix) is not None

    def autocomplete(self, prefix: str) -> List[str]:
        """
        Returns a list of all words in the trie that start with the given prefix,
        sorted by frequency in descending order, then alphabetically.
        
        Args:
            prefix: The prefix to autocomplete.
            
        Returns:
            A list of matching words.
        """
        node = self._find_node(prefix)
        if not node:
            return []

        results = []
        self._dfs(node, prefix, results)
        
        # Sort by frequency descending, then lexicographically ascending
        results.sort(key=lambda x: (-x[1], x[0]))
        
        return [word for word, _ in results]

    def delete(self, word: str) -> bool:
        """
        Deletes a word from the trie. Uses a bottom-up approach to clean up unused nodes.
        
        Args:
            word: The word to delete.
            
        Returns:
            True if the word was successfully deleted, False if it wasn't found.
        """
        def _delete_recursive(node: TrieNode, word: str, depth: int) -> bool:
            # Base case: we've reached the end of the word
            if depth == len(word):
                if not node.is_end_of_word:
                    return False
                # Unmark the end of word flag
                node.is_end_of_word = False
                # If the node has no children, it can be safely deleted by the parent
                return len(node.children) == 0

            char = word[depth]
            if char not in node.children:
                return False

            # Recurse down the trie
            should_delete_child = _delete_recursive(node.children[char], word, depth + 1)

            # If the child tells us it can be deleted, we remove it from our children dict
            if should_delete_child:
                del node.children[char]
                # Return True if the current node also has no other children and is not an end of word
                return len(node.children) == 0 and not node.is_end_of_word

            return False

        return _delete_recursive(self.root, word, 0)

    def _find_node(self, prefix: str) -> Optional[TrieNode]:
        """
        Helper method to find the node corresponding to a prefix.
        
        Args:
            prefix: The prefix to traverse to.
            
        Returns:
            The TrieNode at the end of the prefix, or None if the prefix doesn't exist.
        """
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def _dfs(self, node: TrieNode, path: str, results: List[tuple]):
        """
        Helper method to perform Depth-First Search to find all valid words
        starting from a given node.
        
        Args:
            node: The starting TrieNode.
            path: The string path built up to this node.
            results: The list to append found words and their frequencies to.
        """
        if node.is_end_of_word:
            results.append((path, node.frequency))
            
        for char, child_node in node.children.items():
            self._dfs(child_node, path + char, results)

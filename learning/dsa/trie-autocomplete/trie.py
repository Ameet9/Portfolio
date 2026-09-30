class TrieNode:
    def __init__(self):
        # Maps a character to its corresponding TrieNode
        self.children = {}
        # True if this node represents the end of a valid word
        self.isEndOfWord = False
        # Represents how often this word is searched/used. Useful for ranking suggestions.
        self.frequency = 0

class Trie:
    def __init__(self):
        # Root node doesn't hold any character, just links to children
        self.root = TrieNode()

    def insert(self, word: str, frequency: int = 1) -> None:
        """
        Inserts a word into the trie.
        Time Complexity: O(L) where L is the length of the word.
        Space Complexity: O(L) in the worst case if all characters are new.
        """
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        
        node.isEndOfWord = True
        node.frequency += frequency

    def search(self, word: str) -> bool:
        """
        Searches if the exact word is present in the trie.
        Time Complexity: O(L) where L is the length of the word.
        """
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.isEndOfWord

    def _dfs_collect(self, node: TrieNode, prefix: str, results: list):
        """
        Helper function to traverse the Trie using DFS and collect words.
        """
        if node.isEndOfWord:
            results.append((prefix, node.frequency))
        
        for char, child_node in node.children.items():
            self._dfs_collect(child_node, prefix + char, results)

    def get_suggestions(self, prefix: str) -> list:
        """
        Returns a list of words starting with the given prefix, sorted by frequency descending.
        Time Complexity: O(L + N log N) where L is prefix length, N is number of collected words.
        """
        node = self.root
        # 1. Traverse to the end of the prefix
        for char in prefix:
            if char not in node.children:
                return [] # Prefix not found
            node = node.children[char]
        
        # 2. Collect all valid words from this node onwards using DFS
        results = []
        self._dfs_collect(node, prefix, results)
        
        # 3. Sort results by frequency descending, then lexicographically
        results.sort(key=lambda x: (-x[1], x[0]))
        
        return [word for word, freq in results]

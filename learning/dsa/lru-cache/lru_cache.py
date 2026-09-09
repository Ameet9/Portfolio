"""LRU Cache — O(1) Get/Put using HashMap + Doubly Linked List.

This is one of the most frequently asked data structure interview questions.
It demonstrates how combining two data structures (hash map for O(1) lookup,
doubly linked list for O(1) insertion/deletion/reordering) achieves something
neither can do alone.

Real-world usage: This is the core algorithm behind Redis's LRU eviction,
browser caches, CDN edge caches, and database buffer pools.
"""
from __future__ import annotations


class Node:
    """Doubly linked list node holding a key-value pair.
    
    We store the key IN the node (not just the value) because during eviction
    we need to remove the node from BOTH the linked list AND the dict.
    Without the key stored in the node, we'd need an O(n) scan of the dict
    to find which key maps to the evicted node.
    """
    __slots__ = ('key', 'value', 'prev', 'next')
    
    def __init__(self, key: int = 0, value: int = 0):
        self.key = key
        self.value = value
        self.prev: Node | None = None
        self.next: Node | None = None


class LRUCache:
    """Least Recently Used Cache with O(1) get and put operations."""
    
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("Capacity must be strictly positive.")
            
        self.capacity = capacity
        # Mapping from key to the corresponding Node in the DLL
        self.cache: dict[int, Node] = {}
        
        # Sentinel/dummy nodes to avoid edge cases during insertion and deletion.
        # head.next will always point to the most recently used node.
        # tail.prev will always point to the least recently used node.
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def get(self, key: int) -> int:
        """Get the value of the key if it exists, otherwise return -1."""
        if key not in self.cache:
            return -1
            
        node = self.cache[key]
        
        # Move the accessed node to the front (most recently used position)
        self._remove(node)
        self._add_to_front(node)
        
        return node.value
    
    def put(self, key: int, value: int) -> None:
        """Update the value of the key if it exists, or insert the key-value pair."""
        if key in self.cache:
            # Key exists, update the value and move it to the front
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_front(node)
        else:
            # New key, create a new node
            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_to_front(new_node)
            
            # Evict if we exceeded capacity
            if len(self.cache) > self.capacity:
                # The LRU node is right before the tail sentinel
                lru_node = self.tail.prev
                # Safely remove it from list
                if lru_node is not None and lru_node != self.head:
                    self._remove(lru_node)
                    # Remove it from the hash map (this is why we store `key` in Node)
                    del self.cache[lru_node.key]
    
    def _remove(self, node: Node) -> None:
        """Unlink a node from wherever it sits in the doubly linked list. O(1)."""
        prev_node = node.prev
        next_node = node.next
        
        if prev_node and next_node:
            prev_node.next = next_node
            next_node.prev = prev_node
    
    def _add_to_front(self, node: Node) -> None:
        """Insert a node right after the head sentinel (most recently used position). O(1)."""
        next_node = self.head.next
        
        # Link node with head
        self.head.next = node
        node.prev = self.head
        
        # Link node with former first node
        if next_node:
            node.next = next_node
            next_node.prev = node

    def __repr__(self) -> str:
        """Visualize the current cache state."""
        nodes = []
        curr = self.head.next
        while curr and curr != self.tail:
            nodes.append(f"({curr.key}:{curr.value})")
            curr = curr.next
        return f"LRUCache(capacity={self.capacity}, state=[{' <-> '.join(nodes)}])"

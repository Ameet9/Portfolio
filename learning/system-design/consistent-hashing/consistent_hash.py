import hashlib
import bisect

class ConsistentHashRing:
    """
    A Consistent Hashing Ring implementation.
    
    We use a cryptographic hash (MD5) to map both nodes and keys onto a ring
    represented by the values 0 to 2^32 - 1. 
    
    Why MD5? It provides a uniform distribution which is critical for balancing load.
    Why virtual nodes? Without them, a small number of physical nodes might be grouped
    too closely on the ring, leading to highly uneven key distribution. By assigning
    multiple 'virtual' points on the ring for each physical node, we interleave the
    nodes and achieve a more even distribution.
    """
    
    def __init__(self, nodes: list[str] = None, num_virtual_nodes: int = 150):
        self.num_virtual_nodes = num_virtual_nodes
        self._ring: list[int] = []
        self._node_map: dict[int, str] = {}
        
        if nodes:
            for node in nodes:
                self.add_node(node)

    def _hash(self, key: str) -> int:
        """
        Hash a string to a 32-bit integer.
        MD5 is fast enough and provides excellent uniformity for this use case.
        """
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16) & 0xFFFFFFFF

    def add_node(self, node: str) -> None:
        """
        Add a physical node to the ring by creating multiple virtual nodes.
        We append an index to the node's name to generate distinct hashes.
        """
        for i in range(self.num_virtual_nodes):
            v_node_key = f"{node}#{i}"
            h = self._hash(v_node_key)
            # Use bisect to maintain the sorted order of the ring
            bisect.insort(self._ring, h)
            self._node_map[h] = node

    def remove_node(self, node: str) -> None:
        """
        Remove a physical node and all its virtual nodes from the ring.
        """
        for i in range(self.num_virtual_nodes):
            v_node_key = f"{node}#{i}"
            h = self._hash(v_node_key)
            if h in self._node_map:
                self._ring.remove(h)
                del self._node_map[h]

    def get_node(self, key: str) -> str:
        """
        Find the appropriate node for a given key.
        We hash the key, find where it lands on the ring, and then move clockwise
        (to the right in our sorted list) to find the first node.
        If we hit the end of the list, we wrap around to the first element (index 0).
        """
        if not self._ring:
            return None
            
        h = self._hash(key)
        # Find the insertion point (next highest hash value)
        idx = bisect.bisect_right(self._ring, h)
        
        # If the hash is greater than the highest hash in the ring, wrap around
        if idx == len(self._ring):
            idx = 0
            
        return self._node_map[self._ring[idx]]

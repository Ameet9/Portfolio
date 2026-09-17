from consistent_hash import ConsistentHashRing
from collections import Counter

def demo():
    print("--- Consistent Hashing Demo ---\n")
    
    # 1. Initialize with 4 nodes
    nodes = ["node_A", "node_B", "node_C", "node_D"]
    ring = ConsistentHashRing(nodes, num_virtual_nodes=150)
    
    keys = [f"user:{i}" for i in range(10000)]
    
    print("Distributing 10,000 keys across 4 nodes...")
    mapping_4 = {}
    for key in keys:
        mapping_4[key] = ring.get_node(key)
        
    counts_4 = Counter(mapping_4.values())
    for node, count in sorted(counts_4.items()):
        print(f"  {node}: {count} keys ({(count/10000)*100:.2f}%)")
    
    # 2. Add a 5th node
    print("\nAdding 'node_E'...")
    ring.add_node("node_E")
    
    mapping_5 = {}
    for key in keys:
        mapping_5[key] = ring.get_node(key)
        
    counts_5 = Counter(mapping_5.values())
    for node, count in sorted(counts_5.items()):
        print(f"  {node}: {count} keys")
        
    moved_add = sum(1 for key in keys if mapping_4[key] != mapping_5[key])
    print(f"\nKeys moved after adding 5th node: {moved_add} ({(moved_add/10000)*100:.2f}%)")
    print("Notice this is much closer to 1/5 (20%) compared to the naive approach!\n")
    
    # 3. Remove a node
    print("Removing 'node_B'...")
    ring.remove_node("node_B")
    
    mapping_remove = {}
    for key in keys:
        mapping_remove[key] = ring.get_node(key)
        
    moved_remove = sum(1 for key in keys if mapping_5[key] != mapping_remove[key])
    print(f"\nKeys moved after removing 'node_B' from the 5-node setup: {moved_remove} ({(moved_remove/10000)*100:.2f}%)")
    
    # Check that keys that weren't on node_B stayed put
    unrelated_moved = sum(
        1 for key in keys 
        if mapping_5[key] != "node_B" and mapping_5[key] != mapping_remove[key]
    )
    print(f"Keys moved that were NOT originally on 'node_B': {unrelated_moved}")
    print("Consistent hashing ensures only the keys assigned to the removed node get redistributed!\n")

if __name__ == "__main__":
    demo()

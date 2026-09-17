import hashlib

def naive_hash(key: str) -> int:
    # Use MD5 to get a consistent integer representation
    return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)

def simulate_naive_hashing():
    print("--- Naive Hashing Simulation ---")
    keys = [f"key_{i}" for i in range(10000)]
    
    # 4 Nodes
    nodes_4 = ["node_A", "node_B", "node_C", "node_D"]
    mapping_4 = {}
    for key in keys:
        node_idx = naive_hash(key) % 4
        mapping_4[key] = nodes_4[node_idx]
        
    # 5 Nodes
    nodes_5 = ["node_A", "node_B", "node_C", "node_D", "node_E"]
    mapping_5 = {}
    for key in keys:
        node_idx = naive_hash(key) % 5
        mapping_5[key] = nodes_5[node_idx]
        
    # Count moved keys
    moved = sum(1 for key in keys if mapping_4[key] != mapping_5[key])
    
    print(f"Total Keys: {len(keys)}")
    print(f"Nodes changed from 4 to 5.")
    print(f"Keys Moved: {moved} out of {len(keys)} ({(moved / len(keys)) * 100:.2f}%)")
    print("Notice how changing the number of nodes causes ~80% of keys to remap, which is catastrophic for caching systems.\n")

if __name__ == "__main__":
    simulate_naive_hashing()

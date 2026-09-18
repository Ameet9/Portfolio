from lfu_cache import LFUCache

def main():
    print("--- LFU Cache Demo ---")
    cache = LFUCache(2)
    
    print("put(1, 1)")
    cache.put(1, 1)
    
    print("put(2, 2)")
    cache.put(2, 2)
    
    print(f"get(1) -> {cache.get(1)} (Expected: 1)")
    
    print("put(3, 3) - This should evict key 2")
    cache.put(3, 3)
    
    print(f"get(2) -> {cache.get(2)} (Expected: -1)")
    print(f"get(3) -> {cache.get(3)} (Expected: 3)")
    
    print("put(4, 4) - This should evict key 1")
    cache.put(4, 4)
    
    print(f"get(1) -> {cache.get(1)} (Expected: -1)")
    print(f"get(3) -> {cache.get(3)} (Expected: 3)")
    print(f"get(4) -> {cache.get(4)} (Expected: 4)")

if __name__ == "__main__":
    main()

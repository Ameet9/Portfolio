import collections

class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        # Maps key -> value
        self.key_to_val = {}
        # Maps key -> frequency
        self.key_to_freq = {}
        # Maps frequency -> OrderedDict of keys
        self.freq_to_keys = collections.defaultdict(collections.OrderedDict)
        self.min_freq = 0

    def _bump_freq(self, key: int) -> None:
        """Helper to increase the frequency of a key."""
        freq = self.key_to_freq[key]
        self.key_to_freq[key] = freq + 1
        
        # Remove key from current frequency's OrderedDict
        del self.freq_to_keys[freq][key]
        
        # If the minimum frequency list is now empty, update min_freq
        if freq == self.min_freq and not self.freq_to_keys[freq]:
            self.min_freq += 1
            
        # Add key to the new frequency's OrderedDict
        self.freq_to_keys[freq + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.key_to_val:
            return -1
        
        self._bump_freq(key)
        return self.key_to_val[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity <= 0:
            return

        if key in self.key_to_val:
            self.key_to_val[key] = value
            self._bump_freq(key)
            return

        if len(self.key_to_val) >= self.capacity:
            # Evict the least frequently used key (and least recently used among them)
            # OrderedDict.popitem(last=False) acts as a queue (FIFO)
            evict_key, _ = self.freq_to_keys[self.min_freq].popitem(last=False)
            del self.key_to_val[evict_key]
            del self.key_to_freq[evict_key]

        # Insert the new key
        self.key_to_val[key] = value
        self.key_to_freq[key] = 1
        self.freq_to_keys[1][key] = None
        self.min_freq = 1

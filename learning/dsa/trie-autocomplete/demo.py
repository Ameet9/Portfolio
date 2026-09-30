import random
import sys
from trie import Trie

def main():
    words = [
        "apple", "app", "application", "apt", "aptitude", "apricot", "api", "apex",
        "banana", "band", "bandwidth", "banner", "banjo", "bank", "bankrupt", "bangle",
        "cat", "caterpillar", "catastrophe", "catalog", "catch", "category", "cattle",
        "dog", "dogma", "dogged", "dogwood", "dodge", "document", "dock", "doctor",
        "elephant", "elegant", "element", "elevator", "eleven", "electric", "electron",
        "fish", "fist", "fission", "fisherman", "fissure", "fiscal", "fisher", "fistula",
        "grape", "graph", "graphics", "grapple", "gravity", "gravy", "grand", "grant",
        "hello", "help", "helmet", "hell", "helicopter", "helium", "hellish", "helix",
        "internet", "internal", "international", "intersect", "interact", "interval", "interfere",
        "zebra", "zero", "zenith", "zest", "zealous", "zeppelin", "zeus", "zetta",
        "zoom", "zombie", "zone", "zodiac", "zoo", "zoology", "zookeeper", "zoologist"
    ]

    print("Building Trie with mock data...")
    trie = Trie()
    
    # Insert words with randomized frequencies
    for word in words:
        freq = random.randint(1, 1000)
        trie.insert(word, freq)
    
    print(f"Loaded {len(words)} words into the Trie autocomplete engine.")
    print("Type a prefix to see suggestions. Type 'exit' to quit.\n")

    try:
        while True:
            prefix = input("Enter prefix: ").strip().lower()
            if prefix == 'exit':
                print("Goodbye!")
                break
            if not prefix:
                continue
            
            suggestions = trie.get_suggestions(prefix)
            
            if suggestions:
                print(f"Top suggestions for '{prefix}':")
                # Show top 10 suggestions
                for i, word in enumerate(suggestions[:10], 1):
                    print(f"  {i}. {word}")
            else:
                print(f"No suggestions found for '{prefix}'.")
            print("-" * 40)
            
    except KeyboardInterrupt:
        print("\nExiting. Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    main()

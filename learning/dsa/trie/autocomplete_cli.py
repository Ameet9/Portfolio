"""
CLI application for demonstrating Trie autocomplete.
"""

import sys
from trie import Trie

def main():
    trie = Trie()
    
    # Sample data with mock frequencies (popularity)
    sample_data = [
        ("python", 1000), ("java", 800), ("javascript", 950),
        ("c", 700), ("c++", 750), ("c#", 600), ("ruby", 500),
        ("rust", 650), ("go", 600), ("swift", 400), ("kotlin", 450),
        ("typescript", 850), ("php", 550), ("perl", 200),
        ("react", 900), ("angular", 700), ("vue", 750),
        ("django", 600), ("flask", 550), ("spring", 650),
        ("nodejs", 800), ("express", 600), ("nextjs", 700)
    ]
    
    for word, freq in sample_data:
        trie.insert(word, freq)
        
    print("========================================")
    print("   Welcome to Trie Autocomplete CLI!    ")
    print("========================================")
    print(f"Loaded {len(sample_data)} programming keywords into the Trie.")
    print("Type a prefix to see autocomplete suggestions. Type '!quit' to exit.")
    
    while True:
        try:
            prefix = input("\nEnter prefix: ").strip()
            
            if prefix.lower() == "!quit":
                break
                
            if not prefix:
                continue
                
            suggestions = trie.autocomplete(prefix)
            
            if suggestions:
                print(f"Suggestions for '{prefix}':")
                for i, word in enumerate(suggestions, 1):
                    print(f"  {i}. {word}")
            else:
                print(f"No suggestions found for '{prefix}'.")
                
        except (KeyboardInterrupt, EOFError):
            break
            
    print("\nGoodbye!")

if __name__ == "__main__":
    main()

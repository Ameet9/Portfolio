import sys
import argparse
from diff import generate_diff

# ANSI escape codes for colors
RED = '\033[91m'
GREEN = '\033[92m'
RESET = '\033[0m'

def print_diff(ops):
    for op, line in ops:
        line = line.rstrip('\n')
        if op == 'unchanged':
            print(f"  {line}")
        elif op == 'added':
            print(f"{GREEN}+ {line}{RESET}")
        elif op == 'removed':
            print(f"{RED}- {line}{RESET}")

def main():
    parser = argparse.ArgumentParser(description="LCS-based file diff tool")
    parser.add_argument("file_a", help="First file (original)")
    parser.add_argument("file_b", help="Second file (modified)")
    
    args = parser.parse_args()
    
    try:
        with open(args.file_a, 'r') as f_a:
            lines_a = f_a.readlines()
            
        with open(args.file_b, 'r') as f_b:
            lines_b = f_b.readlines()
            
        ops = generate_diff(lines_a, lines_b)
        print_diff(ops)
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

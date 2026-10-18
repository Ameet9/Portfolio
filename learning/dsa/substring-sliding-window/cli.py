"""Interactive CLI and visualizer for the Substring Sliding Window Toolkit.

Supports both direct command-line arguments and an interactive terminal menu.
Allows users to run algorithms, inspect results, and view step-by-step
bracket window expansions and contractions.
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional

from substring_toolkit import (
    longest_substring_without_repeat,
    longest_substring_k_distinct,
    min_window_substring,
    step_by_step_longest_no_repeat,
    step_by_step_longest_k_distinct,
    step_by_step_min_window,
)
from benchmark import run_benchmark


BANNER = r"""
================================================================================
          SUBSTRING SLIDING WINDOW TOOLKIT - ALGORITHMIC WORKBENCH
================================================================================
"""


def run_longest_no_repeat(s: str, visualize: bool = False) -> None:
    """Execute and display longest substring without repeating characters."""
    print(f"\n[Algorithm: Longest Substring Without Repeating Characters]")
    print(f"Input: \"{s}\" (length {len(s)})")

    if visualize:
        print("\n--- Step-by-Step Window Execution ---")
        steps = step_by_step_longest_no_repeat(s)
        for line in steps:
            print(f"  {line}")
    else:
        max_len, substr = longest_substring_without_repeat(s)
        print("-" * 60)
        print(f"Maximum Length : {max_len}")
        print(f"Best Substring : \"{substr}\"")
        print("-" * 60)


def run_k_distinct(s: str, k: int, visualize: bool = False) -> None:
    """Execute and display longest substring with at most k distinct characters."""
    print(f"\n[Algorithm: Longest Substring with At Most K Distinct Characters]")
    print(f"Input: \"{s}\", k={k}")

    if visualize:
        print("\n--- Step-by-Step Window Execution ---")
        steps = step_by_step_longest_k_distinct(s, k)
        for line in steps:
            print(f"  {line}")
    else:
        max_len, substr = longest_substring_k_distinct(s, k)
        print("-" * 60)
        print(f"Maximum Length : {max_len}")
        print(f"Best Substring : \"{substr}\"")
        print("-" * 60)


def run_min_window(s: str, t: str, visualize: bool = False) -> None:
    """Execute and display minimum window substring."""
    print(f"\n[Algorithm: Minimum Window Substring]")
    print(f"Source s : \"{s}\"")
    print(f"Target t : \"{t}\"")

    if visualize:
        print("\n--- Step-by-Step Window Execution ---")
        steps = step_by_step_min_window(s, t)
        for line in steps:
            print(f"  {line}")
    else:
        result = min_window_substring(s, t)
        print("-" * 60)
        if result:
            print(f"Minimum Window Substring : \"{result}\" (length {len(result)})")
        else:
            print("No valid window found containing all target characters.")
        print("-" * 60)


def interactive_menu() -> None:
    """Launch interactive CLI prompt loop."""
    print(BANNER)
    while True:
        print("\nSelect an algorithm to run:")
        print("  1. Longest Substring Without Repeating Characters (LeetCode 3)")
        print("  2. Longest Substring with At Most K Distinct Characters (LeetCode 340)")
        print("  3. Minimum Window Substring (LeetCode 76)")
        print("  4. Run Performance Benchmark (O(n) vs O(n^2))")
        print("  5. Exit")

        choice = input("\nEnter choice [1-5]: ").strip()
        if choice == "1":
            default_val = "abcabcbb"
            s = input(f"Enter string [default: '{default_val}']: ").strip() or default_val
            viz = input("Show step-by-step bracket trace? [y/N]: ").strip().lower() == "y"
            run_longest_no_repeat(s, visualize=viz)

        elif choice == "2":
            default_s = "eceba"
            default_k = 2
            s = input(f"Enter string [default: '{default_s}']: ").strip() or default_s
            k_input = input(f"Enter k [default: {default_k}]: ").strip()
            k = int(k_input) if k_input.isdigit() else default_k
            viz = input("Show step-by-step bracket trace? [y/N]: ").strip().lower() == "y"
            run_k_distinct(s, k, visualize=viz)

        elif choice == "3":
            default_s = "ADOBECODEBANC"
            default_t = "ABC"
            s = input(f"Enter source string s [default: '{default_s}']: ").strip() or default_s
            t = input(f"Enter target string t [default: '{default_t}']: ").strip() or default_t
            viz = input("Show step-by-step bracket trace? [y/N]: ").strip().lower() == "y"
            run_min_window(s, t, visualize=viz)

        elif choice == "4":
            run_benchmark()

        elif choice == "5" or choice.lower() in ("q", "quit", "exit"):
            print("Exiting Substring Sliding Window Toolkit. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 5.")


def build_parser() -> argparse.ArgumentParser:
    """Construct CLI argument parser."""
    parser = argparse.ArgumentParser(
        description="Substring Sliding Window Toolkit - production algorithms and step visualizer."
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Command 1: longest-no-repeat
    p1 = subparsers.add_parser("no-repeat", aliases=["longest-no-repeat"], help="Longest substring without repeating characters")
    p1.add_argument("-s", "--string", required=True, help="Input string")
    p1.add_argument("-v", "--visualize", action="store_true", help="Print step-by-step window trace")

    # Command 2: k-distinct
    p2 = subparsers.add_parser("k-distinct", help="Longest substring with at most k distinct characters")
    p2.add_argument("-s", "--string", required=True, help="Input string")
    p2.add_argument("-k", type=int, required=True, help="Maximum distinct characters allowed")
    p2.add_argument("-v", "--visualize", action="store_true", help="Print step-by-step window trace")

    # Command 3: min-window
    p3 = subparsers.add_parser("min-window", help="Minimum window substring containing all target characters")
    p3.add_argument("-s", "--source", required=True, help="Source string")
    p3.add_argument("-t", "--target", required=True, help="Target characters string")
    p3.add_argument("-v", "--visualize", action="store_true", help="Print step-by-step window trace")

    # Command 4: benchmark
    subparsers.add_parser("benchmark", help="Run comparative benchmark vs brute-force")

    return parser


def main() -> None:
    """Entry point routing CLI arguments or falling back to interactive menu."""
    parser = build_parser()
    if len(sys.argv) == 1:
        interactive_menu()
        return

    args = parser.parse_args()
    if args.command in ("no-repeat", "longest-no-repeat"):
        run_longest_no_repeat(args.string, visualize=args.visualize)
    elif args.command == "k-distinct":
        run_k_distinct(args.string, args.k, visualize=args.visualize)
    elif args.command == "min-window":
        run_min_window(args.source, args.target, visualize=args.visualize)
    elif args.command == "benchmark":
        run_benchmark()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

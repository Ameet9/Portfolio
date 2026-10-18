"""Substring Sliding Window Toolkit.

This module provides high-performance, production-quality implementations of
the three foundational sliding-window substring algorithms:
1. Longest Substring Without Repeating Characters (LeetCode 3)
2. Longest Substring with At Most K Distinct Characters (LeetCode 340)
3. Minimum Window Substring (LeetCode 76)

Along with step-by-step visualizers that show window expansion and contraction.
"""

from __future__ import annotations

from collections import Counter
from typing import List, Tuple, Dict


def longest_substring_without_repeat(s: str) -> tuple[int, str]:
    """Find the length and slice of the longest substring without repeating characters.

    Time Complexity:
        O(n) - Single pass where right pointer advances n times, and left pointer
        jumps directly to max(left, last_seen[char] + 1) without scanning.

    Space Complexity:
        O(min(n, |Sigma|)) where Sigma is the alphabet size (e.g., 26 for lowercase
        ASCII, 128 for standard ASCII, or min(n, distinct unicode chars)).

    Why this design:
        A naive sliding window shrinks left by one index in a while loop until the duplicate
        is removed. By storing char -> last_seen_index in a hash map, we can jump the left
        pointer directly past the duplicate in O(1). Using max(left, last_seen[char] + 1)
        prevents left from moving backwards if an old duplicate outside the current window
        is encountered, avoiding the need to delete keys from the map.

    Args:
        s: The input string.

    Returns:
        A tuple of (max_length, best_substring). If string is empty, returns (0, "").
    """
    if not s:
        return 0, ""

    last_seen: dict[str, int] = {}
    left: int = 0
    max_len: int = 0
    best_start: int = 0

    for right, char in enumerate(s):
        # If character was seen inside the current active window [left..right-1],
        # jump left pointer immediately past its previous occurrence.
        if char in last_seen and last_seen[char] >= left:
            left = last_seen[char] + 1

        last_seen[char] = right
        current_len = right - left + 1

        if current_len > max_len:
            max_len = current_len
            best_start = left

    return max_len, s[best_start : best_start + max_len]


def longest_substring_k_distinct(s: str, k: int) -> tuple[int, str]:
    """Find the longest substring containing at most k distinct characters.

    Time Complexity:
        O(n) - Right pointer advances from 0 to n-1. Left pointer advances at most n times
        across the entire loop. Dictionary operations are amortized O(1).

    Space Complexity:
        O(k) - The frequency map stores at most k + 1 distinct character keys before
        triggering the contraction loop.

    Why this design:
        We maintain a window frequency table. When a new character causes len(freq) > k,
        the window has become INVALID. We shrink from the left until len(freq) <= k.
        Crucially, we must `del freq[char]` when a character's count reaches 0;
        otherwise len(freq) would falsely report the character as still present.

    Args:
        s: The input string.
        k: Maximum number of distinct characters allowed.

    Returns:
        A tuple of (max_length, best_substring). If k <= 0 or s is empty, returns (0, "").
    """
    if k <= 0 or not s:
        return 0, ""

    freq: dict[str, int] = {}
    left: int = 0
    max_len: int = 0
    best_start: int = 0

    for right, char in enumerate(s):
        freq[char] = freq.get(char, 0) + 1

        # Shrink while condition is violated (too many distinct characters)
        while len(freq) > k:
            left_char = s[left]
            freq[left_char] -= 1
            if freq[left_char] == 0:
                del freq[left_char]
            left += 1

        current_len = right - left + 1
        if current_len > max_len:
            max_len = current_len
            best_start = left

    return max_len, s[best_start : best_start + max_len]


def min_window_substring(s: str, t: str) -> str:
    """Find the minimum window substring of s such that every character in t is included.

    If multiple valid windows exist with the same minimum length, returns the first one.
    If no such window exists, returns "".

    Time Complexity:
        O(|s| + |t|) - O(|t|) to build target frequency counts, and O(|s|) to slide
        the window across s. Both left and right pointers traverse s at most once.

    Space Complexity:
        O(|Sigma|) where Sigma is the distinct characters in t and s.

    Why this design:
        Instead of comparing dictionaries on every step (which would cost O(|Sigma|) per step),
        we maintain two counters:
        - `required`: number of UNIQUE characters in t that must meet their target frequency.
        - `formed`: number of UNIQUE characters whose window frequency >= target frequency.
        This enables an O(1) validity check (`formed == required`).
        Notice the key duality: while "Longest Substring" algorithms shrink while INVALID,
        "Minimum Window" algorithms shrink while VALID to compress to the smallest valid slice!

    Args:
        s: Source string to search within.
        t: Target character requirements.

    Returns:
        The shortest substring containing all characters of t (with multiplicity),
        or "" if impossible.
    """
    if not s or not t or len(s) < len(t):
        return ""

    target_counts: Counter[str] = Counter(t)
    required: int = len(target_counts)
    window_counts: dict[str, int] = {}
    formed: int = 0

    min_len: float = float("inf")
    best_range: tuple[int, int] = (-1, -1)

    left: int = 0
    for right, char in enumerate(s):
        # 1. Expand right and track frequencies
        window_counts[char] = window_counts.get(char, 0) + 1
        if char in target_counts and window_counts[char] == target_counts[char]:
            formed += 1

        # 2. While window satisfies all requirements, try to shrink from left
        while formed == required and left <= right:
            current_len = right - left + 1
            if current_len < min_len:
                min_len = current_len
                best_range = (left, right)

            left_char = s[left]
            window_counts[left_char] -= 1
            if left_char in target_counts and window_counts[left_char] < target_counts[left_char]:
                formed -= 1

            left += 1

    if best_range[0] == -1:
        return ""
    return s[best_range[0] : best_range[1] + 1]


def visualize_window(s: str, left: int, right: int, extra_info: str = "") -> str:
    """Format string with brackets around the active window [left..right].

    Format: s[:left] + "[" + s[left:right+1] + "]" + s[right+1:]

    Args:
        s: The underlying string.
        left: Left pointer index (inclusive).
        right: Right pointer index (inclusive).
        extra_info: Optional status message explaining the window state.

    Returns:
        Bracket-delimited string visualization with optional state note.
    """
    if not s:
        base = "[]"
    elif left > right or right < 0 or left >= len(s):
        base = f"{s} []"
    else:
        clamped_left = max(0, min(left, len(s)))
        clamped_right = max(clamped_left, min(right, len(s) - 1))
        base = f"{s[:clamped_left]}[{s[clamped_left : clamped_right + 1]}]{s[clamped_right + 1:]}"

    if extra_info:
        return f"{base}  |  {extra_info}"
    return base


def step_by_step_longest_no_repeat(s: str) -> list[str]:
    """Generate a step-by-step visual trace for longest substring without repeating characters.

    Args:
        s: The input string.

    Returns:
        List of formatted lines depicting each expansion, duplicate jump, and max record.
    """
    if not s:
        return ["Input string is empty. Max length: 0, Substring: ''"]

    logs: list[str] = [
        f"Input: \"{s}\" (length {len(s)})",
        "Algorithm: Longest Substring Without Repeating Characters (Hash Map Jump)",
        "-" * 70,
    ]
    last_seen: dict[str, int] = {}
    left = 0
    max_len = 0
    best_start = 0

    for right, char in enumerate(s):
        duplicate_jump = False
        prev_idx = -1
        old_left = left

        if char in last_seen and last_seen[char] >= left:
            prev_idx = last_seen[char]
            left = prev_idx + 1
            duplicate_jump = True

        last_seen[char] = right
        curr_len = right - left + 1

        info_tokens = [f"R={right} ('{char}')", f"L={left}"]
        if duplicate_jump:
            info_tokens.append(f"DUP '{char}' at idx {prev_idx} -> Left jumped {old_left}->{left}")

        if curr_len > max_len:
            max_len = curr_len
            best_start = left
            info_tokens.append(f"NEW MAX: len={max_len} (\"{s[best_start : best_start + max_len]}\")")
        else:
            info_tokens.append(f"len={curr_len}")

        logs.append(visualize_window(s, left, right, ", ".join(info_tokens)))

    logs.append("-" * 70)
    best_str = s[best_start : best_start + max_len]
    logs.append(f"Result: Maximum Length = {max_len}, Substring = \"{best_str}\"")
    return logs


def step_by_step_longest_k_distinct(s: str, k: int) -> list[str]:
    """Generate a step-by-step visual trace for longest substring with at most k distinct characters.

    Args:
        s: The input string.
        k: Maximum distinct characters allowed.

    Returns:
        List of formatted lines showing expansion, character frequency, and left contraction.
    """
    if k <= 0 or not s:
        return [f"Input s='{s}', k={k}. Result: Length 0, Substring: ''"]

    logs: list[str] = [
        f"Input: \"{s}\", k={k}",
        "Algorithm: Longest Substring with At Most K Distinct Characters",
        "-" * 70,
    ]

    freq: dict[str, int] = {}
    left = 0
    max_len = 0
    best_start = 0

    for right, char in enumerate(s):
        freq[char] = freq.get(char, 0) + 1
        logs.append(
            visualize_window(
                s, left, right,
                f"EXPAND: Added '{char}' | distinct={len(freq)}/{k} | freq={dict(freq)}"
            )
        )

        while len(freq) > k:
            left_char = s[left]
            freq[left_char] -= 1
            if freq[left_char] == 0:
                del freq[left_char]
                reason = f"deleted '{left_char}'"
            else:
                reason = f"decremented '{left_char}' to {freq[left_char]}"
            left += 1
            logs.append(
                visualize_window(
                    s, left, right,
                    f"SHRINK: {reason} | distinct={len(freq)}/{k} | freq={dict(freq)}"
                )
            )

        curr_len = right - left + 1
        if curr_len > max_len:
            max_len = curr_len
            best_start = left
            logs.append(
                visualize_window(
                    s, left, right,
                    f"RECORD MAX: len={max_len} (\"{s[best_start : best_start + max_len]}\")"
                )
            )

    logs.append("-" * 70)
    best_str = s[best_start : best_start + max_len]
    logs.append(f"Result: Maximum Length = {max_len}, Substring = \"{best_str}\"")
    return logs


def step_by_step_min_window(s: str, t: str) -> list[str]:
    """Generate a step-by-step visual trace for minimum window substring.

    Args:
        s: Source string.
        t: Target characters string.

    Returns:
        List of formatted lines depicting window expansion and shrinking when valid.
    """
    if not s or not t:
        return [f"Empty input: s='{s}', t='{t}'. Minimum window: ''"]
    if len(t) > len(s):
        return [f"Target t='{t}' longer than s='{s}'. Minimum window: ''"]

    target_counts = Counter(t)
    required = len(target_counts)
    window_counts: dict[str, int] = {}
    formed = 0

    min_len = float("inf")
    best_range = (-1, -1)

    logs: list[str] = [
        f"Source: \"{s}\", Target: \"{t}\"",
        f"Target Requirements: {dict(target_counts)} ({required} unique characters)",
        "Algorithm: Minimum Window Substring (Expand -> Shrink While Valid)",
        "-" * 70,
    ]

    left = 0
    for right, char in enumerate(s):
        window_counts[char] = window_counts.get(char, 0) + 1
        if char in target_counts and window_counts[char] == target_counts[char]:
            formed += 1

        logs.append(
            visualize_window(
                s, left, right,
                f"EXPAND R={right} ('{char}') | formed={formed}/{required}"
            )
        )

        while formed == required and left <= right:
            curr_len = right - left + 1
            is_new_best = False
            if curr_len < min_len:
                min_len = curr_len
                best_range = (left, right)
                is_new_best = True

            best_note = f" -> **NEW MIN WINDOW: \"{s[left:right+1]}\" (len={curr_len})**" if is_new_best else ""
            logs.append(
                visualize_window(
                    s, left, right,
                    f"VALID WINDOW [len={curr_len}]{best_note}"
                )
            )

            # Contract from left
            left_char = s[left]
            window_counts[left_char] -= 1
            if left_char in target_counts and window_counts[left_char] < target_counts[left_char]:
                formed -= 1
                logs.append(
                    visualize_window(
                        s, left + 1, right,
                        f"SHRINK: Drop critical '{left_char}' at L={left} -> Window now INVALID (formed={formed}/{required})"
                    )
                )
            else:
                logs.append(
                    visualize_window(
                        s, left + 1, right,
                        f"SHRINK: Drop surplus '{left_char}' at L={left} -> Window STILL VALID (formed={formed}/{required})"
                    )
                )
            left += 1

    logs.append("-" * 70)
    if best_range[0] == -1:
        logs.append("Result: No valid window found.")
    else:
        best_str = s[best_range[0] : best_range[1] + 1]
        logs.append(
            f"Result: Minimum Window Substring = \"{best_str}\" "
            f"(length {len(best_str)}) at indices [{best_range[0]}..{best_range[1]}]"
        )
    return logs

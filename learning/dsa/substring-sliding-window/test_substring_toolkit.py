"""Comprehensive unit tests for the Substring Sliding Window Toolkit.

Tests all algorithmic requirements, edge cases, visualizers, and boundary conditions
using pytest.
"""

from __future__ import annotations

import pytest
from substring_toolkit import (
    longest_substring_without_repeat,
    longest_substring_k_distinct,
    min_window_substring,
    visualize_window,
    step_by_step_longest_no_repeat,
    step_by_step_longest_k_distinct,
    step_by_step_min_window,
)


# =====================================================================
# Tests: Longest Substring Without Repeating Characters
# =====================================================================

class TestLongestSubstringWithoutRepeat:
    """Test suite for longest_substring_without_repeat algorithm."""

    def test_empty_string(self) -> None:
        """Empty string returns length 0 and empty substring."""
        max_len, substr = longest_substring_without_repeat("")
        assert max_len == 0
        assert substr == ""

    def test_single_character(self) -> None:
        """Single character string returns length 1 and that character."""
        max_len, substr = longest_substring_without_repeat("x")
        assert max_len == 1
        assert substr == "x"

    def test_all_identical_characters(self) -> None:
        """String of identical characters returns length 1."""
        max_len, substr = longest_substring_without_repeat("bbbbb")
        assert max_len == 1
        assert substr == "b"

    def test_all_unique_characters(self) -> None:
        """String of all distinct characters returns full string length."""
        s = "abcdef"
        max_len, substr = longest_substring_without_repeat(s)
        assert max_len == 6
        assert substr == s

    @pytest.mark.parametrize(
        "s, expected_len, expected_substr",
        [
            ("abcabcbb", 3, "abc"),
            ("pwwkew", 3, "wke"),
            ("dvdf", 3, "vdf"),
            ("abba", 2, "ab"),
            ("tmmzuxt", 5, "mzuxt"),
        ],
    )
    def test_repeating_patterns(self, s: str, expected_len: int, expected_substr: str) -> None:
        """Verify classic substring patterns with inner duplicate jumps."""
        max_len, substr = longest_substring_without_repeat(s)
        assert max_len == expected_len
        assert substr == expected_substr
        # Ensure returned substring truly has no repeating characters
        assert len(set(substr)) == len(substr)

    def test_case_sensitivity(self) -> None:
        """Verify algorithm treats upper and lowercase as distinct."""
        s = "aAaBbB"
        max_len, substr = longest_substring_without_repeat(s)
        # 'a' and 'A' are distinct, 'b' and 'B' are distinct.
        # "AaBb" has length 4 with no duplicates.
        assert max_len == 4
        assert substr == "AaBb"

    def test_special_characters_and_spaces(self) -> None:
        """Verify spaces and symbols are handled properly."""
        s = "a b c a b "
        # Space repeats, so window cannot contain two spaces. Longest slice is e.g. "a b" or "b c" (len 3).
        max_len, substr = longest_substring_without_repeat(s)
        assert max_len == 3
        assert len(set(substr)) == len(substr)

        symbols = "!@#$%^&*()!"
        sym_len, sym_substr = longest_substring_without_repeat(symbols)
        assert sym_len == 10
        assert sym_substr == "!@#$%^&*()"

    def test_unicode_and_emojis(self) -> None:
        """Verify proper handling of non-ASCII characters."""
        # 'l' repeats in "hello", so max unique span is "lo世界he" or "o世界hel" of length 6.
        s = "hello世界hello"
        max_len, substr = longest_substring_without_repeat(s)
        assert max_len == 6
        assert len(set(substr)) == len(substr)

        emoji_s = "🚀🌟🔥🚀🌟"
        em_len, em_substr = longest_substring_without_repeat(emoji_s)
        assert em_len == 3
        assert em_substr == "🚀🌟🔥"


# =====================================================================
# Tests: Longest Substring with At Most K Distinct Characters
# =====================================================================

class TestLongestSubstringKDistinct:
    """Test suite for longest_substring_k_distinct algorithm."""

    def test_k_zero_or_negative(self) -> None:
        """k <= 0 must return length 0 and empty string."""
        assert longest_substring_k_distinct("eceba", 0) == (0, "")
        assert longest_substring_k_distinct("eceba", -3) == (0, "")

    def test_empty_string(self) -> None:
        """Empty string returns (0, '') for any k."""
        assert longest_substring_k_distinct("", 2) == (0, "")

    def test_k_equals_one(self) -> None:
        """k=1 isolates longest run of identical characters."""
        max_len, substr = longest_substring_k_distinct("aabbcc", 1)
        assert max_len == 2
        assert substr == "aa"

        max_len2, substr2 = longest_substring_k_distinct("aabaaaccc", 1)
        assert max_len2 == 3
        assert substr2 == "aaa"

    def test_k_greater_than_or_equal_to_len(self) -> None:
        """When k >= len(s), entire string is valid."""
        s = "abcde"
        assert longest_substring_k_distinct(s, 5) == (5, s)
        assert longest_substring_k_distinct(s, 10) == (5, s)

    @pytest.mark.parametrize(
        "s, k, expected_len, expected_substr",
        [
            ("eceba", 2, 3, "ece"),
            ("ccaabbb", 2, 5, "aabbb"),
            ("abaccc", 2, 4, "accc"),
            ("world", 3, 3, "wor"),
            ("a", 1, 1, "a"),
        ],
    )
    def test_standard_k_distinct_cases(
        self, s: str, k: int, expected_len: int, expected_substr: str
    ) -> None:
        """Verify variable-size shrinking when distinct count exceeds k."""
        max_len, substr = longest_substring_k_distinct(s, k)
        assert max_len == expected_len
        assert substr == expected_substr
        assert len(set(substr)) <= k


# =====================================================================
# Tests: Minimum Window Substring
# =====================================================================

class TestMinWindowSubstring:
    """Test suite for min_window_substring algorithm."""

    def test_standard_classic_case(self) -> None:
        """LeetCode classic: ADOBECODEBANC with target ABC yields BANC."""
        s = "ADOBECODEBANC"
        t = "ABC"
        assert min_window_substring(s, t) == "BANC"

    def test_exact_match(self) -> None:
        """When s == t, returns the whole string."""
        assert min_window_substring("ABC", "ABC") == "ABC"

    def test_single_character(self) -> None:
        """Single character matches."""
        assert min_window_substring("a", "a") == "a"
        assert min_window_substring("a", "b") == ""

    def test_target_longer_than_source(self) -> None:
        """If target is longer than source, no window can exist."""
        assert min_window_substring("a", "aa") == ""
        assert min_window_substring("ab", "abc") == ""

    def test_empty_inputs(self) -> None:
        """Empty source or target returns empty string."""
        assert min_window_substring("", "a") == ""
        assert min_window_substring("a", "") == ""
        assert min_window_substring("", "") == ""

    def test_no_match_possible(self) -> None:
        """When characters in t are missing from s, returns empty string."""
        assert min_window_substring("abcdef", "xyz") == ""
        assert min_window_substring("abcdef", "az") == ""

    def test_duplicate_characters_in_target(self) -> None:
        """Target with duplicate characters requires exact frequency in window."""
        s = "AAFLSLFLABB"
        t = "AAB"
        # Valid window requires at least two 'A's and one 'B'.
        # The shortest window satisfying this is s[1:10] = "AFLSLFLAB" (len 9).
        res = min_window_substring(s, t)
        assert res.count("A") >= 2
        assert res.count("B") >= 1
        assert res == "AFLSLFLAB"

        s2 = "ADOBECODEBANC"
        t2 = "AABC"
        res2 = min_window_substring(s2, t2)
        assert res2.count("A") >= 2
        assert res2.count("B") >= 1
        assert res2.count("C") >= 1
        assert res2 == "ADOBECODEBA"

    def test_target_at_very_end_or_beginning(self) -> None:
        """Window occurs at the boundary edges."""
        assert min_window_substring("XYZABC", "ABC") == "ABC"
        assert min_window_substring("ABCXYZ", "ABC") == "ABC"

    def test_case_sensitivity(self) -> None:
        """Upper and lower case characters must be treated distinctly."""
        assert min_window_substring("a", "A") == ""
        assert min_window_substring("AaBbCc", "ABC") == "aBbC" or min_window_substring("AaBbCc", "ABC") == "AaBbC"


# =====================================================================
# Tests: Step-by-Step Visualizer
# =====================================================================

class TestVisualizers:
    """Test suite for bracket formatting and step-by-step trace generation."""

    def test_visualize_window_formatting(self) -> None:
        """Verify exact bracket formatting: s[:left] + '[' + s[left:right+1] + ']' + s[right+1:]."""
        s = "abcdef"
        formatted = visualize_window(s, 1, 3)
        assert formatted == "a[bcd]ef"

        # Edge of string
        assert visualize_window(s, 0, 0) == "[a]bcdef"
        assert visualize_window(s, 0, 5) == "[abcdef]"

        # With extra info
        formatted_info = visualize_window(s, 1, 2, "Test note")
        assert formatted_info == "a[bc]def  |  Test note"

    def test_visualize_window_empty_or_invalid(self) -> None:
        """Verify empty string or invalid index handling."""
        assert "[]" in visualize_window("", 0, 0)
        assert "[]" in visualize_window("abc", 2, 1)

    def test_step_by_step_longest_no_repeat_output(self) -> None:
        """Verify step_by_step_longest_no_repeat returns readable logs."""
        trace = step_by_step_longest_no_repeat("abcabcbb")
        assert isinstance(trace, list)
        assert len(trace) > 5
        # Check that brackets exist in steps
        bracket_lines = [line for line in trace if "[" in line and "]" in line]
        assert len(bracket_lines) >= 8
        assert "Maximum Length = 3" in trace[-1]

    def test_step_by_step_longest_no_repeat_empty(self) -> None:
        """Empty string trace does not crash."""
        trace = step_by_step_longest_no_repeat("")
        assert len(trace) == 1
        assert "empty" in trace[0].lower()

    def test_step_by_step_longest_k_distinct(self) -> None:
        """Verify step_by_step_longest_k_distinct shows shrink events."""
        trace = step_by_step_longest_k_distinct("eceba", 2)
        assert isinstance(trace, list)
        assert any("SHRINK" in line for line in trace)
        assert any("RECORD MAX" in line for line in trace)
        assert "Maximum Length = 3" in trace[-1]

    def test_step_by_step_min_window(self) -> None:
        """Verify step_by_step_min_window records expansions and contractions."""
        trace = step_by_step_min_window("ADOBECODEBANC", "ABC")
        assert isinstance(trace, list)
        assert any("EXPAND" in line for line in trace)
        assert any("SHRINK" in line for line in trace)
        assert any("VALID WINDOW" in line for line in trace)
        assert "BANC" in trace[-1]

    def test_step_by_step_min_window_impossible(self) -> None:
        """Trace for impossible match indicates no valid window."""
        trace = step_by_step_min_window("abc", "z")
        assert any("No valid window found" in line for line in trace)

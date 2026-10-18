# Substring Sliding Window Toolkit

A production-grade algorithmic toolkit and visual laboratory implementing the three classic variable-size sliding window substring algorithms in Python:

1. **Longest Substring Without Repeating Characters** (LeetCode 3)
2. **Longest Substring with At Most K Distinct Characters** (LeetCode 340)
3. **Minimum Window Substring** (LeetCode 76)

This repository includes high-performance algorithmic implementations, bracket-based step-by-step visualizers, a full interactive CLI workbench, comprehensive unit tests, and empirical performance benchmarks comparing amortized $\mathcal{O}(n)$ sliding windows against $\mathcal{O}(n^2)$ brute-force solutions.

---

## Architecture & File Structure

```text
d:\Portfolio\learning\dsa\substring-sliding-window\
│
├── substring_toolkit.py      # Core algorithms, data structures, and step visualizers
├── cli.py                    # Interactive menu loop & command-line interface
├── test_substring_toolkit.py # Pytest test suite covering edge cases and visualizers
├── benchmark.py              # Performance benchmark (O(n) vs O(n^2) on strings up to 10k chars)
└── README.md                 # Complete technical documentation & senior interview guide
```

---

## The Sliding Window Pattern Taxonomy

Sliding window algorithms are two-pointer techniques used primarily on sequential data structures (arrays, strings, linked lists) to convert naive $\mathcal{O}(n^2)$ or $\mathcal{O}(n^3)$ exhaustive searches into strictly linear $\mathcal{O}(n)$ passes.

```
                         Sliding Window Taxonomy
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
   Fixed-Size Window                               Variable-Size Window
   (e.g., Subarray sum of size K,                 (Window dynamically expands & contracts)
    Sliding Window Maximum)                                  │
                                          ┌──────────────────┴──────────────────┐
                                          ▼                                     ▼
                                Shrink-While-Invalid                   Shrink-While-Valid
                              (Target: MAXIMUM window)              (Target: MINIMUM window)
                              Example: Longest Substring            Example: Minimum Window Substring
```

### 1. Fixed-Size Windows
- Window size $W = R - L + 1$ is invariant.
- Pointers advance synchronously: when $R$ advances, $L$ advances by the exact same amount.
- Typical applications: moving averages, fixed-length anagram search, rolling hash computation.

### 2. Variable-Size Windows
- Window size $W$ dynamically grows and shrinks based on whether a domain constraint is currently satisfied.
- Two distinct operational regimes dictate pointer movement:
  - **When to Expand ($R \to R + 1$):**
    - In **Maximize** problems: Expand whenever the current window is *valid* to explore if a larger valid window exists.
    - In **Minimize** problems: Expand whenever the current window is *invalid* to ingest missing target elements.
  - **When to Shrink ($L \to L + 1$):**
    - In **Maximize** problems: Shrink whenever the window becomes *invalid* until validity is restored.
    - In **Minimize** problems: Shrink whenever the window is *valid* to discard superfluous characters and compress to the minimal valid slice.

---

## The Critical Algorithmic Duality

The sliding window pattern bifurcates into two opposing paradigms:

| Dimension | Shrink-While-Invalid (Longest Substring) | Shrink-While-Valid (Minimum Window Substring) |
| :--- | :--- | :--- |
| **Optimization Goal** | Maximize window length ($R - L + 1$) | Minimize window length ($R - L + 1$) |
| **Expansion Step ($R$)** | Introduces next character into window frequency | Introduces next character and increments `formed` |
| **Contraction Condition** | `while condition_violated:` (e.g., duplicate found or `len(freq) > k`) | `while window_is_valid:` (`formed == required`) |
| **Best Result Update** | Updated when window is **valid** (after shrinking) | Updated when window is **valid** (before/during shrinking) |
| **State Pruning** | Must `del freq[char]` when count drops to zero | Decrements `formed` only when count drops below requirement |
| **Optimization Trick** | Fast jump: `L = max(L, last_seen[char] + 1)` in $\mathcal{O}(1)$ | Match tracking: `formed == required` avoids $\mathcal{O}(\|\Sigma\|)$ map comparisons |

```
Shrink-While-Invalid (Longest):
  [── Valid Window ──]──> Invalid Character ──> [Shrink Left until Valid again] ──> Record Max

Shrink-While-Valid (Minimum Window):
  [── Invalid Window ────────]──> Valid! ──> [Shrink Left as long as Valid] ──> Record Min
```

---

## Visual ASCII Traces

### 1. Longest Substring Without Repeating Characters (`s = "abcabcbb"`)

```text
Step 0: [a]bcabcbb   | R=0 ('a'), L=0, NEW MAX: len=1 ("a")
Step 1: [ab]cabcbb   | R=1 ('b'), L=0, NEW MAX: len=2 ("ab")
Step 2: [abc]abcbb   | R=2 ('c'), L=0, NEW MAX: len=3 ("abc")
Step 3: a[bca]bcbb   | R=3 ('a'), DUP 'a' at idx 0 -> Left jumped 0->1, len=3
Step 4: ab[cab]cbb   | R=4 ('b'), DUP 'b' at idx 1 -> Left jumped 1->2, len=3
Step 5: abc[abc]bb   | R=5 ('c'), DUP 'c' at idx 2 -> Left jumped 2->3, len=3
Step 6: abcab[cb]b   | R=6 ('b'), DUP 'b' at idx 4 -> Left jumped 3->5, len=2
Step 7: abcabcb[b]   | R=7 ('b'), DUP 'b' at idx 6 -> Left jumped 5->7, len=1
======================================================================
Result: Maximum Length = 3, Substring = "abc"
```

### 2. Minimum Window Substring (`s = "ADOBECODEBANC"`, `t = "ABC"`)

```text
Target Requirements: {'A': 1, 'B': 1, 'C': 1} (3 unique characters required)

[A]DOBECODEBANC   | EXPAND R=0 ('A') | formed=1/3
[ADOB]ECODEBANC   | EXPAND R=3 ('B') | formed=2/3
[ADOBEC]ODEBANC   | EXPAND R=5 ('C') | formed=3/3 (VALID WINDOW, len=6) -> NEW MIN: "ADOBEC"
A[DOBEC]ODEBANC   | SHRINK L=0 (dropped 'A') -> Window now INVALID (formed=2/3)
...
A[DOBECODEBA]NC   | EXPAND R=10 ('A') | formed=3/3 (VALID WINDOW, len=10)
ADOBE[CODEBA]NC   | SHRINK L=4 (dropped 'E') -> Window STILL VALID (formed=3/3, len=6)
ADOBEC[ODEBA]NC   | SHRINK L=5 (dropped 'C') -> Window now INVALID (formed=2/3)
ADOBEC[ODEBANC]   | EXPAND R=12 ('C') | formed=3/3 (VALID WINDOW, len=7)
ADOBECOD[EBANC]   | SHRINK L=7 (dropped 'D') -> Window STILL VALID (len=5) -> NEW MIN: "EBANC"
ADOBECODE[BANC]   | SHRINK L=8 (dropped 'E') -> Window STILL VALID (len=4) -> NEW MIN: "BANC"
ADOBECODEB[ANC]   | SHRINK L=9 (dropped 'B') -> Window now INVALID (formed=2/3)
======================================================================
Result: Minimum Window Substring = "BANC" (length 4) at indices [9..12]
```

---

## Complexity Analysis: Amortized $\mathcal{O}(n)$ Two-Pointer Movement

A frequent point of confusion during technical interviews is why an algorithm containing a nested `while` loop runs in $\mathcal{O}(n)$ rather than $\mathcal{O}(n^2)$ time.

```python
for right in range(n):
    # ... expansion ...
    while condition:
        # ... contraction ...
        left += 1
```

### Mathematical Proof via Aggregate Analysis
1. **Right Pointer Invariant:** The outer `for` loop executes exactly $n$ times. The pointer `right` starts at $0$ and increments strictly by $+1$ on each step:
   $$\sum \Delta right = n$$
2. **Left Pointer Invariant:** The pointer `left` starts at $0$. Inside the `while` loop, `left` increments strictly by $+1$. Furthermore, the condition `left <= right` is maintained at all times. Therefore, `left` can never exceed $n$:
   $$\sum \Delta left \le n$$
3. **Aggregate Operations:**
   Every element $s[i]$ enters the window at `right = i` exactly once.
   Every element $s[i]$ exits the window at `left = i` at most once.
   Total pointer transitions across the entire execution is strictly bounded:
   $$\text{Total Pointer Advances} = \sum \Delta right + \sum \Delta left \le 2n$$
4. **Per-Step Overhead:** Hash table insertions, deletions, and integer counter updates execute in amortized $\mathcal{O}(1)$ time.
5. **Conclusion:** Total time complexity is strictly $\mathcal{O}(n)$ amortized.

---

## How to Run

### 1. Run Unit Tests (Pytest)
```powershell
python -m pytest test_substring_toolkit.py -v
```

### 2. Run Performance Benchmark
```powershell
python benchmark.py
```

Sample Benchmark Output:
```text
==================================================================================
SUBSTRING SLIDING WINDOW PERFORMANCE BENCHMARK
Algorithm: Longest Substring Without Repeating Characters (LeetCode 3)
Comparing Amortized O(n) Sliding Window vs O(n^2) Brute Force
==================================================================================
Length (chars)  | Sliding Window (ms)  | Brute Force (ms)   | Speedup      | Matches?
----------------------------------------------------------------------------------
1000            | 0.1868               | 1.69               |       9.0x | YES     
2500            | 0.6466               | 4.96               |       7.7x | YES     
5000            | 1.0360               | 8.36               |       8.1x | YES     
7500            | 1.4898               | 14.48              |       9.7x | YES     
10000           | 2.3037               | 17.62              |       7.7x | YES     
----------------------------------------------------------------------------------
```

### 3. Run the Interactive CLI & Visualizer
Launch the interactive terminal menu:
```powershell
python cli.py
```

Or execute directly with command-line flags:
```powershell
# Longest substring without repeat with visual bracket trace
python cli.py no-repeat -s "abcabcbb" -v

# Longest substring with at most k distinct characters
python cli.py k-distinct -s "eceba" -k 2 -v

# Minimum window substring with expansion and contraction trace
python cli.py min-window -s "ADOBECODEBANC" -t "ABC" -v
```

---

## Senior Engineering Interview Q&A

### Q1: Why is the time complexity $\mathcal{O}(n)$ if there is a nested while-loop inside the for-loop?

**Answer:**
A nested loop only produces $\mathcal{O}(n^2)$ complexity if the inner loop restarts its iterations for every outer step (e.g., scanning $0 \dots n$ each time). 

In sliding window algorithms, the inner loop never restarts. We use the **Aggregate Method** of amortized analysis:
- The `right` pointer monotonically advances from $0$ to $n-1$, incrementing exactly $n$ times.
- The `left` pointer monotonically advances from $0$ to $n-1$ throughout the *entire lifecycle* of the algorithm. It never resets or moves backward.
- Therefore, each character in the string is enqueued into the window exactly once and dequeued at most once.
- The total number of inner loop iterations across the entire execution is bounded by $n$. Summing the outer loop ($n$) and the inner loop ($\le n$), we obtain at most $2n$ total pointer steps. Combined with $\mathcal{O}(1)$ dictionary operations, the runtime is strictly $\mathcal{O}(n)$.

---

### Q2: What is the fundamental algorithmic difference between "shrink-while-invalid" and "shrink-while-valid"?

**Answer:**
The two patterns reflect the mathematical duality between **maximization** and **minimization** optimization problems:

1. **Shrink-While-Invalid (Maximization Problems):**
   - *Example:* Longest Substring Without Repeating Characters, Longest Substring with At Most $K$ Distinct Characters.
   - *Strategy:* We greedily expand $R$ to make the window as large as possible. If an added character violates the constraint (e.g., character count exceeds threshold, or duplicate introduced), the window is now **invalid**.
   - *Action:* We execute a `while` loop to shrink $L$ until validity is restored. Once valid again, we record the candidate maximum length: `max_len = max(max_len, R - L + 1)`.

2. **Shrink-While-Valid (Minimization Problems):**
   - *Example:* Minimum Window Substring, Minimum Size Subarray Sum.
   - *Strategy:* We expand $R$ until all constraint requirements are met. Once the requirements are met, the window is **valid**.
   - *Action:* Any further expansion would only make the window larger, which conflicts with minimization. Therefore, we execute a `while` loop to shrink $L$ *while the window remains valid*, continuously updating our global minimum length: `min_len = min(min_len, R - L + 1)` and recording the slice, stopping only when the window drops below the requirement.

---

### Q3: How does the hash map index jump in `longest_substring_without_repeat` optimize over single-step shrinking, and why is `max(left, last_seen[char] + 1)` necessary?

**Answer:**
In a classic variable sliding window, when a duplicate character $c$ enters at `right`, we would normally step `left` forward by $+1$ in a `while` loop until $c$ is eliminated:
```python
while s[left] != s[right]:
    left += 1
left += 1
```
While amortized $\mathcal{O}(n)$, this still requires multiple pointer steps. 

By storing `last_seen: dict[char, int]`, we can jump `left` directly past the duplicate's prior index in a single operation:
```python
if char in last_seen:
    left = max(left, last_seen[char] + 1)
```

**Why the `max()` is strictly necessary:**
We do not prune or delete characters from `last_seen` when `left` advances. If character $c$ appeared early in the string (say index 1), and our current active window is $[10 \dots 15]$, encountering character $c$ again at index 16 will find $c$ in `last_seen` at index 1. 

If we simply wrote `left = last_seen[char] + 1`, `left` would jump backwards from 10 to 2, corrupting the window invariant! The `max(left, last_seen[char] + 1)` guard guarantees that `left` only moves monotonically forward, ignoring duplicate records that lie outside the current active window.

---

### Q4: How do you handle non-ASCII characters, multi-byte unicode code points, and streaming inputs where the full string cannot fit in memory?

**Answer:**

1. **Unicode & Surrogate Pairs:**
   - In languages like Java or JavaScript that represent strings as UTF-16 code units, emojis (such as 🚀) span two code units (a surrogate pair). Slicing or indexing by integer index can slice a surrogate pair in half, corrupting characters.
   - In Python 3, strings are sequences of unicode code points (PEP 393), meaning emojis and international characters (CJK, Arabic) index naturally as single elements. For language-agnostic systems or grapheme clusters (e.g., emojis with zero-width joiners and skin tone modifiers), we must normalize (Unicode NFC/NFD) or iterate over grapheme clusters using dedicated libraries (e.g., Python's `regex` module with `\X`).

2. **Streaming Inputs ($\mathcal{O}(1)$ Memory):**
   - If the input stream is unbounded (e.g., multi-gigabyte log files, network socket streams), we cannot retain the full string in memory.
   - We maintain a circular ring buffer or deque of size equal to the maximum active window size.
   - For `longest_substring_without_repeat`, since maximum alphabet size is bounded (e.g., standard ASCII is 128, extended ASCII is 256), the active window never exceeds $\|\Sigma\|$. We only need to buffer at most $\|\Sigma\|$ characters in a deque, evicting from the front as the left pointer moves.

---

### Q5: How does the sliding window pattern generalize to 2D arrays (matrices) or multi-dimensional constraints, and what are the trade-offs?

**Answer:**
Sliding window does not directly translate to 2D because a 2D submatrix has four degrees of freedom: `(row_start, row_end, col_start, col_end)`.

To generalize sliding window to 2D:
1. **Dimension Reduction (Kadane's / Prefix Sums + 1D Sliding Window):**
   - Fix the top row $r_1$ and bottom row $r_2$ (requiring $\mathcal{O}(R^2)$ pairs).
   - Compress the 2D matrix into a 1D column array by aggregating values across rows $r_1 \dots r_2$.
   - Apply the 1D sliding window algorithm across the columns $c = 0 \dots C-1$.
   - **Complexity:** Reduces a naive $\mathcal{O}(R^2 \cdot C^2)$ 2D brute-force to $\mathcal{O}(R^2 \cdot C)$ time.

2. **Monotonicity Requirement:**
   - The fundamental prerequisite for sliding window in any dimension is **monotonicity**: expanding the window must monotonically increase (or maintain) the target metric (e.g., sum of non-negative numbers, character frequency), while contracting must monotonically decrease it.
   - If negative values or non-monotonic functions exist, sliding window fails because contracting `left` might unpredictably increase the sum; in such cases, prefix sums combined with hash maps (e.g., Subarray Sum Equals K) or 2D quad-trees must be used instead.

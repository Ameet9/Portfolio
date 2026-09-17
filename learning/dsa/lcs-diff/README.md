# LCS-based Diff Tool

## Overview
This project implements a simplified file difference (diff) tool similar to `git diff`, utilizing the **Longest Common Subsequence (LCS)** dynamic programming algorithm. The LCS allows us to identify the lines that have not changed between two files, enabling us to pinpoint additions and deletions.

## Architecture & Key Concepts
1. **Dynamic Programming**: We use a 2D table where `dp[i][j]` represents the length of the LCS of the first `i` elements of sequence A and the first `j` elements of sequence B.
2. **Recurrence Relation**:
   - If `A[i-1] == B[j-1]`, then `dp[i][j] = dp[i-1][j-1] + 1`
   - If `A[i-1] != B[j-1]`, then `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
3. **Backtracking**: To generate the diff operations, we backtrack from `dp[m][n]` to `dp[0][0]`. 
   - Moving diagonally means the element was *unchanged*.
   - Moving left means an element was *added* (present in B but not in A).
   - Moving up means an element was *removed* (present in A but not in B).

## Complexity
- **Time Complexity**: `O(m * n)` where `m` and `n` are the number of lines in the two files. The table takes `m * n` steps to build, and backtracking takes `O(m + n)` steps.
- **Space Complexity**: `O(m * n)` to store the DP table. (Can be optimized to `O(min(m,n))` if we only need the length, but we need the full table for backtracking the exact path).

## How to Run
```powershell
python cli.py sample_a.txt sample_b.txt
```
To run tests:
```powershell
pytest test_diff.py
```

## Interview Q&A
**Q1: How does LCS apply to file diffing?**
A: Finding the LCS between two files (where each line is an element) gives us the parts of the files that are identical and in the same order. Everything else is either an addition or a deletion.

**Q2: What is the time complexity of the standard DP approach for LCS?**
A: O(m * n) where m and n are the lengths of the two sequences. This can be slow for large files.

**Q3: How do modern version control systems like Git handle diffs efficiently?**
A: They don't use standard O(m*n) DP. Git typically uses Myers' diff algorithm, which is an O(ND) algorithm where N is the total length of the files and D is the number of differences. This is much faster when files are highly similar.

**Q4: How do you trace back the DP table to get the diff?**
A: Start at the bottom-right of the table. If the lines match, it's a "keep/unchanged" (move diagonally). If they don't match, move in the direction of the larger adjacent cell in the table. Moving up corresponds to a deletion, moving left corresponds to an addition.

**Q5: Can the space complexity be optimized if we just need the length of the LCS?**
A: Yes, since the recurrence only looks at the current row and the previous row, space can be reduced to O(min(m, n)) by keeping only two rows in memory at any time. However, to reconstruct the diff, we need the full table.

def compute_lcs_table(list_a, list_b):
    """
    Computes the Longest Common Subsequence (LCS) table for two lists.
    Time Complexity: O(M * N)
    Space Complexity: O(M * N)
    """
    m, n = len(list_a), len(list_b)
    # table[i][j] stores the length of LCS of list_a[:i] and list_b[:j]
    table = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if list_a[i - 1] == list_b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
                
    return table

def backtrack_lcs(table, list_a, list_b):
    """
    Reconstructs the LCS from the DP table.
    """
    lcs = []
    i, j = len(list_a), len(list_b)
    
    while i > 0 and j > 0:
        if list_a[i - 1] == list_b[j - 1]:
            lcs.append(list_a[i - 1])
            i -= 1
            j -= 1
        elif table[i - 1][j] >= table[i][j - 1]:
            i -= 1
        else:
            j -= 1
            
    return lcs[::-1]

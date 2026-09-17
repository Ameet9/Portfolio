from lcs import compute_lcs_table

def generate_diff(list_a, list_b):
    """
    Generates diff operations between list_a and list_b based on LCS.
    Yields tuples of (operation, line).
    Operations: 'unchanged', 'added', 'removed'
    """
    table = compute_lcs_table(list_a, list_b)
    
    i, j = len(list_a), len(list_b)
    ops = []
    
    # Backtrack from bottom-right to top-left
    while i > 0 or j > 0:
        if i > 0 and j > 0 and list_a[i - 1] == list_b[j - 1]:
            ops.append(('unchanged', list_a[i - 1]))
            i -= 1
            j -= 1
        elif j > 0 and (i == 0 or table[i][j - 1] >= table[i - 1][j]):
            ops.append(('added', list_b[j - 1]))
            j -= 1
        elif i > 0 and (j == 0 or table[i][j - 1] < table[i - 1][j]):
            ops.append(('removed', list_a[i - 1]))
            i -= 1

    return reversed(ops)

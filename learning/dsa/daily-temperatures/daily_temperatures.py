def brute_force(temps):
    n = len(temps)
    res = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if temps[j] > temps[i]:
                res[i] = j - i
                break
    return res

def daily_temperatures_fast(temps):
    n = len(temps)
    res = [0] * n
    stack = [] # stores indices
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            prev_idx = stack.pop()
            res[prev_idx] = i - prev_idx
        stack.append(i)
    return res

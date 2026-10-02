import random
from daily_temperatures import brute_force, daily_temperatures_fast

def run_tests():
    test_cases = [
        ([], []),
        ([30], [0]),
        ([30, 40, 50, 60], [1, 1, 1, 0]), # strictly increasing
        ([60, 50, 40, 30], [0, 0, 0, 0]), # strictly decreasing
        ([30, 30, 30, 30], [0, 0, 0, 0]), # identical
        ([73, 74, 75, 71, 69, 72, 76, 73], [1, 1, 4, 2, 1, 1, 0, 0]) # classic example
    ]
    
    print("Running basic edge cases...")
    for temps, expected in test_cases:
        res = daily_temperatures_fast(temps)
        assert res == expected, f"Failed on {temps}. Expected {expected}, got {res}"
        print(f"Passed: {temps} -> {res}")
        
    print("\nRunning random array verification against brute force...")
    for _ in range(10):
        length = random.randint(10, 50)
        temps = [random.randint(30, 100) for _ in range(length)]
        expected = brute_force(temps)
        actual = daily_temperatures_fast(temps)
        assert expected == actual, f"Failed random test!\nTemps: {temps}\nExpected: {expected}\nActual: {actual}"
    print("Passed all random tests!")
    
if __name__ == '__main__':
    run_tests()

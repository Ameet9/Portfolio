import time
import random
from brute_force import trap_brute_force
from two_pointer import trap_two_pointer

def run_benchmark():
    """
    Compare the execution time of brute force and two-pointer solutions.
    """
    # Generate a large array
    random.seed(42)
    n = 5000
    test_data = [random.randint(0, 100) for _ in range(n)]
    
    print(f"Benchmarking Trapping Rain Water with array size: {n}\n")
    
    # Benchmark Brute Force
    start_time = time.time()
    res1 = trap_brute_force(test_data)
    time_brute = time.time() - start_time
    print(f"Brute Force:")
    print(f"  Result: {res1}")
    print(f"  Time:   {time_brute:.4f} seconds\n")
    
    # Benchmark Two Pointer
    start_time = time.time()
    res2 = trap_two_pointer(test_data)
    time_two_ptr = time.time() - start_time
    print(f"Two Pointer:")
    print(f"  Result: {res2}")
    print(f"  Time:   {time_two_ptr:.4f} seconds\n")
    
    speedup = time_brute / time_two_ptr if time_two_ptr > 0 else float('inf')
    print(f"The Two Pointer approach was {speedup:.2f}x faster!")

if __name__ == "__main__":
    run_benchmark()

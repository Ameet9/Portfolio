import time
import os
from generate_data import generate_logs
from merge_heap import merge_logs_heap
from merge_naive import merge_logs_naive

def run_benchmark():
    num_files = 5
    lines_per_file = 20000
    
    print(f"Generating {num_files} log files with {lines_per_file} lines each...")
    generate_logs(num_files, lines_per_file)
    print("Data generation complete.\n")
    
    inputs = [f"log_{i}.txt" for i in range(num_files)]
    
    # Benchmark Heap Merge
    print("Running Heap Merge (O(N log k))...")
    start_time = time.time()
    merge_logs_heap(inputs, "merged_heap.txt")
    heap_duration = time.time() - start_time
    print(f"Heap Merge took: {heap_duration:.4f} seconds\n")
    
    # Benchmark Naive Merge
    print("Running Naive Merge (O(N log N))...")
    start_time = time.time()
    merge_logs_naive(inputs, "merged_naive.txt")
    naive_duration = time.time() - start_time
    print(f"Naive Merge took: {naive_duration:.4f} seconds\n")
    
    print(f"Speedup: {naive_duration / heap_duration:.2f}x (Naive Time / Heap Time)")
    
    # Cleanup (Optional)
    # for f in inputs + ["merged_heap.txt", "merged_naive.txt"]:
    #     if os.path.exists(f):
    #         os.remove(f)

if __name__ == "__main__":
    run_benchmark()

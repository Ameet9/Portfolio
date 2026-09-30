# Merge K Sorted Logs

## Overview
This project implements and benchmarks the "Merge K Sorted Lists" pattern, specifically applied to merging large, time-stamped log files from distributed services. 

## Architecture
- `generate_data.py`: Creates mock sorted log files simulating multiple service logs.
- `merge_heap.py`: Uses a min-heap (priority queue) to efficiently merge files line-by-line without loading them entirely into memory.
- `merge_naive.py`: Reads all files into memory, concatenates them, and sorts.
- `benchmark.py`: Compares the execution time of both methods.

## How to Run
1. Ensure you have Python 3 installed.
2. Run the benchmark script:
   ```powershell
   python benchmark.py
   ```
3. Observe the output logs (`merged_heap.txt` and `merged_naive.txt`) and execution times.

## Key Concepts
### K-Way Merge Pattern
When you have `K` lists (or files) that are already sorted, you can merge them into a single sorted list efficiently by using a min-heap of size `K`.
- Insert the first element of each list into the heap.
- Pop the smallest element from the heap and append it to the output.
- Insert the next element from the list that originated the popped element.
- Repeat until all lists are exhausted.

### External Merge Sort
This technique is fundamental to External Merge Sort, used when data is too large to fit in RAM. Data is split into chunks that fit in RAM, sorted individually, written to disk, and then merged using a K-way merge.

### Time Complexity
- **N**: Total number of log entries across all files.
- **K**: Number of log files.
- **Heap Merge**: `O(N log K)` time complexity. Memory is `O(K)` since we only store one line per file at any time.
- **Naive Merge**: `O(N log N)` time complexity. Memory is `O(N)` since everything is loaded into memory.

## Interview Q&A
**Q: How would you handle lines that have the exact same timestamp?**
A: We store elements in the heap as a tuple `(timestamp, file_index, line_text)`. Python's `heapq` compares tuples element by element. If the `timestamp` is identical, it falls back to comparing `file_index`. Since `file_index` is unique for each file, this breaks ties consistently and prevents exceptions that might occur if it tried to compare the raw text or objects that don't support comparison.

**Q: What if the files are too large and there are too many files (e.g., K = 100,000) such that even opening all files exhausts the file descriptor limit?**
A: We would perform the merge in passes (a tree-like hierarchical merge). For example, merge files in batches of 1,000 to create intermediate merged files, and then merge those intermediate files until a single file remains.

**Q: Is `merged_naive.py` really that bad in Python?**
A: Python's `list.sort()` uses Timsort, which is highly optimized and very fast for partially sorted data. In many practical scenarios with enough RAM, naive sort is actually extremely fast. However, for genuinely large files (e.g., terabytes of logs), the naive approach will simply crash due to OOM (Out Of Memory) errors, making the heap approach mandatory.

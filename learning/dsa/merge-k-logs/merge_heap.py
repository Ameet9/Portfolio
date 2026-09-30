import heapq

def merge_logs_heap(input_files, output_file):
    """
    Merges multiple sorted log files using a min-heap.
    This streams the files line-by-line, keeping memory usage bounded by O(K),
    where K is the number of input files.
    """
    heap = []
    file_handles = []
    
    try:
        # Open all files and read the first line from each
        for i, filename in enumerate(input_files):
            f = open(filename, 'r')
            file_handles.append(f)
            line = f.readline()
            if line:
                # The first token is the timestamp
                timestamp = line.split(' ')[0]
                # Tuple structure: (timestamp, file_index, line_text)
                heapq.heappush(heap, (timestamp, i, line))
                
        with open(output_file, 'w') as out_f:
            while heap:
                # Get the earliest log entry
                timestamp, file_index, line = heapq.heappop(heap)
                out_f.write(line)
                
                # Read the next line from the file that just yielded the earliest entry
                f = file_handles[file_index]
                next_line = f.readline()
                if next_line:
                    next_timestamp = next_line.split(' ')[0]
                    heapq.heappush(heap, (next_timestamp, file_index, next_line))
                    
    finally:
        # Ensure all files are closed
        for f in file_handles:
            f.close()

if __name__ == "__main__":
    inputs = [f"log_{i}.txt" for i in range(5)]
    merge_logs_heap(inputs, "merged_heap.txt")

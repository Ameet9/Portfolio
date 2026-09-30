def merge_logs_naive(input_files, output_file):
    """
    Naive approach: read all lines into memory, sort them, and write out.
    Memory usage is O(N), where N is the total number of lines across all files.
    """
    all_lines = []
    
    # Read all lines into memory
    for filename in input_files:
        with open(filename, 'r') as f:
            all_lines.extend(f.readlines())
            
    # Sort lines based on the timestamp (first token)
    all_lines.sort(key=lambda x: x.split(' ')[0])
    
    # Write the sorted lines to the output file
    with open(output_file, 'w') as f:
        f.writelines(all_lines)

if __name__ == "__main__":
    inputs = [f"log_{i}.txt" for i in range(5)]
    merge_logs_naive(inputs, "merged_naive.txt")

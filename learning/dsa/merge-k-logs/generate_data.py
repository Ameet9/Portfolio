import os
import random
from datetime import datetime, timedelta

def generate_logs(num_files=5, lines_per_file=20000):
    start_time = datetime(2025, 1, 1)
    
    for i in range(num_files):
        filename = f"log_{i}.txt"
        current_time = start_time + timedelta(seconds=random.randint(0, 3600))
        
        with open(filename, 'w') as f:
            for j in range(lines_per_file):
                # Increment time by random milliseconds or seconds to ensure it is sorted
                current_time += timedelta(milliseconds=random.randint(10, 1000))
                timestamp = current_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
                service = f"service-{random.choice(['A', 'B', 'C', 'D'])}"
                message = f"Log message {j} from file {i}"
                f.write(f"{timestamp} {service} {message}\n")
                
if __name__ == "__main__":
    generate_logs()

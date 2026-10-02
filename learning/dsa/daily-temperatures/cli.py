import sys
from daily_temperatures import daily_temperatures_fast

def main():
    if len(sys.argv) > 1:
        # Parse from arguments
        try:
            temps = [int(x) for x in sys.argv[1:]]
        except ValueError:
            print("Please provide a list of integers.")
            sys.exit(1)
    else:
        # Prompt from input
        try:
            raw_input = input("Enter temperatures separated by spaces: ")
            temps = [int(x) for x in raw_input.strip().split()]
        except ValueError:
            print("Please provide a list of integers.")
            sys.exit(1)
            
    if not temps:
        print("No temperatures provided.")
        return
        
    res = daily_temperatures_fast(temps)
    print(f"Input temperatures: {temps}")
    print(f"Days to wait for a warmer temperature: {res}")

if __name__ == '__main__':
    main()

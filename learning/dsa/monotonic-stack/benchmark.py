import random
from stock_spanner import StockSpannerNaive, StockSpannerFast

def print_ascii_chart(prices, spans):
    print("\n--- Stock Span ASCII Bar Chart ---")
    max_price = max(prices) if prices else 0
    
    # Scale down if max_price is too large to fit in terminal
    scale = 1
    if max_price > 40:
        scale = max_price / 40.0
        
    for price, span in zip(prices, spans):
        bar_len = int(price / scale)
        bar = "#" * bar_len
        print(f"P: {price:4d} | Span: {span:3d} | {bar}")

def run_benchmark():
    print("Generating random sequence of prices...")
    random.seed(42)
    num_days = 20
    prices = [random.randint(10, 100) for _ in range(num_days)]
    
    naive = StockSpannerNaive()
    fast = StockSpannerFast()
    
    naive_spans = []
    fast_spans = []
    
    print("Running spans and asserting match...")
    for price in prices:
        n_span = naive.next(price)
        f_span = fast.next(price)
        assert n_span == f_span, f"Mismatch at price {price}: Naive={n_span}, Fast={f_span}"
        naive_spans.append(n_span)
        fast_spans.append(f_span)
        
    print("Success! Fast spanner matches naive oracle.")
    
    print_ascii_chart(prices, fast_spans)

if __name__ == "__main__":
    run_benchmark()

"""
Online Stock Span (Monotonic Stack)
------------------------------------
Calculates the span of a stock's price for the current day:
the maximum number of consecutive days (starting today and going backward)
where the stock price was less than or equal to today's price.
"""

class StockSpannerNaive:
    """O(n^2) brute-force baseline used as an oracle for differential testing."""
    def __init__(self):
        self.prices = []

    def next(self, price: int) -> int:
        self.prices.append(price)
        span = 0
        for i in range(len(self.prices) - 1, -1, -1):
            if self.prices[i] <= price:
                span += 1
            else:
                break
        return span


class StockSpannerFast:
    """
    Optimal O(n) amortized solution using a strictly decreasing monotonic stack.
    Each incoming price pops all smaller/equal previous prices, accumulating their spans.
    """
    def __init__(self):
        # Monotonic stack of tuples: (price, span)
        self.stack = []
        self.max_span = 0
        self.max_rally_price = 0
        self.day_count = 0

    def next(self, price: int) -> int:
        self.day_count += 1
        span = 1
        # Pop elements from stack while top price <= current price.
        # Elements popped can never be a future barrier because today's price is >= and more recent.
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        
        self.stack.append((price, span))

        # Track the most significant rally seen so far
        if span > self.max_span:
            self.max_span = span
            self.max_rally_price = price

        return span

    def get_max_rally(self) -> dict:
        """Returns the largest consecutive price rally recorded so far."""
        return {
            "max_span_days": self.max_span,
            "peak_price": self.max_rally_price,
            "total_days_processed": self.day_count
        }

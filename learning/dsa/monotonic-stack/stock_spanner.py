class StockSpannerNaive:
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
    def __init__(self):
        # Monotonic stack of tuples: (price, span)
        self.stack = []

    def next(self, price: int) -> int:
        span = 1
        # Pop elements from stack while the stack's top price is less than or equal to current price.
        # This maintains a strictly decreasing monotonic stack.
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        
        self.stack.append((price, span))
        return span

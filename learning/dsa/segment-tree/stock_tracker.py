"""
StockPriceTracker uses a SegmentTree to efficiently track and query
the maximum price of a stock over different periods (ranges of days).
"""
from segment_tree import SegmentTree
from typing import List

class StockPriceTracker:
    def __init__(self, daily_prices: List[int]):
        """
        Initialize the tracker with initial daily prices.
        We use a segment tree that merges nodes by taking the maximum.
        """
        self.prices = list(daily_prices)
        
        # Merge function is max, default value is negative infinity
        # Using a very small number as default for max queries
        self.tree = SegmentTree(
            data=self.prices,
            merge_func=max,
            default_val=float('-inf')
        )

    def update_price(self, day: int, new_price: int):
        """
        Update the stock price for a specific day.
        Day is 0-indexed.
        """
        if 0 <= day < len(self.prices):
            self.prices[day] = new_price
            self.tree.update(day, new_price)
        else:
            raise ValueError(f"Day {day} is out of range.")

    def get_max_price(self, start_day: int, end_day: int) -> int:
        """
        Get the maximum price between start_day and end_day (inclusive).
        """
        if start_day > end_day:
            return float('-inf')
        return self.tree.query(start_day, end_day)

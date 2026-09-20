from fenwick_tree import FenwickTree

class PageViewCounter:
    """
    A wrapper around FenwickTree to track and query page views 
    binned by minutes of the day (e.g., 1 to 1440 for a 24-hour period).
    """
    def __init__(self, max_minutes: int = 1440):
        self.max_minutes = max_minutes
        self.ft = FenwickTree(max_minutes)

    def record_views(self, minute: int, count: int = 1) -> None:
        """
        Record `count` views at the specified `minute`.
        """
        if 1 <= minute <= self.max_minutes:
            self.ft.update(minute, count)
        else:
            raise ValueError(f"Minute must be between 1 and {self.max_minutes}")

    def get_views_in_range(self, start_minute: int, end_minute: int) -> int:
        """
        Get the total number of page views between start_minute and end_minute inclusive.
        """
        start_minute = max(1, start_minute)
        end_minute = min(self.max_minutes, end_minute)
        
        if start_minute > end_minute:
            return 0
            
        return self.ft.range_query(start_minute, end_minute)

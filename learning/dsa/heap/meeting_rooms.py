"""
Solution for the Meeting Rooms II problem using a Min-Heap.
"""
from min_heap import MinHeap

def min_meeting_rooms(intervals: list[list[int]]) -> int:
    """
    Find the minimum number of conference rooms required for a given set of meeting time intervals.
    
    Each interval is represented as a list of [start, end].
    
    Args:
        intervals: A list of intervals, where each interval is [start_time, end_time].
        
    Returns:
        The minimum number of rooms required.
    """
    if not intervals:
        return 0
        
    # Sort the intervals by start time
    intervals.sort(key=lambda x: x[0])
    
    # Initialize a new min-heap to track the end times of meetings
    # The heap will store the end times of currently active meetings
    room_allocations = MinHeap()
    
    # Add the first meeting's end time to the heap
    room_allocations.insert(intervals[0][1])
    
    # Iterate over the remaining intervals
    for i in range(1, len(intervals)):
        # If the room that frees up the earliest is free before this meeting starts,
        # we can reuse that room. We extract that end time and add the new end time.
        if intervals[i][0] >= room_allocations.peek():
            room_allocations.extract_min()
            
        # Add the current meeting's end time to the heap
        room_allocations.insert(intervals[i][1])
        
    # The size of the heap tells us the minimum rooms required for all the meetings.
    return len(room_allocations)

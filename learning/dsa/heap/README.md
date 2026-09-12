# Min-Heap and Meeting Rooms II

This project demonstrates the implementation of a Min-Heap data structure from scratch and uses it to efficiently solve the "Meeting Rooms II" algorithmic problem.

## Min-Heap Internals

A Min-Heap is a complete binary tree where the value of each node is less than or equal to the values of its children. This property ensures that the minimum element is always at the root of the tree.

### Array Representation

Instead of using node objects with pointers, a complete binary tree can be efficiently represented using an array (or list in Python). For any element at index `i`:

*   **Left Child Index:** `2 * i + 1`
*   **Right Child Index:** `2 * i + 2`
*   **Parent Index:** `(i - 1) // 2`

### Bubble Up

When a new element is inserted, it is placed at the end of the array. To maintain the heap property, the element is "bubbled up" by comparing it with its parent and swapping them if the new element is smaller. This process continues until the element reaches a valid position or the root.

### Bubble Down

When the minimum element (the root) is extracted, the last element in the array is moved to the root position. To restore the heap property, this element is "bubbled down" by comparing it with its children and swapping it with the smaller child if necessary. This process continues until the element is smaller than both its children or it becomes a leaf node.

## Meeting Rooms II

**Problem:** Given an array of meeting time intervals consisting of start and end times `[[s1,e1],[s2,e2],...]`, find the minimum number of conference rooms required.

**Example:** `[[0, 30], [5, 10], [15, 20]]` requires 2 rooms.

### Why a Heap?

1.  **Sort by Start Time:** We first sort the meetings by their start time. This allows us to process the meetings in chronological order.
2.  **Track End Times:** We use a Min-Heap to keep track of the *end times* of currently occupied rooms.
3.  **Efficient Room Reuse:** For each new meeting, we check the earliest ending meeting (which is always at the root of our Min-Heap).
    *   If the room frees up before the new meeting starts (`new_start >= earliest_end`), we can reuse that room. We extract the earliest end time and insert the new meeting's end time.
    *   If the room does not free up in time, we must allocate a new room, so we simply insert the new meeting's end time into the heap.
4.  **Result:** The size of the heap at the end represents the maximum number of concurrently occupied rooms, which is the minimum number of rooms required.

## Testing

Tests are written using `pytest`. Run them with:

```bash
pytest tests/test_heap.py
```

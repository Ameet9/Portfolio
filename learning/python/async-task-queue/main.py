import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
from models import Task
from worker import worker, task_queue, task_store

# Background tasks reference to prevent garbage collection and allow cancellation
workers: List[asyncio.Task] = []
NUM_WORKERS = 5

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan context manager.
    Handles startup (spawning workers) and shutdown (cancelling workers).
    """
    print("Starting background workers...")
    for i in range(NUM_WORKERS):
        task = asyncio.create_task(worker(i))
        workers.append(task)
    
    yield # App is running
    
    print("Shutting down background workers...")
    # Cancel all running worker tasks
    for task in workers:
        task.cancel()
    
    # Wait for workers to finish cancellation process
    await asyncio.gather(*workers, return_exceptions=True)
    print("All workers shut down gracefully.")

app = FastAPI(lifespan=lifespan, title="Async Task Queue")

@app.post("/tasks", response_model=Task)
async def create_task(payload: Dict[str, Any]):
    """
    Enqueues a new task into the task queue.
    Returns the task object including the generated ID.
    """
    task = Task(payload=payload)
    
    # Store task metadata
    task_store[task.id] = task
    
    # Put task ID in the queue
    await task_queue.put(task.id)
    
    return task

@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """
    Retrieves the current status and result/error of a specific task.
    """
    task = task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

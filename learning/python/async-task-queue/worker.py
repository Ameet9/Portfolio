import asyncio
import random
from typing import Dict
from models import Task, TaskStatus

# In-memory store for tasks (in production, use Redis or a database)
task_store: Dict[str, Task] = {}

# The global asyncio queue acting as our task broker
task_queue: asyncio.Queue = asyncio.Queue()

async def process_task(task: Task) -> Dict:
    """
    Simulates a unit of work that might fail.
    Succeeds randomly to demonstrate exponential backoff.
    """
    # Simulate IO-bound work
    await asyncio.sleep(0.5) 
    
    # 30% chance to fail to demonstrate retries
    if random.random() < 0.3:
        raise ValueError("Random processing error occurred (simulated)")
    
    # Return processed payload as result
    return {"processed": True, "original_payload": task.payload}

async def worker(worker_id: int):
    """
    Worker coroutine that pulls tasks from the queue and processes them.
    Implements exponential backoff for retries.
    """
    print(f"Worker {worker_id} started")
    while True:
        try:
            # Block until a task is available
            task_id = await task_queue.get()
            task = task_store.get(task_id)
            
            if not task:
                # Edge case: Task ID in queue but not in store
                task_queue.task_done()
                continue
                
            task.status = TaskStatus.PROCESSING
            print(f"Worker {worker_id} processing task {task_id} (Attempt {task.attempts + 1})")
            
            try:
                task.attempts += 1
                result = await process_task(task)
                
                # Success
                task.status = TaskStatus.COMPLETED
                task.result = result
                print(f"Worker {worker_id} completed task {task_id}")
                
            except Exception as e:
                # Failure and Retry Logic
                if task.attempts < 3: # Max 3 attempts
                    print(f"Worker {worker_id} failed task {task_id} (Attempt {task.attempts}): {e}. Retrying...")
                    
                    # Exponential backoff: 2^1, 2^2, 2^3 seconds
                    backoff = 2 ** task.attempts
                    await asyncio.sleep(backoff)
                    
                    # Re-queue for another attempt
                    task.status = TaskStatus.PENDING
                    await task_queue.put(task_id)
                else:
                    # Permanent failure after max attempts
                    print(f"Worker {worker_id} permanently failed task {task_id} after {task.attempts} attempts.")
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
            finally:
                # Always mark the queue item as done
                task_queue.task_done()
                
        except asyncio.CancelledError:
            # Handle graceful shutdown
            print(f"Worker {worker_id} cancelled")
            break
        except Exception as e:
            print(f"Worker {worker_id} encountered an unexpected error: {e}")

import asyncio
import httpx
import time

API_URL = "http://127.0.0.1:8000/tasks"
NUM_TASKS = 25

async def submit_task(client: httpx.AsyncClient, i: int) -> str:
    """Submit a single task and return its ID."""
    payload = {"task_index": i, "data": f"Payload data {i}"}
    response = await client.post(API_URL, json=payload)
    response.raise_for_status()
    return response.json()["id"]

async def poll_task(client: httpx.AsyncClient, task_id: str) -> dict:
    """Poll a task until it reaches a terminal state (COMPLETED or FAILED)."""
    while True:
        response = await client.get(f"{API_URL}/{task_id}")
        response.raise_for_status()
        task = response.json()
        
        status = task["status"]
        if status in ["COMPLETED", "FAILED"]:
            return task
        
        # Wait before polling again to avoid spamming the server
        await asyncio.sleep(0.5)

async def main():
    start_time = time.time()
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        print(f"Submitting {NUM_TASKS} tasks concurrently...")
        
        # 1. Submit tasks concurrently
        submit_coroutines = [submit_task(client, i) for i in range(NUM_TASKS)]
        task_ids = await asyncio.gather(*submit_coroutines)
        
        print(f"Submitted {len(task_ids)} tasks. Polling for completion...")
        
        # 2. Poll all tasks concurrently
        poll_coroutines = [poll_task(client, tid) for tid in task_ids]
        results = await asyncio.gather(*poll_coroutines)
        
    end_time = time.time()
    
    # Calculate statistics
    completed = sum(1 for r in results if r["status"] == "COMPLETED")
    failed = sum(1 for r in results if r["status"] == "FAILED")
    retries = sum(r["attempts"] - 1 for r in results if r["attempts"] > 1)
    
    print("\n--- Load Test Results ---")
    print(f"Total time: {end_time - start_time:.2f} seconds")
    print(f"Total tasks: {NUM_TASKS}")
    print(f"Completed: {completed}")
    print(f"Failed: {failed}")
    print(f"Total Retries Executed: {retries}")

if __name__ == "__main__":
    asyncio.run(main())

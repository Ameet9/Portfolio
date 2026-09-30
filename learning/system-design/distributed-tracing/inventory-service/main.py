from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.get("/stock/{item}")
async def get_stock(item: str):
    """
    Get stock for an item. Simulates a slow database query.
    """
    # Simulate DB lookup latency
    await asyncio.sleep(0.3)
    return {"item": item, "stock": 42}

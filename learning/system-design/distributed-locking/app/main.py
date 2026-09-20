import os
import time
import uuid
from fastapi import FastAPI, HTTPException
import redis

app = FastAPI()

redis_host = os.getenv("REDIS_HOST", "localhost")
r = redis.Redis(host=redis_host, port=6379, decode_responses=True)

# Global dict representing our DB
seats = {
    "seat_1": "available",
    "seat_2": "available"
}

@app.post("/book/naive/{seat_id}")
def book_naive(seat_id: str):
    if seat_id not in seats:
        raise HTTPException(status_code=404, detail="Seat not found")
        
    # Check-then-act race condition
    if seats[seat_id] == 'available':
        time.sleep(0.1)  # Simulate DB latency to exacerbate race condition
        seats[seat_id] = 'booked'
        return {"status": "success", "message": f"{seat_id} booked naively!"}
    
    return {"status": "failed", "message": f"{seat_id} is already booked"}

@app.post("/book/safe/{seat_id}")
def book_safe(seat_id: str):
    if seat_id not in seats:
        raise HTTPException(status_code=404, detail="Seat not found")

    lock_key = f"lock:{seat_id}"
    token = str(uuid.uuid4())
    
    # Acquire lock: SET key value NX PX 5000
    acquired = r.set(lock_key, token, nx=True, px=5000)
    
    if not acquired:
        return {"status": "failed", "message": "Could not acquire lock, please try again"}
        
    try:
        # Check and act inside the lock
        if seats[seat_id] == 'available':
            time.sleep(0.1) # Simulate DB latency
            seats[seat_id] = 'booked'
            return {"status": "success", "message": f"{seat_id} booked safely!"}
        else:
            return {"status": "failed", "message": f"{seat_id} is already booked"}
    finally:
        # Release lock safely using Lua script
        lua_script = """
        if redis.call("get",KEYS[1]) == ARGV[1] then
            return redis.call("del",KEYS[1])
        else
            return 0
        end
        """
        r.eval(lua_script, 1, lock_key, token)

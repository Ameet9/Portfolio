import asyncio
import aiohttp
import time

URL_NAIVE = "http://localhost:8000/book/naive/seat_1"
URL_SAFE = "http://localhost:8000/book/safe/seat_2"
CONCURRENCY = 20

async def make_request(session, url):
    try:
        async with session.post(url) as response:
            return await response.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def run_test(url, name):
    print(f"\n--- Testing {name} endpoint ---")
    async with aiohttp.ClientSession() as session:
        tasks = [make_request(session, url) for _ in range(CONCURRENCY)]
        results = await asyncio.gather(*tasks)
        
        successes = [r for r in results if r.get('status') == 'success']
        print(f"Total requests: {CONCURRENCY}")
        print(f"Successful bookings: {len(successes)} (Expected: 1 for safe, >1 for naive if race happens)")
        if len(successes) > 1:
            print("❌ RACE CONDITION DETECTED!")
        elif len(successes) == 1:
            print("✅ ONLY ONE SUCCESS - NO RACE CONDITION")
        else:
            print("⚠️ No successes, something might be broken or seat already booked.")

if __name__ == "__main__":
    # Give the server a moment to start if run right after docker-compose up
    time.sleep(1)
    asyncio.run(run_test(URL_NAIVE, "Naive (seat_1)"))
    asyncio.run(run_test(URL_SAFE, "Safe (seat_2)"))

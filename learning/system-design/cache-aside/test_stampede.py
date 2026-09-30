import asyncio
import httpx
import time

async def fetch(client, product_id):
    start = time.time()
    try:
        response = await client.get(f"http://localhost:8000/product/{product_id}")
        data = response.json()
        return f"Status: {response.status_code}, Source: {data.get('source')}, Latency: {data.get('latency_s'):.4f}s"
    except Exception as e:
        return f"Error: {e}"

async def main():
    product_id = 42
    num_requests = 20
    
    print(f"Sending {num_requests} concurrent requests for product {product_id}...")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = [fetch(client, product_id) for _ in range(num_requests)]
        results = await asyncio.gather(*tasks)
        
        for i, res in enumerate(results):
            print(f"Request {i+1}: {res}")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import json
import random
import websockets

TICKERS = ["AAPL", "GOOG", "TSLA", "MSFT", "AMZN"]
prices = {ticker: random.uniform(100, 500) for ticker in TICKERS}

async def ticker_handler(websocket):
    print("Client connected")
    try:
        while True:
            # Update prices randomly
            for ticker in TICKERS:
                change = random.uniform(-2, 2)
                prices[ticker] = max(1.0, prices[ticker] + change)
            
            # Broadcast updates
            await websocket.send(json.dumps(prices))
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")

async def main():
    async with websockets.serve(ticker_handler, "localhost", 8080):
        print("WebSocket Server running on ws://localhost:8080")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())

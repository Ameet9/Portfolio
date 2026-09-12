"""
Real-Time Chat Room using FastAPI and WebSockets.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import os

app = FastAPI(title="WebSocket Chat")

# Determine static directory path
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

class ConnectionManager:
    """
    Manages active WebSocket connections.
    This acts as our central hub for keeping track of connected clients
    and broadcasting messages to all of them.
    """
    def __init__(self):
        # We store active connections in a list in memory.
        # Note: In a multi-worker production environment, this list would not be shared.
        # You'd need an external pub/sub system like Redis.
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accepts the WebSocket connection and adds it to the active list.
        """
        # We must explicitly accept the connection.
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """
        Removes the WebSocket from the active list when a client disconnects.
        """
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        """
        Sends a message to all connected clients.
        
        WHY THIS WORKS: Because we accepted the connections and kept references 
        to the WebSocket objects in `self.active_connections`, the connections 
        are held open. We can iterate through them and push data at any time.
        """
        for connection in self.active_connections:
            await connection.send_text(message)

# Instantiate the manager singleton
manager = ConnectionManager()

@app.get("/")
async def get():
    """
    Serves the main chat HTML page.
    """
    # Create static directory if it doesn't exist to prevent crash on first run if not created
    if not os.path.exists(STATIC_DIR):
        os.makedirs(STATIC_DIR)
        
    index_path = os.path.join(STATIC_DIR, "index.html")
    if not os.path.exists(index_path):
        return HTMLResponse(content="<h1>Chat app starting up...</h1><p>index.html not found yet.</p>")
        
    with open(index_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    The WebSocket endpoint. Clients connect here to join the chat.
    """
    await manager.connect(websocket)
    # Announce that a new user has joined
    await manager.broadcast(f"Client #{client_id} joined the chat")
    
    try:
        # The Accept/Loop Pattern:
        # After accepting the connection, we enter an infinite `while True` loop.
        # `await websocket.receive_text()` blocks and waits for a message from this specific client.
        # This blocking call is what keeps the connection open.
        # When a message arrives, we broadcast it to everyone, then loop back and wait again.
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client #{client_id}: {data}")
    except WebSocketDisconnect:
        # If the client disconnects (closes tab, network loss), an exception is raised.
        # We catch it, remove the client from our manager, and notify others.
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")

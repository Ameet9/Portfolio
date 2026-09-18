from fastapi import FastAPI, HTTPException
from consistent_hash import ConsistentHashRing

app = FastAPI(title="Consistent Hashing API")
ring = ConsistentHashRing()

@app.post("/servers/{name}")
def add_server(name: str):
    """
    Adds a server to the consistent hashing ring.
    """
    # Note: In a production scenario, you'd want to check if the server already exists
    # to avoid adding duplicate virtual nodes, but our implementation handles it idempotently
    # in terms of keys (though it might duplicate hashes if node logic changes).
    ring.add_node(name)
    return {"message": f"Server '{name}' added to the ring."}

@app.delete("/servers/{name}")
def remove_server(name: str):
    """
    Removes a server from the consistent hashing ring.
    """
    ring.remove_node(name)
    return {"message": f"Server '{name}' removed from the ring."}

@app.get("/keys/{key}")
def get_server(key: str):
    """
    Returns the server responsible for the given key.
    """
    server = ring.get_node(key)
    if not server:
        raise HTTPException(status_code=404, detail="No servers available in the ring.")
    return {"key": key, "server": server}

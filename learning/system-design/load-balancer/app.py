"""
A simple Flask application for demonstrating load balancing.
It relies on the SERVER_NAME environment variable to identify the instance.
"""
import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    """Returns a hello message and the server name."""
    server_name = os.environ.get("SERVER_NAME", "unknown")
    return jsonify({
        "server": server_name,
        "message": "hello"
    })

@app.route("/health")
def health():
    """Health check endpoint for the load balancer."""
    return "OK", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

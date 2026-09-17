import os
import socket
from flask import Flask, jsonify

app = Flask(__name__)

# Track health status for demonstration purposes (e.g., simulating failures)
is_healthy = True

@app.route('/')
def index():
    hostname = socket.gethostname()
    env = os.environ.get('APP_ENV', 'unknown')
    return jsonify({
        "message": "Hello from Kubernetes!",
        "hostname": hostname,
        "environment": env
    })

@app.route('/health')
def health():
    """
    Health check endpoint used by Kubernetes liveness and readiness probes.
    """
    if is_healthy:
        return jsonify({"status": "healthy"}), 200
    else:
        return jsonify({"status": "unhealthy"}), 500

@app.route('/break')
def break_app():
    """
    Endpoint to simulate an application failure.
    Calling this will cause the liveness probe to fail,
    demonstrating Kubernetes self-healing by restarting the pod.
    """
    global is_healthy
    is_healthy = False
    return jsonify({"message": "App is now broken. Liveness probe should fail shortly."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

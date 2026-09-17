import time
import random
from flask import Flask, jsonify, request

app = Flask(__name__)

# Global state to simulate failures
failure_mode = False

@app.route('/data', methods=['GET'])
def get_data():
    """
    Returns data normally.
    If failure_mode is on, randomly returns 500 or sleeps for 5 seconds to simulate a timeout.
    """
    if failure_mode:
        chance = random.random()
        if chance < 0.5:
            # Simulate slow response
            time.sleep(5)
            return jsonify({"error": "Service slow"}), 500
        else:
            # Simulate internal server error
            return jsonify({"error": "Internal Server Error"}), 500
            
    return jsonify({"data": "Here is your critical data", "status": "success"}), 200

@app.route('/toggle-failure', methods=['POST'])
def toggle_failure():
    """Toggles the failure mode on or off."""
    global failure_mode
    failure_mode = not failure_mode
    return jsonify({"failure_mode": failure_mode}), 200

@app.route('/health', methods=['GET'])
def health():
    """Returns the current state of the service."""
    return jsonify({"status": "up", "failure_mode": failure_mode}), 200

if __name__ == '__main__':
    # Run on port 5001
    app.run(port=5001, debug=True)

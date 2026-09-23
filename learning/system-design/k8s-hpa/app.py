import math
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/work')
def work():
    # Burn CPU by calculating primes
    n = 50000
    primes = []
    for num in range(2, n + 1):
        is_prime = True
        for i in range(2, int(math.isqrt(num)) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    
    return jsonify({"message": f"Calculated {len(primes)} primes."}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

import os
import redis
from flask import Flask, request, jsonify, make_response
from rate_limiter import TokenBucketLuaScript

app = Flask(__name__)

# Configuration
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
BUCKET_CAPACITY = int(os.environ.get('BUCKET_CAPACITY', 5))
REFILL_RATE = float(os.environ.get('REFILL_RATE', 1.0))

# Initialize Redis and Rate Limiter
# Using the Lua Script version for robust concurrent handling
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
limiter = TokenBucketLuaScript(redis_client, BUCKET_CAPACITY, REFILL_RATE)

def get_client_ip() -> str:
    """Extract client IP to use as the rate limiting identifier."""
    # In a real environment behind a load balancer, use X-Forwarded-For
    return request.headers.get('X-Forwarded-For', request.remote_addr)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint. Not rate limited."""
    return jsonify({"status": "healthy"}), 200

@app.route('/ping', methods=['GET'])
def ping():
    """
    Main endpoint demonstrating rate limiting.
    Returns 'pong' if allowed, 429 if rate limited.
    """
    client_id = get_client_ip()
    
    try:
        allowed, stats = limiter.allow_request(client_id)
        
        if not allowed:
            # Build 429 Too Many Requests response
            response = make_response(jsonify({
                "error": "Too Many Requests",
                "message": "Rate limit exceeded. Please try again later."
            }), 429)
            
            # Standard HTTP header for communicating backoff time
            response.headers['Retry-After'] = int(stats['retry_after'])
            response.headers['X-RateLimit-Remaining'] = stats['remaining']
            response.headers['X-RateLimit-Limit'] = BUCKET_CAPACITY
            return response
            
        # Allowed request
        response = make_response(jsonify({"message": "pong"}), 200)
        response.headers['X-RateLimit-Remaining'] = stats['remaining']
        response.headers['X-RateLimit-Limit'] = BUCKET_CAPACITY
        return response
        
    except redis.RedisError as e:
        # Fallback in case Redis goes down - typically we allow traffic (fail open)
        # or fail closed depending on business requirements. Here we fail open.
        app.logger.error(f"Redis error during rate limiting: {e}")
        return jsonify({"message": "pong", "warning": "rate limiter degraded"}), 200

if __name__ == '__main__':
    # Used only for local development
    app.run(host='0.0.0.0', port=5000, debug=True)

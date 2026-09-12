import os
import time
from functools import wraps
from flask import Flask, request, jsonify
import redis

app = Flask(__name__)

# Connect to Redis
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

# Rate limiter configuration
CAPACITY = 10        # Max tokens in the bucket
REFILL_RATE = 1.0    # Tokens added per second (1 token/sec = 60/min)

def rate_limit(key_prefix="ratelimit"):
    """
    Decorator to apply rate limiting using the Token Bucket algorithm backed by Redis.
    Uses a Lua script for atomic operations.
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Using client IP as the identifier. In production, use API keys or user IDs.
            identifier = request.remote_addr
            key = f"{key_prefix}:{identifier}"
            
            now = time.time()
            
            # Lua script to atomically:
            # 1. Get current tokens and last updated time.
            # 2. Calculate newly added tokens based on elapsed time.
            # 3. Cap at CAPACITY.
            # 4. If tokens >= 1, decrement and update last updated time.
            # 5. Return allowed (1/0) and remaining tokens.
            lua_script = """
            local key = KEYS[1]
            local capacity = tonumber(ARGV[1])
            local refill_rate = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            
            local bucket = redis.call('HMGET', key, 'tokens', 'last_updated')
            local tokens = tonumber(bucket[1])
            local last_updated = tonumber(bucket[2])
            
            if tokens == nil then
                tokens = capacity
                last_updated = now
            else
                local elapsed = now - last_updated
                local new_tokens = elapsed * refill_rate
                tokens = math.min(capacity, tokens + new_tokens)
            end
            
            if tokens >= 1 then
                tokens = tokens - 1
                redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
                -- Expire the key to avoid memory leak for inactive users
                redis.call('EXPIRE', key, math.ceil(capacity / refill_rate))
                return {1, tostring(tokens)}
            else
                return {0, tostring(tokens)}
            end
            """
            
            try:
                result = r.eval(lua_script, 1, key, CAPACITY, REFILL_RATE, now)
                allowed = result[0] == 1
                tokens_remaining = float(result[1])
                
                if not allowed:
                    return jsonify({"error": "Too Many Requests"}), 429
                    
            except redis.RedisError as e:
                # Fallback in case Redis is down - allow request or deny depending on policy
                print(f"Redis error: {e}")
                
            return f(*args, **kwargs)
        return wrapped
    return decorator

@app.route('/data', methods=['GET'])
@rate_limit()
def get_data():
    return jsonify({"message": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

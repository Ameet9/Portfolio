import time
import redis
from typing import Tuple, Dict

class TokenBucketRateLimiter:
    """
    A rate limiter implementing the Token Bucket algorithm using Redis.
    
    The Token Bucket algorithm works as follows:
    - A bucket has a maximum capacity of tokens.
    - Tokens are added to the bucket at a constant rate (refill rate).
    - Each request consumes one token.
    - If the bucket is empty, the request is rejected.
    
    This implementation stores the state in Redis using a Hash for each client:
    - 'tokens': Current number of tokens available.
    - 'last_refill': Timestamp of the last time tokens were calculated.
    
    NOTE: This implementation reads, calculates, and writes back to Redis. 
    In a highly concurrent environment, this could lead to race conditions.
    For a production-grade atomic implementation, use the TokenBucketLuaScript below.
    """
    def __init__(self, redis_client: redis.Redis, capacity: int, refill_rate: float):
        self.redis = redis_client
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second

    def allow_request(self, client_id: str) -> Tuple[bool, Dict[str, any]]:
        key = f"rate_limit:{client_id}"
        now = time.time()
        
        # Read current state
        state = self.redis.hgetall(key)
        
        if not state:
            # First time seeing this client, start with full capacity - 1
            tokens = self.capacity - 1
            self.redis.hset(key, mapping={'tokens': tokens, 'last_refill': now})
            # Set an expiry to prevent Redis from filling up with old clients
            self.redis.expire(key, int(self.capacity / self.refill_rate) * 2 + 60)
            return True, {
                'remaining': tokens,
                'retry_after': 0
            }
            
        # Parse state
        tokens = float(state.get(b'tokens', self.capacity))
        last_refill = float(state.get(b'last_refill', now))
        
        # Calculate tokens to add based on elapsed time
        elapsed = now - last_refill
        tokens_to_add = elapsed * self.refill_rate
        
        # New token count, capped at capacity
        tokens = min(self.capacity, tokens + tokens_to_add)
        
        if tokens >= 1:
            # We have enough tokens, consume one
            tokens -= 1
            self.redis.hset(key, mapping={'tokens': tokens, 'last_refill': now})
            allowed = True
            retry_after = 0
        else:
            # Not enough tokens, reject
            allowed = False
            # Calculate time needed to get 1 token
            retry_after = (1 - tokens) / self.refill_rate
            
        return allowed, {
            'remaining': int(tokens),
            'retry_after': retry_after
        }


class TokenBucketLuaScript:
    """
    Production-grade Token Bucket implementation using a Redis Lua script.
    
    This ensures that the read-calculate-write cycle is completely atomic,
    preventing race conditions when multiple requests hit the limiter simultaneously.
    """
    LUA_SCRIPT = """
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = 1

    local state = redis.call('HGETALL', key)
    local tokens = capacity
    local last_refill = now

    if #state > 0 then
        -- Redis HGETALL returns an array like {field1, value1, field2, value2}
        for i=1, #state, 2 do
            if state[i] == 'tokens' then
                tokens = tonumber(state[i+1])
            elseif state[i] == 'last_refill' then
                last_refill = tonumber(state[i+1])
            end
        end
    end

    local elapsed = math.max(0, now - last_refill)
    local tokens_to_add = elapsed * refill_rate
    tokens = math.min(capacity, tokens + tokens_to_add)

    local allowed = 0
    local retry_after = 0

    if tokens >= requested then
        tokens = tokens - requested
        allowed = 1
    else
        retry_after = (requested - tokens) / refill_rate
    end

    redis.call('HSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2 + 60)

    return {allowed, tokens, retry_after}
    """

    def __init__(self, redis_client: redis.Redis, capacity: int, refill_rate: float):
        self.redis = redis_client
        self.capacity = capacity
        self.refill_rate = refill_rate
        # Pre-load script into Redis for performance
        self._script = self.redis.register_script(self.LUA_SCRIPT)

    def allow_request(self, client_id: str) -> Tuple[bool, Dict[str, any]]:
        key = f"rate_limit:{client_id}"
        now = time.time()
        
        # Execute script atomically
        result = self._script(keys=[key], args=[self.capacity, self.refill_rate, now])
        
        allowed, remaining, retry_after = result
        
        return bool(allowed), {
            'remaining': int(remaining),
            'retry_after': float(retry_after)
        }

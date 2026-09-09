import time
import pytest
from fakeredis import FakeRedis
from rate_limiter import TokenBucketRateLimiter, TokenBucketLuaScript

# Test both implementations to ensure they behave similarly
@pytest.fixture(params=[TokenBucketRateLimiter, TokenBucketLuaScript])
def limiter_class(request):
    return request.param

@pytest.fixture
def redis_client():
    # Use fakeredis for self-contained, fast unit testing without real Redis
    return FakeRedis(decode_responses=False)

def test_initial_request_allowed(redis_client, limiter_class):
    limiter = limiter_class(redis_client, capacity=5, refill_rate=1)
    allowed, stats = limiter.allow_request("client_1")
    
    assert allowed is True
    assert stats['remaining'] == 4
    assert stats['retry_after'] == 0

def test_bucket_exhaustion(redis_client, limiter_class):
    limiter = limiter_class(redis_client, capacity=3, refill_rate=0.1) # slow refill
    
    # Consume all tokens
    for i in range(3):
        allowed, _ = limiter.allow_request("client_2")
        assert allowed is True
        
    # Next request should be rejected
    allowed, stats = limiter.allow_request("client_2")
    assert allowed is False
    assert stats['remaining'] == 0
    assert stats['retry_after'] > 0

def test_token_refill_after_wait(redis_client, limiter_class, monkeypatch):
    limiter = limiter_class(redis_client, capacity=2, refill_rate=1) # 1 token per second
    
    # Consume all tokens
    limiter.allow_request("client_3")
    limiter.allow_request("client_3")
    
    # Should be rejected
    allowed, _ = limiter.allow_request("client_3")
    assert allowed is False
    
    # Fast-forward time by 1.5 seconds by mocking time.time
    # This should refill at least 1 token
    original_time = time.time
    monkeypatch.setattr(time, "time", lambda: original_time() + 1.5)
    
    allowed, stats = limiter.allow_request("client_3")
    assert allowed is True
    # We refilled 1.5 tokens, consumed 1, so 0.5 left (represented as 0 integer remaining typically)
    assert stats['remaining'] == 0 

def test_independent_clients(redis_client, limiter_class):
    limiter = limiter_class(redis_client, capacity=1, refill_rate=1)
    
    # Client A consumes their only token
    allowed_a, _ = limiter.allow_request("client_A")
    assert allowed_a is True
    
    # Client A is rejected
    allowed_a_2, _ = limiter.allow_request("client_A")
    assert allowed_a_2 is False
    
    # Client B should still be allowed (independent buckets)
    allowed_b, _ = limiter.allow_request("client_B")
    assert allowed_b is True

import time
import pytest
from circuit_breaker import CircuitBreaker, CircuitState, CircuitOpenError

def dummy_success(timeout=2):
    return "success"

def dummy_failure(timeout=2):
    raise Exception("Simulated failure")

def dummy_timeout(timeout=2):
    # Simulate an error being raised due to timeout
    raise TimeoutError("Simulated timeout")

def test_closed_to_open_transition():
    cb = CircuitBreaker(failure_threshold=3, cooldown_period=10, timeout=1)
    
    assert cb.state == CircuitState.CLOSED
    
    # 1st failure
    with pytest.raises(Exception):
        cb.call(dummy_failure)
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 1
    
    # 2nd failure
    with pytest.raises(Exception):
        cb.call(dummy_failure)
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 2
    
    # 3rd failure (threshold reached)
    with pytest.raises(Exception):
        cb.call(dummy_failure)
    assert cb.state == CircuitState.OPEN
    assert cb.failure_count == 3

def test_open_state_fails_fast():
    cb = CircuitBreaker(failure_threshold=1, cooldown_period=10, timeout=1)
    
    # 1 failure trips circuit
    with pytest.raises(Exception):
        cb.call(dummy_failure)
        
    assert cb.state == CircuitState.OPEN
    
    # Next call should fail fast with CircuitOpenError without actually calling the function
    with pytest.raises(CircuitOpenError):
        cb.call(dummy_success)  # Even though func is success, circuit is OPEN

def test_half_open_after_cooldown():
    # Short cooldown for testing
    cb = CircuitBreaker(failure_threshold=1, cooldown_period=0.1, timeout=1)
    
    with pytest.raises(Exception):
        cb.call(dummy_failure)
        
    assert cb.state == CircuitState.OPEN
    
    # Wait for cooldown
    time.sleep(0.15)
    
    # Next call should transition to HALF_OPEN and succeed, then go to CLOSED
    res = cb.call(dummy_success)
    assert res == "success"
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 0

def test_half_open_to_open_on_failure():
    cb = CircuitBreaker(failure_threshold=1, cooldown_period=0.1, timeout=1)
    
    with pytest.raises(Exception):
        cb.call(dummy_failure)
        
    assert cb.state == CircuitState.OPEN
    time.sleep(0.15)
    
    # This call happens in HALF_OPEN state but fails
    with pytest.raises(Exception):
        cb.call(dummy_failure)
        
    # Should revert back to OPEN
    assert cb.state == CircuitState.OPEN

def test_timeout_counts_as_failure():
    cb = CircuitBreaker(failure_threshold=1, cooldown_period=10, timeout=1)
    
    with pytest.raises(TimeoutError):
        cb.call(dummy_timeout)
        
    # Should trip the breaker
    assert cb.state == CircuitState.OPEN

def test_success_resets_failure_count():
    cb = CircuitBreaker(failure_threshold=3, cooldown_period=10, timeout=1)
    
    with pytest.raises(Exception):
        cb.call(dummy_failure)
    assert cb.failure_count == 1
    
    # Success should reset count
    cb.call(dummy_success)
    assert cb.failure_count == 0
    assert cb.state == CircuitState.CLOSED

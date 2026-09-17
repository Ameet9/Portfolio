import time
import logging
from enum import Enum, auto

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = auto()     # Everything is working fine
    OPEN = auto()       # Service is failing, fail fast
    HALF_OPEN = auto()  # Testing if service has recovered

class CircuitOpenError(Exception):
    """Exception raised when the circuit breaker is OPEN."""
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold=3, cooldown_period=10, timeout=2):
        """
        Initialize the Circuit Breaker.
        
        :param failure_threshold: Number of consecutive failures before opening the circuit.
        :param cooldown_period: Seconds to wait before transitioning from OPEN to HALF_OPEN.
        :param timeout: Time in seconds before a call is considered a timeout failure.
        """
        self.failure_threshold = failure_threshold
        self.cooldown_period = cooldown_period
        self.timeout = timeout
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        
    def _transition_to(self, new_state):
        """Log state transitions."""
        logger.info(f"State transition: {self.state.name} -> {new_state.name}")
        self.state = new_state

    def call(self, func, *args, **kwargs):
        """
        Execute the wrapped function based on the current state.
        
        CLOSED: Execute normally. On failure, increment failure_count. If threshold reached, transition to OPEN.
        OPEN: Check if cooldown elapsed. If not, raise CircuitOpenError (fail fast). If yes, transition to HALF_OPEN.
        HALF_OPEN: Allow one request. If successful, reset and transition to CLOSED. If failed, transition back to OPEN.
        """
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.cooldown_period:
                # Cooldown period elapsed, let's test if the service has recovered
                self._transition_to(CircuitState.HALF_OPEN)
            else:
                # Fail fast to prevent overloading the failing service and block the client
                raise CircuitOpenError("Circuit is OPEN. Failing fast.")

        try:
            # We treat both exceptions and timeouts as failures.
            # Depending on how the client implements it, timeout might be part of kwargs or handled by func.
            # If the underlying func takes a timeout, we pass it.
            if 'timeout' not in kwargs:
                kwargs['timeout'] = self.timeout
                
            result = func(*args, **kwargs)
            
            # If we reach here, the call was successful
            if self.state == CircuitState.HALF_OPEN:
                # Service has recovered
                logger.info("Service recovered. Resetting circuit.")
                self.failure_count = 0
                self._transition_to(CircuitState.CLOSED)
            elif self.state == CircuitState.CLOSED:
                # Successful call in CLOSED state resets any partial failure counts
                self.failure_count = 0
                
            return result
            
        except Exception as e:
            # An error occurred (e.g. timeout, connection error, HTTP error)
            logger.warning(f"Call failed: {str(e)}")
            self.last_failure_time = time.time()
            self.failure_count += 1
            
            if self.state == CircuitState.HALF_OPEN:
                # The test request failed, service is still down
                self._transition_to(CircuitState.OPEN)
            elif self.state == CircuitState.CLOSED:
                if self.failure_count >= self.failure_threshold:
                    # Too many failures, open the circuit
                    self._transition_to(CircuitState.OPEN)
                    
            raise

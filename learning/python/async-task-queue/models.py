import uuid
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Task(BaseModel):
    """
    Represents a unit of work in the queue.
    Uses Pydantic for validation and easy serialization.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    attempts: int = 0
    result: Optional[Any] = None
    error: Optional[str] = None

# backend/app/schemas/queue.py
from enum import Enum

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..schemas.queue_item import QueueItemRead
from ..schemas import UserRead


class QueueType(str, Enum):
    GENERAL = "GENERAL"
    TOKEN_BASED = "TOKEN_BASED"
    PRIORITY = "PRIORITY"

class QueueStatus(str, Enum):
    OPEN = "OPEN"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"

class QueueBase(BaseModel):
    name: str
    queue_type: QueueType = QueueType.GENERAL
    max_capacity: Optional[int] = None
    status: QueueStatus = QueueStatus.OPEN
    service_id: Optional[int] = None
    organization_id: Optional[int] = None
    access_token: Optional[str] = None
    qr_code_url: Optional[str] = None

class QueueCreate(QueueBase):
    pass  # user_id will be set from current_user

class QueueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    queue_type: Optional[QueueType] = None
    max_capacity: Optional[int] = None
    status: Optional[QueueStatus] = None
    service_id: Optional[int] = None
    organization_id: Optional[int] = None
    access_token: Optional[str] = None
    qr_code_url: Optional[str] = None

class QueueRead(QueueBase):
    id: int
    created_at: datetime
    user: Optional[UserRead] = None  # Include user info if tied to a user
    queue_items: List[QueueItemRead] = []
    access_token: Optional[str] = None
    qr_code_url: Optional[str] = None
    class Config:
        orm_mode = True
# Do not import ServiceRead or OrganizationRead here to avoid circular imports

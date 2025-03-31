# backend/app/schemas/queue_history.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserRead

class QueueHistoryBase(BaseModel):
    queue_id: int
    user_id: Optional[int] = None
    joined_at: datetime
    removed_at: datetime
    waiting_time: float

class QueueHistoryCreate(QueueHistoryBase):
    pass

class QueueHistoryRead(QueueHistoryBase):
    id: int
    user: Optional[UserRead] = None

    class Config:
        from_attributes = True 
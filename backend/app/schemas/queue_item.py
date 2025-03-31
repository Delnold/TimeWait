from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models import QueueItemStatus
from ..schemas.user import UserRead

class QueueItemBase(BaseModel):
    queue_id: int
    user_id: Optional[int] = None
    token_number: int
    status: QueueItemStatus = QueueItemStatus.WAITING
    joined_at: datetime = datetime.utcnow()
    called_at: Optional[datetime] = None
    served_at: Optional[datetime] = None

class QueueItemCreate(QueueItemBase):
    join_hash: str

class QueueItemRead(QueueItemBase):
    id: int
    join_hash: str
    estimated_wait_time: Optional[int] = None  # in minutes
    user: Optional[UserRead] = None

    class Config:
        from_attributes = True

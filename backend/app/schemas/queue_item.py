from pydantic import BaseModel
from typing import Optional, Tuple
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
    waiting_time: Optional[float] = None

class QueueItemCreate(QueueItemBase):
    join_hash: str

class QueueItemRead(QueueItemBase):
    id: int
    join_hash: str
    estimated_wait_time: Optional[int] = None  # in minutes
    average_wait_time: Optional[float] = None  # historical average waiting time
    user: Optional[UserRead] = None

    class Config:
        from_attributes = True

class QueueUpdate(BaseModel):
    status: Optional[QueueItemStatus] = None
    called_at: Optional[datetime] = None
    served_at: Optional[datetime] = None

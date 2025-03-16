from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models import QueueItemStatus

class QueueItemBase(BaseModel):
    queue_id: int
    user_id: Optional[int] = None
    token_number: int
    status: QueueItemStatus = QueueItemStatus.WAITING
    joined_at: datetime = datetime.utcnow()
    called_at: Optional[datetime] = None
    served_at: Optional[datetime] = None

class QueueItemCreate(QueueItemBase):
    join_hash: Optional[str] = None

class QueueItemRead(QueueItemBase):
    id: int
    join_hash: Optional[str] = None  # <--- add this

    class Config:
        from_attributes = True

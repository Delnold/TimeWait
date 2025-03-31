from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.notification import NotificationType, NotificationStatus

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    organization_id: Optional[int] = None
    queue_id: Optional[int] = None
    service_id: Optional[int] = None
    extra_data: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    status: NotificationStatus
    read_at: Optional[datetime] = None

class NotificationRead(NotificationBase):
    id: int
    user_id: int
    status: NotificationStatus
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True 
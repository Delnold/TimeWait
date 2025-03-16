# backend/app/schemas/service.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .queue import QueueRead  # Import for use in the field
from .organization import OrganizationShort  # Use a shallow version to avoid recursion

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ServiceRead(ServiceBase):
    id: int
    organization_id: int
    created_at: datetime
    queues: List[QueueRead] = []  # forward reference as a type is stored as a string
    organization: Optional[OrganizationShort] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Do not call ServiceRead.model_rebuild() here.

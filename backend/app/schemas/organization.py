# backend/app/schemas/organization.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# A shallow version used for nested usage (in ServiceRead)
class OrganizationShort(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class OrganizationRead(OrganizationBase):
    id: int
    created_at: datetime
    services: List["ServiceRead"] = []  # forward reference as a string
    general_queues: List["QueueRead"] = []
    memberships: List["MembershipRead"] = []

    class Config:
        orm_mode = True

# Do not call OrganizationRead.model_rebuild() here.

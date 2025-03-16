# backend/app/schemas/membership.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from .user import UserRead  # Import UserRead as it doesn't cause circular dependency
from ..models.user import UserRole  # Import UserRole from models

class MembershipBase(BaseModel):
    user_id: int
    role: UserRole

class MembershipCreate(MembershipBase):
    pass

class MembershipUpdate(BaseModel):
    role: UserRole

class MembershipRead(MembershipBase):
    id: int
    organization_id: int
    user: UserRead
    created_at: datetime

    class Config:
        from_attributes = True  # Correct for Pydantic V2

# No forward references needed here

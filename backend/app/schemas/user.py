# backend/app/schemas/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from ..models.user import UserRole

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone_number: str

    class Config:
        from_attributes = True  # Updated from orm_mode

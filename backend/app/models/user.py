# backend/app/models/user.py
from enum import unique

from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    BUSINESS_OWNER = "BUSINESS_OWNER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)  # Ensure 'role' is defined

    # Relationships
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    queue_items = relationship("QueueItem", back_populates="user", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="user")

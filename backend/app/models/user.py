# backend/app/models/user.py
from enum import unique

from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    BUSINESS_OWNER = "business_owner"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)

    # Relationships
    organizations = relationship("Organization", back_populates="user")
    services = relationship("Service", back_populates="user")
    queues = relationship("Queue", back_populates="user")
    queue_items = relationship("QueueItem", back_populates="user")
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user")
    queue_history = relationship("QueueHistory", back_populates="user")

    __table_args__ = {'extend_existing': True}

    def __repr__(self):
        return f"<User {self.email}>"

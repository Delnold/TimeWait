# backend/app/models/queue.py

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from ..database import Base

class QueueType(enum.Enum):
    GENERAL = "GENERAL"
    TOKEN_BASED = "TOKEN_BASED"
    PRIORITY = "PRIORITY"

class QueueStatus(enum.Enum):
    OPEN = "OPEN"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"

class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    queue_type = Column(Enum(QueueType), default=QueueType.GENERAL)
    max_capacity = Column(Integer, nullable=True)
    status = Column(Enum(QueueStatus), default=QueueStatus.OPEN)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign keys
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    service = relationship("Service", back_populates="queues")
    organization = relationship("Organization", back_populates="queues")
    user = relationship("User", back_populates="queues")
    queue_items = relationship("QueueItem", back_populates="queue", cascade="all, delete-orphan")
    history_items = relationship("QueueHistory", back_populates="queue", cascade="all, delete-orphan")

    __table_args__ = {'extend_existing': True}

    def __repr__(self):
        return f"<Queue {self.name}>"

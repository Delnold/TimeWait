# backend/app/models/queue_item.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, String
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class QueueItemStatus(enum.Enum):
    WAITING = "waiting"
    BEING_SERVE = "being_served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class QueueItem(Base):
    """
    Represents an individual item within a queue.
    """
    __tablename__ = "queue_items"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey("queues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for anonymous
    token_number = Column(Integer, nullable=False)
    status = Column(Enum(QueueItemStatus), default=QueueItemStatus.WAITING, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    served_at = Column(DateTime, nullable=True)
    join_hash = Column(String, unique=True, nullable=False)

    # Relationships
    queue = relationship("Queue", back_populates="queue_items")
    user = relationship("User", back_populates="queue_items")

    def __repr__(self):
        return f"<QueueItem {self.token_number} - {self.status.value}>"

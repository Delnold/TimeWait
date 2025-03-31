# backend/app/models/queue_item.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, String, Float
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
    waiting_time = Column(Float, nullable=True)  # Waiting time in minutes

    # Relationships
    queue = relationship("Queue", back_populates="queue_items")
    user = relationship("User", back_populates="queue_items")

    def calculate_waiting_time(self):
        """Calculate the waiting time in minutes"""
        if self.status == QueueItemStatus.COMPLETED and self.served_at and self.joined_at:
            delta = self.served_at - self.joined_at
            return delta.total_seconds() / 60
        elif self.status == QueueItemStatus.BEING_SERVE and self.called_at and self.joined_at:
            delta = self.called_at - self.joined_at
            return delta.total_seconds() / 60
        return None

    def update_waiting_time(self):
        """Update the waiting time when status changes"""
        self.waiting_time = self.calculate_waiting_time()

    def __repr__(self):
        return f"<QueueItem {self.token_number} - {self.status.value}>"

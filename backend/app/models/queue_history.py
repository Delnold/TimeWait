from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class QueueHistory(Base):
    """
    Represents historical records of queue items for analytics.
    """
    __tablename__ = "queue_history"

    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey("queues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for anonymous users
    joined_at = Column(DateTime, nullable=False)
    removed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    waiting_time = Column(Float, nullable=False)  # Waiting time in minutes

    # Relationships
    queue = relationship("Queue", back_populates="history_items")
    user = relationship("User", back_populates="queue_history")

    def __repr__(self):
        return f"<QueueHistory {self.id} - Wait: {self.waiting_time} mins>" 
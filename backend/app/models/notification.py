from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class NotificationType(str, enum.Enum):
    ORGANIZATION_INVITE = "ORGANIZATION_INVITE"
    QUEUE_INVITE = "QUEUE_INVITE"
    SERVICE_INVITE = "SERVICE_INVITE"
    QUEUE_UPDATE = "QUEUE_UPDATE"
    SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION"

class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    READ = "READ"

class Notification(Base):
    """
    Represents a notification in the system.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    
    # Reference IDs for different types of invites
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    queue_id = Column(Integer, ForeignKey("queues.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    
    # Additional data stored as JSON
    extra_data = Column(Text, nullable=True)  # JSON string for additional data

    # Relationships
    user = relationship("User", back_populates="notifications")
    organization = relationship("Organization", back_populates="notifications")
    queue = relationship("Queue", back_populates="notifications")
    service = relationship("Service", back_populates="notifications") 
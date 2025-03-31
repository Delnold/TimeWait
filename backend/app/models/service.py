# backend/app/models/service.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Service(Base):
    """
    Represents a service offered by an organization.
    """
    __tablename__ = "services"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="services")
    queues = relationship("Queue", back_populates="service", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="service", cascade="all, delete-orphan")

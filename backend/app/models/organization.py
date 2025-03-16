from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Organization(Base):
    """
    Represents an organization within the system.
    """
    __tablename__ = "organizations"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    services = relationship("Service", back_populates="organization", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="organization", cascade="all, delete-orphan")  # Renamed
    memberships = relationship("Membership", back_populates="organization", cascade="all, delete-orphan")

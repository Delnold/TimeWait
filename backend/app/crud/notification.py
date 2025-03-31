from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
from .. import models, schemas

def create_notification(db: Session, notification: schemas.NotificationCreate) -> models.Notification:
    """
    Create a new notification.
    """
    db_notification = models.Notification(
        user_id=notification.user_id,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        organization_id=notification.organization_id,
        queue_id=notification.queue_id,
        service_id=notification.service_id,
        extra_data=notification.extra_data,
        status=models.NotificationStatus.PENDING
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notification(db: Session, notification_id: int) -> Optional[models.Notification]:
    """
    Get a notification by ID.
    """
    return db.query(models.Notification).filter(models.Notification.id == notification_id).first()

def get_user_notifications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False
) -> List[models.Notification]:
    """
    Get notifications for a specific user.
    """
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(
            models.Notification.status.in_([models.NotificationStatus.PENDING])
        )
    
    return query.order_by(models.Notification.created_at.desc()).offset(skip).limit(limit).all()

def update_notification(
    db: Session,
    notification_id: int,
    notification_update: schemas.NotificationUpdate
) -> Optional[models.Notification]:
    """
    Update a notification's status.
    """
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return None
    
    for key, value in notification_update.dict(exclude_unset=True).items():
        setattr(db_notification, key, value)
    
    db.commit()
    db.refresh(db_notification)
    return db_notification

def mark_as_read(db: Session, notification_id: int) -> Optional[models.Notification]:
    """
    Mark a notification as read.
    """
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return None
    
    db_notification.status = models.NotificationStatus.READ
    db_notification.read_at = datetime.utcnow()
    db.commit()
    db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: int) -> bool:
    """
    Delete a notification.
    """
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return False
    
    db.delete(db_notification)
    db.commit()
    return True

def get_unread_count(db: Session, user_id: int) -> int:
    """
    Get the count of unread notifications for a user.
    """
    return db.query(models.Notification).filter(
        and_(
            models.Notification.user_id == user_id,
            models.Notification.status == models.NotificationStatus.PENDING
        )
    ).count() 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..dependencies import get_db
from ..models.notification import NotificationStatus, NotificationType
from ..schemas.notification import NotificationRead, NotificationCreate, NotificationUpdate
from ..crud import notification as crud_notification
from ..crud import organization as crud_organization
from ..crud import queue as crud_queue
from ..crud import service as crud_service
from ..dependencies import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

@router.get("/", response_model=List[NotificationRead])
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    """
    return crud_notification.get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        unread_only=unread_only
    )

@router.get("/unread-count", response_model=int)
def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the count of unread notifications for the current user.
    """
    return crud_notification.get_unread_count(db=db, user_id=current_user.id)

@router.post("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a notification as read.
    """
    notification = crud_notification.get_notification(db=db, notification_id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this notification"
        )
    
    return crud_notification.mark_as_read(db=db, notification_id=notification_id)

@router.post("/{notification_id}/accept", response_model=NotificationRead)
def accept_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accept an invitation notification.
    """
    notification = crud_notification.get_notification(db=db, notification_id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this notification"
        )
    
    if notification.status != NotificationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification is not in a pending state"
        )
    
    # Handle different types of invitations
    if notification.type == NotificationType.ORGANIZATION_INVITE:
        if not notification.organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid organization invitation"
            )
        # Add user to organization
        organization = crud_organization.get_organization(db=db, organization_id=notification.organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        crud_organization.add_member(db=db, organization=organization, user=current_user)
    
    elif notification.type == NotificationType.QUEUE_INVITE:
        if not notification.queue_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid queue invitation"
            )
        # Add user to queue
        queue = crud_queue.get_queue(db=db, queue_id=notification.queue_id)
        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue not found"
            )
        # Add logic to handle queue invitation acceptance
        pass
    
    elif notification.type == NotificationType.SERVICE_INVITE:
        if not notification.service_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid service invitation"
            )
        # Add user to service
        service = crud_service.get_service(db=db, service_id=notification.service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        # Add logic to handle service invitation acceptance
        pass
    
    # Update notification status
    return crud_notification.update_notification(
        db=db,
        notification_id=notification_id,
        notification_update=NotificationUpdate(
            status=NotificationStatus.ACCEPTED,
            read_at=datetime.utcnow()
        )
    )

@router.post("/{notification_id}/reject", response_model=NotificationRead)
def reject_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reject an invitation notification.
    """
    notification = crud_notification.get_notification(db=db, notification_id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this notification"
        )
    
    if notification.status != NotificationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification is not in a pending state"
        )
    
    return crud_notification.update_notification(
        db=db,
        notification_id=notification_id,
        notification_update=NotificationUpdate(
            status=NotificationStatus.REJECTED,
            read_at=datetime.utcnow()
        )
    ) 
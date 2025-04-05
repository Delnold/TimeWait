from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json
import secrets
from ..dependencies import get_db
from ..models.notification import NotificationStatus, NotificationType
from ..schemas.notification import NotificationRead, NotificationCreate, NotificationUpdate
from ..crud import notification as crud_notification, get_user
from ..crud import organization as crud_organization
from ..crud import queue as crud_queue
from ..crud import service as crud_service
from ..crud import membership as crud_membership
from ..dependencies import get_current_user
from ..models.user import User, UserRole
from ..utils.email import send_organization_invite_email

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

# Constants
INVITE_EXPIRATION_HOURS = 24

def is_invitation_expired(notification) -> bool:
    """
    Check if an invitation has expired based on its creation time.
    """
    if not notification.created_at:
        return True
    
    expiration_time = notification.created_at + timedelta(hours=INVITE_EXPIRATION_HOURS)
    return datetime.utcnow() > expiration_time

@router.post("/", response_model=NotificationRead)
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new notification.
    """
    # Verify that the target user exists
    target_user = get_user(db, user_id=notification.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )
    
    # If it's an organization invite, verify the organization exists
    if notification.type == NotificationType.ORGANIZATION_INVITE:
        if not notification.organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization ID is required for organization invites"
            )
        organization = crud_organization.get_organization(db, organization_id=notification.organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Check if the user is already a member
        existing_membership = crud_membership.get_membership(
            db=db,
            organization_id=notification.organization_id,
            user_id=notification.user_id
        )
        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this organization"
            )
        
        # Generate invite token
        invite_token = secrets.token_urlsafe(32)
        
        # Add invite token to extra_data
        extra_data = json.loads(notification.extra_data or '{}')
        extra_data['invite_token'] = invite_token
        notification.extra_data = json.dumps(extra_data)
        
        # Create notification
        db_notification = crud_notification.create_notification(db=db, notification=notification)
        
        # Send email invitation
        try:
            await send_organization_invite_email(
                email_to=target_user.email,
                organization_name=organization.name,
                invite_token=invite_token,
                role=extra_data.get('role', 'user')
            )
        except Exception as e:
            # Log the error but don't fail the notification creation
            print(f"Failed to send invitation email: {str(e)}")
        
        return db_notification
    
    return crud_notification.create_notification(db=db, notification=notification)

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
async def accept_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accept an organization invitation.
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
    
    if notification.type != NotificationType.ORGANIZATION_INVITE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This notification is not an organization invitation"
        )
    
    if notification.status != NotificationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been processed"
        )
    
    # Get the role from extra_data
    try:
        extra_data = json.loads(notification.extra_data or '{}')
        role_str = extra_data.get('role', 'USER').upper()
        role = UserRole[role_str]
    except (json.JSONDecodeError, KeyError):
        role = UserRole.USER
    
    # Create membership
    membership = crud_membership.create_membership(
        db=db,
        organization_id=notification.organization_id,
        user_id=current_user.id,
        role=role
    )
    
    # Update notification status
    notification_update = NotificationUpdate(
        status=NotificationStatus.ACCEPTED,
        read_at=datetime.utcnow()
    )
    return crud_notification.update_notification(db=db, notification_id=notification_id, notification_update=notification_update)

@router.post("/{notification_id}/reject", response_model=NotificationRead)
async def reject_invitation(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reject an organization invitation.
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
    
    if notification.type != NotificationType.ORGANIZATION_INVITE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This notification is not an organization invitation"
        )
    
    if notification.status != NotificationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been processed"
        )
    
    # Update notification status
    notification_update = NotificationUpdate(
        status=NotificationStatus.REJECTED,
        read_at=datetime.utcnow()
    )
    return crud_notification.update_notification(db=db, notification_id=notification_id, notification_update=notification_update)

@router.post("/invite/verify/{token}", response_model=NotificationRead)
async def verify_invite_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify an invitation token and return the associated notification.
    """
    # Find notification with matching token
    notifications = crud_notification.get_notifications_by_type(
        db=db,
        type=NotificationType.ORGANIZATION_INVITE,
        status=NotificationStatus.PENDING
    )
    
    for notification in notifications:
        try:
            extra_data = json.loads(notification.extra_data or '{}')
            if extra_data.get('invite_token') == token:
                if is_invitation_expired(notification):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invitation has expired"
                    )
                return notification
        except json.JSONDecodeError:
            continue
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Invalid or expired invitation token"
    )

@router.post("/invite/accept/{token}", response_model=NotificationRead)
async def accept_invite_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Accept an invitation using a token.
    """
    # Find notification with matching token
    notifications = crud_notification.get_notifications_by_type(
        db=db,
        type=NotificationType.ORGANIZATION_INVITE,
        status=NotificationStatus.PENDING
    )
    
    notification = None
    for n in notifications:
        try:
            extra_data = json.loads(n.extra_data or '{}')
            if extra_data.get('invite_token') == token:
                notification = n
                break
        except json.JSONDecodeError:
            continue
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired invitation token"
        )
    
    # Check if invitation has expired
    if is_invitation_expired(notification):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )
    
    # Get the role from extra_data
    try:
        extra_data = json.loads(notification.extra_data or '{}')
        role_str = extra_data.get('role', 'USER').upper()
        role = UserRole[role_str]
    except (json.JSONDecodeError, KeyError):
        role = UserRole.USER
    
    # Create membership
    membership = crud_membership.create_membership(
        db=db,
        organization_id=notification.organization_id,
        user_id=notification.user_id,
        role=role
    )
    
    # Update notification status
    notification_update = NotificationUpdate(
        status=NotificationStatus.ACCEPTED,
        read_at=datetime.utcnow()
    )
    return crud_notification.update_notification(db=db, notification_id=notification.id, notification_update=notification_update) 
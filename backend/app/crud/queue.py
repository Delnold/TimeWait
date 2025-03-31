# backend/app/crud.py
from typing import Optional
from sqlalchemy.orm import Session
from .. import models, schemas
from ..utils.token import generate_access_token, generate_qr_code_url, validate_access_token
from fastapi import HTTPException

def create_queue(db: Session, queue: schemas.QueueCreate, user_id: int, service_id: Optional[int] = None,
                organization_id: Optional[int] = None):
    # Generate access token and QR code URL if queue type is TOKEN_BASED
    access_token = None
    qr_code_url = None
    if queue.queue_type == "TOKEN_BASED":
        access_token = generate_access_token()
        qr_code_url = generate_qr_code_url("http://localhost:3000", None, access_token)  # We'll update this after queue creation

    db_queue = models.Queue(
        name=queue.name,
        queue_type=queue.queue_type,
        max_capacity=queue.max_capacity,
        status=queue.status,
        service_id=service_id,
        organization_id=organization_id,
        user_id=user_id,  # Always set the user_id
        access_token=access_token,
        qr_code_url=qr_code_url
    )
    db.add(db_queue)
    db.commit()
    db.refresh(db_queue)

    # Update QR code URL with actual queue ID
    if queue.queue_type == "TOKEN_BASED":
        db_queue.qr_code_url = generate_qr_code_url("http://localhost:3000", db_queue.id, access_token)
        db.commit()
        db.refresh(db_queue)

    return db_queue

def get_queues(db: Session, service_id: Optional[int] = None, organization_id: Optional[int] = None,
              user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Queue)
    if service_id:
        query = query.filter(models.Queue.service_id == service_id)
    if organization_id:
        query = query.filter(models.Queue.organization_id == organization_id)
    if user_id:
        query = query.filter(models.Queue.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def get_queue(db: Session, queue_id: int):
    return db.query(models.Queue).filter(models.Queue.id == queue_id).first()

def get_queue_by_token(db: Session, token: str):
    return db.query(models.Queue).filter(models.Queue.access_token == token).first()

def update_queue(db: Session, queue_id: int, updates: schemas.QueueUpdate):
    db_queue = get_queue(db, queue_id)
    if not db_queue:
        return None

    # If queue type is being changed to TOKEN_BASED, generate new token
    if updates.queue_type == "TOKEN_BASED" and db_queue.queue_type != "TOKEN_BASED":
        updates.access_token = generate_access_token()
        updates.qr_code_url = generate_qr_code_url("http://localhost:3000", queue_id, updates.access_token)
    # If queue type is being changed from TOKEN_BASED, remove token
    elif updates.queue_type != "TOKEN_BASED" and db_queue.queue_type == "TOKEN_BASED":
        updates.access_token = None
        updates.qr_code_url = None

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_queue, field, value)

    db.commit()
    db.refresh(db_queue)
    return db_queue

def delete_queue(db: Session, queue_id: int):
    db_queue = get_queue(db, queue_id)
    if not db_queue:
        return False
    db.delete(db_queue)
    db.commit()
    return True

def validate_queue_access(db: Session, queue_id: int, token: Optional[str] = None) -> bool:
    """Validate if a user has access to join a queue."""
    queue = get_queue(db, queue_id)
    if not queue:
        return False

    # If queue is not token-based, access is granted
    if queue.queue_type != "TOKEN_BASED":
        return True

    # For token-based queues, validate the token
    if not token or not queue.access_token:
        return False

    return validate_access_token(token, queue.access_token)

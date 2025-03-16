# backend/app/crud.py
from typing import Optional

from sqlalchemy.orm import Session
from .. import models, schemas

def create_queue(db: Session, queue: schemas.QueueCreate, user_id: int, service_id: Optional[int] = None,
                organization_id: Optional[int] = None):
    db_queue = models.Queue(
        name=queue.name,
        queue_type=queue.queue_type,
        max_capacity=queue.max_capacity,
        status=queue.status,
        service_id=service_id,
        organization_id=organization_id,
        user_id=user_id if not service_id and not organization_id else None  # Tie to user only if not tied to service or organization
    )
    db.add(db_queue)
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

def update_queue(db: Session, queue_id: int, updates: schemas.QueueUpdate):
    db_queue = get_queue(db, queue_id)
    if not db_queue:
        return None
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_queue, key, value)
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

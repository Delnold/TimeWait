# backend/app/crud/queue_item.py

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func
from .. import models, schemas

def create_queue_item(db: Session, queue_item: schemas.QueueItemCreate) -> models.QueueItem:
    db_queue_item = models.QueueItem(
        queue_id=queue_item.queue_id,
        user_id=queue_item.user_id,
        token_number=queue_item.token_number,
        status=queue_item.status,
        joined_at=queue_item.joined_at,
        called_at=queue_item.called_at,
        served_at=queue_item.served_at,
        join_hash=queue_item.join_hash  # new field
    )
    db.add(db_queue_item)
    db.commit()
    db.refresh(db_queue_item)
    return db_queue_item

def calculate_average_service_time(db: Session, queue_id: int, lookback_hours: int = 24) -> Optional[float]:
    """
    Calculate the average service time for a queue based on completed items
    within the last specified hours.
    """
    lookback_time = datetime.utcnow() - timedelta(hours=lookback_hours)
    
    # Get completed items with both called_at and served_at timestamps
    completed_items = db.query(models.QueueItem).filter(
        models.QueueItem.queue_id == queue_id,
        models.QueueItem.status == models.QueueItemStatus.COMPLETED,
        models.QueueItem.called_at != None,
        models.QueueItem.served_at != None,
        models.QueueItem.called_at >= lookback_time
    ).all()
    
    if not completed_items:
        return None
    
    # Calculate average service time in minutes
    total_service_time = sum(
        (item.served_at - item.called_at).total_seconds() / 60
        for item in completed_items
    )
    
    return total_service_time / len(completed_items)

def estimate_waiting_time(db: Session, queue_id: int, token_number: int) -> Optional[int]:
    """
    Estimate waiting time in minutes for a specific token number in a queue.
    Returns None if estimation is not possible.
    """
    # Get average service time
    avg_service_time = calculate_average_service_time(db, queue_id)
    if avg_service_time is None:
        return None
    
    # Count number of waiting people before this token
    people_ahead = db.query(func.count(models.QueueItem.id)).filter(
        models.QueueItem.queue_id == queue_id,
        models.QueueItem.token_number < token_number,
        models.QueueItem.status == models.QueueItemStatus.WAITING
    ).scalar()
    
    # Get number of active service points (being served items)
    active_service_points = db.query(func.count(models.QueueItem.id)).filter(
        models.QueueItem.queue_id == queue_id,
        models.QueueItem.status == models.QueueItemStatus.BEING_SERVE
    ).scalar()
    
    # If no active service points, assume at least 1
    if active_service_points == 0:
        active_service_points = 1
    
    # Calculate estimated waiting time
    estimated_minutes = (people_ahead / active_service_points) * avg_service_time
    
    return round(estimated_minutes)

def get_queue_item(db: Session, queue_item_id: int) -> Optional[models.QueueItem]:
    return db.query(models.QueueItem).filter(models.QueueItem.id == queue_item_id).first()

def get_queue_items(db: Session, queue_id: Optional[int] = None, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.QueueItem]:
    query = db.query(models.QueueItem)
    if queue_id:
        query = query.filter(models.QueueItem.queue_id == queue_id)
    if user_id:
        query = query.filter(models.QueueItem.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def update_queue_item(db: Session, queue_item_id: int, updates: schemas.QueueUpdate) -> Optional[models.QueueItem]:
    queue_item = get_queue_item(db, queue_item_id)
    if not queue_item:
        return None
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(queue_item, key, value)
    db.commit()
    db.refresh(queue_item)
    return queue_item

def delete_queue_item(db: Session, queue_item_id: int) -> bool:
    queue_item = get_queue_item(db, queue_item_id)
    if not queue_item:
        return False
    db.delete(queue_item)
    db.commit()
    return True

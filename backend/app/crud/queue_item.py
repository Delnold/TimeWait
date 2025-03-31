# backend/app/crud/queue_item.py

from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from .. import models, schemas

def create_queue_item(db: Session, queue_item: schemas.QueueItemCreate) -> models.QueueItem:
    db_queue_item = models.QueueItem(
        queue_id=queue_item.queue_id,
        user_id=queue_item.user_id,
        token_number=queue_item.token_number,
        status=queue_item.status,
        joined_at=queue_item.joined_at or datetime.utcnow(),
        called_at=queue_item.called_at,
        served_at=queue_item.served_at,
        join_hash=queue_item.join_hash
    )
    db.add(db_queue_item)
    db.commit()
    db.refresh(db_queue_item)
    return db_queue_item

def calculate_average_waiting_time(db: Session, queue_id: int, lookback_hours: int = 24) -> Optional[float]:
    """
    Calculate the average waiting time for a queue based on completed and being served items
    within the last specified hours.
    """
    lookback_time = datetime.utcnow() - timedelta(hours=lookback_hours)
    
    # Get items that have either been completed or are being served
    items = db.query(models.QueueItem).filter(
        models.QueueItem.queue_id == queue_id,
        models.QueueItem.joined_at >= lookback_time,
        models.QueueItem.waiting_time != None
    ).all()
    
    if not items:
        return None
    
    total_waiting_time = sum(item.waiting_time for item in items if item.waiting_time is not None)
    return total_waiting_time / len(items)

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

def estimate_waiting_time(db: Session, queue_id: int, token_number: int) -> Tuple[Optional[int], Optional[float]]:
    """
    Estimate waiting time in minutes for a specific token number in a queue.
    Returns a tuple of (estimated_wait_time, average_historical_wait_time).
    """
    # Get average service time and historical waiting time
    avg_service_time = calculate_average_service_time(db, queue_id)
    avg_waiting_time = calculate_average_waiting_time(db, queue_id)
    
    if avg_service_time is None:
        return None, avg_waiting_time
    
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
    
    return round(estimated_minutes), avg_waiting_time

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

    # Store the old status
    old_status = queue_item.status

    # Update the queue item
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(queue_item, key, value)

    # If status has changed to BEING_SERVE or COMPLETED, update timestamps and waiting time
    if updates.status and updates.status != old_status:
        if updates.status == models.QueueItemStatus.BEING_SERVE:
            queue_item.called_at = datetime.utcnow()
        elif updates.status == models.QueueItemStatus.COMPLETED:
            queue_item.served_at = datetime.utcnow()
        
        # Update waiting time
        queue_item.update_waiting_time()

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

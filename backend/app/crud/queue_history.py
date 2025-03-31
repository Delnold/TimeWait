from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from .. import models, schemas

def create_queue_history(db: Session, queue_history: schemas.QueueHistoryCreate) -> models.QueueHistory:
    db_history = models.QueueHistory(**queue_history.model_dump())
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_queue_history(db: Session, queue_id: int, skip: int = 0, limit: int = 100) -> List[models.QueueHistory]:
    return db.query(models.QueueHistory)\
        .filter(models.QueueHistory.queue_id == queue_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_average_wait_time(db: Session, queue_id: int, lookback_hours: int = 24) -> Optional[float]:
    """
    Calculate the average waiting time for a queue based on historical data
    within the last specified hours.
    """
    lookback_time = datetime.utcnow() - timedelta(hours=lookback_hours)
    
    result = db.query(func.avg(models.QueueHistory.waiting_time))\
        .filter(
            models.QueueHistory.queue_id == queue_id,
            models.QueueHistory.removed_at >= lookback_time
        )\
        .scalar()
    
    return float(result) if result is not None else None

def get_queue_history_stats(db: Session, queue_id: int, lookback_hours: int = 24):
    """
    Get comprehensive statistics about queue waiting times.
    """
    lookback_time = datetime.utcnow() - timedelta(hours=lookback_hours)
    
    stats = db.query(
        func.avg(models.QueueHistory.waiting_time).label('avg_wait'),
        func.min(models.QueueHistory.waiting_time).label('min_wait'),
        func.max(models.QueueHistory.waiting_time).label('max_wait'),
        func.count(models.QueueHistory.id).label('total_served')
    ).filter(
        models.QueueHistory.queue_id == queue_id,
        models.QueueHistory.removed_at >= lookback_time
    ).first()
    
    return {
        'average_wait_time': float(stats.avg_wait) if stats.avg_wait is not None else None,
        'min_wait_time': float(stats.min_wait) if stats.min_wait is not None else None,
        'max_wait_time': float(stats.max_wait) if stats.max_wait is not None else None,
        'total_served': stats.total_served
    } 
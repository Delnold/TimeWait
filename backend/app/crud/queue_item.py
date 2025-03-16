# backend/app/crud/queue_item.py

from sqlalchemy.orm import Session
from typing import List, Optional
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

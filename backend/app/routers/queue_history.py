# backend/app/routers/queue_history.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, models
from ..dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/queues/{queue_id}/history",
    tags=["queue history"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.QueueHistoryRead])
def read_queue_history(
    queue_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get historical records for a specific queue.
    """
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    
    # Check permissions
    if queue.organization_id:
        membership = crud.get_membership(db, queue.organization_id, current_user.id)
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this organization")
    elif queue.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this queue's history")
    
    return crud.get_queue_history(db, queue_id, skip=skip, limit=limit)

@router.get("/stats")
def get_queue_stats(
    queue_id: int,
    lookback_hours: int = 24,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get statistics about queue waiting times.
    """
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    
    # Check permissions
    if queue.organization_id:
        membership = crud.get_membership(db, queue.organization_id, current_user.id)
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this organization")
    elif queue.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this queue's statistics")
    
    return crud.get_queue_history_stats(db, queue_id, lookback_hours) 
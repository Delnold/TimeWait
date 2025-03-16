# backend/app/routers/stats.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..dependencies import get_db
from .. import models

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)

@router.get("/")
def get_stats(db: Session = Depends(get_db)):
    # 1) Top queues by number of queue items
    # This query counts how many QueueItems are in each Queue, sorts desc
    top_queues_query = (
        db.query(
            models.Queue.id,
            models.Queue.name,
            func.count(models.QueueItem.id).label("item_count")
        )
        .outerjoin(models.QueueItem, models.Queue.id == models.QueueItem.queue_id)
        .group_by(models.Queue.id, models.Queue.name)
        .order_by(desc("item_count"))
        .limit(5)
    )
    top_queues = top_queues_query.all()  # returns a list of (id, name, item_count)

    # 2) Top organizations by total queue items across all their queues
    # We'll join organizations -> queues -> queue_items, then group by org
    top_orgs_query = (
        db.query(
            models.Organization.id,
            models.Organization.name,
            func.count(models.QueueItem.id).label("total_items")
        )
        .outerjoin(models.Queue, models.Organization.id == models.Queue.organization_id)
        .outerjoin(models.QueueItem, models.Queue.id == models.QueueItem.queue_id)
        .group_by(models.Organization.id, models.Organization.name)
        .order_by(desc("total_items"))
        .limit(5)
    )
    top_orgs = top_orgs_query.all()

    # Return them as JSON. You can shape it as you like:
    return {
        "top_queues": [
            {
                "queue_id": q.id,
                "queue_name": q.name,
                "count": q.item_count
            }
            for q in top_queues
        ],
        "top_organizations": [
            {
                "org_id": o.id,
                "org_name": o.name,
                "count": o.total_items
            }
            for o in top_orgs
        ]
    }

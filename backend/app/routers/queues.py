# backend/app/routers/queues.py
from datetime import datetime
import hashlib, uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Tuple
from .. import schemas, crud, models
from ..dependencies import get_db, get_current_user
from ..utils.kafka import publish_event

router = APIRouter(
    prefix="/queues",
    tags=["queues"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.QueueRead)
def create_queue(queue: schemas.QueueCreate, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    # Extract optional foreign keys from the request
    service_id = queue.service_id
    organization_id = queue.organization_id

    # If the queue is tied to a service, verify and use its organization
    if service_id:
        service = crud.get_service(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found.")
        organization_id = service.organization_id
    elif organization_id:
        organization = crud.get_organization(db, organization_id)
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found.")

    # Check membership if queue is tied to an organization or service
    if service_id or organization_id:
        membership = crud.get_membership(db, organization_id, current_user.id)
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions.")
        if service_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to create queue for this service.")
        # For general queues, any member can create
        if organization_id and not service_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER, models.UserRole.USER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to create general queue.")

    # Create the queue
    new_queue = crud.create_queue(db, queue, current_user.id, service_id=service_id, organization_id=organization_id)
    return new_queue

@router.get("/", response_model=List[schemas.QueueRead])
def read_queues(service_id: Optional[int] = None, organization_id: Optional[int] = None,
                user_id: Optional[int] = None, skip: int = 0, limit: int = 100,
                db: Session = Depends(get_db)):
    queues = crud.get_queues(db, service_id=service_id, organization_id=organization_id,
                              user_id=user_id, skip=skip, limit=limit)
    return queues

@router.get("/{queue_id}", response_model=schemas.QueueRead)
def read_queue(queue_id: int, db: Session = Depends(get_db)):
    queue = (
        db.query(models.Queue)
        .options(
            joinedload(models.Queue.user),  # load the queue's creator
            joinedload(models.Queue.queue_items).joinedload(models.QueueItem.user)  # load user for each item
        )
        .filter(models.Queue.id == queue_id)
        .first()
    )
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")
    return queue

@router.put("/{queue_id}", response_model=schemas.QueueRead)
def update_queue(queue_id: int, updates: schemas.QueueUpdate,
                 db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")

    # Determine organization id from the queue (if tied to a service, use its organization)
    organization_id = queue.organization_id if not queue.service_id else queue.service.organization_id

    if queue.service_id or queue.organization_id:
        membership = crud.get_membership(db, organization_id, current_user.id)
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions.")
        if queue.service_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to update this queue.")
        if queue.organization_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER, models.UserRole.USER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to update this queue.")
    else:
        # For queues tied directly to the user
        if queue.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only update your own queues.")

    updated_queue = crud.update_queue(db, queue_id, updates)
    return updated_queue

@router.delete("/{queue_id}/items/{item_id}", status_code=204)
async def remove_queue_item(queue_id: int, item_id: int,
                            db: Session = Depends(get_db),
                            current_user: models.User = Depends(get_current_user)):
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")

    # Get the queue item before deletion to calculate waiting time
    queue_item = crud.get_queue_item(db, item_id)
    if not queue_item:
        raise HTTPException(status_code=404, detail="Queue item not found.")

    # Allow global admins to remove items from any queue
    if current_user.role == models.UserRole.ADMIN:
        pass  # Admin can proceed
    else:
        # Determine if the queue is organization/service tied or user tied
        org_id = None
        if queue.organization_id:
            org_id = queue.organization_id
        elif queue.service_id and queue.service:
            org_id = queue.service.organization_id

        if org_id:
            membership = crud.get_membership(db, org_id, current_user.id)
            if not membership or membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
                raise HTTPException(status_code=403, detail="Insufficient permissions to remove items from this queue.")
        else:
            if queue.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="You are not the owner of this queue.")

    # Update the waiting time before deletion
    if queue_item.status != models.QueueItemStatus.COMPLETED:
        queue_item.status = models.QueueItemStatus.COMPLETED
        queue_item.served_at = datetime.utcnow()
        queue_item.update_waiting_time()
        db.commit()

    # Create history record
    history_record = schemas.QueueHistoryCreate(
        queue_id=queue_id,
        user_id=queue_item.user_id,
        joined_at=queue_item.joined_at,
        removed_at=datetime.utcnow(),
        waiting_time=queue_item.waiting_time or 0.0
    )
    crud.create_queue_history(db, history_record)

    success = crud.delete_queue_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Queue item not found.")

    await publish_event("QUEUE_ITEM_REMOVED", {
        "queue_id": queue_id,
        "item_id": item_id,
        "waiting_time": queue_item.waiting_time
    })

@router.delete("/{queue_id}", status_code=204)
def delete_queue(queue_id: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")

    organization_id = queue.organization_id if not queue.service_id else queue.service.organization_id

    if queue.service_id or queue.organization_id:
        membership = crud.get_membership(db, organization_id, current_user.id)
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions.")
        if queue.service_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to delete this queue.")
        if queue.organization_id and membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER, models.UserRole.USER]:
            raise HTTPException(status_code=403, detail="Insufficient permissions to delete this queue.")
    else:
        if queue.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only delete your own queues.")

    success = crud.delete_queue(db, queue_id)
    if not success:
        raise HTTPException(status_code=404, detail="Queue not found.")
    return

@router.post("/{queue_id}/join", response_model=schemas.QueueItemRead)
async def join_queue(
    queue_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")

    # Validate access for token-based queues
    if not crud.validate_queue_access(db, queue_id, token):
        raise HTTPException(status_code=403, detail="Invalid access token or insufficient permissions.")

    # Check if user already in queue
    existing_item = db.query(models.QueueItem).filter_by(queue_id=queue_id, user_id=current_user.id).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="You have already joined this queue.")

    # Next token number
    current_count = db.query(models.QueueItem).filter(models.QueueItem.queue_id == queue_id).count()
    token_number = current_count + 1

    joined_at = datetime.utcnow()

    # Create the queue item
    unique_data = f"{current_user.id}-{queue_id}-{joined_at.isoformat()}-{uuid.uuid4()}"
    join_hash = hashlib.sha256(unique_data.encode()).hexdigest()

    queue_item_create = schemas.QueueItemCreate(
        queue_id=queue_id,
        user_id=current_user.id,
        token_number=token_number,
        status=models.QueueItemStatus.WAITING,
        joined_at=joined_at,
        called_at=None,
        served_at=None,
        join_hash=join_hash
    )
    queue_item = crud.create_queue_item(db, queue_item_create)

    # Calculate estimated waiting time and average waiting time
    estimated_wait, avg_wait = crud.estimate_waiting_time(db, queue_id, token_number)
    queue_item_dict = schemas.QueueItemRead.model_validate(queue_item).model_dump()
    queue_item_dict["estimated_wait_time"] = estimated_wait
    queue_item_dict["average_wait_time"] = avg_wait

    # Publish event
    await publish_event("QUEUE_ITEM_JOINED", {
        "queue_id": queue_id,
        "item_id": queue_item.id,
        "token_number": token_number,
        "estimated_wait_time": estimated_wait,
        "average_wait_time": avg_wait
    })

    return queue_item_dict

@router.get("/{queue_id}/access-info", response_model=dict)
def get_queue_access_info(
    queue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    queue = crud.get_queue(db, queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found.")

    # Check permissions
    if queue.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view access info for your own queues.")

    if queue.queue_type != models.QueueType.TOKEN_BASED:
        raise HTTPException(status_code=400, detail="This queue is not token-based.")

    return {
        "access_token": queue.access_token,
        "qr_code_url": queue.qr_code_url
    }

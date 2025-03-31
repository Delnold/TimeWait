# backend/app/crud/service.py

from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas

def create_service(db: Session, service: schemas.ServiceCreate, organization_id: int, user_id: int) -> models.Service:
    db_service = models.Service(
        name=service.name,
        description=service.description,
        organization_id=organization_id,
        user_id=user_id
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_service(db: Session, service_id: int) -> Optional[models.Service]:
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_services(db: Session, organization_id: int, skip: int = 0, limit: int = 100) -> List[models.Service]:
    return db.query(models.Service).filter(models.Service.organization_id == organization_id).offset(skip).limit(limit).all()


def update_service(db: Session, service_id: int, updates: schemas.ServiceUpdate) -> Optional[models.Service]:
    service = get_service(db, service_id)
    if not service:
        return None
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service

def delete_service(db: Session, service_id: int) -> bool:
    service = get_service(db, service_id)
    if not service:
        return False
    db.delete(service)
    db.commit()
    return True

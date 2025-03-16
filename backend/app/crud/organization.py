# backend/app/crud/organization.py

# backend/app/crud/organization.py

from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from .membership import create_membership
from ..models.user import UserRole

# Rest of the code remains the same

def create_organization(db: Session, organization: schemas.OrganizationCreate, creator_id: int) -> models.Organization:
    db_org = models.Organization(
        name=organization.name,
        description=organization.description
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    # Add the creator as a member with ADMIN role
    create_membership(db, db_org.id, creator_id, UserRole.ADMIN)
    return db_org

def get_organization(db: Session, organization_id: int) -> Optional[models.Organization]:
    return db.query(models.Organization).filter(models.Organization.id == organization_id).first()

def get_organization_by_name(db: Session, name: str) -> Optional[models.Organization]:
    return db.query(models.Organization).filter(models.Organization.name == name).first()

def get_organizations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Organization]:
    return db.query(models.Organization).offset(skip).limit(limit).all()

def update_organization(db: Session, organization_id: int, updates: schemas.OrganizationUpdate) -> Optional[models.Organization]:
    org = get_organization(db, organization_id)
    if not org:
        return None
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(org, key, value)
    db.commit()
    db.refresh(org)
    return org

def delete_organization(db: Session, organization_id: int) -> bool:
    org = get_organization(db, organization_id)
    if not org:
        return False
    db.delete(org)
    db.commit()
    return True

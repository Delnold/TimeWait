# backend/app/crud/membership.py

from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..models.user import UserRole

def create_membership(db: Session, organization_id: int, user_id: int, role: UserRole) -> models.Membership:
    db_membership = models.Membership(
        organization_id=organization_id,
        user_id=user_id,
        role=role
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership

def get_membership(db: Session, organization_id: int, user_id: int) -> Optional[models.Membership]:
    return db.query(models.Membership).filter(
        models.Membership.organization_id == organization_id,
        models.Membership.user_id == user_id
    ).first()

def get_memberships_by_organization(db: Session, organization_id: int) -> List[models.Membership]:
    return db.query(models.Membership).filter(models.Membership.organization_id == organization_id).all()

def update_membership(db: Session, organization_id: int, user_id: int, new_role: UserRole) -> Optional[models.Membership]:
    membership = get_membership(db, organization_id, user_id)
    if not membership:
        return None
    membership.role = new_role
    db.commit()
    db.refresh(membership)
    return membership

def delete_membership(db: Session, organization_id: int, user_id: int) -> bool:
    membership = get_membership(db, organization_id, user_id)
    if not membership:
        return False
    db.delete(membership)
    db.commit()
    return True

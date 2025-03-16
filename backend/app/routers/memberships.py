# backend/app/routers/memberships.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, models
from ..dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/organizations/{organization_id}/memberships",
    tags=["memberships"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.MembershipRead)
def add_member(
        organization_id: int,
        membership: schemas.MembershipCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """
    Add a member to an organization. Only ADMIN members can perform this action.
    """
    # Check if current user is ADMIN
    current_membership = crud.get_membership(db, organization_id, current_user.id)
    if not current_membership or current_membership.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")

    # Check if user exists
    user = crud.get_user(db, membership.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Check if user is already a member
    existing_membership = crud.get_membership(db, organization_id, membership.user_id)
    if existing_membership:
        raise HTTPException(status_code=400, detail="User is already a member of the organization.")

    return crud.create_membership(db, organization_id, membership.user_id, membership.role)

@router.get("/", response_model=List[schemas.MembershipRead])
def read_memberships(
        organization_id: int,
        db: Session = Depends(get_db)
):
    """
    List all members of an organization.
    """
    memberships = crud.get_memberships_by_organization(db, organization_id)
    return memberships

@router.put("/{user_id}", response_model=schemas.MembershipRead)
def update_membership(
        organization_id: int,
        user_id: int,
        membership_update: schemas.MembershipUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """
    Update a member's role within an organization. Only ADMIN members can perform this action.
    """
    # Check if current user is ADMIN
    current_membership = crud.get_membership(db, organization_id, current_user.id)
    if not current_membership or current_membership.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")

    # Update membership
    membership = crud.update_membership(db, organization_id, user_id, membership_update.role)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found.")
    return membership

@router.delete("/{user_id}", status_code=204)
def remove_member(
        organization_id: int,
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """
    Remove a member from an organization. Only ADMIN members can perform this action.
    """
    # Check if current user is ADMIN
    current_membership = crud.get_membership(db, organization_id, current_user.id)
    if not current_membership or current_membership.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")

    # Remove membership
    success = crud.delete_membership(db, organization_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Membership not found.")
    return

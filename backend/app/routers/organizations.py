# backend/app/routers/organizations.py

# backend/app/routers/organizations.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, models
from ..dependencies import get_db, get_current_user
from ..models.user import UserRole  # Ensure correct import if needed

# Rest of the code remains the same


router = APIRouter(
    prefix="/organizations",
    tags=["organizations"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.OrganizationRead)
def create_organization(
    organization: schemas.OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new organization. The creator is automatically assigned as an ADMIN member.
    """
    existing_org = crud.get_organization_by_name(db, name=organization.name)
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization with this name already exists.")
    return crud.create_organization(db, organization, creator_id=current_user.id)

@router.get("/", response_model=List[schemas.OrganizationRead])
def read_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of organizations.
    """
    organizations = crud.get_organizations(db, skip=skip, limit=limit)
    return organizations

@router.get("/{organization_id}", response_model=schemas.OrganizationRead)
def read_organization(
    organization_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific organization by ID.
    """
    organization = crud.get_organization(db, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return organization

@router.put("/{organization_id}", response_model=schemas.OrganizationRead)
def update_organization(
    organization_id: int,
    updates: schemas.OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update an organization. Only ADMIN and BUSINESS_OWNER members can perform this action.
    """
    # Check membership and role
    membership = crud.get_membership(db, organization_id, current_user.id)
    if not membership or membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    organization = crud.update_organization(db, organization_id, updates)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return organization

@router.delete("/{organization_id}", status_code=204)
def delete_organization(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete an organization. Only ADMIN members can perform this action.
    """
    # Check membership and role
    membership = crud.get_membership(db, organization_id, current_user.id)
    if not membership or membership.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    success = crud.delete_organization(db, organization_id)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return

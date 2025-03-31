import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import schemas, crud, models
from ..dependencies import get_db, get_current_user

# Set up module-level logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter(
    prefix="/services",
    tags=["services"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)


# 1. New Endpoint: Get all services for organizations that the user is a member of.
@router.get("/all", response_model=List[schemas.ServiceRead])
def read_services_for_user(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"GET /services/all called by user {current_user.id}")
    try:
        memberships = db.query(models.Membership).filter_by(user_id=current_user.id).all()
        logger.debug(f"Memberships for user {current_user.id}: {memberships}")
    except Exception as e:
        logger.error(f"Error fetching memberships for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching memberships")

    org_ids = [m.organization_id for m in memberships]
    logger.info(f"User {current_user.id} is a member of organizations: {org_ids}")

    try:
        services = (
            db.query(models.Service)
            .options(joinedload(models.Service.organization))
            .filter(models.Service.organization_id.in_(org_ids))
            .all()
        )
        logger.info(f"Found {len(services)} services for user {current_user.id}")
        for service in services:
            org_info = service.organization.name if service.organization else "None"
            logger.debug(f"Service id {service.id}: name={service.name}, organization={org_info}")
    except Exception as e:
        logger.error(f"Error fetching services for organizations {org_ids}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching services")

    return services


# 2. Create a new service (requires organization_id in query)
@router.post("/", response_model=schemas.ServiceRead)
def create_service(
        organization_id: int,
        service: schemas.ServiceCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"POST /services/ called by user {current_user.id} for organization {organization_id}")
    membership = crud.get_membership(db, organization_id, current_user.id)
    if not membership or membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
        logger.warning(f"User {current_user.id} lacks permission to create service in organization {organization_id}")
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    try:
        new_service = crud.create_service(db, service, organization_id, current_user.id)
        logger.info(
            f"Service created with id {new_service.id} in organization {organization_id} by user {current_user.id}")
    except Exception as e:
        logger.error(f"Error creating service in organization {organization_id}: {e}")
        raise HTTPException(status_code=500, detail="Error creating service")
    return new_service


# 3. Read services for a specific organization (using query parameter organization_id)
@router.get("/", response_model=List[schemas.ServiceRead])
def read_services(
        organization_id: int,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    logger.info(
        f"GET /services/ called to fetch services for organization {organization_id} (skip={skip}, limit={limit})")
    try:
        services = crud.get_services(db, organization_id, skip=skip, limit=limit)
        logger.info(f"Found {len(services)} services for organization {organization_id}")
    except Exception as e:
        logger.error(f"Error fetching services for organization {organization_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching services")
    return services


# 4. Read a specific service by service_id (and organization_id via query)
@router.get("/{service_id}", response_model=schemas.ServiceRead)
def read_service(
        organization_id: int,
        service_id: int,
        db: Session = Depends(get_db)
):
    logger.info(f"GET /services/{service_id} called for organization {organization_id}")
    try:
        service = crud.get_service(db, service_id)
    except Exception as e:
        logger.error(f"Error fetching service {service_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching service")
    if not service or service.organization_id != organization_id:
        logger.warning(f"Service {service_id} not found in organization {organization_id}")
        raise HTTPException(status_code=404, detail="Service not found in this organization.")
    logger.info(f"Service {service_id} retrieved for organization {organization_id}")
    return service


# 5. Update a service by service_id (requires proper permissions)
@router.put("/{service_id}", response_model=schemas.ServiceRead)
def update_service(
        organization_id: int,
        service_id: int,
        updates: schemas.ServiceUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"PUT /services/{service_id} called by user {current_user.id} for organization {organization_id}")
    membership = crud.get_membership(db, organization_id, current_user.id)
    if not membership or membership.role not in [models.UserRole.ADMIN, models.UserRole.BUSINESS_OWNER]:
        logger.warning(
            f"User {current_user.id} lacks permission to update service {service_id} in organization {organization_id}")
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    try:
        service = crud.get_service(db, service_id)
    except Exception as e:
        logger.error(f"Error fetching service {service_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching service")
    if not service or service.organization_id != organization_id:
        logger.warning(f"Service {service_id} not found in organization {organization_id} for update")
        raise HTTPException(status_code=404, detail="Service not found in this organization.")
    try:
        updated_service = crud.update_service(db, service_id, updates)
        logger.info(f"Service {service_id} updated in organization {organization_id} by user {current_user.id}")
    except Exception as e:
        logger.error(f"Error updating service {service_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating service")
    return updated_service


# 6. Delete a service by service_id (requires ADMIN permission)
@router.delete("/{service_id}", status_code=204)
def delete_service(
        organization_id: int,
        service_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"DELETE /services/{service_id} called by user {current_user.id} for organization {organization_id}")
    membership = crud.get_membership(db, organization_id, current_user.id)
    if not membership or membership.role != models.UserRole.ADMIN:
        logger.warning(
            f"User {current_user.id} lacks permission to delete service {service_id} in organization {organization_id}")
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    try:
        service = crud.get_service(db, service_id)
    except Exception as e:
        logger.error(f"Error fetching service {service_id} for deletion: {e}")
        raise HTTPException(status_code=500, detail="Error fetching service")
    if not service or service.organization_id != organization_id:
        logger.warning(f"Service {service_id} not found in organization {organization_id} for deletion")
        raise HTTPException(status_code=404, detail="Service not found in this organization.")
    try:
        success = crud.delete_service(db, service_id)
        if not success:
            logger.warning(f"Service {service_id} could not be deleted in organization {organization_id}")
            raise HTTPException(status_code=404, detail="Service not found.")
        logger.info(f"Service {service_id} deleted from organization {organization_id} by user {current_user.id}")
    except Exception as e:
        logger.error(f"Error deleting service {service_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting service")
    return

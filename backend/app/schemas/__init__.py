# backend/app/schemas/__init__.py
from .queue_item import QueueItemCreate, QueueItemRead
from .user import UserBase, UserCreate, UserUpdate, UserRead
from .membership import MembershipBase, MembershipCreate, MembershipUpdate, MembershipRead
from .token import Token, TokenData
from .service import ServiceBase, ServiceCreate, ServiceUpdate, ServiceRead
from .queue import QueueBase, QueueCreate, QueueUpdate, QueueRead
from .organization import OrganizationBase, OrganizationCreate, OrganizationUpdate, OrganizationRead, OrganizationShort
from .queue_history import QueueHistoryRead, QueueHistoryBase, QueueHistoryCreate
from .notification import NotificationCreate, NotificationUpdate, NotificationRead

__all__ = [
    "OrganizationBase",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationRead",
    "OrganizationShort",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserRead",
    "ServiceBase",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceRead",
    "QueueBase",
    "QueueCreate",
    "QueueUpdate",
    "QueueRead",
    "QueueItemCreate",
    "QueueItemRead",
    "MembershipBase",
    "MembershipCreate",
    "MembershipUpdate",
    "MembershipRead",
    "Token",
    "TokenData",
    "QueueHistoryRead",
    "QueueHistoryCreate",
    "QueueHistoryBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationRead"
]

# Now rebuild models; by this time, ServiceRead is imported and defined.
OrganizationRead.model_rebuild()
ServiceRead.model_rebuild()
QueueRead.model_rebuild()
MembershipRead.model_rebuild()
UserRead.model_rebuild()

# backend/app/crud/__init__.py

from .user import (
    get_user,
    get_user_by_email,
    create_user,
    get_users,
    update_user,
    delete_user
)

from .organization import (
    create_organization,
    get_organization,
    get_organization_by_name,
    get_organizations,
    update_organization,
    delete_organization
)

from .service import (
    create_service,
    get_service,
    get_services,
    update_service,
    delete_service
)

from .queue import (
    create_queue,
    get_queue,
    get_queues,
    update_queue,
    delete_queue,
    validate_queue_access,
    get_queue_by_token
)

from .queue_item import (
    create_queue_item,
    get_queue_item,
    get_queue_items,
    update_queue_item,
    delete_queue_item,
    estimate_waiting_time,
    calculate_average_service_time,
    calculate_average_waiting_time
)

from .membership import (
    create_membership,
    get_membership,
    get_memberships_by_organization,
    update_membership,
    delete_membership
)

from .queue_history import (
    create_queue_history,
    get_queue_history,
    get_average_wait_time,
    get_queue_history_stats
)

from .notification import (
    create_notification,
    get_notification,
    get_user_notifications,
    update_notification,
    mark_as_read,
    delete_notification,
    get_unread_count
)

__all__ = [
    "get_user",
    "get_user_by_email",
    "create_user",
    "get_users",
    "update_user",
    "delete_user",
    "create_organization",
    "get_organization",
    "get_organization_by_name",
    "get_organizations",
    "update_organization",
    "delete_organization",
    "create_service",
    "get_service",
    "get_services",
    "update_service",
    "delete_service",
    "create_queue",
    "get_queue",
    "get_queues",
    "update_queue",
    "delete_queue",
    "validate_queue_access",
    "get_queue_by_token",
    "create_queue_item",
    "get_queue_item",
    "get_queue_items",
    "update_queue_item",
    "delete_queue_item",
    "estimate_waiting_time",
    "calculate_average_service_time",
    "calculate_average_waiting_time",
    "create_membership",
    "get_membership",
    "get_memberships_by_organization",
    "update_membership",
    "delete_membership",
    "create_queue_history",
    "get_queue_history",
    "get_average_wait_time",
    "get_queue_history_stats",
    "create_notification",
    "get_notification",
    "get_user_notifications",
    "update_notification",
    "mark_as_read",
    "delete_notification",
    "get_unread_count",
]

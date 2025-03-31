import secrets
import string
from typing import Optional
from datetime import datetime, timedelta

def generate_access_token(length: int = 8) -> str:
    """Generate a random access token for queue access."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_qr_code_url(base_url: str, queue_id: int, access_token: str) -> str:
    """Generate a QR code URL for queue access."""
    return f"{base_url}/queue/join/{queue_id}?token={access_token}"

def validate_access_token(token: str, queue_access_token: str) -> bool:
    """Validate if the provided token matches the queue's access token."""
    return token == queue_access_token 
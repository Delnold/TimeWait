from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from ..core.config import settings
from pathlib import Path
import json

async def send_organization_invite_email(
    email_to: str,
    organization_name: str,
    invite_token: str,
    role: str
):
    """
    Send organization invitation email
    """
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.SMTP_FROM_EMAIL,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_FROM_NAME=settings.SMTP_FROM_NAME,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        TEMPLATE_FOLDER=Path(__file__).parent.parent / 'templates' / 'email'
    )

    message = MessageSchema(
        subject=f"Invitation to join {organization_name}",
        recipients=[email_to],
        template_body={
            "organization_name": organization_name,
            "role": role,
            "invite_link": f"{settings.FRONTEND_URL}/invite/accept/{invite_token}"
        },
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message, template_name="organization_invite.html") 
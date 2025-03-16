# backend/app/schemas/token.py

from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True  # Updated for Pydantic V2
        orm_mode = True

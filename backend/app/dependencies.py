# backend/app/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from . import crud, models, schemas
from .database import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print(token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
        user_id: int = payload.get("sub")
        print(user_id)
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(sub=str(user_id))
    except JWTError:
        raise credentials_exception
    user = crud.get_user(db, user_id=int(token_data.sub))
    if user is None:
        raise credentials_exception
    return user

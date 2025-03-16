# backend/app/database_sqlite.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import Base

DATABASE_URL = "sqlite:///./queuetracker.db"  # SQLite file in current directory

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

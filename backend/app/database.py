# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_TYPE = os.getenv("DB_TYPE", "sqlite")

if DB_TYPE == "postgres":
    SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL_POSTGRES")
else:
    SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./queuetracker.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if DB_TYPE != "postgres" else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# We're using PostgreSQL in Docker
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://youruser:yourpassword@db:5432/queuetracker")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# backend/app/database_postgres.py
#
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from .database import Base
# import os
#
# DATABASE_URL = os.getenv("DATABASE_URL_POSTGRES", "postgresql://user:password@db:5432/queuetracker")  # 'db' is the service name in docker-compose
#
# engine = create_engine(
#     DATABASE_URL
# )
#
# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

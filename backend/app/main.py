# backend/app/main.py

import os
from fastapi import FastAPI
from dotenv import load_dotenv
from .routers import auth, users, organizations, services, queues, memberships, stats
from .database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env
load_dotenv()

# Import all models to ensure they are registered with SQLAlchemy
from . import models  # Add this line

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QueueTracker",
    description="A Queue Management System",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",  # React app
    "http://localhost",        # Adjust as needed
    # Add more origins as required
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or ["*"] to allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(services.router)
app.include_router(queues.router)
app.include_router(memberships.router)
app.include_router(stats.router)
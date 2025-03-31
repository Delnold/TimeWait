from fastapi import FastAPI
from .database import Base, engine
from .routers import auth, users, organizations, services, queues, memberships, stats, ws, queue_history
from .utils.kafka import init_kafka_producer, shutdown_kafka_producer
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TimeWait",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(services.router)
app.include_router(queues.router)
app.include_router(memberships.router)
app.include_router(stats.router)
app.include_router(ws.router)
app.include_router(queue_history.router)

@app.on_event("startup")
async def on_startup():
    await init_kafka_producer()

@app.on_event("shutdown")
async def on_shutdown():
    await shutdown_kafka_producer()

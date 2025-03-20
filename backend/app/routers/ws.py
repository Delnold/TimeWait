import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..utils.kafka import kafka_consumer_loop

router = APIRouter()

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/queues")
async def websocket_queues(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        async def kafka_callback(event_data: dict) -> None:
            await manager.broadcast(event_data)

        consumer_task = asyncio.create_task(kafka_consumer_loop(kafka_callback))

        while True:
            # Keep the connection alive; no incoming messages are processed here by default.
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        consumer_task.cancel()

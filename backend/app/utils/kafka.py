from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import json

KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
TOPIC_QUEUE_UPDATES = "queue-updates"

producer = None

async def init_kafka_producer() -> None:
    global producer
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await producer.start()

async def shutdown_kafka_producer() -> None:
    global producer
    if producer:
        await producer.stop()

async def publish_event(event_type: str, payload: dict) -> None:
    global producer
    if not producer:
        await init_kafka_producer()
    message = json.dumps({
        "event_type": event_type,
        "payload": payload
    }).encode("utf-8")
    await producer.send_and_wait(TOPIC_QUEUE_UPDATES, message)

async def kafka_consumer_loop(callback) -> None:
    consumer = AIOKafkaConsumer(
        TOPIC_QUEUE_UPDATES,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="websocket_group"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            data = json.loads(msg.value.decode("utf-8"))
            await callback(data)
    finally:
        await consumer.stop()

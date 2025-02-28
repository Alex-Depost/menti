import asyncio
from dotenv import load_dotenv

def setup_db():
    from src.data.base import create_schema
    asyncio.get_event_loop().create_task(create_schema())

def setup():
    load_dotenv()
    setup_db()
from typing import Union

from fastapi import FastAPI
from sqlalchemy import insert, select
from src.data.base import session_scope
from src.data.models import User
from src.setup import setup

app = FastAPI()
setup()


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
    assert item_id
    async with session_scope() as session:
        new_user = User(
            username="TMP", email="newuser@exaasdmple.com", password_hash="asd"
        )
        stmt = insert(User).values(
            username=new_user.username,
            email=new_user.email,
            password_hash=new_user.password_hash,
        )
        await session.execute(stmt)
        result = await session.execute(select(User))
        users = result.scalars().all()

    return {
        "users": [{"username": user.username, "email": user.email} for user in users]
    }

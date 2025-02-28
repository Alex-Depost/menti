import os
from contextlib import asynccontextmanager
from typing import cast

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema

from src.data.models import SCHEMA_NAME, Base

main_engine = create_async_engine(
    f"postgresql+asyncpg://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}@{
        os.environ['POSTGRES_HOST']}:{os.environ['POSTGRES_PORT']}/{os.environ['POSTGRES_DB']}",
    echo=False,
)
DBSession = sessionmaker(
    binds={
        Base: main_engine,
    },
    expire_on_commit=False,
    class_=AsyncSession,
)
DBSession.configure(bind=main_engine)


@asynccontextmanager
async def session_scope():
    """Provides a transactional scope around a series of operations."""
    session: AsyncSession = cast(AsyncSession, DBSession())
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise e
    finally:
        await session.close()


async def create_schema():
    """Create schema if not exists."""
    async with main_engine.begin() as connection:
        # await drop_all_tables()
        await connection.execute(CreateSchema(SCHEMA_NAME, if_not_exists=True))
        await connection.run_sync(Base.metadata.create_all)
        await connection.commit()


async def drop_all_tables():
    """Drop all tables in the database."""
    async with main_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.commit()


from contextlib import asynccontextmanager
from typing import cast

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema
from sqlalchemy import text

from src.config import CONNECTION_STRING
from src.data.models import SCHEMA_NAME, Base

main_engine = create_async_engine(
    CONNECTION_STRING,
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
        await drop_all_tables()  # Временно раскомментировано для пересоздания схемы
        await connection.execute(CreateSchema(SCHEMA_NAME, if_not_exists=True))
        await connection.run_sync(Base.metadata.create_all)
        await connection.commit()


async def drop_all_tables():
    """Drop all tables in the database."""
    async with main_engine.begin() as connection:
        # Используем CASCADE для корректного удаления таблиц с зависимостями
        await connection.execute(text(f"DROP SCHEMA IF EXISTS {SCHEMA_NAME} CASCADE"))
        await connection.commit()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import settings

DATABASE_URL = settings.DATABASE_URL


def _engine_options(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        # SQLite needs check_same_thread disabled for FastAPI's threaded server.
        return {"connect_args": {"check_same_thread": False}}

    return {"pool_pre_ping": True}


engine = create_engine(DATABASE_URL, **_engine_options(DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models.

    Add new models by inheriting from Base and running create_all in main.py startup.
    """


# Dependency for routes
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

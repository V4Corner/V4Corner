from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./v4corner.db"

# SQLite needs check_same_thread disabled for FastAPI's threaded server.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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

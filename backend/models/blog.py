from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text

from ..database import Base


class Blog(Base):
    __tablename__ = "blogs"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(200), nullable=False)
    content: str = Column(Text, nullable=False)
    author: str = Column(String(100), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

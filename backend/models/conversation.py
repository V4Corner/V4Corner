from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    title: str = Column(String(100), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

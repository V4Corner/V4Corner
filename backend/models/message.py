from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Message(Base):
    __tablename__ = "messages"

    id: int = Column(Integer, primary_key=True, index=True)
    conversation_id: int = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role: str = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content: str = Column(Text, nullable=False)
    tokens_used: int | None = Column(Integer, nullable=True)  # AI消息使用的Token数
    feedback: str | None = Column(String(20), nullable=True)  # 'helpful', 'not_helpful', or NULL
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 关系
    conversation = relationship("Conversation", back_populates="messages")

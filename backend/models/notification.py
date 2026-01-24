from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Index
from sqlalchemy.orm import relationship

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: str = Column(String(50), nullable=False)  # comment_reply, blog_comment, comment_reply_blog, system
    title: str = Column(String(200), nullable=False)
    content: str = Column(String(1000), nullable=False)
    related_type: str = Column(String(50), nullable=True)  # blog, comment, null
    related_id: int = Column(Integer, nullable=True)
    related_url: str = Column(String(500), nullable=True)
    is_read: bool = Column(Boolean, default=False, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="notifications")

    # 索引
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_is_read', 'is_read'),
        Index('idx_created_at', 'created_at'),
        Index('idx_user_read', 'user_id', 'is_read'),
    )

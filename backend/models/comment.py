from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Index
from sqlalchemy.orm import relationship

from database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: int = Column(Integer, primary_key=True, index=True)
    blog_id: int = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content: str = Column(String(1000), nullable=False)
    parent_id: int = Column(Integer, ForeignKey("comments.id", ondelete="SET NULL"), nullable=True)
    is_deleted: bool = Column(Boolean, default=False, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # 关系
    blog = relationship("Blog", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index('idx_blog_id', 'blog_id'),
        Index('idx_parent_id', 'parent_id'),
        Index('idx_created_at', 'created_at'),
    )

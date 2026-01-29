from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship

from database import Base


class Like(Base):
    __tablename__ = "likes"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blog_id: int = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="likes")
    blog = relationship("Blog", back_populates="likes")

    # 索引
    __table_args__ = (
        Index('idx_user_blog', 'user_id', 'blog_id', unique=True),
    )

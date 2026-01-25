from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship

from database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blog_id: int = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)
    folder_id: int = Column(Integer, ForeignKey("favorite_folders.id", ondelete="CASCADE"), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="favorites")
    blog = relationship("Blog", back_populates="favorites")
    folder = relationship("FavoriteFolder", back_populates="favorites")

    # 索引
    __table_args__ = (
        Index('idx_favorites_user_blog_folder', 'user_id', 'blog_id', 'folder_id', unique=True),
        Index('idx_favorites_folder_id', 'folder_id'),
    )

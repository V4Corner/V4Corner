from datetime import datetime
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Index
from sqlalchemy.orm import relationship

from database import Base


class FavoriteFolder(Base):
    __tablename__ = "favorite_folders"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: str = Column(String(50), nullable=False)
    is_public: bool = Column(Boolean, default=True, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="favorite_folders")
    favorites = relationship("Favorite", back_populates="folder", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index('idx_favorite_folders_user_id', 'user_id'),
    )

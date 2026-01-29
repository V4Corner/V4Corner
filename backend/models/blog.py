from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import relationship

from database import Base


class Blog(Base):
    __tablename__ = "blogs"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(200), nullable=False)
    content: str = Column(Text, nullable=False)
    status: str = Column(String(20), default="published", nullable=False)  # draft or published
    author_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name: str = Column(String(50), nullable=False)  # 冗余字段，方便查询
    views: int = Column(Integer, default=0)  # 阅读次数
    likes_count: int = Column(Integer, default=0)  # 点赞数（冗余）
    favorites_count: int = Column(Integer, default=0)  # 收藏数（冗余）
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    author = relationship("User", back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="blog", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="blog", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index('idx_author_status', 'author_id', 'status'),
        Index('idx_blog_title', 'title'),  # 标题搜索索引
        Index('idx_blog_created_at', 'created_at'),  # 日期筛选和排序索引
        Index('idx_blog_views', 'views'),  # 按浏览量排序索引
        Index('idx_blog_likes', 'likes_count'),  # 按点赞数排序索引
        Index('idx_blog_favorites', 'favorites_count'),  # 按收藏数排序索引
    )

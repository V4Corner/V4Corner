from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String(50), unique=True, nullable=False, index=True)
    email: str = Column(String(100), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(255), nullable=False)
    nickname: str = Column(String(50), nullable=True)
    avatar_url: str = Column(String(255), nullable=True)
    class_field: str = Column(String(100), nullable=True)  # 班级/学校（class 是 Python 关键字）
    bio: str = Column(String(200), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # 关系
    blogs = relationship("Blog", back_populates="author", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="author", cascade="all, delete-orphan")
    checkins = relationship("CheckIn", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    favorite_folders = relationship("FavoriteFolder", back_populates="user", cascade="all, delete-orphan")

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Blog(Base):
    __tablename__ = "blogs"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(200), nullable=False)
    content: str = Column(Text, nullable=False)
    author_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name: str = Column(String(50), nullable=False)  # 冗余字段，方便查询
    views: int = Column(Integer, default=0)  # 阅读次数
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # 关系
    author = relationship("User", back_populates="blogs")

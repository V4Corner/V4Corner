from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Activity(Base):
    """最新动态模型"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String(50), nullable=False)
    content = Column(String(200), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    target_title = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # 关系
    user = relationship("User", backref="activities")

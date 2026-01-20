from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(100), nullable=False)
    content: str = Column(String(1000), nullable=False)
    is_pinned: bool = Column(Boolean, default=False)
    published_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_by: int | None = Column(Integer, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", backref="announcements")

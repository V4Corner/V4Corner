from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from database import Base


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(100), nullable=False)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    location: str | None = Column(String(100), nullable=True)
    description: str | None = Column(String(500), nullable=True)
    is_all_day: bool = Column(Boolean, default=False)
    importance: str = Column(String(20), default="low")
    created_by: int | None = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    creator = relationship("User", backref="calendar_events")

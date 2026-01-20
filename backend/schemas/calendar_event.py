from datetime import date as date_type, time as time_type

from pydantic import BaseModel, Field


class CalendarEventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    date: date_type
    start_time: time_type | None = None
    end_time: time_type | None = None
    location: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=500)
    is_all_day: bool = False
    importance: str = Field("low", pattern="^(low|normal|high)$")


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    date: date_type | None = None
    start_time: time_type | None = None
    end_time: time_type | None = None
    location: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=500)
    is_all_day: bool | None = None
    importance: str | None = Field(None, pattern="^(low|normal|high)$")


class CalendarEventRead(CalendarEventBase):
    id: int

    class Config:
        from_attributes = True


class CalendarEventListResponse(BaseModel):
    month: str
    items: list[CalendarEventRead]

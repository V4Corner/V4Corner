from datetime import datetime

from pydantic import BaseModel, Field


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=1000)
    is_pinned: bool = False


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    content: str | None = Field(None, min_length=1, max_length=1000)
    is_pinned: bool | None = None


class AnnouncementRead(AnnouncementBase):
    id: int
    published_at: datetime

    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: list[AnnouncementRead]

from datetime import datetime
from pydantic import BaseModel


class BlogBase(BaseModel):
    title: str
    content: str
    author: str


class BlogCreate(BlogBase):
    """Incoming payload when creating a blog."""


class BlogRead(BlogBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

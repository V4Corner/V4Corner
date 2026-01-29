from pydantic import BaseModel


class LikeResponse(BaseModel):
    """点赞/取消点赞响应"""
    liked: bool
    likes_count: int


class LikeStatusResponse(BaseModel):
    """点赞状态响应"""
    is_liked: bool
    likes_count: int

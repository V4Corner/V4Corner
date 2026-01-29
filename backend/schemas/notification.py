from datetime import datetime
from pydantic import BaseModel


class NotificationRead(BaseModel):
    """通知详情"""
    id: int
    type: str  # comment_reply, blog_comment, comment_reply_blog, system
    title: str
    content: str
    related_type: str | None = None  # blog, comment, null
    related_id: int | None = None
    related_url: str | None = None
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationWithTimeDisplay(NotificationRead):
    """带时间显示的通知"""
    time_display: str  # "5分钟前", "昨天" 等


class NotificationListResponse(BaseModel):
    """通知列表响应（分页）"""
    total: int
    unread_count: int
    page: int
    size: int
    items: list[NotificationWithTimeDisplay]


class NotificationMarkReadResponse(BaseModel):
    """标记已读响应"""
    message: str
    marked_count: int


class NotificationDeleteResponse(BaseModel):
    """删除通知响应"""
    message: str
    deleted_count: int


class NotificationUnreadCountResponse(BaseModel):
    """未读通知数量响应"""
    unread_count: int

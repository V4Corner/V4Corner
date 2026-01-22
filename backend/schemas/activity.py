from datetime import datetime
from pydantic import BaseModel


class ActivityBase(BaseModel):
    """动态基础 Schema"""
    type: str
    content: str
    target_type: str | None = None
    target_id: int | None = None
    target_title: str | None = None


class ActivityCreate(ActivityBase):
    """创建动态请求"""
    pass


class ActivityUserInfo(BaseModel):
    """动态用户信息"""
    id: int
    username: str
    nickname: str | None = None
    avatar: str | None = None


class ActivityTarget(BaseModel):
    """动态关联对象"""
    type: str | None = None
    id: int | None = None
    title: str | None = None
    url: str | None = None


class ActivityResponse(ActivityBase):
    """动态响应"""
    id: int
    user: ActivityUserInfo
    target: ActivityTarget | None = None
    created_at: datetime
    time_display: str

    class Config:
        from_attributes = True


class ActivityListItem(BaseModel):
    """动态列表项（简化版）"""
    id: int
    type: str
    user_name: str
    content: str
    target_title: str | None = None
    target_url: str | None = None
    created_at: datetime
    time_display: str


class ActivityListResponse(BaseModel):
    """动态列表响应"""
    total: int
    page: int
    size: int
    items: list[ActivityListItem]


class ActivityLatestResponse(BaseModel):
    """最新动态响应（首页简化版）"""
    items: list[ActivityListItem]

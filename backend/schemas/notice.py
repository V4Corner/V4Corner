from datetime import datetime
from pydantic import BaseModel, Field

from models.notice import generate_excerpt, generate_date_display


class NoticeBase(BaseModel):
    """通知基础 Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="标题")
    content: str = Field(..., min_length=1, max_length=10000, description="内容")
    is_important: bool = Field(default=False, description="是否重要")


class NoticeCreate(NoticeBase):
    """创建通知 Schema"""
    pass


class NoticeUpdate(BaseModel):
    """更新通知 Schema（所有字段可选）"""
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = Field(None, min_length=1, max_length=10000)
    is_important: bool | None = None


class NoticeListItem(BaseModel):
    """通知列表项 Schema（用于列表页）"""
    id: int
    title: str
    excerpt: str
    is_important: bool
    author: str
    views: int
    published_at: datetime
    date_display: str  # 格式化后的日期 "MM-DD"

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_excerpt(cls, notice):
        """从 ORM 对象创建，自动生成摘要和日期显示"""
        return cls(
            id=notice.id,
            title=notice.title,
            excerpt=generate_excerpt(notice.content),
            is_important=notice.is_important,
            author=notice.author_name,
            views=notice.views,
            published_at=notice.published_at,
            date_display=generate_date_display(notice.published_at)
        )


class NoticeDetail(BaseModel):
    """通知详情 Schema"""
    id: int
    title: str
    content: str
    is_important: bool
    author: str
    author_id: int
    views: int
    published_at: datetime
    updated_at: datetime | None = None
    is_owner: bool = False  # 当前用户是否为发布者
    can_edit: bool = False  # 当前用户是否可编辑

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_permission(cls, notice, current_user=None):
        """从 ORM 对象创建，包含权限信息"""
        is_owner = current_user and current_user.id == notice.author_id
        can_edit = is_owner or (current_user and current_user.role == "admin")

        return cls(
            id=notice.id,
            title=notice.title,
            content=notice.content,
            is_important=notice.is_important,
            author=notice.author_name,
            author_id=notice.author_id,
            views=notice.views,
            published_at=notice.published_at,
            updated_at=notice.updated_at,
            is_owner=is_owner,
            can_edit=can_edit
        )


class NoticeMini(BaseModel):
    """通知简化 Schema（用于首页）"""
    id: int
    title: str
    is_important: bool
    published_at: datetime
    date_display: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_date(cls, notice):
        """从 ORM 对象创建，自动生成日期显示"""
        return cls(
            id=notice.id,
            title=notice.title,
            is_important=notice.is_important,
            published_at=notice.published_at,
            date_display=generate_date_display(notice.published_at)
        )


class NoticeListResponse(BaseModel):
    """通知列表响应 Schema"""
    total: int
    page: int
    size: int
    items: list[NoticeListItem]


class NoticeLatestResponse(BaseModel):
    """最新通知响应 Schema（首页用）"""
    items: list[NoticeMini]

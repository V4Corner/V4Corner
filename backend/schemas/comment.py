from datetime import datetime
from pydantic import BaseModel, Field


class CommentAuthor(BaseModel):
    """评论作者信息"""
    id: int
    username: str
    nickname: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    """评论基础字段"""
    content: str = Field(..., min_length=1, max_length=200)
    parent_id: int | None = None


class CommentCreate(CommentBase):
    """创建评论"""
    pass


class CommentUpdate(BaseModel):
    """更新评论"""
    content: str = Field(..., min_length=1, max_length=200)


class CommentRead(BaseModel):
    """评论详情"""
    id: int
    content: str
    author: CommentAuthor
    parent_id: int | None = None
    parent_author: str | None = None
    replies_count: int = 0
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime | None = None
    is_author: bool = False  # 当前用户是否为博客作者
    can_edit: bool = False  # 当前用户是否可编辑此评论

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """评论列表响应（分页）"""
    total: int
    page: int
    size: int
    items: list[CommentRead]

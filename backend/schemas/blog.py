from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal


# 博客内容摘要（前150字）
def generate_excerpt(content: str, max_length: int = 150) -> str:
    """生成博客摘要"""
    if len(content) <= max_length:
        return content
    return content[:max_length] + "..."


class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    status: Literal["draft", "published"] = "published"


class BlogCreate(BlogBase):
    """创建博客时的输入（不需要 author 字段，从 Token 获取）"""
    content: str = Field("", min_length=0)  # 草稿时内容可以为空


class BlogUpdate(BaseModel):
    """更新博客时的输入"""
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = None
    status: Literal["draft", "published"] | None = None


class BlogListItem(BaseModel):
    """博客列表项"""
    id: int
    title: str
    excerpt: str
    author: str
    author_id: int
    author_avatar_url: str | None = None
    status: str
    views: int
    created_at: datetime


class BlogRead(BaseModel):
    """博客详情"""
    id: int
    title: str
    content: str
    excerpt: str
    author: str
    author_id: int
    author_avatar_url: str | None = None
    status: str
    views: int
    is_owner: bool = False  # 当前用户是否为作者
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_excerpt(cls, blog, is_owner: bool = False):
        """从 ORM 对象创建，自动生成摘要"""
        excerpt = generate_excerpt(blog.content)
        return cls(
            id=blog.id,
            title=blog.title,
            content=blog.content,
            excerpt=excerpt,
            author=blog.author_name,
            author_id=blog.author_id,
            author_avatar_url=blog.author.avatar_url if blog.author else None,
            status=blog.status,
            views=blog.views,
            is_owner=is_owner,
            created_at=blog.created_at,
            updated_at=blog.updated_at
        )


class BlogListResponse(BaseModel):
    """博客列表响应（分页）"""
    total: int
    page: int
    size: int
    items: list[BlogListItem]

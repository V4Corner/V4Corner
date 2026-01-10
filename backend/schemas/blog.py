from datetime import datetime
from pydantic import BaseModel, Field


# 博客内容摘要（前150字）
def generate_excerpt(content: str, max_length: int = 150) -> str:
    """生成博客摘要"""
    if len(content) <= max_length:
        return content
    return content[:max_length] + "..."


class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)


class BlogCreate(BlogBase):
    """创建博客时的输入（不需要 author 字段，从 Token 获取）"""
    pass


class BlogUpdate(BlogBase):
    """更新博客时的输入"""
    pass


class BlogListItem(BaseModel):
    """博客列表项"""
    id: int
    title: str
    excerpt: str
    author: str
    author_id: int
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
            views=blog.views,
            is_owner=is_owner,
            created_at=blog.created_at,
            updated_at=blog.updated_at
        )

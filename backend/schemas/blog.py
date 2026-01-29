from datetime import datetime
from pydantic import BaseModel, Field, validator
from typing import Literal
import re
import os
import models


# 博客内容摘要（移除HTML标签，媒体文件替换为占位符）
def generate_excerpt(content: str, max_length: int = 150) -> str:
    """生成博客摘要"""
    import re

    # 移除所有 HTML 标签，获取纯文本
    text = re.sub(r'<[^>]+>', '', content)

    # 替换 HTML 实体
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&amp;', '&')
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")

    # 统计媒体文件数量
    img_count = len(re.findall(r'<img[^>]+src="[^"]+"', content))
    video_count = len(re.findall(r'<video[^>]*>', content))

    # 为每个媒体文件创建占位符（每个独占一行）
    media_lines = []
    for _ in range(img_count):
        media_lines.append('【图片】')
    for _ in range(video_count):
        media_lines.append('【视频】')

    # 移除多余空白
    text = re.sub(r'\s+', ' ', text).strip()

    # 组合媒体占位符和文本（用换行符分隔）
    if media_lines:
        text = '\n'.join(media_lines) + '\n' + text

    # 截断到指定长度（考虑换行符）
    if len(text) > max_length:
        text = text[:max_length].rsplit(' ', 1)[0] + '...'

    return text


# 提取博客内容中的媒体文件路径
def extract_media_paths(content: str) -> list[str]:
    """从富文本内容中提取所有媒体文件路径"""
    # 匹配 <img src="..."> 和 <video src="...">
    img_pattern = r'<img[^>]+src="([^"]+)"'
    video_pattern = r'<video[^>]*>.*?<source[^>]+src="([^"]+)"'

    media_paths = []

    # 提取图片路径
    for match in re.finditer(img_pattern, content):
        url = match.group(1)
        if url.startswith('/static/') or url.startswith('/uploads/'):
            # 提取文件系统路径
            if url.startswith('/static/'):
                path = 'uploads' + url[7:]  # /static/xxx -> uploads/xxx
            else:
                path = 'uploads' + url[8:]  # /uploads/xxx -> uploads/xxx
            media_paths.append(path)

    # 提取视频路径
    for match in re.finditer(video_pattern, content, re.DOTALL):
        url = match.group(1)
        if url.startswith('/static/') or url.startswith('/uploads/'):
            if url.startswith('/static/'):
                path = 'uploads' + url[7:]
            else:
                path = 'uploads' + url[8:]
            media_paths.append(path)

    return media_paths


def calculate_media_size(content: str, uploads_dir: str = 'uploads') -> int:
    """计算博客内容中所有媒体文件的总大小（字节）"""
    try:
        media_paths = extract_media_paths(content)
        total_size = 0

        for path in media_paths:
            full_path = os.path.join(uploads_dir, path)
            if os.path.exists(full_path):
                total_size += os.path.getsize(full_path)

        return total_size
    except Exception:
        # 如果计算出错，返回0（不限制）
        return 0


class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)  # 字数限制5千字
    status: Literal["draft", "published"] = "published"

    @validator('content')
    def validate_content_length(cls, v):
        """验证内容长度"""
        if len(v) > 5000:
            raise ValueError('博客内容不能超过5000字')
        return v


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
    likes_count: int = 0
    favorites_count: int = 0
    is_liked: bool = False
    is_favorited: bool = False
    created_at: datetime
    favorited_at: datetime | None = None  # 收藏时间（用于收藏列表排序）
    folders: list | None = None  # 收藏所在的文件夹列表（仅"我的收藏"接口返回）


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
    likes_count: int = 0
    favorites_count: int = 0
    is_liked: bool = False
    is_favorited: bool = False
    is_owner: bool = False  # 当前用户是否为作者
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_excerpt(cls, blog, is_owner: bool = False, current_user=None, db=None):
        """从 ORM 对象创建，自动生成摘要"""
        excerpt = generate_excerpt(blog.content)

        # 检查点赞和收藏状态
        is_liked = False
        is_favorited = False

        if current_user and db:
            like = db.query(models.Like).filter(
                models.Like.user_id == current_user.id,
                models.Like.blog_id == blog.id
            ).first()
            is_liked = like is not None

            favorite = db.query(models.Favorite).filter(
                models.Favorite.user_id == current_user.id,
                models.Favorite.blog_id == blog.id
            ).first()
            is_favorited = favorite is not None

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
            likes_count=blog.likes_count,
            favorites_count=blog.favorites_count,
            is_liked=is_liked,
            is_favorited=is_favorited,
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

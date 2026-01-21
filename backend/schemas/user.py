from pydantic import BaseModel, Field, EmailStr
from datetime import datetime


class UserStats(BaseModel):
    """用户统计信息"""
    blog_count: int
    total_views: int


class UserLogin(BaseModel):
    """用户登录"""
    username_or_email: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=100)


class UserBase(BaseModel):
    """用户基础信息"""
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    email: EmailStr
    nickname: str | None = Field(None, min_length=2, max_length=20)


class UserCreate(UserBase):
    """用户注册"""
    password: str = Field(..., min_length=6, max_length=20)
    password_confirm: str = Field(..., min_length=6, max_length=20)
    verification_code: str = Field(..., min_length=4, max_length=10, description="邮箱验证码")


class UserUpdate(BaseModel):
    """更新用户信息"""
    nickname: str | None = Field(None, min_length=2, max_length=20)
    class_field: str | None = Field(None, max_length=100)
    bio: str | None = Field(None, max_length=200)


class UserRead(BaseModel):
    """当前用户完整信息"""
    id: int
    username: str
    email: EmailStr
    nickname: str | None
    avatar_url: str | None
    class_field: str | None
    bio: str | None
    stats: UserStats
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """用户公开信息（不包含邮箱）"""
    id: int
    username: str
    nickname: str | None
    avatar_url: str | None
    class_field: str | None
    bio: str | None
    stats: UserStats
    created_at: datetime

    class Config:
        from_attributes = True


class AvatarUploadResponse(BaseModel):
    """头像上传响应"""
    avatar_url: str

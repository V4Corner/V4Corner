from datetime import datetime
from pydantic import BaseModel, Field


class FavoriteFolderCreate(BaseModel):
    """创建收藏文件夹"""
    name: str = Field(..., min_length=1, max_length=50, description="文件夹名称")
    is_public: bool = Field(default=True, description="是否公开")


class FavoriteFolderUpdate(BaseModel):
    """更新收藏文件夹"""
    name: str | None = Field(None, min_length=1, max_length=50, description="文件夹名称")
    is_public: bool | None = Field(None, description="是否公开")


class FavoriteFolderRead(BaseModel):
    """收藏文件夹详情"""
    id: int
    user_id: int
    name: str
    is_public: bool
    favorites_count: int = 0
    created_at: datetime


class FavoriteFolderListResponse(BaseModel):
    """收藏文件夹列表"""
    folders: list[FavoriteFolderRead]

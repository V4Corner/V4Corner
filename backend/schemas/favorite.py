from pydantic import BaseModel, Field


class FavoriteCreate(BaseModel):
    """收藏博客"""
    folder_id: int = Field(..., description="目标文件夹 ID")


class FavoriteDelete(BaseModel):
    """取消收藏（可选指定文件夹）"""
    folder_id: int | None = Field(None, description="指定文件夹 ID（不提供则从所有文件夹移除）")


class FavoriteResponse(BaseModel):
    """收藏/取消收藏响应"""
    favorited: bool
    favorites_count: int


class FavoriteFolderInfo(BaseModel):
    """收藏文件夹信息"""
    id: int
    name: str


class FavoriteStatusResponse(BaseModel):
    """收藏状态响应"""
    is_favorited: bool
    folders: list[FavoriteFolderInfo]
    favorites_count: int

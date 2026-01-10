# 成员列表相关路由

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import dependencies, models, schemas

router = APIRouter(prefix="/api/members", tags=["成员管理"])


@router.get("")
async def list_members(
    db: dependencies.DbSession,
    q: str = Query("", description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """获取班级成员列表"""
    query = db.query(models.User)

    # 搜索
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            (models.User.username.ilike(pattern)) |
            (models.User.nickname.ilike(pattern))
        )

    # 分页
    total = query.count()
    members = query.offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for member in members:
        # 统计博客数
        blog_count = db.query(models.Blog).filter(models.Blog.author_id == member.id).count()

        items.append({
            "id": member.id,
            "username": member.username,
            "nickname": member.nickname,
            "avatar_url": member.avatar_url,
            "class": member.class_field,
            "stats": {
                "blog_count": blog_count
            }
        })

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }

# 用户管理相关路由

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

import dependencies, models, schemas

router = APIRouter(prefix="/api/users", tags=["用户管理"])


@router.get("/me", response_model=schemas.UserRead)
async def get_current_user_info(
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """获取当前用户信息"""
    # 统计博客数和总阅读量
    blog_count = db.query(models.Blog).filter(models.Blog.author_id == current_user.id).count()
    total_views = db.query(func.sum(models.Blog.views)).filter(
        models.Blog.author_id == current_user.id
    ).scalar() or 0

    return schemas.UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        nickname=current_user.nickname,
        avatar_url=current_user.avatar_url,
        class_field=current_user.class_field,
        bio=current_user.bio,
        stats=schemas.UserStats(blog_count=blog_count, total_views=total_views),
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.put("/me", response_model=schemas.UserRead)
async def update_current_user(
    user_data: schemas.UserUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """更新当前用户信息"""
    # 更新字段
    if user_data.nickname is not None:
        current_user.nickname = user_data.nickname
    if user_data.class_field is not None:
        current_user.class_field = user_data.class_field
    if user_data.bio is not None:
        current_user.bio = user_data.bio

    db.commit()
    db.refresh(current_user)

    # 统计博客数和总阅读量
    blog_count = db.query(models.Blog).filter(models.Blog.author_id == current_user.id).count()
    total_views = db.query(func.sum(models.Blog.views)).filter(
        models.Blog.author_id == current_user.id
    ).scalar() or 0

    return schemas.UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        nickname=current_user.nickname,
        avatar_url=current_user.avatar_url,
        class_field=current_user.class_field,
        bio=current_user.bio,
        stats=schemas.UserStats(blog_count=blog_count, total_views=total_views),
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.get("/{user_id}", response_model=schemas.UserPublic)
async def get_user_public_info(
    user_id: int,
    db: dependencies.DbSession
):
    """获取指定用户的公开信息"""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 统计博客数和总阅读量
    blog_count = db.query(models.Blog).filter(models.Blog.author_id == user.id).count()
    total_views = db.query(func.sum(models.Blog.views)).filter(
        models.Blog.author_id == user.id
    ).scalar() or 0

    return schemas.UserPublic(
        id=user.id,
        username=user.username,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        class_field=user.class_field,
        bio=user.bio,
        stats=schemas.UserStats(blog_count=blog_count, total_views=total_views),
        created_at=user.created_at
    )


@router.get("/{user_id}/blogs", response_model=schemas.BlogListResponse)
async def get_user_blogs(
    user_id: int,
    db: dependencies.DbSession,
    page: int = 1,
    size: int = 10
):
    """获取指定用户的博客列表"""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 统计总数
    total = db.query(models.Blog).filter(models.Blog.author_id == user_id).count()

    # 查询博客
    blogs = db.query(models.Blog).filter(
        models.Blog.author_id == user_id
    ).order_by(
        models.Blog.created_at.desc()
    ).offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for blog in blogs:
        excerpt = schemas.generate_excerpt(blog.content)
        items.append(schemas.BlogListItem(
            id=blog.id,
            title=blog.title,
            excerpt=excerpt,
            author=blog.author_name,
            author_id=blog.author_id,
            views=blog.views,
            created_at=blog.created_at
        ))

    return schemas.BlogListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )

# 点赞相关路由

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import dependencies, models, schemas

router = APIRouter(prefix="/api/blogs", tags=["点赞"])


@router.post("/{blog_id}/like", response_model=schemas.LikeResponse)
async def like_blog(
    blog_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """点赞博客"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查是否已点赞
    existing_like = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.blog_id == blog_id
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="已经点赞过了"
        )

    # 创建点赞记录
    like = models.Like(
        user_id=current_user.id,
        blog_id=blog_id
    )
    db.add(like)

    # 更新点赞数
    blog.likes_count += 1

    # 创建通知（如果点赞者不是作者）
    if current_user.id != blog.author_id:
        liker_name = current_user.nickname or current_user.username
        notification = models.Notification(
            user_id=blog.author_id,
            type="blog_liked",
            title=f"{liker_name} 点赞了你的博客《{blog.title}》",
            content=f"{liker_name} 觉得你的博客很棒",
            related_type="blog",
            related_id=blog.id,
            related_url=f"/blogs/{blog.id}"
        )
        db.add(notification)

    db.commit()

    return schemas.LikeResponse(
        liked=True,
        likes_count=blog.likes_count
    )


@router.delete("/{blog_id}/like", response_model=schemas.LikeResponse)
async def unlike_blog(
    blog_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """取消点赞博客"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查是否已点赞
    like = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.blog_id == blog_id
    ).first()

    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未点赞过该博客"
        )

    # 删除点赞记录
    db.delete(like)

    # 更新点赞数
    blog.likes_count -= 1

    db.commit()

    return schemas.LikeResponse(
        liked=False,
        likes_count=blog.likes_count
    )


@router.get("/{blog_id}/like/status", response_model=schemas.LikeStatusResponse)
async def get_like_status(
    blog_id: int,
    current_user: dependencies.CurrentUserOptional,
    db: dependencies.DbSession
):
    """查询点赞状态"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查是否已点赞
    is_liked = False
    if current_user:
        like = db.query(models.Like).filter(
            models.Like.user_id == current_user.id,
            models.Like.blog_id == blog_id
        ).first()
        is_liked = like is not None

    return schemas.LikeStatusResponse(
        is_liked=is_liked,
        likes_count=blog.likes_count
    )

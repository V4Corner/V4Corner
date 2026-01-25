# 博客相关路由

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc
from typing import Optional

import dependencies, models, schemas, auth
from models.activity import Activity

router = APIRouter(prefix="/api/blogs", tags=["博客"])


@router.get("", response_model=schemas.BlogListResponse)
async def list_blogs(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUserOptional,
    # 搜索参数
    q: Optional[str] = Query(None, description="搜索关键词（标题/内容）"),
    search_in: Optional[str] = Query("title,content", description="搜索字段（title/content/两者都用逗号分隔）"),
    # 筛选参数
    author: Optional[str] = Query(None, description="按作者筛选"),
    status_filter: Optional[str] = Query(None, alias="status", description="状态筛选 (draft/published)"),
    date_from: Optional[datetime] = Query(None, description="起始日期 (YYYY-MM-DD)"),
    date_to: Optional[datetime] = Query(None, description="结束日期 (YYYY-MM-DD)"),
    # 排序参数
    sort_by: Optional[str] = Query("created_at", description="排序字段 (created_at/views/likes/favorites)"),
    sort_order: Optional[str] = Query("desc", description="排序方向 (asc/desc)"),
    # 分页参数
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """
    获取博客列表

    支持功能：
    - 搜索：按标题和/或内容搜索
    - 筛选：按作者、状态、日期范围筛选
    - 排序：按创建时间、浏览量、点赞数、收藏数排序
    - 分页：支持分页查询
    """
    query = db.query(models.Blog).options(joinedload(models.Blog.author))

    # 搜索功能
    if q:
        if "title" in search_in and "content" in search_in:
            # 同时搜索标题和内容
            query = query.filter(
                (models.Blog.title.contains(q)) | (models.Blog.content.contains(q))
            )
        elif "title" in search_in:
            query = query.filter(models.Blog.title.contains(q))
        elif "content" in search_in:
            query = query.filter(models.Blog.content.contains(q))

    # 按作者筛选
    if author:
        query = query.filter(models.Blog.author_name == author)

    # 按状态筛选
    if status_filter:
        if status_filter == "draft":
            # 草稿仅返回自己的
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="查看草稿需要登录"
                )
            query = query.filter(models.Blog.author_id == current_user.id, models.Blog.status == "draft")
        elif status_filter == "published":
            query = query.filter(models.Blog.status == "published")
    else:
        # 默认只返回已发布的
        query = query.filter(models.Blog.status == "published")

    # 日期范围筛选
    if date_from:
        query = query.filter(models.Blog.created_at >= date_from)
    if date_to:
        query = query.filter(models.Blog.created_at <= date_to)

    # 统计总数（在排序和分页之前）
    total = query.count()

    # 排序
    order_func = desc if sort_order == "desc" else asc
    if sort_by == "created_at":
        query = query.order_by(order_func(models.Blog.created_at))
    elif sort_by == "views":
        query = query.order_by(order_func(models.Blog.views))
    elif sort_by == "likes":
        query = query.order_by(order_func(models.Blog.likes_count))
    elif sort_by == "favorites":
        query = query.order_by(order_func(models.Blog.favorites_count))
    else:
        # 默认按创建时间倒序
        query = query.order_by(models.Blog.created_at.desc())

    # 分页查询
    blogs = query.offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for blog in blogs:
        # 生成摘要
        excerpt = schemas.generate_excerpt(blog.content)

        # 检查点赞和收藏状态
        is_liked = False
        is_favorited = False

        if current_user:
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

        items.append(schemas.BlogListItem(
            id=blog.id,
            title=blog.title,
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
            created_at=blog.created_at
        ))

    return schemas.BlogListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )


@router.get("/{blog_id}", response_model=schemas.BlogRead)
async def get_blog(
    blog_id: int,
    current_user: dependencies.CurrentUserOptional,
    db: dependencies.DbSession
):
    """获取博客详情"""
    blog = db.query(models.Blog).options(joinedload(models.Blog.author)).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 草稿权限检查
    if blog.status == "draft":
        if not current_user or current_user.id != blog.author_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="博客不存在"
            )

    # 增加阅读次数（仅已发布的博客）
    if blog.status == "published":
        blog.views += 1
        db.commit()
        db.refresh(blog)

    # 判断是否为作者
    is_owner = current_user is not None and current_user.id == blog.author_id

    # 使用自定义方法构造响应
    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=is_owner, current_user=current_user, db=db)


@router.post("", response_model=schemas.BlogRead, status_code=status.HTTP_201_CREATED)
async def create_blog(
    blog_data: schemas.BlogCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """创建新博客或草稿"""

    # 只有发布时才检查每日限制
    if blog_data.status == "published":
        from datetime import datetime, timedelta
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_count = db.query(models.Blog).filter(
            models.Blog.author_id == current_user.id,
            models.Blog.status == "published",
            models.Blog.created_at >= today_start
        ).count()

        if daily_count >= 50:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="每日发布博客数量已达上限（50条/天），请明天再试"
            )

    # 检查草稿箱数量限制（20条）
    if blog_data.status == "draft":
        draft_count = db.query(models.Blog).filter(
            models.Blog.author_id == current_user.id,
            models.Blog.status == "draft"
        ).count()

        if draft_count >= 20:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="草稿箱已满（20条），请先发布或删除部分草稿"
            )

    # 检查字数限制（5千字）
    if len(blog_data.content) > 5000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="博客内容不能超过5000字"
        )

    # 检查媒体文件总大小（2GB）
    media_size = schemas.calculate_media_size(blog_data.content)
    MAX_MEDIA_SIZE = 2 * 1024 * 1024 * 1024  # 2GB
    if media_size > MAX_MEDIA_SIZE:
        size_mb = media_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"博客中的媒体文件总大小不能超过2GB（当前{size_mb:.1f}MB）"
        )

    # 创建博客
    blog = models.Blog(
        title=blog_data.title,
        content=blog_data.content,
        status=blog_data.status,
        author_id=current_user.id,
        author_name=current_user.nickname or current_user.username
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)

    # 仅已发布的博客记录动态
    if blog.status == "published":
        activity = Activity(
            type="blog_created",
            user_id=current_user.id,
            user_name=current_user.nickname or current_user.username,
            content="发布了博客",
            target_type="blog",
            target_id=blog.id,
            target_title=blog.title
        )
        db.add(activity)
        db.commit()

    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=True, current_user=current_user, db=db)


@router.put("/{blog_id}", response_model=schemas.BlogRead)
async def update_blog(
    blog_id: int,
    blog_data: schemas.BlogUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """更新博客"""
    # 获取博客
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查权限
    if blog.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限编辑此博客"
        )

    # 如果从草稿改为发布，检查每日限制
    if blog.status == "draft" and blog_data.status == "published":
        from datetime import datetime, timedelta
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_count = db.query(models.Blog).filter(
            models.Blog.author_id == current_user.id,
            models.Blog.status == "published",
            models.Blog.created_at >= today_start
        ).count()

        if daily_count >= 50:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="每日发布博客数量已达上限（50条/天），请明天再试"
            )

    # 检查字数限制（5千字）
    if blog_data.content is not None and len(blog_data.content) > 5000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="博客内容不能超过5000字"
        )

    # 检查媒体文件总大小（2GB）
    if blog_data.content is not None:
        media_size = schemas.calculate_media_size(blog_data.content)
        MAX_MEDIA_SIZE = 2 * 1024 * 1024 * 1024  # 2GB
        if media_size > MAX_MEDIA_SIZE:
            size_mb = media_size / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"博客中的媒体文件总大小不能超过2GB（当前{size_mb:.1f}MB）"
            )

    # 记录旧状态，用于判断是否从草稿改为发布
    old_status = blog.status

    # 更新字段
    if blog_data.title is not None:
        blog.title = blog_data.title
    if blog_data.content is not None:
        blog.content = blog_data.content
    if blog_data.status is not None:
        blog.status = blog_data.status

    db.commit()
    db.refresh(blog)

    # 如果从草稿改为发布，记录动态
    if old_status == "draft" and blog.status == "published":
        activity = Activity(
            type="blog_created",
            user_id=current_user.id,
            user_name=current_user.nickname or current_user.username,
            content="发布了博客",
            target_type="blog",
            target_id=blog.id,
            target_title=blog.title
        )
        db.add(activity)
        db.commit()

    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=True, current_user=current_user, db=db)


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(
    blog_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """删除博客"""
    # 获取博客
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查权限
    if blog.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此博客"
        )

    db.delete(blog)
    db.commit()

    return None

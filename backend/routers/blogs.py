# 博客相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

import dependencies, models, schemas, auth
from models.activity import Activity

router = APIRouter(prefix="/api/blogs", tags=["博客"])


@router.get("", response_model=schemas.BlogListResponse)
async def list_blogs(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUserOptional,
    author: Optional[str] = Query(None, description="按作者筛选"),
    status_filter: Optional[str] = Query(None, alias="status", description="状态筛选 (draft/published)"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """获取博客列表"""
    query = db.query(models.Blog).options(joinedload(models.Blog.author))

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

    # 统计总数
    total = query.count()

    # 按创建时间倒序，分页查询
    blogs = query.order_by(models.Blog.created_at.desc()).offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for blog in blogs:
        # 生成摘要
        excerpt = schemas.generate_excerpt(blog.content)
        items.append(schemas.BlogListItem(
            id=blog.id,
            title=blog.title,
            excerpt=excerpt,
            author=blog.author_name,
            author_id=blog.author_id,
            author_avatar_url=blog.author.avatar_url if blog.author else None,
            status=blog.status,
            views=blog.views,
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
    is_owner = current_user and current_user.id == blog.author_id

    # 使用自定义方法构造响应
    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=is_owner)


@router.post("", response_model=schemas.BlogRead, status_code=status.HTTP_201_CREATED)
async def create_blog(
    blog_data: schemas.BlogCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """创建新博客或草稿"""
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

    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=True)


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

    # 更新字段
    if blog_data.title is not None:
        blog.title = blog_data.title
    if blog_data.content is not None:
        blog.content = blog_data.content
    if blog_data.status is not None:
        blog.status = blog_data.status

    db.commit()
    db.refresh(blog)

    return schemas.BlogRead.from_orm_with_excerpt(blog, is_owner=True)


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

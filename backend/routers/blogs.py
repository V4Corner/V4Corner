# 博客相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

import dependencies, models, schemas, auth

router = APIRouter(prefix="/api/blogs", tags=["博客"])


@router.get("", response_model=list[schemas.BlogListItem])
async def list_blogs(
    db: dependencies.DbSession,
    author: Optional[str] = Query(None, description="按作者筛选"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """获取博客列表"""
    query = db.query(models.Blog)

    # 按作者筛选
    if author:
        query = query.filter(models.Blog.author_name == author)

    # 按创建时间倒序
    blogs = query.order_by(models.Blog.created_at.desc()).offset((page - 1) * size).limit(size).all()

    # 构造响应
    result = []
    for blog in blogs:
        # 生成摘要
        excerpt = schemas.generate_excerpt(blog.content)
        result.append(schemas.BlogListItem(
            id=blog.id,
            title=blog.title,
            excerpt=excerpt,
            author=blog.author_name,
            author_id=blog.author_id,
            views=blog.views,
            created_at=blog.created_at
        ))

    return result


@router.get("/{blog_id}", response_model=schemas.BlogRead)
async def get_blog(
    blog_id: int,
    current_user: dependencies.CurrentUserOptional,
    db: dependencies.DbSession
):
    """获取博客详情"""
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 增加阅读次数
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
    """创建新博客"""
    # 创建博客
    blog = models.Blog(
        title=blog_data.title,
        content=blog_data.content,
        author_id=current_user.id,
        author_name=current_user.nickname or current_user.username
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)

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
    blog.title = blog_data.title
    blog.content = blog_data.content
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

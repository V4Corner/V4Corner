# 收藏相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

import dependencies, models, schemas

router = APIRouter(prefix="/api", tags=["收藏"])


# ============================================
# 收藏文件夹管理
# ============================================

@router.post("/users/favorites/folders", response_model=schemas.FavoriteFolderRead, status_code=status.HTTP_201_CREATED)
async def create_favorite_folder(
    folder_data: schemas.FavoriteFolderCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """创建收藏文件夹"""
    # 验证名称
    if not folder_data.name or not folder_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件夹名称不能为空"
        )

    # 检查同名文件夹
    existing = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.user_id == current_user.id,
        models.FavoriteFolder.name == folder_data.name.strip()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件夹名称已存在"
        )

    # 创建文件夹
    folder = models.FavoriteFolder(
        user_id=current_user.id,
        name=folder_data.name.strip(),
        is_public=folder_data.is_public
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)

    return schemas.FavoriteFolderRead(
        id=folder.id,
        user_id=folder.user_id,
        name=folder.name,
        is_public=folder.is_public,
        favorites_count=0,
        created_at=folder.created_at
    )


@router.get("/users/favorites/folders", response_model=schemas.FavoriteFolderListResponse)
async def get_favorite_folders(
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """获取收藏文件夹列表"""
    folders = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.user_id == current_user.id
    ).order_by(models.FavoriteFolder.created_at.desc()).all()

    # 统计每个文件夹的收藏数量
    result = []
    for folder in folders:
        count = db.query(models.Favorite).filter(
            models.Favorite.folder_id == folder.id
        ).count()

        result.append(schemas.FavoriteFolderRead(
            id=folder.id,
            user_id=folder.user_id,
            name=folder.name,
            is_public=folder.is_public,
            favorites_count=count,
            created_at=folder.created_at
        ))

    return schemas.FavoriteFolderListResponse(folders=result)


@router.put("/users/favorites/folders/{folder_id}", response_model=schemas.FavoriteFolderRead)
async def update_favorite_folder(
    folder_id: int,
    folder_data: schemas.FavoriteFolderUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """更新收藏文件夹"""
    # 获取文件夹
    folder = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.id == folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件夹不存在"
        )

    # 检查权限
    if folder.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限修改此文件夹"
        )

    # 更新字段
    if folder_data.name is not None:
        if not folder_data.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件夹名称不能为空"
            )

        # 检查同名文件夹（排除自己）
        existing = db.query(models.FavoriteFolder).filter(
            models.FavoriteFolder.user_id == current_user.id,
            models.FavoriteFolder.name == folder_data.name.strip(),
            models.FavoriteFolder.id != folder_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件夹名称已存在"
            )

        folder.name = folder_data.name.strip()

    if folder_data.is_public is not None:
        folder.is_public = folder_data.is_public

    db.commit()
    db.refresh(folder)

    # 统计收藏数量
    count = db.query(models.Favorite).filter(
        models.Favorite.folder_id == folder.id
    ).count()

    return schemas.FavoriteFolderRead(
        id=folder.id,
        user_id=folder.user_id,
        name=folder.name,
        is_public=folder.is_public,
        favorites_count=count,
        created_at=folder.created_at
    )


@router.delete("/users/favorites/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite_folder(
    folder_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """删除收藏文件夹"""
    # 获取文件夹
    folder = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.id == folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件夹不存在"
        )

    # 检查权限
    if folder.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此文件夹"
        )

    # 删除文件夹（级联删除所有收藏）
    db.delete(folder)
    db.commit()

    return None


# ============================================
# 收藏博客
# ============================================

@router.post("/blogs/{blog_id}/favorite", response_model=schemas.FavoriteResponse)
async def favorite_blog(
    blog_id: int,
    favorite_data: schemas.FavoriteCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """收藏博客到指定文件夹"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查文件夹是否存在
    folder = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.id == favorite_data.folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件夹不存在"
        )

    # 验证文件夹权限
    if folder.user_id != current_user.id and not folder.is_public:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能收藏到别人的私有文件夹"
        )

    # 检查是否已收藏
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.blog_id == blog_id,
        models.Favorite.folder_id == favorite_data.folder_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="该博客已在此文件夹中"
        )

    # 创建收藏记录
    favorite = models.Favorite(
        user_id=current_user.id,
        blog_id=blog_id,
        folder_id=favorite_data.folder_id
    )
    db.add(favorite)

    # 更新收藏数（如果这是第一次收藏该博客）
    existing_any = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.blog_id == blog_id
    ).first()

    if not existing_any:
        blog.favorites_count += 1

        # 创建通知（如果收藏者不是作者）
        if current_user.id != blog.author_id:
            favoriter_name = current_user.nickname or current_user.username
            notification = models.Notification(
                user_id=blog.author_id,
                type="blog_favorited",
                title=f"{favoriter_name} 收藏了你的博客《{blog.title}》",
                content=f"{favoriter_name} 收藏了你的博客到文件夹「{folder.name}」",
                related_type="blog",
                related_id=blog.id,
                related_url=f"/blogs/{blog.id}"
            )
            db.add(notification)

    db.commit()

    return schemas.FavoriteResponse(
        favorited=True,
        favorites_count=blog.favorites_count
    )


@router.delete("/blogs/{blog_id}/favorite", response_model=schemas.FavoriteResponse)
async def unfavorite_blog(
    blog_id: int,
    favorite_data: schemas.FavoriteDelete | None,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """取消收藏博客"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 构建查询
    query = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.blog_id == blog_id
    )

    # 如果指定了文件夹，只删除该文件夹的收藏
    if favorite_data and favorite_data.folder_id is not None:
        query = query.filter(models.Favorite.folder_id == favorite_data.folder_id)

    # 检查是否存在收藏记录
    favorites = query.all()
    if not favorites:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未收藏过该博客"
        )

    # 删除收藏记录
    for favorite in favorites:
        db.delete(favorite)

    # 检查是否还有其他文件夹的收藏
    remaining = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.blog_id == blog_id
    ).count()

    # 如果这是最后一次收藏，更新收藏数
    if remaining == 0:
        blog.favorites_count -= 1

    db.commit()

    return schemas.FavoriteResponse(
        favorited=remaining > 0,
        favorites_count=blog.favorites_count
    )


@router.get("/blogs/{blog_id}/favorite/status", response_model=schemas.FavoriteStatusResponse)
async def get_favorite_status(
    blog_id: int,
    current_user: dependencies.CurrentUserOptional,
    db: dependencies.DbSession
):
    """查询收藏状态"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    folders = []
    is_favorited = False

    if current_user:
        # 查询收藏记录
        favorites = db.query(models.Favorite).options(
            joinedload(models.Favorite.folder)
        ).filter(
            models.Favorite.user_id == current_user.id,
            models.Favorite.blog_id == blog_id
        ).all()

        is_favorited = len(favorites) > 0

        for favorite in favorites:
            if favorite.folder:
                folders.append(schemas.FavoriteFolderInfo(
                    id=favorite.folder.id,
                    name=favorite.folder.name
                ))

    return schemas.FavoriteStatusResponse(
        is_favorited=is_favorited,
        folders=folders,
        favorites_count=blog.favorites_count
    )


@router.get("/users/favorites", response_model=schemas.BlogListResponse)
async def get_all_favorites(
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """获取用户的所有收藏"""
    from sqlalchemy import distinct

    # 子查询：获取最早收藏的博客ID（去重）
    subquery = db.query(
        models.Favorite.blog_id,
        models.Favorite.created_at.label("favorited_at")
    ).filter(
        models.Favorite.user_id == current_user.id
    ).group_by(
        models.Favorite.blog_id
    ).order_by(
        models.Favorite.created_at.asc()
    ).subquery()

    # 统计总数
    total = db.query(func.count(distinct(models.Favorite.blog_id))).filter(
        models.Favorite.user_id == current_user.id
    ).scalar()

    from sqlalchemy import func as sqlalchemy_func

    # 查询收藏记录
    query = db.query(models.Favorite).options(
        joinedload(models.Favorite.blog).joinedload(models.Blog.author)
    ).filter(
        models.Favorite.user_id == current_user.id
    ).order_by(
        models.Favorite.created_at.desc()
    )

    # 分页
    favorites = query.offset((page - 1) * size).limit(size).all()

    # 去重（同一博客可能在多个文件夹）
    seen_blogs = set()
    items = []

    for favorite in favorites:
        if favorite.blog and favorite.blog.id not in seen_blogs:
            seen_blogs.add(favorite.blog.id)
            blog = favorite.blog
            excerpt = schemas.generate_excerpt(blog.content)

            # 获取收藏的文件夹列表
            folder_favorites = db.query(models.Favorite).options(
                joinedload(models.Favorite.folder)
            ).filter(
                models.Favorite.user_id == current_user.id,
                models.Favorite.blog_id == blog.id
            ).all()

            folders = []
            for ff in folder_favorites:
                if ff.folder:
                    folders.append(schemas.FavoriteFolderInfo(
                        id=ff.folder.id,
                        name=ff.folder.name
                    ))

            # 检查当前用户的点赞/收藏状态
            is_liked = False
            like = db.query(models.Like).filter(
                models.Like.user_id == current_user.id,
                models.Like.blog_id == blog.id
            ).first()
            is_liked = like is not None

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
                is_favorited=True,
                created_at=blog.created_at,
                folders=folders,
                favorited_at=favorite.created_at
            ))

            if len(items) >= size:
                break

    return schemas.BlogListResponse(
        total=total or 0,
        page=page,
        size=size,
        items=items
    )


@router.get("/users/favorites/folders/{folder_id}", response_model=schemas.BlogListResponse)
async def get_folder_favorites(
    folder_id: int,
    current_user: dependencies.CurrentUser,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(dependencies.get_db)
):
    """获取文件夹收藏列表"""
    # 获取文件夹
    folder = db.query(models.FavoriteFolder).filter(
        models.FavoriteFolder.id == folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件夹不存在"
        )

    # 验证权限（创建者或公开文件夹）
    if folder.user_id != current_user.id and not folder.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限查看此文件夹"
        )

    # 查询收藏记录
    query = db.query(models.Favorite).options(
        joinedload(models.Favorite.blog).joinedload(models.Blog.author)
    ).filter(
        models.Favorite.folder_id == folder_id
    )

    # 统计总数
    total = query.count()

    # 分页查询（按收藏时间倒序）
    favorites = query.order_by(models.Favorite.created_at.desc()).offset(
        (page - 1) * size
    ).limit(size).all()

    # 构造响应
    items = []
    for favorite in favorites:
        if favorite.blog:
            blog = favorite.blog
            excerpt = schemas.generate_excerpt(blog.content)

            # 检查当前用户的点赞/收藏状态
            is_liked = False
            is_favorited = False

            like = db.query(models.Like).filter(
                models.Like.user_id == current_user.id,
                models.Like.blog_id == blog.id
            ).first()
            is_liked = like is not None

            fav = db.query(models.Favorite).filter(
                models.Favorite.user_id == current_user.id,
                models.Favorite.blog_id == blog.id
            ).first()
            is_favorited = fav is not None

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
                created_at=blog.created_at,
                favorited_at=favorite.created_at
            ))

    return schemas.BlogListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )

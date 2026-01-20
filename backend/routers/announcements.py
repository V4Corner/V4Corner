# 班级通知相关路由

from fastapi import APIRouter, HTTPException, Query, status

import dependencies, models, schemas

router = APIRouter(prefix="/api/announcements", tags=["班级通知"])


@router.get("", response_model=schemas.AnnouncementListResponse)
async def list_announcements(
    db: dependencies.DbSession,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(5, ge=1, le=50, description="每页数量"),
):
    """获取班级通知列表"""
    query = db.query(models.Announcement)
    total = query.count()

    announcements = (
        query.order_by(
            models.Announcement.is_pinned.desc(),
            models.Announcement.published_at.desc(),
        )
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    items = [schemas.AnnouncementRead.model_validate(item) for item in announcements]

    return schemas.AnnouncementListResponse(
        total=total,
        page=page,
        size=size,
        items=items,
    )


@router.post("", response_model=schemas.AnnouncementRead, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    payload: schemas.AnnouncementCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """创建班级通知"""
    announcement = models.Announcement(
        title=payload.title,
        content=payload.content,
        is_pinned=payload.is_pinned,
        created_by=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return schemas.AnnouncementRead.model_validate(announcement)


@router.put("/{announcement_id}", response_model=schemas.AnnouncementRead)
async def update_announcement(
    announcement_id: int,
    payload: schemas.AnnouncementUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """更新班级通知"""
    announcement = (
        db.query(models.Announcement)
        .filter(models.Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="通知不存在")

    if payload.title is not None:
        announcement.title = payload.title
    if payload.content is not None:
        announcement.content = payload.content
    if payload.is_pinned is not None:
        announcement.is_pinned = payload.is_pinned

    db.commit()
    db.refresh(announcement)

    return schemas.AnnouncementRead.model_validate(announcement)


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """删除班级通知"""
    announcement = (
        db.query(models.Announcement)
        .filter(models.Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="通知不存在")

    db.delete(announcement)
    db.commit()

    return None

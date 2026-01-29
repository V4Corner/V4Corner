# 用户通知相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from typing import Optional

import dependencies, models, schemas

router = APIRouter(prefix="/api/notifications", tags=["通知"])


def format_time_display(created_at) -> str:
    """格式化时间显示（如"5分钟前"、"昨天"）"""
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    delta = now - created_at

    if delta < timedelta(minutes=1):
        return "刚刚"
    elif delta < timedelta(hours=1):
        return f"{delta.seconds // 60}分钟前"
    elif delta < timedelta(days=1):
        return f"{delta.seconds // 3600}小时前"
    elif delta < timedelta(days=2):
        return "昨天"
    elif delta < timedelta(days=7):
        return f"{delta.days}天前"
    else:
        return created_at.strftime("%Y-%m-%d")


@router.get("", response_model=schemas.NotificationListResponse)
async def get_notifications(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser,
    unread_only: bool = Query(False, description="仅显示未读通知"),
    type_filter: Optional[str] = Query(None, alias="type", description="筛选通知类型"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取当前用户的通知列表"""
    # 构建查询
    query = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )

    # 筛选未读
    if unread_only:
        query = query.filter(models.Notification.is_read == False)

    # 按类型筛选
    if type_filter:
        query = query.filter(models.Notification.type == type_filter)

    # 统计总数和未读数
    total = query.count()
    unread_count = db.query(func.count(models.Notification.id)).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).scalar()

    # 按创建时间倒序
    query = query.order_by(desc(models.Notification.created_at))

    # 分页
    notifications = query.offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for notification in notifications:
        items.append(schemas.NotificationWithTimeDisplay(
            id=notification.id,
            type=notification.type,
            title=notification.title,
            content=notification.content,
            related_type=notification.related_type,
            related_id=notification.related_id,
            related_url=notification.related_url,
            is_read=notification.is_read,
            created_at=notification.created_at,
            time_display=format_time_display(notification.created_at)
        ))

    return schemas.NotificationListResponse(
        total=total,
        unread_count=unread_count or 0,
        page=page,
        size=size,
        items=items
    )


@router.post("/read-all", response_model=schemas.NotificationMarkReadResponse)
async def mark_all_read(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """标记所有通知为已读"""
    # 查询所有未读通知
    unread_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).all()

    marked_count = len(unread_notifications)

    # 批量更新
    for notification in unread_notifications:
        notification.is_read = True

    db.commit()

    return schemas.NotificationMarkReadResponse(
        message="已标记所有通知为已读",
        marked_count=marked_count
    )


@router.put("/{notification_id}/read", response_model=schemas.NotificationRead)
async def mark_notification_read(
    notification_id: int,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """标记单个通知为已读"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )

    # 权限检查
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此通知"
        )

    # 标记已读
    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return schemas.NotificationRead(
        id=notification.id,
        type=notification.type,
        title=notification.title,
        content=notification.content,
        related_type=notification.related_type,
        related_id=notification.related_id,
        related_url=notification.related_url,
        is_read=notification.is_read,
        created_at=notification.created_at
    )


@router.delete("", response_model=schemas.NotificationDeleteResponse)
async def delete_notifications(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser,
    all: bool = Query(False, description="是否清除所有通知")
):
    """清除通知"""
    query = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )

    if not all:
        # 仅清除已读
        query = query.filter(models.Notification.is_read == True)

    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()

    return schemas.NotificationDeleteResponse(
        message=f"已清除 {deleted_count} 条通知",
        deleted_count=deleted_count
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """删除单个通知"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )

    # 权限检查
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此通知"
        )

    db.delete(notification)
    db.commit()

    return None


@router.get("/unread-count", response_model=schemas.NotificationUnreadCountResponse)
async def get_unread_count(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """获取未读通知数量"""
    from sqlalchemy import func

    unread_count = db.query(func.count(models.Notification.id)).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).scalar()

    return schemas.NotificationUnreadCountResponse(
        unread_count=unread_count or 0
    )

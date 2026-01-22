from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.activity import Activity
from models.user import User
from schemas.activity import (
    ActivityCreate,
    ActivityListResponse,
    ActivityLatestResponse,
    ActivityListItem,
)

router = APIRouter(prefix="/api/activities", tags=["Activity"])


def generate_time_display(created_at: datetime) -> str:
    """生成友好的时间显示"""
    now = datetime.utcnow()
    # 确保 created_at 也是 naive datetime
    if created_at.tzinfo is not None:
        created_at = created_at.replace(tzinfo=None)
    delta = now - created_at

    if delta < timedelta(minutes=1):
        return "刚刚"
    elif delta < timedelta(hours=1):
        minutes = delta.seconds // 60
        return f"{minutes}分钟前"
    elif delta < timedelta(days=1):
        hours = delta.seconds // 3600
        return f"{hours}小时前"
    elif delta < timedelta(days=2):
        return "昨天"
    elif delta < timedelta(days=7):
        days = delta.days
        return f"{days}天前"
    else:
        return created_at.strftime("%m-%d")


def activity_to_dict(activity: Activity, db: Session) -> dict:
    """将 Activity 对象转换为字典"""
    return {
        "id": activity.id,
        "type": activity.type,
        "user": {
            "id": activity.user.id,
            "username": activity.user.username,
            "nickname": activity.user.nickname,
            "avatar": activity.user.avatar_url,
        },
        "content": activity.content,
        "target": {
            "type": activity.target_type,
            "id": activity.target_id,
            "title": activity.target_title,
            "url": f"/{activity.target_type}s/{activity.target_id}" if activity.target_type else None,
        } if activity.target_type else None,
        "created_at": activity.created_at,
        "time_display": generate_time_display(activity.created_at),
    }


@router.get("", response_model=ActivityListResponse)
def get_activities(
    page: int = 1,
    size: int = 20,
    type: str | None = None,
    db: Session = Depends(get_db),
):
    """
    获取动态列表（公开接口）

    - **page**: 页码（默认1）
    - **size**: 每页数量（默认20，最大50）
    - **type**: 筛选动态类型（可选）
    """
    # 限制每页最大数量
    size = min(size, 50)

    # 构建查询
    query = db.query(Activity)

    if type:
        query = query.filter(Activity.type == type)

    # 计算总数
    total = query.count()

    # 分页查询
    activities = (
        query.order_by(Activity.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    # 转换为响应格式
    items = []
    for activity in activities:
        target_title = activity.target_title
        target_url = None

        if activity.target_type and activity.target_id:
            target_url = f"/{activity.target_type}s/{activity.target_id}"

        items.append({
            "id": activity.id,
            "type": activity.type,
            "user_name": activity.user_name,
            "content": activity.content,
            "target_title": target_title,
            "target_url": target_url,
            "created_at": activity.created_at,
            "time_display": generate_time_display(activity.created_at),
        })

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items,
    }


@router.get("/latest", response_model=ActivityLatestResponse)
def get_latest_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    获取最新动态（用于首页展示，简化版）

    - **limit**: 返回数量（默认10，最大20）
    """
    limit = min(limit, 20)

    activities = (
        db.query(Activity)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .all()
    )

    items = []
    for activity in activities:
        target_title = activity.target_title
        target_url = None

        if activity.target_type and activity.target_id:
            target_url = f"/{activity.target_type}s/{activity.target_id}"

        items.append({
            "id": activity.id,
            "type": activity.type,
            "user_name": activity.user_name,
            "content": activity.content,
            "target_title": target_title,
            "target_url": target_url,
            "created_at": activity.created_at,
            "time_display": generate_time_display(activity.created_at),
        })

    return {"items": items}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    创建动态记录（内部接口）

    - **type**: 动态类型（blog_created/notice_published/checkin_streak等）
    - **target_type**: 关联对象类型
    - **target_id**: 关联对象ID
    - **target_title**: 关联对象标题

    注意：此接口主要用于系统内部调用
    """
    # 创建动态记录
    new_activity = Activity(
        type=activity.type,
        user_id=current_user.id,
        user_name=current_user.nickname or current_user.username,
        content=activity.content,
        target_type=activity.target_type,
        target_id=activity.target_id,
        target_title=activity.target_title,
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return activity_to_dict(new_activity, db)

# 班级通知相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

import dependencies, models, schemas
from models.activity import Activity

router = APIRouter(prefix="/api/notices", tags=["班级通知"])


@router.get("", response_model=schemas.NoticeListResponse)
async def list_notices(
    db: dependencies.DbSession,
    is_important: Optional[bool] = Query(None, description="是否仅显示重要通知"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=50, description="每页数量")
):
    """
    获取通知列表（公开接口）

    - **page**: 页码（从1开始）
    - **size**: 每页数量（默认10，最大50）
    - **is_important**: 是否仅显示重要通知（可选）
    """
    # 构建查询
    query = db.query(models.Notice).options(joinedload(models.Notice.author))

    # 按重要程度筛选
    if is_important is not None:
        query = query.filter(models.Notice.is_important == is_important)

    # 统计总数
    total = query.count()

    # 排序：重要通知优先，然后按发布时间倒序
    query = query.order_by(
        models.Notice.is_important.desc(),
        models.Notice.published_at.desc()
    )

    # 分页查询
    notices = query.offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = [schemas.NoticeListItem.from_orm_with_excerpt(notice) for notice in notices]

    return schemas.NoticeListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )


@router.get("/latest", response_model=schemas.NoticeLatestResponse)
async def get_latest_notices(
    db: dependencies.DbSession,
    limit: int = Query(3, ge=1, le=5, description="返回数量")
):
    """
    获取最新通知（首页用）

    - **limit**: 返回数量（默认3，最大5）
    """
    # 查询最新通知，重要通知优先
    notices = db.query(models.Notice).order_by(
        models.Notice.is_important.desc(),
        models.Notice.published_at.desc()
    ).limit(limit).all()

    # 构造响应
    items = [schemas.NoticeMini.from_orm_with_date(notice) for notice in notices]

    return schemas.NoticeLatestResponse(items=items)


@router.get("/{notice_id}", response_model=schemas.NoticeDetail)
async def get_notice(
    notice_id: int,
    current_user: dependencies.CurrentUserOptional,
    db: dependencies.DbSession
):
    """
    获取通知详情（公开接口）

    - **notice_id**: 通知 ID
    - 每次调用浏览量 +1
    """
    # 查询通知
    notice = db.query(models.Notice).options(
        joinedload(models.Notice.author)
    ).filter(models.Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )

    # 增加浏览次数
    notice.views += 1
    db.commit()
    db.refresh(notice)

    # 构造响应（包含权限信息）
    return schemas.NoticeDetail.from_orm_with_permission(notice, current_user)


@router.post("", response_model=schemas.NoticeDetail, status_code=status.HTTP_201_CREATED)
async def create_notice(
    notice_data: schemas.NoticeCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """
    创建通知（需要认证，管理员/班委）

    - **title**: 标题（1-200字符）
    - **content**: 内容（Markdown，1-10000字符）
    - **is_important**: 是否重要（可选，默认false）
    """
    # TODO: 添加权限检查，限制管理员和班委
    # 目前所有登录用户都可以发布通知，后续可以根据需要添加角色检查

    # 创建通知
    notice = models.Notice(
        title=notice_data.title,
        content=notice_data.content,
        is_important=notice_data.is_important,
        author_id=current_user.id,
        author_name=current_user.nickname or current_user.username
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    # 记录动态
    activity = Activity(
        type="notice_published",
        user_id=current_user.id,
        user_name=current_user.nickname or current_user.username,
        content="发布了通知",
        target_type="notice",
        target_id=notice.id,
        target_title=notice.title
    )
    db.add(activity)
    db.commit()

    # 重新加载以获取关联数据
    notice = db.query(models.Notice).options(
        joinedload(models.Notice.author)
    ).filter(models.Notice.id == notice.id).first()

    # 构造响应
    return schemas.NoticeDetail.from_orm_with_permission(notice, current_user)


@router.put("/{notice_id}", response_model=schemas.NoticeDetail)
async def update_notice(
    notice_id: int,
    notice_data: schemas.NoticeUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """
    更新通知（需要认证，管理员或发布者本人）

    - **notice_id**: 通知 ID
    - 所有字段均为可选
    """
    # 查询通知
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )

    # 权限检查：管理员或发布者本人
    is_owner = current_user.id == notice.author_id
    is_admin = current_user.role == "admin"  # TODO: 根据实际角色字段调整

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限编辑此通知"
        )

    # 更新字段
    if notice_data.title is not None:
        notice.title = notice_data.title
    if notice_data.content is not None:
        notice.content = notice_data.content
    if notice_data.is_important is not None:
        notice.is_important = notice_data.is_important

    db.commit()
    db.refresh(notice)

    # 重新加载以获取关联数据
    notice = db.query(models.Notice).options(
        joinedload(models.Notice.author)
    ).filter(models.Notice.id == notice.id).first()

    # 构造响应
    return schemas.NoticeDetail.from_orm_with_permission(notice, current_user)


@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notice(
    notice_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """
    删除通知（需要认证，管理员或发布者本人）

    - **notice_id**: 通知 ID
    """
    # 查询通知
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )

    # 权限检查：管理员或发布者本人
    is_owner = current_user.id == notice.author_id
    is_admin = current_user.role == "admin"  # TODO: 根据实际角色字段调整

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此通知"
        )

    # 删除通知
    db.delete(notice)
    db.commit()

    return None

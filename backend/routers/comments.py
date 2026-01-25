# 评论相关路由

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case, desc
from typing import Optional
from datetime import datetime, timedelta

import dependencies, models, schemas, auth

router = APIRouter(prefix="/api", tags=["评论"])

# 评论频率限制（秒）
COMMENT_RATE_LIMIT_SECONDS = 2

# 存储每个用户最后一次尝试发表评论的时间
user_last_comment_attempt: dict[int, datetime] = {}


@router.get("/test-comment-debug")
async def test_debug():
    """测试端点：验证后端是否重启"""
    return {"status": "ok", "message": "后端已重启，新代码已生效", "timestamp": "now"}


def get_comment_depth(comment_id: int, db: Session) -> int:
    """获取评论的嵌套深度（0=顶级, 1=一级回复, 2=二级回复）"""
    depth = 0
    current = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    while current and current.parent_id:
        depth += 1
        if depth >= 2:  # 最多2层
            break
        current = db.query(models.Comment).filter(models.Comment.id == current.parent_id).first()
    return depth


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


@router.get("/blogs/{blog_id}/comments", response_model=schemas.CommentListResponse)
async def get_blog_comments(
    blog_id: int,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUserOptional,
    sort: str = Query("asc", description="排序方式: asc(时间正序), desc(时间倒序), hot(热度)"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=50, description="每页数量")
):
    """获取博客的评论列表"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 构建查询（排除已删除的评论）
    query = db.query(models.Comment).options(
        joinedload(models.Comment.user),
        joinedload(models.Comment.parent)
    ).filter(
        models.Comment.blog_id == blog_id
    )

    # 统计总数（排除已删除的评论）
    total = db.query(func.count(models.Comment.id)).filter(
        models.Comment.blog_id == blog_id,
        models.Comment.is_deleted == False
    ).scalar() or 0

    # 应用已删除过滤
    query = query.filter(models.Comment.is_deleted == False)

    # 排序
    if sort == "asc":
        # 时间正序（旧→新）
        query = query.order_by(models.Comment.created_at.asc())
    elif sort == "desc":
        # 时间倒序（新→旧）
        query = query.order_by(models.Comment.created_at.desc())
    elif sort == "hot":
        # 热度排序（子查询计算回复数，排除已删除的）
        subquery = db.query(
            models.Comment.parent_id,
            func.count(models.Comment.id).label('replies_count')
        ).filter(
            models.Comment.is_deleted == False
        ).group_by(
            models.Comment.parent_id
        ).subquery()

        query = query.outerjoin(
            subquery,
            models.Comment.id == subquery.c.parent_id
        ).order_by(
            desc(subquery.c.replies_count),  # 按回复数降序
            models.Comment.created_at.desc()  # 回复数相同按时间降序
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的排序参数，仅支持 asc/desc/hot"
        )

    # 分页
    comments = query.offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = []
    for comment in comments:
        # 统计子评论数量（排除已删除的）
        replies_count = db.query(func.count(models.Comment.id)).filter(
            models.Comment.parent_id == comment.id,
            models.Comment.is_deleted == False
        ).scalar() or 0

        # 获取父评论作者名
        parent_author = None
        effective_parent_id = comment.parent_id  # 实际使用的 parent_id

        if comment.parent:
            if comment.parent.is_deleted:
                # 父评论已删除，将此评论作为顶级评论
                effective_parent_id = None
                parent_author = None
            elif comment.parent.user:
                parent_author = comment.parent.user.nickname or comment.parent.user.username

        # 判断是否可编辑
        can_edit = bool(current_user and current_user.id == comment.user_id)

        # 判断是否为博客作者
        is_author = bool(current_user and current_user.id == blog.author_id)

        # 软删除：内容显示为"已删除"
        content = comment.content
        if comment.is_deleted:
            content = "已删除"

        items.append(schemas.CommentRead(
            id=comment.id,
            content=content,
            author=schemas.CommentAuthor(
                id=comment.user.id,
                username=comment.user.username,
                nickname=comment.user.nickname,
                avatar_url=comment.user.avatar_url
            ),
            parent_id=effective_parent_id,  # 使用调整后的 parent_id
            parent_author=parent_author,
            replies_count=replies_count,
            is_deleted=comment.is_deleted,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            is_author=is_author,
            can_edit=can_edit
        ))

    return schemas.CommentListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )


@router.post("/blogs/{blog_id}/comments", response_model=schemas.CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    blog_id: int,
    comment: schemas.CommentCreate,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """发表评论"""
    # 检查博客是否存在
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )

    # 检查每日评论限制（500条/天）
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_comment_count = db.query(models.Comment).filter(
        models.Comment.user_id == current_user.id,
        models.Comment.created_at >= today_start
    ).count()

    if daily_comment_count >= 500:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="每日评论数量已达上限（500条/天），请明天再试"
        )

    # 检查评论频率限制（每次尝试提交后重新计时）
    now = datetime.utcnow()
    last_attempt = user_last_comment_attempt.get(current_user.id)

    if last_attempt:
        time_since_last = (now - last_attempt).total_seconds()
        if time_since_last < COMMENT_RATE_LIMIT_SECONDS:
            # 更新最后尝试时间（重新计时）
            user_last_comment_attempt[current_user.id] = now
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="评论太快了，请稍后再试"
            )

    # 更新最后尝试时间
    user_last_comment_attempt[current_user.id] = now

    # 如果是回复评论，检查父评论是否存在并验证嵌套深度
    if comment.parent_id:
        parent_comment = db.query(models.Comment).filter(
            models.Comment.id == comment.parent_id
        ).first()

        if not parent_comment or parent_comment.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="父评论不存在或已删除"
            )

        # 检查嵌套深度（最多2层）
        parent_depth = get_comment_depth(comment.parent_id, db)
        if parent_depth >= 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="回复层级超过限制，最多支持2层嵌套"
            )

    # 创建评论
    new_comment = models.Comment(
        blog_id=blog_id,
        user_id=current_user.id,
        content=comment.content,
        parent_id=comment.parent_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    # 加载关系
    db.refresh(new_comment)
    if new_comment.parent:
        db.refresh(new_comment.parent)

    # 创建通知
    commenter_name = current_user.nickname or current_user.username

    # 1. 如果是回复评论，通知被回复的用户
    if new_comment.parent_id and new_comment.parent.user_id != current_user.id:
        notification = models.Notification(
            user_id=new_comment.parent.user_id,
            type="comment_reply",
            title=f"{commenter_name} 回复了你的评论",
            content=new_comment.content,
            related_type="comment",
            related_id=new_comment.id,
            related_url=f"/blogs/{blog_id}?comment={new_comment.id}"
        )
        db.add(notification)

    # 2. 如果评论者不是博客作者，通知博客作者
    if current_user.id != blog.author_id:
        # 如果是回复评论，使用 comment_reply_blog 类型
        if new_comment.parent_id:
            notification_type = "comment_reply_blog"
            title = f"{commenter_name} 回复了你博客下的评论"
        else:
            notification_type = "blog_comment"
            title = f"{commenter_name} 评论了你的博客《{blog.title}》"

        notification = models.Notification(
            user_id=blog.author_id,
            type=notification_type,
            title=title,
            content=new_comment.content,
            related_type="blog",
            related_id=blog_id,
            related_url=f"/blogs/{blog_id}?comment={new_comment.id}"
        )
        db.add(notification)

    db.commit()

    # 构造响应
    parent_author = None
    if new_comment.parent and new_comment.parent.user:
        parent_author = new_comment.parent.user.nickname or new_comment.parent.user.username

    return schemas.CommentRead(
        id=new_comment.id,
        content=new_comment.content,
        author=schemas.CommentAuthor(
            id=current_user.id,
            username=current_user.username,
            nickname=current_user.nickname,
            avatar_url=current_user.avatar_url
        ),
        parent_id=new_comment.parent_id,
        parent_author=parent_author,
        replies_count=0,
        is_deleted=False,
        created_at=new_comment.created_at,
        updated_at=None,
        is_author=bool(current_user.id == blog.author_id),
        can_edit=True
    )


@router.put("/comments/{comment_id}", response_model=schemas.CommentRead)
async def update_comment(
    comment_id: int,
    comment_update: schemas.CommentUpdate,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """编辑评论"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评论不存在"
        )

    # 权限检查
    if current_user.id != comment.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限编辑此评论"
        )

    # 已删除的评论不能编辑
    if comment.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已删除的评论不能编辑"
        )

    # 更新内容
    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)

    # 构造响应
    parent_author = None
    if comment.parent and comment.parent.user:
        parent_author = comment.parent.user.nickname or comment.parent.user.username

    return schemas.CommentRead(
        id=comment.id,
        content=comment.content,
        author=schemas.CommentAuthor(
            id=comment.user.id,
            username=comment.user.username,
            nickname=comment.user.nickname,
            avatar_url=comment.user.avatar_url
        ),
        parent_id=comment.parent_id,
        parent_author=parent_author,
        replies_count=0,  # 暂不计算
        is_deleted=comment.is_deleted,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        is_author=False,
        can_edit=True  # 编辑自己的评论
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser
):
    """删除评论（软删除）"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评论不存在"
        )

    # 权限检查：评论作者或博客作者可以删除
    blog = db.query(models.Blog).filter(models.Blog.id == comment.blog_id).first()
    if current_user.id != comment.user_id and current_user.id != blog.author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此评论"
        )

    # 软删除（级联删除所有子评论）
    def delete_comment_recursive(comment_id: int):
        """递归删除评论及其所有子评论"""
        # 获取所有直接子评论
        children = db.query(models.Comment).filter(
            models.Comment.parent_id == comment_id,
            models.Comment.is_deleted == False
        ).all()

        # 递归删除每个子评论
        for child in children:
            delete_comment_recursive(child.id)
            child.is_deleted = True

        # 标记当前评论为已删除
        current = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
        if current:
            current.is_deleted = True

    # 执行级联软删除
    delete_comment_recursive(comment_id)
    db.commit()

    return None

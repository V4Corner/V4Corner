from sqlalchemy.orm import Session

from database import get_db
from fastapi import APIRouter, Depends
from models import blog, user

router = APIRouter(prefix="/api/stats", tags=["Statistics"])


@router.get("")
async def get_class_stats(db: Session = Depends(get_db)):
    """获取班级统计数据

    Returns:
        {
            "member_count": 班级成员总数,
            "blog_count": 发布博客总数,
            "longest_streak": 最长连续签到天数 (TODO: 待实现签到系统后填充真实数据)
        }
    """
    # 统计班级成员数
    member_count = db.query(user.User).count()

    # 统计博客总数
    blog_count = db.query(blog.Blog).count()

    # 最长连续签到天数 - 暂时返回0，待实现签到系统后更新
    longest_streak = 0

    return {
        "member_count": member_count,
        "blog_count": blog_count,
        "longest_streak": longest_streak,
    }

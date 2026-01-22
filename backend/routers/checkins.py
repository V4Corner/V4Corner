from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import dependencies
import models
import schemas
from models.checkin import generate_fortune, calculate_streak
from models.activity import Activity


router = APIRouter(prefix="/api/checkins", tags=["Check-ins"])


@router.post("", response_model=schemas.CheckInResponse)
async def create_checkin(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser,
):
    """用户签到/打卡

    随机生成运势（大吉/中吉/小吉/末吉/凶）和宜忌建议

    Returns:
        {
            "id": 签到ID,
            "fortune": "大吉",
            "good": ["写代码", "复习"],
            "bad": ["熬夜", "刷手机"],
            "streak": 连续签到天数,
            "checkin_date": "2025-01-22"
        }
    """
    today = date.today()

    # 检查今天是否已签到
    existing_checkin = (
        db.query(models.CheckIn)
        .filter(models.CheckIn.user_id == current_user.id, models.CheckIn.checkin_date == today)
        .first()
    )

    if existing_checkin:
        raise HTTPException(status_code=400, detail="今天已经签到过了")

    # 生成运势
    fortune_data = generate_fortune()

    # 创建签到记录
    checkin = models.CheckIn(
        user_id=current_user.id,
        checkin_date=today,
        fortune=fortune_data["fortune"],
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    # 获取用户的所有签到记录（按日期降序）
    all_checkins = (
        db.query(models.CheckIn.checkin_date)
        .filter(models.CheckIn.user_id == current_user.id)
        .order_by(models.CheckIn.checkin_date.desc())
        .all()
    )
    checkin_dates = [c.checkin_date for c in all_checkins]

    # 计算连续签到天数
    streak = calculate_streak(checkin_dates)

    # 记录里程碑动态
    activity = None
    if streak == 7:
        activity = Activity(
            type="checkin_streak",
            user_id=current_user.id,
            user_name=current_user.nickname or current_user.username,
            content=f"连续签到7天",
            target_type="checkin",
            target_id=checkin.id,
            target_title=f"连续签到{streak}天"
        )
    elif streak == 30:
        activity = Activity(
            type="checkin_streak",
            user_id=current_user.id,
            user_name=current_user.nickname or current_user.username,
            content=f"连续签到30天",
            target_type="checkin",
            target_id=checkin.id,
            target_title=f"连续签到{streak}天"
        )
    elif streak == 1:
        # 首次签到
        activity = Activity(
            type="checkin_first",
            user_id=current_user.id,
            user_name=current_user.nickname or current_user.username,
            content=f"完成首次签到",
            target_type="checkin",
            target_id=checkin.id,
            target_title="首次签到"
        )

    if activity:
        db.add(activity)
        db.commit()

    return schemas.CheckInResponse(
        id=checkin.id,
        fortune=fortune_data["fortune"],
        good=fortune_data["good"],
        bad=fortune_data["bad"],
        streak=streak,
        checkin_date=checkin.checkin_date.isoformat(),
    )


@router.get("/status", response_model=schemas.CheckInStatus)
async def get_checkin_status(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser,
):
    """获取用户签到状态

    Returns:
        {
            "checked_today": 是否今天已签到,
            "current_streak": 当前连续签到天数
        }
    """
    today = date.today()

    # 检查今天是否已签到
    today_checkin = (
        db.query(models.CheckIn)
        .filter(models.CheckIn.user_id == current_user.id, models.CheckIn.checkin_date == today)
        .first()
    )

    # 获取所有签到记录
    all_checkins = (
        db.query(models.CheckIn.checkin_date)
        .filter(models.CheckIn.user_id == current_user.id)
        .order_by(models.CheckIn.checkin_date.desc())
        .all()
    )
    checkin_dates = [c.checkin_date for c in all_checkins]

    # 计算连续签到天数
    streak = calculate_streak(checkin_dates)

    return schemas.CheckInStatus(
        checked_today=today_checkin is not None,
        current_streak=streak,
    )


@router.get("/streak", response_model=schemas.CheckInStreak)
async def get_checkin_streak(
    db: dependencies.DbSession,
    current_user: dependencies.CurrentUser,
):
    """获取用户连续签到统计

    Returns:
        {
            "longest_streak": 历史最长连续签到天数,
            "current_streak": 当前连续签到天数
        }
    """
    # 获取所有签到记录
    all_checkins = (
        db.query(models.CheckIn.checkin_date)
        .filter(models.CheckIn.user_id == current_user.id)
        .order_by(models.CheckIn.checkin_date.asc())
        .all()
    )
    checkin_dates = [c.checkin_date for c in all_checkins]

    if not checkin_dates:
        return schemas.CheckInStreak(longest_streak=0, current_streak=0)

    # 计算当前连续签到天数（从最近的开始算）
    current_streak = calculate_streak(checkin_dates[::-1])  # 反转列表，最新的在前

    # 计算历史最长连续签到天数
    longest_streak = 0
    temp_streak = 1

    for i in range(1, len(checkin_dates)):
        from datetime import timedelta

        if checkin_dates[i] == checkin_dates[i - 1] + timedelta(days=1):
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak)

    return schemas.CheckInStreak(
        longest_streak=longest_streak,
        current_streak=current_streak,
    )

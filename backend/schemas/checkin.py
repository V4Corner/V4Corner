from datetime import date
from pydantic import BaseModel


class ActivityItem(BaseModel):
    """活动项"""
    title: str
    desc: str


class CheckInCreate(BaseModel):
    """创建签到请求"""
    pass  # 不需要额外字段，user_id 和 checkin_date 从请求中获取


class CheckInResponse(BaseModel):
    """签到响应"""
    id: int
    fortune: str
    good: list[ActivityItem]
    bad: list[ActivityItem]
    streak: int
    checkin_date: str


class CheckInStatus(BaseModel):
    """签到状态"""
    checked_today: bool
    current_streak: int


class CheckInStreak(BaseModel):
    """连续签到统计"""
    longest_streak: int
    current_streak: int

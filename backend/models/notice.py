from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def generate_date_display(published_at: datetime) -> str:
    """生成显示用日期 (MM-DD)"""
    return published_at.strftime("%m-%d")


def generate_excerpt(content: str, max_length: int = 100) -> str:
    """生成通知摘要"""
    # 移除 Markdown 标记
    import re
    # 简单的 Markdown 清理（移除标题、粗体、链接等）
    content = re.sub(r'^#+\s+', '', content, flags=re.MULTILINE)  # 移除标题
    content = re.sub(r'\*\*(.+?)\*\*', r'\1', content)  # 移除粗体
    content = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', content)  # 移除链接
    content = re.sub(r'[-*]\s+', '', content)  # 移除列表标记
    content = re.sub(r'\n+', ' ', content)  # 替换换行为空格

    if len(content) <= max_length:
        return content
    return content[:max_length] + "..."


class Notice(Base):
    """班级通知模型"""
    __tablename__ = "notices"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(200), nullable=False)
    content: str = Column(Text, nullable=False)
    is_important: bool = Column(Boolean, default=False, index=True)  # 是否重要通知
    author_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name: str = Column(String(50), nullable=False)  # 冗余字段，方便查询
    views: int = Column(Integer, default=0)  # 浏览次数
    published_at: datetime = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
        index=True
    )
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # 关系
    author = relationship("User", back_populates="notices")

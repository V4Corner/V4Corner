# 邮箱验证码模型

from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, Integer, Index
from database import Base


class VerificationCode(Base):
    """邮箱验证码模型"""
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True, comment="邮箱地址")
    code = Column(String(10), nullable=False, comment="验证码")
    type = Column(String(20), nullable=False, default="register", comment="验证码类型: register, reset_password")
    is_used = Column(Integer, default=0, nullable=False, comment="是否已使用")
    expires_at = Column(DateTime(timezone=True), nullable=False, comment="过期时间")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, comment="创建时间")

    # 复合索引：邮箱+类型+是否未使用
    __table_args__ = (
        Index('idx_email_type_unused', 'email', 'type', 'is_used'),
    )

    @classmethod
    def create_verification_code(cls, db, email: str, code: str, code_type: str = "register", expire_minutes: int = 5):
        """创建验证码"""
        expires_at = datetime.utcnow() + timedelta(minutes=expire_minutes)
        verification = cls(
            email=email,
            code=code,
            type=code_type,
            is_used=0,
            expires_at=expires_at
        )
        db.add(verification)
        db.commit()
        db.refresh(verification)
        return verification

    @classmethod
    def get_pending_code(cls, db, email: str, code: str, code_type: str = "register"):
        """获取待验证的验证码"""
        return db.query(cls).filter(
            cls.email == email,
            cls.type == code_type,
            cls.is_used == 0,
            cls.code == code,
            cls.expires_at > datetime.utcnow()
        ).first()

    @classmethod
    def mark_as_used(cls, db, verification_id: int):
        """标记验证码为已使用"""
        verification = db.query(cls).filter(cls.id == verification_id).first()
        if verification:
            verification.is_used = 1
            db.commit()
        return verification

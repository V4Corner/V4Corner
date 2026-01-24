# 验证码相关路由

import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

import dependencies, models, schemas
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/verification", tags=["验证码"])


@router.post("/send", response_model=schemas.VerificationResponse)
async def send_verification_code(
    request: schemas.VerificationRequest,
    db: dependencies.DbSession
):
    """发送验证码（支持短信和邮件）"""

    # 生成随机验证码（6位数字）
    code = ''.join(random.choices(string.digits, k=6))

    # 检查是否在限制时间内（60秒）
    existing_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == request.email,
        models.VerificationCode.type == request.type,
        models.VerificationCode.is_used == 0
    ).order_by(models.VerificationCode.created_at.desc()).first()

    if existing_code:
        time_diff = datetime.utcnow() - existing_code.created_at
        if time_diff < timedelta(seconds=60):
            remaining_seconds = int((timedelta(seconds=60) - time_diff).total_seconds())
            return schemas.VerificationResponse(
                success=False,
                message=f"请 {remaining_seconds} 秒后再试",
                expires_in=remaining_seconds
            )

    # 删除该邮箱的旧验证码（保留最近一条）
    db.query(models.VerificationCode).filter(
        models.VerificationCode.email == request.email,
        models.VerificationCode.type == request.type
    ).delete()

    # 创建新验证码（有效期5分钟）
    code_obj = models.VerificationCode.create_verification_code(
        db=db,
        email=request.email,
        code=code,
        code_type=request.type,
        expire_minutes=5
    )

    # 发送验证码（使用邮件服务）
    try:
        from services.email_service import send_verification_code_email

        success = send_verification_code_email(
            email=request.email,
            code=code,
            code_type=request.type
        )

        if not success:
            # 邮件发送失败，使用模拟模式
            _send_mock(request.email, code, request.type)

    except Exception as e:
        logger.error(f"发送验证码失败: {e}")
        # 发送失败，回滚验证码
        db.delete(code_obj)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"发送验证码失败: {str(e)}"
        )

    return schemas.VerificationResponse(
        success=True,
        message="验证码已发送",
        expires_in=300  # 5分钟
    )


@router.post("/verify", response_model=schemas.VerificationResponse)
async def verify_code(
    request: schemas.VerificationVerify,
    db: dependencies.DbSession
):
    """验证验证码"""

    # 查找待验证的验证码
    verification = models.VerificationCode.get_pending_code(
        db=db,
        email=request.email,
        code=request.code,
        code_type="register"
    )

    if not verification:
        return schemas.VerificationResponse(
            success=False,
            message="验证码无效或已过期",
            expires_in=0
        )

    # 标记为已使用
    models.VerificationCode.mark_as_used(db, verification.id)

    return schemas.VerificationResponse(
        success=True,
        message="验证成功",
        expires_in=0
    )


def _send_mock(email: str, code: str, code_type: str):
    """模拟模式：输出到控制台"""
    print(f"\n[模拟模式] 发送验证码")
    print(f"[模拟模式] 接收方式: 邮箱")
    print(f"[模拟模式] 接收地址: {email}")
    print(f"[模拟模式] 验证码: {code}")
    print(f"[模拟模式] 类型: {code_type}")
    print(f"[模拟模式] 有效期: 5分钟\n")

# 验证码相关 Schema

from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class VerificationRequest(BaseModel):
    """发送验证码请求"""
    email: EmailStr
    type: str = Field("register", description="验证码类型: register, reset_password")


class VerificationVerify(BaseModel):
    """验证验证码请求"""
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=10)


class VerificationResponse(BaseModel):
    """验证码响应"""
    success: bool
    message: str
    expires_in: int  # 剩余秒数
    dev_code: Optional[str] = None  # 开发模式：直接返回验证码

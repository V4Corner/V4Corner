# 用户认证相关路由

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import auth, dependencies, models, schemas
from models.activity import Activity
from config import settings

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.get("/check-username")
async def check_username(username: str, db: dependencies.DbSession):
    """检查用户名是否可用"""
    user = auth.get_user_by_username(db, username)
    return {
        "available": user is None,
        "message": "用户名可用" if user is None else "用户名已被注册"
    }


@router.get("/check-email")
async def check_email(email: str, db: dependencies.DbSession):
    """检查邮箱是否可用"""
    user = auth.get_user_by_email(db, email)
    return {
        "available": user is None,
        "message": "邮箱可以使用" if user is None else "邮箱已被注册"
    }


@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: schemas.UserCreate,
    db: dependencies.DbSession
):
    """用户注册"""
    # 检查用户名是否已存在
    if auth.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="用户名已存在"
        )

    # 检查邮箱是否已存在
    if auth.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="邮箱已被注册"
        )

    # 验证两次密码是否一致
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="两次密码不一致"
        )

    # 验证密码强度
    is_valid, error_msg = auth.validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error_msg
        )

    # 验证验证码（开发模式支持跳过）
    if settings.SKIP_EMAIL_VERIFICATION:
        # 开发模式：接受通用验证码或跳过验证
        if user_data.verification_code != settings.DEV_VERIFICATION_CODE:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"开发模式：请使用通用验证码 {settings.DEV_VERIFICATION_CODE}"
            )
        verification = None  # 跳过验证码验证
    else:
        # 生产模式：正常验证验证码
        verification = models.VerificationCode.get_pending_code(
            db=db,
            email=user_data.email,
            code=user_data.verification_code,
            code_type="register"
        )
        if not verification:
            # 检查是否因为尝试次数过多而失效
            exceeded = models.VerificationCode.is_attempts_exceeded(
                db=db,
                email=user_data.email,
                code=user_data.verification_code,
                code_type="register"
            )
            if exceeded:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="验证码尝试次数过多，请重新获取验证码"
                )
            else:
                # 检查是否过期
                from datetime import datetime
                from database import SessionLocal
                temp_db = SessionLocal()
                expired_code = temp_db.query(models.VerificationCode).filter(
                    models.VerificationCode.email == user_data.email,
                    models.VerificationCode.code == user_data.verification_code,
                    models.VerificationCode.type == "register"
                ).first()

                if expired_code and expired_code.expires_at < datetime.utcnow():
                    temp_db.close()
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="验证码已过期，请重新获取"
                    )
                temp_db.close()

                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="验证码错误，请检查后重新输入"
                )

    # 增加尝试次数和标记验证码（仅在生产模式）
    if not settings.SKIP_EMAIL_VERIFICATION:
        is_exceeded = models.VerificationCode.increment_attempts(
            db=db,
            email=user_data.email,
            code=user_data.verification_code,
            code_type="register"
        )

        if is_exceeded:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="验证码尝试次数过多，请重新获取验证码"
            )

        # 标记验证码为已使用
        models.VerificationCode.mark_as_used(db, verification.id)

    # 创建新用户
    user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=auth.get_password_hash(user_data.password),
        nickname=user_data.nickname
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 记录动态
    activity = Activity(
        type="user_joined",
        user_id=user.id,
        user_name=user.nickname or user.username,
        content="加入了班级",
        target_type="user",
        target_id=user.id,
        target_title=user.nickname or user.username
    )
    db.add(activity)
    db.commit()

    # 创建访问令牌（注册后自动登录）
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    # 构造响应
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/login")
async def login(
    user_data: schemas.UserLogin,
    db: dependencies.DbSession
):
    """用户登录"""
    # 验证用户凭据
    user = auth.authenticate_user(db, user_data.username_or_email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    # 创建访问令牌
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},  # JWT spec requires sub to be string
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "username": user.username,
            "nickname": user.nickname,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/logout")
async def logout():
    """用户登出"""
    # JWT 是无状态的，客户端删除 Token 即可
    return {"message": "退出登录成功"}


@router.post("/refresh")
async def refresh_token(current_user: dependencies.CurrentUser):
    """刷新 Token"""
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(current_user.id)},  # JWT spec requires sub to be string
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

# 用户认证相关路由

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import auth, dependencies, models, schemas
from models.activity import Activity

router = APIRouter(prefix="/api/auth", tags=["认证"])


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

    # 验证验证码
    verification = models.VerificationCode.get_pending_code(
        db=db,
        email=user_data.email,
        code=user_data.verification_code,
        code_type="register"
    )
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="验证码无效或已过期"
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

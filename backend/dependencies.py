# FastAPI 依赖项

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

import auth, database, models

# HTTP Bearer 安全方案
security = HTTPBearer()


def get_db():
    """获取数据库会话"""
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Session = Depends(get_db)
) -> models.User:
    """获取当前登录用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="未认证",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 解码 Token
    token = credentials.credentials
    payload = auth.decode_token(token)
    if payload is None:
        raise credentials_exception

    # 获取用户 ID（JWT spec requires sub to be string, but we stored int, so handle both)
    user_id_raw = payload.get("sub")
    if user_id_raw is None:
        raise credentials_exception

    # Convert to int (might be string in JWT)
    try:
        user_id = int(user_id_raw)
    except (ValueError, TypeError):
        raise credentials_exception

    # 查询用户
    user = auth.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Session = Depends(get_db)
) -> models.User | None:
    """获取当前用户（可选，未登录返回 None）"""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


# 便捷类型别名
CurrentUser = Annotated[models.User, Depends(get_current_user)]
CurrentUserOptional = Annotated[models.User | None, Depends(get_current_user_optional)]
DbSession = Annotated[Session, Depends(get_db)]

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
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False))
) -> models.User | None:
    """获取当前用户（可选，未登录返回 None）"""
    if credentials is None:
        return None

    try:
        # 解码 Token
        token = credentials.credentials
        payload = auth.decode_token(token)
        if payload is None:
            return None

        # 获取用户 ID
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None

        # Convert to int
        try:
            user_id = int(user_id_raw)
        except (ValueError, TypeError):
            return None

        # 查询用户
        user = auth.get_user_by_id(db, user_id)
        return user
    except HTTPException:
        return None


def require_role(user: models.User, allowed_roles: set[str]) -> None:
    """检查用户角色权限"""
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限操作"
        )


# 便捷类型别名
CurrentUser = Annotated[models.User, Depends(get_current_user)]
CurrentUserOptional = Annotated[models.User | None, Depends(get_current_user_optional)]
DbSession = Annotated[Session, Depends(get_db)]

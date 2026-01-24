from pydantic import BaseModel, Field


class AuthResponse(BaseModel):
    """认证响应"""
    access_token: str
    token_type: str
    expires_in: int
    user: dict


class RefreshTokenResponse(BaseModel):
    """刷新 Token 响应"""
    access_token: str
    token_type: str
    expires_in: int

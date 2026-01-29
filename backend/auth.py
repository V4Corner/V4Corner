# 认证相关工具函数

from datetime import datetime, timedelta
from typing import Optional
import re

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
SECRET_KEY = "your-secret-key-here"  # 生产环境应从环境变量读取
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 天


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    验证密码强度

    规则：
    - 6-20个字符
    - 至少包含以下两类：数字、大写字母、小写字母、特殊符号
    - 不能包含可能造成安全漏洞的特殊符号（SQL注入、XSS等）

    返回: (是否有效, 错误信息)
    """
    # 检查长度
    if len(password) < 6 or len(password) > 20:
        return False, "密码长度必须在6-20个字符之间"

    # 危险特殊符号列表（可能造成SQL注入、XSS、路径遍历等漏洞）
    dangerous_chars = ['<', '>', '"', "'", '&', '|', ';', '$', '(', ')', '{', '}', '[', ']', '\\', '/', '`']
    if any(char in password for char in dangerous_chars):
        return False, "密码包含不安全的特殊字符，请避免使用: < > \" ' & | ; $ ( ) { } [ ] \\ / `"

    # 检查字符类型
    has_lowercase = re.search(r'[a-z]', password) is not None
    has_uppercase = re.search(r'[A-Z]', password) is not None
    has_digit = re.search(r'[0-9]', password) is not None
    has_special = re.search(r'[!@#$%^*?\-+=~.,]', password) is not None

    char_types = sum([has_lowercase, has_uppercase, has_digit, has_special])

    if char_types < 2:
        return False, "密码必须包含以下至少两类字符：数字、大写字母、小写字母、特殊符号"

    return True, ""


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    # bcrypt has a 72 byte limit, truncate if necessary
    password_bytes = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), hashed_password)


def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    # bcrypt has a 72 byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """解码 JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """根据 ID 获取用户"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """根据用户名获取用户"""
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """根据邮箱获取用户"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """根据 ID 获取用户"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[models.User]:
    """验证用户凭据"""
    # 尝试用用户名查找
    user = get_user_by_username(db, username_or_email)
    # 如果找不到，尝试用邮箱查找
    if not user:
        user = get_user_by_email(db, username_or_email)
    # 验证密码
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

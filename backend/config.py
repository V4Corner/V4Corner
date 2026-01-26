"""
配置管理模块
从环境变量中读取 AI 服务配置
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 应用基本信息
    APP_NAME: str = "V4Corner"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # 数据库配置
    DATABASE_URL: str = "sqlite:///./v4corner.db"

    # JWT 认证配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 604800  # 7 天

    # CORS 配置
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # 文件上传配置
    MAX_UPLOAD_SIZE: int = 2097152  # 2MB
    ALLOWED_FILE_TYPES: str = "jpg,jpeg,png,webp,gif,pdf,doc,docx"

    # ========== 邮件配置 ==========

    # 开发模式配置
    SKIP_EMAIL_VERIFICATION: bool = False  # 开发模式：跳过邮箱验证（生产环境必须为 False）
    DEV_VERIFICATION_CODE: str = "123456"  # 开发模式：通用验证码

    # 网易邮箱 SMTP 配置（推荐）
    NETEASE_MAIL_PASSWORD: Optional[str] = None  # 网易邮箱授权码（非登录密码）
    ALIYUN_ACCOUNT_NAME: str = "your-email@163.com"  # 发件人邮箱地址（网易邮箱）
    ALIYUN_FROM_ALIAS: str = "V4Corner"  # 发件人昵称

    # ========== 短信配置 ==========

    # 阿里云短信服务配置
    SMS_ENABLED: bool = False  # 是否启用短信（优先使用短信）
    ALIYUN_SMS_SIGN_NAME: str = "V4Corner"  # 短信签名（需要在阿里云审核）
    ALIYUN_SMS_TEMPLATE_CODE_REGISTER: str = "SMS_123456789"  # 注册验证码模板CODE
    ALIYUN_SMS_TEMPLATE_CODE_RESET: str = "SMS_123456789"  # 重置密码模板CODE
    ALIYUN_SMS_REGION: str = "cn-hangzhou"  # 短信服务区域

    # ========== AI 模型配置 ==========

    # OpenAI 配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_BASE_URL: Optional[str] = None  # 自定义 API 端点（用于代理）

    # Anthropic Claude 配置
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"

    # Google Gemini 配置
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-pro"

    # DeepSeek 配置
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # 智谱 AI 配置
    ZHIPUAI_API_KEY: Optional[str] = None
    ZHIPUAI_MODEL: str = "glm-4"

    # 百度文心一言配置
    QIANFAN_API_KEY: Optional[str] = None
    QIANFAN_MODEL: str = "ernie-bot-turbo"

    # 阿里云通义千问配置
    DASHSCOPE_API_KEY: Optional[str] = None
    DASHSCOPE_MODEL: str = "qwen-turbo"

    # Ollama 配置（本地模型）
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"
    ENABLE_OLLAMA: bool = False  # 默认不启用（需要本地运行 Ollama 服务）

    # AI 服务配置
    AI_PROVIDER: Optional[str] = None  # 指定使用的 AI 服务商（不指定则自动选择）
    AI_MAX_TOKENS: int = 2000  # 最大生成 Token 数
    AI_TEMPERATURE: float = 0.7  # 生成温度（0-1）
    AI_TIMEOUT: int = 30  # API 超时时间（秒）

    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()


def get_ai_providers() -> list[str]:
    """
    获取已配置的 AI 服务商列表
    按优先级顺序检查各服务商的 API Key 是否配置
    """
    providers = []

    if settings.OPENAI_API_KEY:
        providers.append("openai")
    if settings.ANTHROPIC_API_KEY:
        providers.append("anthropic")
    if settings.GEMINI_API_KEY:
        providers.append("gemini")
    if settings.DEEPSEEK_API_KEY:
        providers.append("deepseek")
    if settings.ZHIPUAI_API_KEY:
        providers.append("zhipuai")
    if settings.QIANFAN_API_KEY:
        providers.append("qianfan")
    if settings.DASHSCOPE_API_KEY:
        providers.append("dashscope")

    # Ollama 只有显式启用时才使用（需要本地服务运行）
    if settings.ENABLE_OLLAMA:
        providers.append("ollama")

    return providers


def is_ai_configured() -> bool:
    """检查是否配置了至少一个 AI 服务"""
    return bool(settings.AI_PROVIDER) or bool(get_ai_providers())


def get_primary_ai_provider() -> Optional[str]:
    """
    获取主要使用的 AI 服务商
    优先使用配置中指定的，否则自动选择第一个可用的
    """
    if settings.AI_PROVIDER:
        return settings.AI_PROVIDER.lower()

    providers = get_ai_providers()
    return providers[0] if providers else None

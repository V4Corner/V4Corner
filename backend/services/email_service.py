"""邮件发送服务（使用 SMTP）"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)


class EmailConfig:
    """邮件配置"""
    # SMTP 服务器配置（网易邮箱）
    SMTP_HOST: str = "smtp.163.com"  # 网易 163 邮箱 SMTP
    # 如需使用 126 邮箱，改为: smtp.126.com
    SMTP_PORT: int = 465  # SSL 端口
    SMTP_USE_SSL: bool = True  # 使用 SSL

    # 发件人配置
    SENDER_EMAIL: str = settings.ALIYUN_ACCOUNT_NAME  # 使用 .env 中的配置
    SENDER_NAME: str = settings.ALIYUN_FROM_ALIAS  # 使用 .env 中的配置
    SENDER_PASSWORD: Optional[str] = None  # 需要在 .env 中配置网易邮箱授权码


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    发送邮件

    Args:
        to_email: 收件人邮箱
        subject: 邮件主题
        html_body: HTML 邮件内容
        text_body: 纯文本邮件内容（可选）

    Returns:
        bool: 是否发送成功
    """
    sender_password = getattr(settings, 'NETEASE_MAIL_PASSWORD', None)

    if not sender_password:
        logger.warning("未配置网易邮箱授权码，无法发送真实邮件")
        logger.info(f"模拟发送邮件到 {to_email}")
        logger.info(f"主题: {subject}")
        return False

    try:
        # 创建邮件对象
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = formataddr((EmailConfig.SENDER_NAME, EmailConfig.SENDER_EMAIL))
        msg['To'] = to_email

        # 添加纯文本内容
        if text_body:
            part_text = MIMEText(text_body, 'plain', 'utf-8')
            msg.attach(part_text)

        # 添加 HTML 内容
        part_html = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(part_html)

        # 连接 SMTP 服务器
        if EmailConfig.SMTP_USE_SSL:
            # 使用 SSL 连接（端口 465）
            with smtplib.SMTP_SSL(EmailConfig.SMTP_HOST, EmailConfig.SMTP_PORT) as server:
                # 登录
                server.login(EmailConfig.SENDER_EMAIL, sender_password)
                # 发送邮件
                server.send_message(msg)
        else:
            # 使用 TLS 连接（端口 587 或 25）
            with smtplib.SMTP(EmailConfig.SMTP_HOST, EmailConfig.SMTP_PORT) as server:
                server.starttls()
                # 登录
                server.login(EmailConfig.SENDER_EMAIL, sender_password)
                # 发送邮件
                server.send_message(msg)

        logger.info(f"邮件已成功发送到 {to_email}")
        return True

    except Exception as e:
        logger.error(f"发送邮件失败: {e}")
        return False


def send_verification_code_email(email: str, code: str, code_type: str = "register") -> bool:
    """
    发送验证码邮件

    Args:
        email: 收件人邮箱
        code: 验证码
        code_type: 验证码类型 (register, reset_password)

    Returns:
        bool: 是否发送成功
    """
    if code_type == "register":
        subject = "V4Corner - 注册验证码"
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #fff; margin: 0; }}
                .content {{ background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .code {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 8px; margin: 25px 0; }}
                .code-number {{ font-size: 36px; font-weight: bold; color: #fff; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 14px; }}
                .info {{ background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #667eea; }}
            </style>
        </head>
        <body style="background-color: #f5f7fa; padding: 20px;">
            <div class="container">
                <div class="header">
                    <h1 class="logo">V4Corner</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #333;">欢迎加入 V4Corner</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.8;">您正在使用该邮箱注册 V4Corner 账号，请输入以下验证码完成注册：</p>
                    
                    <div class="code">
                        <div class="code-number">{code}</div>
                    </div>
                    
                    <div class="info">
                        <strong>⏰ 有效期说明：</strong><br>
                        验证码有效期为 <strong>5 分钟</strong>，请尽快使用。
                    </div>
                    
                    <p style="color: #999; font-size: 13px; margin-top: 30px;">
                        ⚠️ 如果这不是您的操作，请忽略此邮件，您的账号安全不会受到影响。
                    </p>
                </div>
                <div class="footer">
                    <p style="margin: 0;">V4Corner - 行健-车辆4班在线空间</p>
                    <p style="margin: 5px 0 0 0; color: #bbb; font-size: 12px;">此邮件由系统自动发送，请勿回复</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_body = f"【V4Corner】您的注册验证码是：{code}，5分钟内有效。如非本人操作，请忽略此邮件。"

    elif code_type == "reset_password":
        subject = "V4Corner - 密码重置验证码"
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #fff; margin: 0; }}
                .content {{ background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .code {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; text-align: center; border-radius: 8px; margin: 25px 0; }}
                .code-number {{ font-size: 36px; font-weight: bold; color: #fff; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .footer {{ text-align: center; padding: 20px; color: #999; font-size: 14px; }}
                .warning {{ background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }}
            </style>
        </head>
        <body style="background-color: #f5f7fa; padding: 20px;">
            <div class="container">
                <div class="header">
                    <h1 class="logo">V4Corner</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #333;">重置密码</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.8;">您正在重置 V4Corner 账号的密码，请输入以下验证码：</p>
                    
                    <div class="code">
                        <div class="code-number">{code}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ 安全提醒：</strong><br>
                        验证码有效期为 <strong>5 分钟</strong>，请尽快使用。<br>
                        验证码仅限本人使用，请勿泄露给他人。
                    </div>
                    
                    <p style="color: #999; font-size: 13px; margin-top: 30px;">
                        如果这不是您的操作，请忽略此邮件，您的账号安全不会受到影响。
                    </p>
                </div>
                <div class="footer">
                    <p style="margin: 0;">V4Corner - 行健-车辆4班在线空间</p>
                    <p style="margin: 5px 0 0 0; color: #bbb; font-size: 12px;">此邮件由系统自动发送，请勿回复</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_body = f"【V4Corner】您的密码重置验证码是：{code}，5分钟内有效。如非本人操作，请忽略此邮件。"

    else:
        subject = "V4Corner - 验证码"
        html_body = f"<p>您的验证码是：<strong>{code}</strong></p><p>有效期：5分钟</p>"
        text_body = f"您的验证码是：{code}，有效期：5分钟"

    return send_email(to_email=email, subject=subject, html_body=html_body, text_body=text_body)

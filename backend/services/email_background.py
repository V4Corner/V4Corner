"""
邮件后台任务服务
使用 FastAPI BackgroundTasks 实现异步邮件发送
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal
from models.verification import VerificationCode

logger = logging.getLogger(__name__)


def send_verification_code_background(
    email: str,
    code: str,
    code_type: str = "register",
    max_retries: int = 3
):
    """
    后台任务：发送验证码邮件

    Args:
        email: 收件人邮箱
        code: 验证码
        code_type: 验证码类型
        max_retries: 最大重试次数
    """
    db = SessionLocal()

    try:
        # 查询验证码记录，确认仍然有效
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.code == code,
            VerificationCode.type == code_type,
            VerificationCode.is_used == 0
        ).first()

        if not verification:
            logger.warning(f"[后台任务] 验证码已失效，取消发送: {email}")
            return

        # 尝试发送邮件
        from services.email_service import send_verification_code_email

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"[后台任务] 尝试发送邮件 (第{attempt}次): {email}")

                success = send_verification_code_email(
                    email=email,
                    code=code,
                    code_type=code_type
                )

                if success:
                    logger.info(f"[后台任务] 邮件发送成功: {email}")
                    return
                else:
                    # 模拟模式
                    logger.info(f"[后台任务] 使用模拟模式: {email}")
                    return

            except Exception as e:
                logger.error(f"[后台任务] 发送失败 (第{attempt}次): {e}")

                if attempt < max_retries:
                    # 重试
                    continue
                else:
                    # 最后一次尝试失败，记录验证码发送失败
                    logger.error(f"[后台任务] 邮件发送失败，已达到最大重试次数: {email}")

                    # 可选：标记验证码为已使用，防止用户继续使用
                    # verification.is_used = 1
                    # db.commit()

    except Exception as e:
        logger.error(f"[后台任务] 执行出错: {e}", exc_info=True)

    finally:
        db.close()


def send_welcome_email_background(email: str, username: str):
    """
    后台任务：发送欢迎邮件

    Args:
        email: 收件人邮箱
        username: 用户名
    """
    try:
        from services.email_service import send_email

        subject = "欢迎加入 V4Corner！"
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #fff; margin: 0; }}
                .content {{ background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }}
                .greeting {{ font-size: 20px; font-weight: bold; margin-bottom: 20px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body style="background-color: #f5f7fa; padding: 20px;">
            <div class="container">
                <div class="header">
                    <h1 class="logo">V4Corner</h1>
                </div>
                <div class="content">
                    <p class="greeting">你好，{username}！</p>
                    <p>欢迎加入 V4Corner - 行健-车辆4班的在线空间！</p>
                    <p>我们很高兴你的加入，在这里你可以：</p>
                    <ul>
                        <li>📝 发布博客文章，记录学习心得</li>
                        <li>💬 与 AI 助手实时对话</li>
                        <li>👥 了解班级成员</li>
                        <li>📅 查看班级通知和日程</li>
                    </ul>
                    <p>赶快开始探索吧！</p>
                    <a href="http://localhost:3000" class="button">进入 V4Corner</a>
                    <p style="color: #999; font-size: 13px; margin-top: 30px;">
                        如果这是你的操作，请忽略此邮件。
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        text_body = f"欢迎加入 V4Corner，{username}！"

        send_email(
            to_email=email,
            subject=subject,
            html_body=html_body,
            text_body=text_body
        )

        logger.info(f"[后台任务] 欢迎邮件发送成功: {email}")

    except Exception as e:
        logger.error(f"[后台任务] 欢迎邮件发送失败: {e}")

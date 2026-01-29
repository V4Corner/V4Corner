"""测试邮件发送功能"""
import sys
sys.path.insert(0, '.')

from services.email_service import send_verification_code_email

def test_email_send():
    """测试发送验证码邮件"""
    print("=== 测试邮件发送功能 ===\n")

    # 测试邮箱
    test_email = "2195432215@qq.com"
    test_code = "123456"

    print(f"发送邮件到: {test_email}")
    print(f"验证码: {test_code}")
    print(f"类型: register\n")

    result = send_verification_code_email(
        email=test_email,
        code=test_code,
        code_type="register"
    )

    if result:
        print("\n[成功] 邮件发送成功！请检查收件箱")
    else:
        print("\n[失败] 邮件发送失败（可能是未配置授权码，系统使用模拟模式）")
        print("请查看后端控制台的模拟输出")

    return result

if __name__ == "__main__":
    print("说明:")
    print("1. 如需发送真实邮件，请在 .env 中配置 QQ_MAIL_PASSWORD")
    print("2. QQ 邮箱授权码获取步骤：")
    print("   - 登录 QQ 邮箱 -> 设置 -> 账户")
    print("   - 开启 IMAP/SMTP 服务")
    print("   - 获取授权码并填入 .env\n")

    input("按回车键开始测试...")
    test_email_send()

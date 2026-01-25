"""测试验证码功能"""
import requests

BASE_URL = "http://localhost:8000"

def test_send_verification_code():
    """测试发送验证码"""
    print("=== 测试发送验证码 ===")

    # 测试发送验证码
    response = requests.post(
        f"{BASE_URL}/api/verification/send",
        json={"email": "test@example.com", "type": "register"}
    )

    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")

    return response.status_code == 200

def test_register_with_code():
    """测试使用验证码注册"""
    print("\n=== 测试使用验证码注册 ===")

    # 发送验证码
    response = requests.post(
        f"{BASE_URL}/api/verification/send",
        json={"email": "test2@example.com", "type": "register"}
    )

    if response.status_code != 200:
        print("发送验证码失败")
        return False

    print("模拟：请查看后端控制台获取验证码")

    # 从控制台获取验证码
    code = input("请输入验证码: ")

    # 使用验证码注册
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "username": "testuser",
            "email": "test2@example.com",
            "password": "password123",
            "password_confirm": "password123",
            "verification_code": code,
            "nickname": "测试用户"
        }
    )

    print(f"注册状态码: {response.status_code}")
    print(f"注册响应: {response.json()}")

    return response.status_code == 201

if __name__ == "__main__":
    print("请确保后端服务正在运行：cd backend && uvicorn main:app --reload\n")

    # 测试发送验证码
    success = test_send_verification_code()

    if success:
        print("\n✅ 验证码发送测试通过")

        # 询问是否测试注册
        choice = input("\n是否测试注册功能？(y/n): ")
        if choice.lower() == 'y':
            success = test_register_with_code()
            if success:
                print("\n✅ 注册功能测试通过")
            else:
                print("\n❌ 注册功能测试失败")
    else:
        print("\n❌ 验证码发送测试失败")

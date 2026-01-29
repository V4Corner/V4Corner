"""测试媒体文件删除功能"""
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

# 1. 登录获取 token
print("1. 登录...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"username": "test", "password": "test"}
)
if login_response.status_code != 200:
    print(f"登录失败: {login_response.status_code}")
    exit(1)

token = login_response.json()["access_token"]
print(f"✓ 登录成功，获取 token")

# 2. 检查现有文件
print("\n2. 检查现有文件...")
uploads_dir = Path("uploads/blog")
if uploads_dir.exists():
    images = list((uploads_dir / "images").glob("*")) if (uploads_dir / "images").exists() else []
    videos = list((uploads_dir / "videos").glob("*")) if (uploads_dir / "videos").exists() else []
    print(f"图片: {len(images)} 个")
    print(f"视频: {len(videos)} 个")

    if videos:
        test_file = videos[0]
        print(f"\n测试文件: {test_file.name}")

        # 3. 测试删除 API
        print("\n3. 测试删除 API...")
        url_path = f"/static/blog/videos/{test_file.name}"

        delete_response = requests.delete(
            f"{BASE_URL}/api/uploads/media",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"urls": [url_path]}
        )

        print(f"响应状态码: {delete_response.status_code}")
        if delete_response.status_code == 204:
            print("✓ 删除 API 调用成功")

            # 4. 验证文件是否真的被删除
            print("\n4. 验证文件是否被删除...")
            if test_file.exists():
                print(f"✗ 文件仍然存在: {test_file}")
            else:
                print(f"✓ 文件已成功删除: {test_file.name}")
        else:
            print(f"✗ 删除失败: {delete_response.text}")
    else:
        print("没有视频文件可供测试")
else:
    print("uploads/blog 目录不存在")

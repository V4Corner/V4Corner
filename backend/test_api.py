#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
V4Corner API 测试脚本

测试所有 API 端点的功能。
运行前请确保后端服务已启动：uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import requests
import json
import sys
from typing import Optional

# API 基础 URL
API_BASE = "http://localhost:8000"

# 颜色输出（Windows 可能不支持）
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(msg: str):
    print(f"{Colors.OKGREEN}✓{Colors.ENDC} {msg}")

def print_error(msg: str):
    print(f"{Colors.FAIL}✗{Colors.ENDC} {msg}")

def print_info(msg: str):
    print(f"{Colors.OKBLUE}ℹ{Colors.ENDC} {msg}")

def print_header(msg: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{msg}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def test_health():
    """测试服务是否运行"""
    print_header("1. 测试服务状态")
    try:
        # 注意：health 端点已移除，这里只测试根路径
        response = requests.get(f"{API_BASE}/docs", timeout=5)
        if response.status_code == 200:
            print_success("后端服务正在运行")
            return True
        else:
            print_error("后端服务未正常运行")
            return False
    except Exception as e:
        print_error(f"无法连接到后端服务: {e}")
        return False


def test_register(username: str, email: str, password: str) -> Optional[dict]:
    """测试用户注册"""
    print_header("2. 测试用户注册")

    payload = {
        "username": username,
        "email": email,
        "password": password,
        "password_confirm": password,
        "nickname": f"{username}的昵称"
    }

    try:
        response = requests.post(f"{API_BASE}/api/auth/register", json=payload)

        if response.status_code == 201:
            print_success("用户注册成功")
            data = response.json()
            print_info(f"  用户ID: {data['id']}")
            print_info(f"  用户名: {data['username']}")
            return data
        elif response.status_code == 422:
            error_msg = response.json().get('detail', '未知错误')
            print_info(f"  用户可能已存在: {error_msg}")
            # 尝试登录
            return test_login(username, password)
        else:
            print_error(f"注册失败: {response.status_code}")
            print_info(f"  响应: {response.text}")
            return None
    except Exception as e:
        print_error(f"注册请求失败: {e}")
        return None


def test_login(username_or_email: str, password: str) -> Optional[dict]:
    """测试用户登录"""
    print_header("3. 测试用户登录")

    payload = {
        "username_or_email": username_or_email,
        "password": password
    }

    try:
        response = requests.post(f"{API_BASE}/api/auth/login", json=payload)

        if response.status_code == 200:
            print_success("登录成功")
            data = response.json()
            print_info(f"  Token: {data['access_token'][:20]}...")
            print_info(f"  Token 类型: {data['token_type']}")
            print_info(f"  过期时间: {data['expires_in']} 秒")
            return data
        else:
            print_error(f"登录失败: {response.status_code}")
            print_info(f"  响应: {response.text}")
            return None
    except Exception as e:
        print_error(f"登录请求失败: {e}")
        return None


def test_get_current_user(token: str):
    """测试获取当前用户信息"""
    print_header("4. 测试获取当前用户信息")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{API_BASE}/api/users/me", headers=headers)

        if response.status_code == 200:
            print_success("获取用户信息成功")
            data = response.json()
            print_info(f"  用户名: {data['username']}")
            print_info(f"  邮箱: {data['email']}")
            print_info(f"  昵称: {data['nickname']}")
            print_info(f"  博客数: {data['stats']['blog_count']}")
            print_info(f"  总阅读量: {data['stats']['total_views']}")
            return data
        else:
            print_error(f"获取用户信息失败: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None


def test_create_blog(token: str, title: str, content: str) -> Optional[dict]:
    """测试创建博客"""
    print_header("5. 测试创建博客")

    payload = {
        "title": title,
        "content": content
    }

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.post(f"{API_BASE}/api/blogs", json=payload, headers=headers)

        if response.status_code == 201:
            print_success("博客创建成功")
            data = response.json()
            print_info(f"  博客ID: {data['id']}")
            print_info(f"  标题: {data['title']}")
            print_info(f"  作者: {data['author']}")
            return data
        else:
            print_error(f"创建博客失败: {response.status_code}")
            print_info(f"  响应: {response.text}")
            return None
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None


def test_get_blogs(blog_id: Optional[int] = None):
    """测试获取博客列表"""
    print_header("6. 测试获取博客列表")

    try:
        response = requests.get(f"{API_BASE}/api/blogs")

        if response.status_code == 200:
            print_success("获取博客列表成功")
            blogs = response.json()
            print_info(f"  博客数量: {len(blogs)}")

            if blogs:
                for blog in blogs[:3]:  # 只显示前3个
                    print_info(f"    - {blog['title']} (ID: {blog['id']})")

            return blogs
        else:
            print_error(f"获取博客列表失败: {response.status_code}")
            return []
    except Exception as e:
        print_error(f"请求失败: {e}")
        return []


def test_get_blog_detail(blog_id: int, token: Optional[str] = None):
    """测试获取博客详情"""
    print_header(f"7. 测试获取博客详情 (ID: {blog_id})")

    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        response = requests.get(f"{API_BASE}/api/blogs/{blog_id}", headers=headers)

        if response.status_code == 200:
            print_success("获取博客详情成功")
            blog = response.json()
            print_info(f"  标题: {blog['title']}")
            print_info(f"  作者: {blog['author']}")
            print_info(f"  阅读次数: {blog['views']}")
            print_info(f"  是作者: {blog['is_owner']}")
            return blog
        else:
            print_error(f"获取博客详情失败: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None


def test_update_blog(blog_id: int, token: str, new_title: str) -> Optional[dict]:
    """测试更新博客"""
    print_header(f"8. 测试更新博客 (ID: {blog_id})")

    payload = {
        "title": new_title,
        "content": "这是更新后的博客内容。"
    }

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.put(f"{API_BASE}/api/blogs/{blog_id}", json=payload, headers=headers)

        if response.status_code == 200:
            print_success("博客更新成功")
            data = response.json()
            print_info(f"  新标题: {data['title']}")
            return data
        elif response.status_code == 403:
            print_error("无权限编辑此博客")
        elif response.status_code == 404:
            print_error("博客不存在")
        else:
            print_error(f"更新失败: {response.status_code}")
        return None
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None


def test_get_members():
    """测试获取成员列表"""
    print_header("9. 测试获取成员列表")

    try:
        response = requests.get(f"{API_BASE}/api/members")

        if response.status_code == 200:
            print_success("获取成员列表成功")
            data = response.json()
            print_info(f"  成员总数: {data['total']}")
            print_info(f"  当前页: {data['page']}")

            if data['items']:
                for member in data['items'][:3]:
                    print_info(f"    - {member.get('nickname') or member['username']} (@{member['username']})")

            return data
        else:
            print_error(f"获取成员列表失败: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None


def test_logout(token: str):
    """测试退出登录"""
    print_header("10. 测试退出登录")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.post(f"{API_BASE}/api/auth/logout", headers=headers)

        if response.status_code == 200:
            print_success("退出登录成功")
            return True
        else:
            print_error(f"退出登录失败: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"请求失败: {e}")
        return False


def main():
    """主测试流程"""
    print(f"\n{Colors.BOLD}V4Corner API 测试脚本{Colors.ENDC}\n")

    # 测试用户信息
    test_username = "testuser"
    test_email = "test@example.com"
    test_password = "password123"
    test_blog_title = "测试博客标题"
    test_blog_content = """# 测试博客内容

这是第一篇测试博客的内容。

## 功能介绍

- 支持用户注册和登录
- 支持创建、编辑、删除博客
- 支持查看成员列表

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：FastAPI + SQLAlchemy
- 数据库：SQLite
"""

    # 1. 测试服务状态
    if not test_health():
        print_error("\n请先启动后端服务：")
        print("  cd backend")
        print("  pip install -r requirements.txt")
        print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        sys.exit(1)

    # 2. 测试注册
    user_data = test_register(test_username, test_email, test_password)

    if not user_data:
        print_error("\n用户注册失败，无法继续测试")
        sys.exit(1)

    # 3. 测试登录
    login_data = test_login(test_username, test_password)

    if not login_data:
        print_error("\n用户登录失败，无法继续测试")
        sys.exit(1)

    token = login_data['access_token']
    user_id = user_data['user']['id']

    # 4. 测试获取当前用户信息
    test_get_current_user(token)

    # 5. 测试创建博客
    blog_data = test_create_blog(token, test_blog_title, test_blog_content)

    if not blog_data:
        print_error("\n博客创建失败，跳过相关测试")
    else:
        blog_id = blog_data['id']

        # 6. 测试获取博客列表
        test_get_blogs()

        # 7. 测试获取博客详情
        test_get_blog_detail(blog_id, token)

        # 8. 测试更新博客
        test_update_blog(blog_id, token, f"{test_blog_title}（已更新）")

    # 9. 测试获取成员列表
    test_get_members()

    # 10. 测试退出登录
    test_logout(token)

    # 完成测试
    print_header("测试完成")
    print_success("所有测试已完成！")
    print_info("\n你可以访问以下地址查看更多信息：")
    print("  • API 文档: http://localhost:8000/docs")
    print("  • 前端页面: http://localhost:3000")
    print("  • API 文档: docs/API.md")
    print()


if __name__ == "__main__":
    main()

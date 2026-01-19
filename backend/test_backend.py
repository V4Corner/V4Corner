#!/usr/bin/env python3
"""
V4Corner 后端测试脚本
验证所有 API 是否正常工作
"""

import sys
import requests

BASE_URL = "http://localhost:8000"

def test_health():
    """测试健康检查"""
    print("[1/5] 测试健康检查...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ 后端服务正常运行")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法连接到后端: {e}")
        print("请确保后端服务正在运行: uvicorn main:app --reload")
        return False

def test_api_docs():
    """测试 API 文档"""
    print("\n[2/5] 测试 API 文档...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API 文档可访问: http://localhost:8000/docs")
            return True
        else:
            print(f"❌ API 文档访问失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法访问 API 文档: {e}")
        return False

def test_chat_api():
    """测试 AI 对话 API"""
    print("\n[3/5] 测试 AI 对话 API...")
    try:
        # 测试获取对话列表（应该返回 401，因为未登录）
        response = requests.get(f"{BASE_URL}/api/chat/conversations")
        if response.status_code == 401:
            print("✅ AI 对话 API 正常响应（需要认证）")
            return True
        else:
            print(f"⚠️ AI 对话 API 返回: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI 对话 API 测试失败: {e}")
        return False

def test_openai_env():
    """测试 OpenAI 环境变量"""
    print("\n[4/5] 测试 OpenAI 配置...")
    import os
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"✅ OPENAI_API_KEY 已设置 (长度: {len(api_key)})")
        return True
    else:
        print("⚠️ OPENAI_API_KEY 未设置")
        print("   当前使用模拟 AI 回复")
        print("   要使用真实 AI，请在 .env 文件中设置 OPENAI_API_KEY")
        return False

def test_database():
    """测试数据库"""
    print("\n[5/5] 测试数据库连接...")
    try:
        from database import engine
        from models import Base, User, Blog, Conversation, Message

        # 测试连接
        with engine.connect() as conn:
            print("✅ 数据库连接成功")

        # 测试表是否存在
        tables = engine.table_names()
        required_tables = ['users', 'blogs', 'conversations', 'messages']
        missing_tables = [t for t in required_tables if t not in tables]

        if missing_tables:
            print(f"⚠️ 缺少数据库表: {missing_tables}")
            print("   正在创建表...")
            Base.metadata.create_all(bind=engine)
            print("✅ 数据库表创建成功")
        else:
            print(f"✅ 所有数据库表存在: {required_tables}")

        return True
    except Exception as e:
        print(f"❌ 数据库测试失败: {e}")
        return False

def main():
    print("=" * 50)
    print("  V4Corner 后端测试")
    print("=" * 50)
    print()

    results = []
    results.append(("健康检查", test_health()))

    if results[0][1]:  # 只有后端运行才继续测试
        results.append(("API 文档", test_api_docs()))
        results.append(("AI 对话 API", test_chat_api()))
        results.append(("数据库", test_database()))
        results.append(("OpenAI 配置", test_openai_env()))

    print("\n" + "=" * 50)
    print("  测试总结")
    print("=" * 50)

    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")

    # 退出码
    if all(r[1] for r in results):
        print("\n🎉 所有测试通过！后端已准备就绪。")
        sys.exit(0)
    else:
        print("\n⚠️ 部分测试失败，请检查配置。")
        sys.exit(1)

if __name__ == "__main__":
    main()

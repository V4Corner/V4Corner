#!/bin/bash
# V4Corner API 快速测试脚本

API_BASE="http://localhost:8000"
TEST_USER="testuser"
TEST_EMAIL="test@example.com"
TEST_PASS="password123"

echo ""
echo "========================================"
echo "  V4Corner API 快速测试"
echo "========================================"
echo ""

# 1. 测试用户注册
echo "[1/4] 测试用户注册..."
curl -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\", \"password_confirm\": \"$TEST_PASS\", \"nickname\": \"测试用户\"}"
echo ""

# 2. 测试用户登录
echo "[2/4] 测试用户登录..."
curl -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\": \"$TEST_USER\", \"password\": \"$TEST_PASS\"}"
echo ""

# 3. 测试获取博客列表
echo "[3/4] 测试获取博客列表..."
curl "$API_BASE/api/blogs"
echo ""

# 4. 测试获取成员列表
echo "[4/4] 测试获取成员列表..."
curl "$API_BASE/api/members"
echo ""

echo "========================================"
echo "  测试完成！"
echo "========================================"
echo ""
echo "提示："
echo "  • 访问 http://localhost:8000/docs 查看完整 API 文档"
echo "  • 运行 python test_api.py 执行完整测试"
echo ""

@echo off
REM V4Corner API 测试脚本 (Windows)
REM 使用前请确保后端服务已启动

setlocal enabledelayedexpansion

set API_BASE=http://localhost:8000
set TEST_USER=testuser
set TEST_EMAIL=test@example.com
set TEST_PASS=password123

echo.
echo ========================================
echo   V4Corner API 测试脚本
echo ========================================
echo.

REM 1. 测试用户注册
echo [1/8] 测试用户注册...
curl -X POST %API_BASE%/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%TEST_USER%\", \"email\": \"%TEST_EMAIL%\", \"password\": \"%TEST_PASS%\", \"password_confirm\": \"%TEST_PASS%\", \"nickname\": \"测试用户\"}"
echo.

REM 2. 测试用户登录
echo [2/8] 测试用户登录...
curl -X POST %API_BASE%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username_or_email\": \"%TEST_USER%\", \"password\": \"%TEST_PASS%\"}"
echo.

REM 3. 测试获取博客列表
echo [3/8] 测试获取博客列表...
curl %API_BASE%/api/blogs
echo.

echo.
echo ========================================
echo   测试完成！
echo ========================================
echo.
echo 提示：
echo   • 访问 http://localhost:8000/docs 查看完整 API 文档
echo   • 运行 python test_api.py 执行完整测试
echo.
pause

# API 测试脚本

本目录包含 V4Corner API 的测试脚本。

## 测试脚本说明

### 1. test_api.py（推荐）
完整的 Python 测试脚本，自动测试所有 API 端点。

**功能：**
- ✅ 测试用户注册
- ✅ 测试用户登录
- ✅ 测试获取当前用户信息
- ✅ 测试创建博客
- ✅ 测试获取博客列表
- ✅ 测试获取博客详情
- ✅ 测试更新博客
- ✅ 测试获取成员列表
- ✅ 测试退出登录
- ✅ 彩色输出，测试结果清晰

**使用方法：**
```bash
# 确保后端服务已启动
cd backend

# 运行测试
python test_api.py
```

**依赖安装：**
```bash
pip install requests
```

### 2. test_api.bat
Windows 批处理脚本，快速测试主要功能。

**使用方法：**
```bash
cd backend
test_api.bat
```

### 3. test_api.sh
Linux/Mac Shell 脚本，快速测试主要功能。

**使用方法：**
```bash
cd backend
chmod +x test_api.sh
./test_api.sh
```

## 测试前准备

### 1. 启动后端服务
```bash
cd backend

# 安装依赖（首次运行）
pip install -r requirements.txt

# 启动服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 验证服务运行
访问 http://localhost:8000/docs 查看 Swagger API 文档。

## 测试流程

完整测试脚本会按以下顺序执行：

1. **检查服务状态** - 确保后端服务正在运行
2. **用户注册** - 创建测试用户（testuser）
3. **用户登录** - 使用注册的用户登录，获取 Token
4. **获取用户信息** - 验证 Token 有效
5. **创建博客** - 使用 Token 创建一篇测试博客
6. **获取博客列表** - 查看所有博客
7. **获取博客详情** - 查看博客详细信息
8. **更新博客** - 修改博客标题和内容
9. **获取成员列表** - 查看所有成员
10. **退出登录** - 清除 Token

## 测试数据

测试脚本使用以下测试数据：

- **用户名**: testuser
- **邮箱**: test@example.com
- **密码**: password123
- **博客标题**: 测试博客标题
- **博客内容**: Markdown 格式的测试内容

## 故障排除

### 问题：无法连接到后端服务
**解决方案：**
```bash
# 检查后端是否启动
curl http://localhost:8000/docs

# 如果没有响应，启动后端服务
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 问题：用户已存在
**解决方案：**
- 测试脚本会自动检测并尝试登录
- 或手动删除数据库文件：`rm backend/v4corner.db`，然后重启服务

### 问题：依赖缺失
**解决方案：**
```bash
pip install requests
```

## 手动测试

你也可以使用 curl 或 Postman 手动测试：

### 用户注册
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "nickname": "测试用户"
  }'
```

### 用户登录
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "password123"
  }'
```

### 创建博客（需要 Token）
```bash
TOKEN="你的access_token"
curl -X POST http://localhost:8000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "我的第一篇博客",
    "content": "这是博客内容..."
  }'
```

## 完整 API 文档

详细的 API 文档请查看：`docs/API.md`

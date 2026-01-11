# V4Corner 项目开发进度

**最后更新**: 2026-01-12 (完成博客系统核心功能：详情页、创建/编辑、实时预览)

## 项目概述

V4Corner 是行健-车辆4班打造的班级在线空间，用于展示班级信息、记录实践经历、分享学习心得与 AI 使用成果。

**技术栈**:
- 前端: React 18.3.1 + TypeScript + Vite 5.4.10
- 后端: FastAPI 0.115.5 + SQLAlchemy 2.0.35 + Pydantic 2.9.2
- 数据库: SQLite (可迁移至 PostgreSQL)
- 认证: JWT (python-jose) + bcrypt

---

## ✅ 已完成功能

### 1. 后端基础设施

#### 数据库模型
- ✅ **User 模型** (`backend/models/user.py`)
  - 字段: id, username, email, password_hash, nickname, avatar_url, class_field, bio, created_at, updated_at
  - 关系: 一对多关系到 Blog

- ✅ **Blog 模型** (`backend/models/blog.py`)
  - 字段: id, title, content, author_id, author_name, views, created_at, updated_at
  - 关系: 多对一关系到 User

#### 认证系统
- ✅ **JWT 认证** (`backend/auth.py`)
  - 密码哈希: bcrypt (72字节限制处理)
  - Token 生成: 7天有效期
  - Token 验证: 支持用户名或邮箱登录

- ✅ **依赖注入** (`backend/dependencies.py`)
  - `get_db()`: 数据库会话管理
  - `get_current_user()`: 获取当前登录用户
  - `get_current_user_optional()`: 可选认证
  - 类型别名: `CurrentUser`, `CurrentUserOptional`, `DbSession`

#### API 路由
- ✅ **认证 API** (`backend/routers/auth.py`)
  - `POST /api/auth/register` - 用户注册
  - `POST /api/auth/login` - 用户登录
  - `POST /api/auth/logout` - 退出登录
  - `POST /api/auth/refresh` - 刷新 Token

- ✅ **博客 API** (`backend/routers/blogs.py`)
  - `GET /api/blogs` - 获取博客列表 (支持作者筛选、分页)
  - `GET /api/blogs/{id}` - 获取博客详情
  - `POST /api/blogs` - 创建博客 (需认证)
  - `PUT /api/blogs/{id}` - 更新博客 (需认证，仅作者)
  - `DELETE /api/blogs/{id}` - 删除博客 (需认证，仅作者)

- ✅ **用户 API** (`backend/routers/users.py`)
  - `GET /api/users/me` - 获取当前用户信息
  - `PUT /api/users/me` - 更新当前用户信息
  - `GET /api/users/{id}` - 获取指定用户公开信息
  - `GET /api/users/{id}/blogs` - 获取指定用户的博客列表

- ✅ **成员 API** (`backend/routers/members.py`)
  - `GET /api/members` - 获取班级成员列表 (支持搜索、分页)

#### 数据验证
- ✅ **User Schemas** (`backend/schemas/user.py`)
  - `UserStats`: 用户统计信息
  - `UserLogin`: 登录请求 (username_or_email, password)
  - `UserCreate`: 注册请求
  - `UserUpdate`: 更新用户信息
  - `UserRead`: 用户完整信息
  - `UserPublic`: 用户公开信息 (不含邮箱)

- ✅ **Blog Schemas** (`backend/schemas/blog.py`)
  - `BlogCreate`: 创建博客
  - `BlogUpdate`: 更新博客
  - `BlogListItem`: 博客列表项
  - `BlogRead`: 博客详情 (含 is_owner 字段)
  - `BlogListResponse`: 博客列表分页响应
  - `generate_excerpt()`: 自动生成摘要 (150字)

### 2. 前端实现

#### 类型定义
- ✅ **认证类型** (`frontend/src/types/auth.ts`)
  - `LoginRequest`, `RegisterRequest`, `AuthResponse`

- ✅ **用户类型** (`frontend/src/types/user.ts`)
  - `User`, `UserPublic`, `UserStats`, `UpdateUserRequest`

- ✅ **博客类型** (`frontend/src/types/blog.ts`)
  - `Blog`, `BlogCreate`, `BlogUpdate`, `BlogListResponse`

#### API 客户端
- ✅ **通用客户端** (`frontend/src/api/client.ts`)
  - Token 管理 (localStorage)
  - 自动添加 Authorization header
  - 统一错误处理 (支持 FastAPI 验证错误格式)
  - 401 自动跳转登录
  - 支持 GET, POST, PUT, DELETE, 文件上传

- ✅ **认证 API** (`frontend/src/api/auth.ts`)
  - login(), register(), logout(), refreshToken()

- ✅ **用户 API** (`frontend/src/api/users.ts`)
  - getCurrentUser(), updateUser(), uploadAvatar(), getUserById(), getUserBlogs()

- ✅ **博客 API** (`frontend/src/api/blogs.ts`)
  - getBlogs(), getBlog(), createBlog(), updateBlog(), deleteBlog()

- ✅ **成员 API** (`frontend/src/api/members.ts`)
  - getMembers()

#### 状态管理
- ✅ **AuthContext** (`frontend/src/contexts/AuthContext.tsx`)
  - 全局认证状态
  - login(), register(), logout(), refreshUser()
  - 自动初始化 (检查 Token 并获取用户信息)
  - isLoading, isAuthenticated 状态

#### 页面组件
- ✅ **登录页面** (`frontend/src/routes/Login.tsx`)
  - 表单验证
  - 错误处理
  - 记住我功能

- ✅ **注册页面** (`frontend/src/routes/Register.tsx`)
  - 客户端验证 (密码一致性)
  - 错误处理
  - 注册成功后自动登录

- ✅ **博客列表** (`frontend/src/routes/Blogs.tsx`)
  - 博客卡片展示
  - 作者筛选
  - 分页加载
  - 【写博客】按钮（仅登录用户可见，页面右上角）

- ✅ **博客详情页** (`frontend/src/routes/BlogDetail.tsx`)
  - 显示完整博客内容（Markdown 渲染）
  - 面包屑导航（博客首页 > 文章标题）
  - 白色卡片背景布局
  - 显示作者信息、发布时间、阅读次数
  - 编辑/删除按钮（仅作者可见，页面头部）

- ✅ **创建博客页面** (`frontend/src/routes/CreateBlog.tsx`)
  - 标题和内容输入（支持 Markdown）
  - 实时预览（左右分栏布局，可切换）
  - 字符计数显示
  - Markdown 语法提示

- ✅ **编辑博客页面** (`frontend/src/routes/EditBlog.tsx`)
  - 加载现有博客内容
  - 标题和内容编辑
  - 实时预览（左右分栏布局，可切换）
  - 权限检查（仅作者可编辑）

- ✅ **用户个人中心** (`frontend/src/routes/UserProfile.tsx`)
  - 显示用户信息
  - 显示用户博客列表
  - 编辑按钮（跳转到编辑资料页）

- ✅ **编辑资料页面** (`frontend/src/routes/EditProfile.tsx`)
  - 编辑昵称、班级、个人简介
  - 用户名和邮箱只读显示
  - 表单验证
  - 保存成功后跳转回个人主页

- ✅ **成员列表** (`frontend/src/routes/Members.tsx`)
  - 成员卡片展示
  - 搜索功能
  - 分页加载

- ✅ **导航栏** (`frontend/src/components/Navbar.tsx`)
  - 登录状态显示
  - 用户菜单（个人中心、编辑资料、退出登录）
  - 登录/注册按钮（未登录时）

#### 路由配置
- ✅ **App.tsx** (`frontend/src/App.tsx`)
  - `/` - 首页
  - `/login` - 登录
  - `/register` - 注册
  - `/blogs` - 博客列表
  - `/blogs/new` - 创建博客（必须在 `/blogs/:blogId` 之前）
  - `/blogs/:blogId/edit` - 编辑博客（必须在 `/blogs/:blogId` 之前）
  - `/blogs/:blogId` - 博客详情
  - `/members` - 成员列表
  - `/users/me` - 编辑资料页面（必须在 `/users/:userId` 之前）
  - `/users/:userId` - 用户个人中心

### 3. 测试与文档

#### 测试脚本
- ✅ **Python 测试脚本** (`backend/test_api.py`)
  - 10个测试用例，覆盖所有主要功能
  - 彩色输出，测试结果清晰

- ✅ **Windows 快速测试** (`backend/test_api.bat`)
- ✅ **Linux/Mac 快速测试** (`backend/test_api.sh`)

#### 文档
- ✅ **API 文档** (`docs/API.md`) - 完整的前后端 API 接口说明
- ✅ **网页原型** (`docs/prototype.html`) - 交互式 HTML 原型
- ✅ **测试说明** (`backend/TESTS_README.md`)
- ✅ **原型文档** (`docs/PROTOTYPE.md`)

---

## 🔧 已修复问题

### 导入问题 (旧代码适配)
**问题**: 项目中存在大量相对导入 (`from ..`, `from .`) 在直接运行模块时失败

**修复**:
- `main.py`: 改用绝对导入
- `routers/*.py`: 改用绝对导入
- `dependencies.py`, `auth.py`: 改用绝对导入
- `models/*.py`: 改用绝对导入
- `models/__init__.py`, `schemas/__init__.py`, `routers/__init__.py`: 正确导出模块

### FastAPI 依赖注入问题
**问题**: 使用 `Annotated[Depends]` 的参数不能在参数使用默认值

**修复**:
- `routers/members.py`: 将 `db` 参数移至参数列表开头
- `routers/users.py`: 将 `db` 参数移至参数列表开头

### Pydantic V2 兼容性
**问题**: `orm_mode = True` 在 Pydantic V2 中已重命名为 `from_attributes`

**修复**:
- `schemas/blog.py`: 改用 `from_attributes = True`
- `schemas/user.py`: 改用 `from_attributes = True`

### bcrypt 兼容性与密码长度限制
**问题**:
1. passlib[bcrypt] 与 bcrypt 4.x 不兼容
2. bcrypt 有 72 字节密码长度限制

**修复**:
- `requirements.txt`: 分离 passlib 和 bcrypt，指定 bcrypt==4.0.1
- `auth.py`: 在哈希前将密码截断至 72 字节

### 登录 Schema 不匹配
**问题**: 后端使用 `UserBase` schema (需要 username, email, nickname)，前端发送 username_or_email, password

**修复**:
- `schemas/user.py`: 创建 `UserLogin` schema
- `routers/auth.py`: 登录接口改用 `UserLogin` schema

### JWT Token 问题
**问题**: JWT `sub` claim 必须是字符串，但代码中存储了整数

**修复**:
- `routers/auth.py`: Token 创建时将 user.id 转为字符串
- `dependencies.py`: Token 解析时处理字符串/整数转换

### 前端错误显示
**问题**: FastAPI 验证错误 (422) 返回数组，前端显示 `[object Object]`

**修复**:
- `frontend/src/api/client.ts`: 处理不同格式的 error.detail

### BlogListResponse 缺失导出
**问题**: 添加 `BlogListResponse` schema 后未在 `schemas/__init__.py` 中导出，导致后端启动失败

**修复**:
- `backend/schemas/__init__.py`: 添加 `BlogListResponse` 到导入列表和 `__all__`

### 用户博客列表 API 返回格式不匹配
**问题**: `/api/users/{id}/blogs` 返回的是 `list[BlogListItem]`，但前端期望分页格式 `BlogListResponse`

**修复**:
- `backend/schemas/blog.py`: 添加 `BlogListResponse` schema
- `backend/routers/users.py`: 修改 `get_user_blogs` 返回 `BlogListResponse` (包含 total, page, size, items)
- `frontend/src/routes/UserProfile.tsx`: 使用可选链 `blogs?.items` 避免空值错误

### 路由顺序问题
**问题**: `/users/me` 被 `/users/:userId` 路由匹配，`me` 被当作 `userId` 参数，导致 `parseInt('me')` 返回 `NaN`

**修复**:
- 创建 `frontend/src/routes/EditProfile.tsx` 编辑资料页面
- `frontend/src/App.tsx`: 将 `/users/me` 路由放在 `/users/:userId` 之前 (更具体的路由优先匹配)

---

## 🚧 当前状态

### 后端
- ✅ 服务正常启动 (http://localhost:8000)
- ✅ 所有 API 路由正常工作
- ✅ 数据库自动创建表
- ✅ Swagger 文档可访问 (http://localhost:8000/docs)

### 前端
- ✅ 开发服务器正常运行 (http://localhost:3000)
- ✅ 用户注册功能正常
- ✅ 用户登录功能正常
- ✅ Token 正确保存和发送
- ✅ 认证状态正常
- ✅ 导航栏显示登录状态

### 数据流
1. 用户注册 → 后端创建用户 → 返回 Token → 前端保存 Token → 获取用户信息 → 跳转首页 ✅
2. 用户登录 → 后端验证凭据 → 返回 Token → 前端保存 Token → 获取用户信息 → 跳转首页 ✅

---

## 📋 待实现功能

### 优先级: 高

#### 评论系统
- [ ] 评论模型 (Comment)
- [ ] 评论 API（创建、获取、删除）
- [ ] 前端评论组件

### 优先级: 中

#### 博客功能增强
- [ ] 升级到专业的 Markdown 渲染库 (react-markdown 或 marked)
- [ ] 代码语法高亮 (react-syntax-highlighter 或 prism.js)
- [ ] 图片上传功能
- [ ] 博客分类/标签系统

### 优先级: 低

#### 其他功能
- [ ] 用户头像上传
- [ ] 博客搜索功能
- [ ] 博客点赞/收藏
- [ ] 通知系统
- [ ] 密码重置

---

## 📁 项目结构

```
V4Corner/
├── backend/
│   ├── auth.py                      # 认证工具函数
│   ├── database.py                  # 数据库连接配置
│   ├── dependencies.py              # FastAPI 依赖注入
│   ├── main.py                      # FastAPI 应用入口
│   ├── models/                      # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── blog.py
│   ├── routers/                     # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── blogs.py
│   │   ├── users.py
│   │   └── members.py
│   ├── schemas/                     # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── blog.py
│   ├── test_api.py                  # Python 测试脚本
│   ├── test_api.bat                 # Windows 快速测试
│   ├── test_api.sh                  # Linux/Mac 快速测试
│   ├── TESTS_README.md              # 测试说明
│   └── requirements.txt             # Python 依赖
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # API 客户端
│   │   │   ├── client.ts            # 通用请求客户端
│   │   │   ├── auth.ts              # 认证 API
│   │   │   ├── blogs.ts             # 博客 API
│   │   │   ├── users.ts             # 用户 API
│   │   │   └── members.ts           # 成员 API
│   │   ├── components/              # React 组件
│   │   │   └── Navbar.tsx
│   │   ├── contexts/                # React Context
│   │   │   └── AuthContext.tsx      # 认证上下文
│   │   ├── routes/                  # 页面组件
│   │   │   ├── BlogDetail.tsx
│   │   │   ├── Blogs.tsx
│   │   │   ├── CreateBlog.tsx
│   │   │   ├── EditBlog.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── Register.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── types/                   # TypeScript 类型
│   │   │   ├── auth.ts
│   │   │   ├── blog.ts
│   │   │   └── user.ts
│   │   └── utils/                   # 工具函数
│   │       └── markdown.ts          # Markdown 转 HTML
│   │   ├── App.tsx                  # 主应用组件
│   │   └── main.tsx                 # 应用入口
│   └── package.json                 # Node 依赖
│
├── docs/
│   ├── API.md                       # API 接口文档
│   ├── PROTOTYPE.md                 # 原型文档
│   └── prototype.html               # 交互式原型
│
├── README.md                        # 项目说明
├── CLAUDE.md                        # Claude Code 使用指南
└── PROGRESS.md                      # 本文件 - 开发进度
```

---

## 🚀 启动命令

### 后端
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 测试
```bash
cd backend
python test_api.py
```

---

## 🔗 重要链接

- 前端开发服务器: http://localhost:3000
- 后端 API 服务: http://localhost:8000
- Swagger API 文档: http://localhost:8000/docs
- 网页原型: `docs/prototype.html`

---

## 💡 下次开发建议

1. **评论系统** - 为博客添加评论功能，增强互动性
2. **升级 Markdown 渲染** - 使用 `react-markdown` 或 `marked` 替换当前简单实现
3. **代码语法高亮** - 使用 `react-syntax-highlighter` 或 `prism.js`
4. **图片上传** - 支持博客内容中的图片
5. **完善错误处理** - 统一的错误提示组件

---

## 📝 备注

- 所有旧代码的导入问题已解决
- JWT Token 正确处理字符串类型
- bcrypt 密码长度限制已处理
- 前后端数据格式完全匹配
- 认证流程完整可用
- **博客系统核心功能已完成**（列表、详情、创建、编辑、删除）
- **游客可访问博客内容**
- **实时预览功能已实现**
- 项目处于可继续开发状态

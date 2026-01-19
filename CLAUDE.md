# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

V4Corner 是**行健-车辆4班**的班级在线空间，用于展示班级信息、记录实践经历、分享学习心得与 AI 使用成果。

**核心功能：**
- 主页展示、成员介绍
- 博客系统（发布文章、项目经验）
- AI 对话系统（支持 8 种 AI 服务商）
- 用户认证、个人中心

**技术栈：**
- Frontend: React 18 + TypeScript 5 + Vite 5
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: SQLite (开发) / PostgreSQL (生产)
- API: RESTful + Server-Sent Events (流式输出)

**当前版本：** v1.2.0

---

## Documentation Structure

### 核心文档

| 文档 | 路径 | 作用 |
|------|------|------|
| **README.md** | `/README.md` | 项目介绍、快速开始、AI 配置指南 |
| **开发进度** | `/docs/PROGRESS.md` | 版本历史、更新日志、开发中功能 |
| **API 文档** | `/docs/API.md` | 完整的前后端 API 接口说明（v1.2.0） |
| **BUG 修复** | `/docs/FIXED_BUG.md` | 已修复的 BUG 记录和解决方案 |
| **开发规范** | `/docs/WORKFLOW.md` | 代码规范和开发流程 |
| **原型设计** | `/docs/PROTOTYPE.md` | 功能原型和交互设计 |

### 技术文档

| 文档 | 路径 | 作用 |
|------|------|------|
| **网页原型** | `/docs/prototype.html` | 可交互的 HTML 原型 |

### 配置文件

| 文件 | 路径 | 作用 |
|------|------|------|
| **环境变量示例** | `/backend/.env.example` | 8 种 AI 服务商的配置模板 |
| **依赖列表** | `/backend/requirements.txt` | Python 依赖和安装说明 |
| **Docker 配置** | `/docker-compose.yml` | 容器化部署配置 |

---

## Architecture

### Backend (FastAPI)

```
backend/
├── main.py              # FastAPI 应用入口、路由注册
├── config.py            # 配置管理（v1.2.0 新增）
├── database.py          # SQLAlchemy 数据库连接
├── dependencies.py      # 依赖注入（认证、数据库会话）
├── auth.py              # JWT 认证逻辑
│
├── models/              # SQLAlchemy ORM 模型
│   ├── __init__.py
│   ├── user.py          # 用户模型
│   ├── blog.py          # 博客模型
│   ├── conversation.py  # 对话模型（v1.1.0）
│   └── message.py       # 消息模型（v1.1.0）
│
├── schemas/             # Pydantic 数据验证
│   ├── __init__.py
│   ├── auth.py          # 认证相关 Schema
│   ├── blogs.py         # 博客 Schema
│   └── chat.py          # 对话 Schema（v1.1.0）
│
├── routers/             # API 路由
│   ├── auth.py          # 认证接口（注册、登录、登出）
│   ├── users.py         # 用户管理
│   ├── blogs.py         # 博客 CRUD
│   ├── members.py       # 成员列表
│   └── chat.py          # AI 对话接口（v1.1.0）
│
└── services/            # 业务逻辑层（v1.2.0 新增）
    ├── __init__.py
    └── ai_service.py    # AI 服务（支持 8 种服务商）
```

**关键模式：**
- 所有 Model 继承自 `Base`，表自动创建
- Router 使用依赖注入：`db: Session = Depends(database.get_db)`
- Schema 分为 `Create`（输入）和 `Read`（输出）变体
- 新 Router 在 `main.py` 中注册：`app.include_router()`

### Frontend (React)

```
frontend/src/
├── main.tsx             # 应用入口
├── App.tsx              # 根组件、路由配置
├── api/                 # API 客户端
│   ├── client.ts        # 通用请求封装
│   └── chat.ts          # AI 对话 API（v1.1.0）
│
├── types/               # TypeScript 类型定义
│   └── chat.ts          # 对话类型（v1.1.0）
│
├── routes/              # 页面组件
│   ├── Home.tsx         # 首页
│   ├── Blogs.tsx        # 博客列表
│   ├── BlogDetail.tsx   # 博客详情
│   ├── Members.tsx      # 成员列表
│   ├── ChatList.tsx     # AI 对话列表（v1.1.0）
│   └── ChatDetail.tsx   # AI 对话详情（v1.1.0）
│
├── components/          # 可复用组件
│   ├── Navbar.tsx       # 导航栏
│   └── ...
│
└── contexts/            # React Context
    └── AuthContext.tsx  # 认证状态管理
```

**关键模式：**
- Types 必须与 Backend Schema 完全匹配
- API base URL 通过 `VITE_BACKEND_URL` 环境变量配置
- 路由采用文件式组件，在 `App.tsx` 中导入

---

## Development Guidelines

### 添加新功能的步骤

#### 1. Backend（添加新的 API 端点）

```bash
# 1. 创建 Model（backend/models/feature.py）
class Feature(Base):
    __tablename__ = "features"
    id: int = Column(Integer, primary_key=True)
    name: str = Column(String(100))

# 2. 创建 Schema（backend/schemas/feature.py）
class FeatureCreate(BaseModel):
    name: str

class FeatureRead(BaseModel):
    id: int
    name: str

# 3. 创建 Router（backend/routers/feature.py）
@router.get("/features", response_model=List[FeatureRead])
async def list_features(db: Session = Depends(database.get_db)):
    ...

# 4. 注册 Router（backend/main.py）
app.include_router(feature.router, prefix="/api/feature", tags=["Feature"])
```

#### 2. Frontend（添加新的页面）

```bash
# 1. 创建 Type（frontend/src/types/feature.ts）
export interface Feature {
  id: number;
  name: string;
}

# 2. 创建 API 函数（frontend/src/api/feature.ts）
export async function getFeatures(): Promise<Feature[]> {
  return apiRequest<Feature[]>("/api/feature/features");
}

# 3. 创建页面组件（frontend/src/routes/Features.tsx）
export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  ...
}

# 4. 添加路由（frontend/src/App.tsx）
<Route path="/features" element={<Features />} />
```

### 数据库变更

- 开发环境：表自动创建，无需迁移
- 生产环境：考虑使用 Alembic 管理迁移

### 类型同步

**Critical**: Frontend Types 必须与 Backend Schema 完全匹配。

```python
# Backend Schema
class BlogCreate(BaseModel):
    title: str
    content: str
```

```typescript
// Frontend Type
export interface BlogCreate {
  title: string;
  content: string;
}
```

### AI 服务配置（v1.2.0）

**配置位置**: `backend/.env`

```bash
# 模拟模式（默认，无需配置）
# 不配置任何 API Key，系统自动使用模拟模式

# 真实 AI 模式
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo

# 或使用其他服务商（详见 .env.example）
```

**测试配置**:
```bash
cd backend
python test_ai_mode.py  # 验证 AI 模式切换
```

---

## Development Commands

### Backend

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 运行测试
python test_backend.py
python test_ai_mode.py
```

### Frontend

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Docker

```bash
# 启动所有服务
docker-compose up --build

# 访问地址
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Project Standards

### 文档规范

**原则：尽量不新建文档，而在现有文档中改动**

1. **版本更新** → 修改 `docs/PROGRESS.md`
2. **BUG 修复** → 修改 `docs/FIXED_BUG.md`
3. **功能说明** → 修改 `README.md`
4. **API 变更** → 修改 `docs/API.md`
5. **开发规范** → 修改 `docs/WORKFLOW.md`

**不新建文档的情况：**
- 避免创建 CHANGELOG.md（使用 PROGRESS.md）
- 避免创建 SETUP_GUIDE.md（使用 README.md）
- 避免创建详细配置文档（使用 .env.example 注释）

**可以新建文档的情况：**
- 必须独立的参考文档
- 特殊的技术规范文档

### 代码规范

1. **保持简洁**
   - 优先可读性
   - 避免过度工程化
   - 不添加未使用的功能

2. **类型安全**
   - Frontend 必须使用 TypeScript
   - Backend 必须使用 Pydantic 验证
   - 保持类型同步

3. **错误处理**
   - API 返回合适的 HTTP 状态码
   - 提供清晰的错误消息
   - 前端显示友好的错误提示

4. **测试**
   - Backend: 使用 `test_backend.py`
   - AI 功能: 使用 `test_ai_mode.py`
   - 手动测试关键流程

### 提交规范

```bash
# 功能开发
git commit -m "feat: 添加 AI 对话导出功能"

# BUG 修复
git commit -m "fix: 修复 Ollama 无条件启用的问题"

# 文档更新
git commit -m "docs: 更新 README.md 添加 AI 配置说明"

# 依赖更新
git commit -m "chore: 更新 requirements.txt 添加 pydantic-settings"
```

---

## Current Status

**已完成（v1.2.0）:**
- ✅ 用户认证系统（JWT）
- ✅ 博客系统（CRUD、Markdown）
- ✅ 用户管理（个人中心、头像上传）
- ✅ 成员系统（列表、搜索）
- ✅ AI 对话系统（8 种服务商、流式输出）

**开发中:**
- ⏳ 上下文管理优化
- ⏳ Token 配额系统
- ⏳ 评论系统
- ⏳ 文件上传优化

详见：`docs/PROGRESS.md`

---

## Quick Reference

### 重要链接

- **API 文档**: http://localhost:8000/docs（后端运行时）
- **开发进度**: [docs/PROGRESS.md](docs/PROGRESS.md)
- **API 接口**: [docs/API.md](docs/API.md)
- **BUG 记录**: [docs/FIXED_BUG.md](docs/FIXED_BUG.md)

### 常见问题

**Q: 后端启动报错 `ModuleNotFoundError`?**
```bash
cd backend
pip install -r requirements.txt
```

**Q: 如何启用真实 AI?**
```bash
# 编辑 backend/.env
OPENAI_API_KEY=sk-your-key

# 重启后端
uvicorn main:app --reload
```

**Q: 前端无法连接后端?**
- 检查 `VITE_BACKEND_URL` 环境变量
- 确保后端运行在 http://localhost:8000

---

**最后更新**: 2025-01-19 (v1.2.0)

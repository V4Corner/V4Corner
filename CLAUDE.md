# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

V4Corner 是**行健-车辆4班**的班级在线空间，用于集中展示班级信息、记录实践经历，以及分享学习心得与 AI 使用成果。

核心功能包括：
- 主页展示
- 成员介绍
- 博客系统（发布文章、项目经验、实践记录）

项目采用 React + FastAPI + Docker 现代技术栈，由班级团队协作开发，结构清晰、易于维护和扩展。使用 SQLite 数据库（开发环境），可轻松切换到 PostgreSQL 等生产级数据库。

## Architecture

### Backend (FastAPI + SQLAlchemy)

- **Entry point**: `backend/main.py` - FastAPI app with CORS middleware
- **Database**: `backend/database.py` - SQLAlchemy setup with SQLite (`./v4corner.db`)
- **Models**: `backend/models/` - SQLAlchemy ORM models (inherit from `Base`)
- **Schemas**: `backend/schemas/` - Pydantic models for request/response validation
- **Routers**: `backend/routers/` - API endpoints grouped by feature

**Key patterns:**
- All models inherit from `Base` (database.py) - tables are auto-created on startup via `Base.metadata.create_all()`
- Routers use dependency injection: `db: Session = Depends(database.get_db)`
- Schemas split into `Create` (input) and `Read` (output) variants
- Add new routers in `main.py` with `app.include_router()`

### Frontend (React + TypeScript + Vite)

- **Entry point**: `frontend/src/main.tsx` → `App.tsx`
- **Routing**: React Router v6 with routes in `frontend/src/routes/`
- **API client**: `frontend/src/api/client.ts` - fetch wrapper using `VITE_BACKEND_URL` env var
- **Types**: `frontend/src/types/` - TypeScript interfaces matching backend schemas
- **Components**: `frontend/src/components/` - reusable components

**Key patterns:**
- Types must match backend schemas exactly (e.g., `Blog` interface matches `BlogRead` schema)
- API base URL defaults to `http://localhost:8000` but respects `VITE_BACKEND_URL`
- Routes are file-based components imported in `App.tsx`

## Development Commands

### Backend

```bash
cd backend

# Initial setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Interactive API docs available at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Initial setup
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker

```bash
# Run both services
docker-compose up --build

# Services run on:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Important Implementation Details

### Database Schema Changes

When adding new models:
1. Create model in `backend/models/` inheriting from `Base`
2. Create corresponding Pydantic schemas in `backend/schemas/`
3. Tables auto-create on backend restart (no migration tool currently)
4. For production, consider switching to PostgreSQL and adding Alembic migrations

### Type Synchronization

**Critical**: Frontend types must exactly match backend schemas. When adding new API endpoints:

1. Backend schema (`backend/schemas/*.py`):
```python
class BlogCreate(BaseModel):
    title: str
    content: str
    author: str
```

2. Frontend type (`frontend/src/types/*.ts`):
```typescript
export interface BlogCreate {
  title: string;
  content: string;
  author: string;
}
```

### Adding New API Endpoints

1. Create Pydantic schemas in `backend/schemas/`
2. Create SQLAlchemy model in `backend/models/`
3. Add routes in `backend/routers/` using the router pattern
4. Register router in `backend/main.py`
5. Add TypeScript types in `frontend/src/types/`
6. Add API client functions in `frontend/src/api/client.ts`

### CORS Configuration

Backend allows all origins (`allow_origins=["*"]`) for development. For production, update the CORS middleware in `backend/main.py` to restrict to specific domains.

## Documentation

- **API 文档**: `docs/API.md` - 完整的前后端 API 接口参考文档
- **FastAPI 自动文档**: 后端运行时访问 `/docs` 获取交互式 API 文档
- **项目说明**: `README.md` - 项目介绍和快速开始指南

## Current Implementation Status

**已实现功能：**
- 博客系统（创建博客、获取列表、获取详情）
- 基础页面路由（首页、博客页、关于页）
- 健康检查接口
- Docker 容器化部署

**计划开发功能（详见 docs/API.md）：**
- 用户认证系统（JWT）
- 成员介绍模块
- 评论系统
- 文件上传（图片、附件）
- 搜索功能
- 博客的编辑与删除

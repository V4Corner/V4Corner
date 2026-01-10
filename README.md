# V4Corner

V4Corner 是**行健-车辆4班**打造的班级在线空间，用来集中展示班级信息、记录实践经历，并提供一个分享学习心得与 AI 使用成果的平台。

网站包含主页、成员介绍、博客系统等核心功能，支持同学们发布自己的文章、项目经验或实践记录，让班级的成长和内容能够长期沉淀与互相参考。项目采用 React + FastAPI + Docker 的现代技术栈，由班级团队协作开发，结构清晰、易于维护，后续也能随时扩展新的功能。

## 项目结构

- `frontend/`: React + TypeScript + Vite 前端应用
- `backend/`: FastAPI 后端服务，使用 SQLAlchemy ORM 和 Pydantic 数据验证
- `docs/`: 项目文档，包含完整的 API 接口文档
- `database/`: 数据库相关说明（默认使用 SQLite）
- `docker/`: 前后端 Docker 镜像配置
- `docker-compose.yml`: 一键启动前后端服务（SQLite 使用文件存储，无需独立容器）

## 文档

- **[开发进度](PROGRESS.md)** - 当前开发状态和已完成功能
- **[API 接口文档](docs/API.md)** - 完整的前后端 API 接口说明
- **[网页原型](docs/prototype.html)** - 交互式 HTML 原型，可在浏览器中直接查看
- **[后端测试说明](backend/TESTS_README.md)** - API 测试脚本使用指南
- **FastAPI 自动文档** - 启动后端后访问 http://localhost:8000/docs 查看交互式 API 文档（Swagger UI）

## 本地开发

### 前端开发
```bash
cd frontend
npm install
npm run dev
```
前端开发服务器运行在 http://localhost:3000

### 后端开发
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
后端 API 服务运行在 http://localhost:8000

### 使用 Docker Compose（推荐）
```bash
docker-compose up --build
```
- 前端：http://localhost:3000
- 后端：http://localhost:8000
- API 文档：http://localhost:8000/docs

## 数据库

默认使用 SQLite，数据库文件保存在 `backend/v4corner.db`。如需切换到 PostgreSQL 或其他数据库，可修改 `backend/database.py` 中的连接字符串。

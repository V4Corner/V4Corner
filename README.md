# V4Corner

V4Corner 是行健-车辆4班打造的班级在线空间，用来集中展示班级信息、记录实践经历，并提供一个分享学习心得与 AI 使用成果的平台。

## ✨ 核心功能

#### 🏠 主页
- 三栏布局（左：通知+数据，中：博客，右：签到+日历）
- 班级通知系统（重要标记、浏览量统计）
- 班级数据统计（成员数、博客数、签到记录）
- 班级日历（迷你月视图、点击显示日程）
- 博客推送（按时间）
- 快速导航入口

#### 📢 班级通知系统
- 通知列表页（卡片式布局、分页浏览）
- 通知详情页（Markdown 内容、浏览量统计）
- 重要通知标记（红色徽章）
- 完整 CRUD 功能（创建、查看、编辑、删除）
- 权限控制（发布者和管理员）

#### ✅ 签到系统
- 每日签到功能
- 运势抽签（大吉/中吉/小吉/中平/凶/大凶）
- 宜忌建议（114 条校园生活主题）
- 连续签到统计
- 数据持久化（localStorage）

#### 🔥 最新动态系统
- 自动记录用户行为（博客、通知、签到里程碑）
- 首页动态流展示（彩色图标、时间显示）
- 点击跳转到关联对象
- 支持 5 种动态类型

#### 📅 班级日历
- 迷你月视图
- 事件指示器（重要日程红色圆点）
- 点击日期查看日程详情
- 支持全天和定时活动

#### 👥 成员系统
- 成员列表展示
- 个人主页
- 头像上传
- 资料编辑

#### 📝 博客系统
- 富文本编辑器
- 搜索与筛选系统
- 草稿系统
- 评论系统
- 通知系统
- 点赞收藏系统

#### 🤖 AI 对话系统
- **ChatGPT 风格**的对话界面
- **流式输出**，实时打字机效果
- 多对话管理
- 消息反馈机制
- 对话导出（Markdown/JSON/TXT）
- 消息复制和分享

#### 🔐 用户认证
- 用户注册和登录
- **邮件验证码**（注册需要邮箱验证）
- JWT Token 认证
- 个人中心管理

## 项目结构

- `frontend/`: React + TypeScript + Vite 前端应用
  - `src/routes/`: 页面组件
  - `src/components/`: 可复用组件
  - `src/api/`: API 客户端
  - `src/types/`: TypeScript 类型定义
  - `src/contexts/`: React Context（认证状态）

- `backend/`: FastAPI 后端服务
  - `models/`: SQLAlchemy ORM 模型
  - `schemas/`: Pydantic 数据验证
  - `routers/`: API 路由
  - `auth.py`: JWT 认证逻辑

- `docs/`: 项目文档
  - `API.md`: 完整的 API 接口文档
  - `PROGRESS.md`: 开发进度
  - `PROTOTYPE.md`: 原型设计文档
  - `prototype.html`: 交互式网页原型

- `docker/`: Docker 配置
- `docker-compose.yml`: 一键启动脚本

## 📚 文档

- **[开发进度](docs/PROGRESS.md)** - 版本历史和更新日志
- **[API 接口文档](docs/API.md)** - 完整的前后端 API 接口说明（v1.8.0）
- **[生产环境部署](docs/DEPLOYMENT.md)** - 服务器部署、安全配置、运维管理
- **[网页原型](docs/PROTOTYPE.md)** - 原型设计文档（v1.8.0）
- **[交互式原型](docs/prototype.html)** - 可在浏览器中直接查看
- **[BUG 修复记录](docs/FIXED_BUG.md)** - 已修复的 BUG 记录
- **[开发规范](docs/WORKFLOW.md)** - 代码规范和开发流程

## 🚀 开始

### 前置要求

- Node.js 18+
- Python 3.10+
- FFmpeg（可选，用于媒体压缩功能）
- Docker & Docker Compose（可选）

### 本地开发

#### 1. 克隆仓库
```bash
git clone <repository-url>
cd V4Corner
```

#### 2. 启动后端
```bash
cd backend

# 创建虚拟环境，只第一次启动时
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖，只第一次启动时
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端 API 服务运行在 http://localhost:8000

#### 3. 启动前端
```bash
cd frontend

# 安装依赖，只第一次启动时
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器运行在 http://localhost:3000

### 使用 Docker Compose

一键启动前后端服务：

```bash
docker-compose up --build
```

访问地址：
- 前端：http://localhost:3000
- 后端：http://localhost:8000
- API 文档：http://localhost:8000/docs

### 🌐 生产环境部署

生产环境部署查看 **[完整部署指南](docs/DEPLOYMENT.md)**

**安全检查清单**：
- 🔒 关闭开发模式：`SKIP_EMAIL_VERIFICATION=False`
- 🔑 使用强随机密钥：至少 32 位
- 📧 配置真实邮箱：SMTP 授权码
- 🔐 启用 HTTPS：SSL 证书

**📖 完整部署文档**：[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📖 API 版本

**当前版本：v2.1.1**（2026-01-25）

详细 API 文档：[docs/API.md](docs/API.md)

## 📝 开发规范

详细的开发规范请参考：[docs/WORKFLOW.md](docs/WORKFLOW.md)

## 🛠 技术栈

### 前端
- React 18.3
- TypeScript 5
- Vite 5.4
- React Router v6
- ReactDOM 18
- TipTap（富文本编辑器）
- browser-image-compression（图片压缩）

### 后端
- FastAPI 0.115.5
- SQLAlchemy 2.0.35
- Pydantic 2.9.2
- Uvicorn 0.32.0
- Python-jose（JWT）
- Bcrypt（密码哈希）

### 开发工具
- Docker & Docker Compose
- Git
- ESLint
- Prettier

---

**行健-车辆4班** © 2025

Built with ❤️ by V4Corner Team

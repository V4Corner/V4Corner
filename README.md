# V4Corner

V4Corner 是**行健-车辆4班**打造的班级在线空间，用来集中展示班级信息、记录实践经历，并提供一个分享学习心得与 AI 使用成果的平台。

网站包含主页、成员介绍、博客系统、**AI 对话系统**等核心功能，支持同学们发布自己的文章、项目经验或实践记录，与 AI 助手实时交流，让班级的成长和内容能够长期沉淀与互相参考。项目采用 React + FastAPI + Docker 的现代技术栈，由班级团队协作开发，结构清晰、易于维护，后续也能随时扩展新的功能。

## ✨ 核心功能

### 🏠 主页
- 三栏布局（左：通知+数据，中：博客，右：签到+日历）
- 班级通知系统（重要标记、浏览量统计）
- 班级数据统计（成员数、博客数、签到记录）
- 班级日历（迷你月视图、点击显示日程）
- 博客推送（按时间）
- 快速导航入口

### 📢 班级通知系统（**NEW**）
- 通知列表页（卡片式布局、分页浏览）
- 通知详情页（Markdown 内容、浏览量统计）
- 重要通知标记（红色徽章）
- 完整 CRUD 功能（创建、查看、编辑、删除）
- 权限控制（发布者和管理员）

### ✅ 签到系统
- 每日签到功能
- 运势抽签（大吉/中吉/小吉/中平/凶/大凶）
- 宜忌建议（114 条校园生活主题）
- 连续签到统计
- 数据持久化（localStorage）

### 🔥 最新动态系统（**NEW**）
- 自动记录用户行为（博客、通知、签到里程碑）
- 首页动态流展示（彩色图标、时间显示）
- 点击跳转到关联对象
- 支持 5 种动态类型

### 📅 班级日历
- 迷你月视图
- 事件指示器（重要日程红色圆点）
- 点击日期查看日程详情
- 支持全天和定时活动

### 👥 成员系统
- 成员列表展示
- 个人主页
- 头像上传
- 资料编辑

### 📝 博客系统（**v2.0.0 点赞收藏**）
- **富文本编辑器**（TipTap）
  - 所见即所得编辑体验
  - 图片上传与自动压缩
  - 视频上传与服务器端压缩
  - 文本格式化（粗体、斜体、标题、列表、引用等）
  - 链接插入与管理
  - 文本对齐（左、中、右）
  - 撤销/重做功能
- **智能媒体管理**（**v1.9.1 优化**）
  - 实时媒体统计（字数、数量、大小）
  - 图片智能压缩询问（> 20MB 可选压缩）
  - 视频容量检查（2GB 总限制）
  - 流式上传优化（支持 1GB+ 大文件）
  - 编辑时自动清理未使用媒体
  - 博客摘要媒体占位符【图片】【视频】
  - 评论内容强制换行
- **草稿系统**
  - 创建博客时可保存为草稿（只需标题）
  - 编辑博客时显示状态标签（草稿/已发布）
  - 支持状态转换（草稿↔已发布）
  - 草稿箱页面（查看、编辑、发布、删除）
  - 草稿数量统计
  - 草稿仅作者可见
  - 草稿不统计浏览次数
- **评论系统**（**v1.9.1**）
  - 楼中楼回复（最多2层嵌套）
  - 编辑评论（仅限作者）
  - 删除评论（软删除，评论作者或博客作者可删除）
  - 三种排序方式（时间正序/时间倒序/热度）
  - 级联删除（删除父评论时自动删除所有子评论）
  - 实时评论数量统计
- **通知系统**（**v1.9.1**）
  - 评论回复通知
  - 博客评论通知
  - 下拉式通知中心（铃铛图标）
  - 未读数量徽章
  - 全部标记已读、清除已读
- **点赞收藏系统**（**v2.0.0 NEW**）
  - 博客点赞/取消点赞（实时计数）
  - 博客收藏到文件夹
  - 收藏文件夹管理（创建、编辑、删除）
  - 公开/私有权限设置
  - 我的收藏页面（分页显示）
  - 收藏组织（一个博客可收藏到多个文件夹）
  - 点赞/收藏通知作者
  - 乐观更新 UI（失败自动回滚）
- Markdown + 混合内容支持
- 文章浏览和阅读计数
- 编辑和删除自己的文章

### 🤖 AI 对话系统
- **ChatGPT 风格**的对话界面
- **流式输出**，实时打字机效果
- 多对话管理
- 消息反馈机制
- 对话导出（Markdown/JSON/TXT）
- 消息复制和分享
- 支持 8 种 AI 服务商

### 🔐 用户认证
- 用户注册和登录
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
- **[网页原型](docs/PROTOTYPE.md)** - 原型设计文档（v1.8.0）
- **[交互式原型](docs/prototype.html)** - 可在浏览器中直接查看
- **[BUG 修复记录](docs/FIXED_BUG.md)** - 已修复的 BUG 记录
- **[开发规范](docs/WORKFLOW.md)** - 代码规范和开发流程

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- FFmpeg（可选，用于视频压缩功能）
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

> **注意**: 如果启动时报错 `ModuleNotFoundError: No module named 'pydantic_settings'`，说明虚拟环境缺少新依赖，请运行：
> ```bash
> pip install -r requirements.txt
> ```

后端 API 服务运行在 http://localhost:8000
交互式 API 文档：http://localhost:8000/docs

> **数据库迁移**：
> - **v1.9.0**: 评论和通知系统，新表会自动创建，无需手动迁移
> - **v1.8.0**: 如果从旧版本升级，需要运行数据库迁移脚本：
> ```bash
> cd backend
> python migrate_add_status.py
> ```

#### 3. 启动前端
```bash
cd frontend

# 安装依赖，只第一次启动时
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器运行在 http://localhost:3000

### 使用 Docker Compose（推荐）

一键启动前后端服务：

```bash
docker-compose up --build
```

访问地址：
- 前端：http://localhost:3000
- 后端：http://localhost:8000
- API 文档：http://localhost:8000/docs

## 💾 数据库

默认使用 SQLite，数据库文件保存在 `backend/v4corner.db`。

**数据库表：**
- `users` - 用户信息
- `blogs` - 博客文章
- `conversations` - AI 对话（NEW）
- `messages` - 对话消息（NEW）
- `announcements` - 班级通知
- `calendar_events` - 班级日历活动

**切换到 PostgreSQL：**

修改 `backend/database.py` 中的连接字符串：
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/v4corner"
```

## 🎯 功能演示

### AI 对话系统使用流程

1. **登录账号**
   - 访问 http://localhost:3000
   - 点击右上角"登录"
   - 输入用户名和密码

2. **进入 AI 对话**
   - 点击导航栏"AI对话 💬"
   - 点击"+ 新对话"创建对话

3. **开始对话**
   - 在输入框输入问题
   - 按 Enter 发送（Shift+Enter 换行）
   - 观察流式输出效果

4. **管理对话**
   - 点击对话卡片查看历史记录
   - 悬浮在消息上可复制或反馈
   - 点击删除按钮删除对话

### 🧪 AI 对话测试（模拟模式）

系统默认使用**模拟 AI 回复**，无需配置任何 API Key 即可测试对话功能。

#### 模拟模式特点
- ✅ **无需 API Key**：开箱即用，无需注册或配置任何 AI 服务
- ✅ **完整流程测试**：支持创建对话、发送消息、流式输出等所有功能
- ✅ **快速验证**：用于验证前后端集成和 UI 交互
- ⚠️ **仅供开发测试**：AI 回复为预设的模拟内容，非真实 AI 生成

#### 测试步骤

1. **启动服务**
   ```bash
   # 后端（模拟模式会自动启用）
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # 前端
   cd frontend
   npm run dev
   ```

2. **登录并创建对话**
   - 访问 http://localhost:3000
   - 注册/登录账号
   - 点击"AI对话 💬"
   - 点击"+ 新对话"

3. **发送测试消息**
   - 在输入框输入任意问题（如："你好，介绍一下自己"）
   - 按 Enter 发送
   - **预期结果**：
     - 消息立即显示在对话右侧（用户消息）
     - AI 开始以"打字机效果"逐字显示回复（左侧）
     - 回复内容根据输入关键词智能生成

4. **验证功能**
   - ✅ 消息流式输出（逐字显示）
   - ✅ 自动滚动到底部
   - ✅ 对话列表更新标题
   - ✅ 消息计数增加
   - ✅ 复制按钮可用
   - ✅ 反馈按钮可用

### 🚀 启用真实 AI 服务

系统支持 **8 种主流 AI 服务商**，可根据需求选择使用。

#### 快速配置

```bash
cd backend

# 1. 复制环境变量模板
cp .env.example .env

# 2. 编辑 .env 文件，配置 API Key（选择一个或多个）
# 例如使用 OpenAI：
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo

# 3. 安装对应的 AI SDK（如果还没安装）
pip install openai

# 4. 重启后端服务
uvicorn main:app --reload
```

#### 支持的 AI 服务商

| 服务商 | 特点 | 推荐场景 | 获取 API Key | 安装命令 |
|--------|------|----------|--------------|----------|
| **OpenAI** | 质量、稳定性最好 | 生产环境首选 | [platform.openai.com](https://platform.openai.com/api-keys) | `pip install openai` |
| **DeepSeek** | 性价比极高，中文友好 | 个人/小团队 | [platform.deepseek.com](https://platform.deepseek.com/) | `pip install openai` |
| **Ollama** | 完全免费，本地运行 | 隐私敏感、离线 | [ollama.ai](https://ollama.ai/) | `pip install openai` |
| **Anthropic** | 长文本能力强 | 复杂任务 | [console.anthropic.com](https://console.anthropic.com/) | `pip install anthropic` |
| **Google Gemini** | 免费额度大 | 测试/学习 | [makersuite.google.com](https://makersuite.google.com/app/apikey) | `pip install google-generativeai` |
| **智谱 GLM** | 有免费额度，中文好 | 个人开发 | [open.bigmodel.cn](https://open.bigmodel.cn/) | `pip install zhipuai` |
| **通义千问** | 国产稳定 | 企业应用 | [dashscope.aliyun.com](https://dashscope.aliyun.com/) | `pip install dashscope` |
| **文心一言** | 百度生态 | 特定需求 | [cloud.baidu.com](https://cloud.baidu.com/) | 需单独配置 |

#### 配置示例

**使用 OpenAI（推荐）**
```bash
# .env 文件
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
```

**使用 DeepSeek（性价比高）**
```bash
# .env 文件
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat
```

**使用 Ollama（完全免费，本地运行）**
```bash
# 1. 安装 Ollama: https://ollama.ai/
# 2. 下载模型: ollama pull llama3.1
# 3. 启动服务: ollama serve
# 4. 配置 .env 文件
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
ENABLE_OLLAMA=True  # 重要：需要显式启用
```

**同时配置多个（自动切换）**
```bash
# .env 文件
OPENAI_API_KEY=sk-xxxx
DEEPSEEK_API_KEY=sk-xxxx
OLLAMA_MODEL=llama3.1

# 系统会按优先级自动尝试，前面的失败后使用后面的
```

#### 高级配置

```bash
# 指定 AI 服务商（可选，不指定则自动选择）
AI_PROVIDER=openai

# 调整生成参数
AI_MAX_TOKENS=2000      # 最大生成 Token 数
AI_TEMPERATURE=0.7      # 创造性（0-2，越高越随机）
AI_TIMEOUT=30           # API 超时时间（秒）
```

详细配置说明：参考 `backend/.env.example` 文件中的注释

#### 后端测试脚本

运行后端自动化测试：

```bash
cd backend
python test_backend.py
python test_ai_mode.py
```

测试内容包括：
- 健康检查
- API 文档访问
- AI 对话 API 响应
- AI 模式切换测试（5 种场景）
- 数据库连接
- 环境变量检查

#### 常见问题

**Q: 视频压缩需要配置 FFmpeg？**

视频压缩功能需要 FFmpeg。配置步骤：

1. **安装 FFmpeg**
   - Windows: 下载 [ffmpeg-release-essentials.zip](https://www.gyan.dev/ffmpeg/builds/)
   - 解压到 `C:\ffmpeg`
   - 或使用 Chocolatey: `choco install ffmpeg`

2. **配置 FFmpeg 路径**

   编辑 `backend/ffmpeg_config.py`：
   ```python
   FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"
   ```

3. **验证配置**
   ```bash
   cd backend
   python ffmpeg_config.py
   # 应显示: ✓ FFmpeg 文件存在
   ```

4. **重启后端**
   ```bash
   uvicorn main:app --reload
   ```

**注意**: 如果不配置 FFmpeg，视频上传功能仍然可用，只是不会压缩视频。

**Q: AI 不回复？**

**Q: 如何验证配置是否正确？**
```bash
cd backend
python test_ai_mode.py
# 看到 "Total: 5/5 passed" 即为成功
```

**Q: Ollama 连接失败？**
```bash
# 1. 确认 Ollama 服务运行
ollama list

# 2. 设置 ENABLE_OLLAMA=True
# 3. 检查端口
curl http://localhost:11434/api/tags
```

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

## 📖 API 版本

**当前版本：v2.0.0**（2026-01-25）

### v2.0.0 更新内容
- ✨ **点赞收藏系统**
  - 博客点赞/取消点赞（实时计数）
  - 博客收藏到文件夹（支持多文件夹）
  - 收藏文件夹管理（创建、编辑、删除、公开/私有）
  - 我的收藏页面（分页显示、去重）
  - 点赞/收藏通知作者
  - 乐观更新 UI（失败自动回滚）
- 🔧 **API 接口**（11 个新接口）
  - 点赞：POST/DELETE/GET `/api/blogs/{blog_id}/like`
  - 收藏：POST/DELETE/GET `/api/blogs/{blog_id}/favorite`
  - 文件夹：POST/GET/PUT/DELETE `/api/users/favorites/folders`
  - 收藏列表：GET `/api/users/favorites`
  - 文件夹收藏：GET `/api/users/favorites/folders/{folder_id}`
- 🐛 **BUG 修复**
  - 路由注册顺序问题（favorites.router 必须在 users.router 之前）
  - 认证加载时序问题（检查 isLoading 再检查 isAuthenticated）
  - 数据库索引名称冲突（添加表前缀）
  - 重复函数定义（清理冗余代码）

### v1.9.0 更新内容
- ✨ **评论系统**
  - 楼中楼回复（最多2层嵌套）
  - 编辑评论（仅限作者）
  - 删除评论（软删除+级联删除）
  - 三种排序方式（时间正序/时间倒序/热度）
  - 孤儿评论处理（父评论删除后子评论自动变为顶级评论）
- ✨ **通知系统**
  - 评论回复通知
  - 博客评论通知
  - 下拉式通知中心（铃铛图标+未读徽章）
  - 全部标记已读、清除已读通知
- 🐛 **BUG 修复**
  - 评论删除后总数正确更新
  - 多个后端进程导致的请求分发问题

### v1.8.0 更新内容
- ✨ **草稿功能**
  - 创建博客时可保存为草稿
  - 编辑博客时显示状态标签
  - 支持状态转换（草稿↔已发布）
  - 草稿箱页面
  - 草稿仅作者可见

### v1.7.0 更新内容
- ✨ **博客系统重大升级**
  - 富文本编辑器（TipTap）
  - 图片自动压缩（浏览器端）
  - 视频服务器端压缩（FFmpeg）
  - 智能媒体文件清理
  - 支持最大 2GB 视频上传
  - 文本格式化、链接、对齐等丰富功能

### v1.5.0 更新内容
- ✨ **班级通知系统（完整）**
  - 通知列表页（卡片式布局、分页浏览）
  - 通知详情页（Markdown 内容、浏览量统计）
  - 完整 CRUD（创建、查看、编辑、删除）
  - 重要通知标记（红色徽章）
  - 权限控制（发布者和管理员）

- ✅ **签到系统（完整）**
  - 每日签到功能
  - 运势抽签（6 种运势等级）
  - 宜忌建议（114 条校园生活主题）
  - 连续签到统计
  - 数据持久化（localStorage）

- ✅ **班级统计数据**
  - 班级成员总数
  - 发布博客总数
  - 最长连续签到天数

### v1.4.0 更新内容
- ✨ 新增班级通知与日历 API
- ✨ 首页三栏布局优化

### v1.3.0 更新内容
- 🐛 AI 对话 BUG 修复（CORS 错误、updated_at 字段）

### v1.2.0 更新内容
- ✨ **集成真实 AI API**
  - 支持 8 种 AI 服务商（OpenAI、Anthropic、Gemini、DeepSeek、智谱、文心、通义、Ollama）
  - 智能模拟模式（无 API Key 时自动启用）
  - 自动服务商选择与降级
  - 统一的 AI 调用接口
  - 配置化管理（`.env`）
  - 上下文传递（最近 20 条消息）

### v1.1.0 功能
- ✨ 新增 AI 对话系统
  - 对话管理 API（5个接口）
  - 消息管理 API（4个接口）
  - 流式输出支持（Server-Sent Events）
  - 消息反馈机制
  - 对话导出功能

### v1.0.0 功能
- ✅ 用户认证系统（注册、登录、JWT）
- ✅ 博客系统（CRUD、Markdown）
- ✅ 用户管理（个人中心、头像上传）
- ✅ 成员系统（列表、搜索）

详细 API 文档：[docs/API.md](docs/API.md)

## 🔒 安全特性

- ✅ JWT Token 认证
- ✅ 密码哈希存储（bcrypt）
- ✅ CORS 跨域配置
- ✅ 输入验证（Pydantic）
- ✅ SQL 注入防护（SQLAlchemy ORM）
- ⏳ API 限流（计划中）

## 📱 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 贡献指南

欢迎班级成员参与开发！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

**开发规范：**
- 遵循现有代码风格
- 添加必要的注释
- 更新相关文档
- 确保代码通过测试

## 📝 开发规范

详细的开发规范请参考：[docs/WORKFLOW.md](docs/WORKFLOW.md)

**核心原则：**
- 保持代码简洁
- 优先可读性
- 避免过度工程化
- 及时更新文档

## 🗺 路线图

### v1.8.0（计划中）
- [ ] 博客搜索功能
- [ ] 博客草稿功能
- [ ] 评论系统
- [ ] 点赞/收藏功能

### 未来功能
- [ ] 通知创建/编辑页面
- [ ] 通知分类功能
- [ ] 全站搜索
- [ ] 数据统计
- [ ] 深色模式

## 📄 许可证

本项目由行健-车辆4班维护，保留所有权利。

## 📧 联系方式

如有问题或建议，请在项目中提交 Issue。

---

**行健-车辆4班** © 2025

Built with ❤️ by V4Corner Team

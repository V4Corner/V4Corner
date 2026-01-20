# V4Corner 开发进度

> 最后更新：2025-01-21

---

## 版本历史

### v1.4.0 (2025-01-21) - 首页班级通知与日历

#### ✨ 新增功能
- 首页新增**班级通知**模块（支持置顶与列表展示）
- 首页新增**班级日历**模块（活动标题展示、悬浮提示）
- 日历活动支持**重要程度**（low/normal/high）用于颜色区分

#### 🔧 技术改进
- 新增公告与日历的 API、模型与前端数据接入
- 首页博客推送按时间展示并与通知/日历统一布局

### v1.3.0 (2025-01-20) - AI 对话 BUG 修复

#### 🐛 BUG 修复
- **修复 AI 对话功能 CORS 错误**
  - 问题：访问 `/chat` 页面时出现 500 错误，CORS headers 缺失
  - 原因：Conversation 模型的 `updated_at` 字段缺少 default 值，导致数据库中存在 NULL 值
  - Pydantic 验证失败返回 500 错误

- **修复内容**：
  - `backend/models/conversation.py`: 为 `updated_at` 字段添加 `default=datetime.utcnow`
  - `backend/main.py`: 添加全局异常处理器，确保错误被正确记录和返回
  - `backend/routers/chat.py`: 在对话列表接口添加错误处理和日志记录

- **数据库迁移**：
  - 删除旧数据库文件 `v4corner.db` 让后端重新创建
  - 新数据库中的所有记录都会有正确的默认值

#### 🔧 技术改进
- 添加全局异常处理器，统一处理未捕获的异常
- 完善错误日志记录，便于问题排查
- 改进端点错误处理，提供更友好的错误信息

#### 📝 文档更新
- 更新 `docs/FIXED_BUG.md` 记录 BUG #3 的详细信息
- 更新 `docs/PROGRESS.md` 添加 v1.3.0 版本记录

#### ⚠️ 升级注意事项
- 如果从 v1.2.0 升级，需要删除旧数据库文件 `v4corner.db`
- 后端会自动创建新数据库，但所有现有数据会被清空
- 详见：`docs/FIXED_BUG.md` 中的 BUG #3

---

### v1.2.0 (2025-01-19) - 真实 AI API 集成

#### ✨ 新增功能
- **8 种 AI 服务商支持**
  - OpenAI、Anthropic Claude、Google Gemini
  - DeepSeek、智谱 AI、百度文心、阿里通义
  - Ollama（本地模型，完全免费）

- **智能模式切换**
  - 无 API Key 时自动使用模拟模式
  - AI 调用失败时自动降级到模拟模式
  - 支持多个服务商自动切换（按优先级）

- **配置化管理**
  - 统一配置模块（`backend/config.py`）
  - 环境变量配置（`.env`）
  - 支持自定义 AI 参数（max_tokens、temperature）

- **上下文管理**
  - 传递最近 20 条消息作为对话历史
  - 支持多轮连续对话

#### 🔧 技术改进
- 新增配置管理模块
- 新增 AI 服务模块（`backend/services/ai_service.py`）
- 优化聊天路由，集成真实 AI API
- 添加 AI 模式测试脚本

#### 📝 文档更新
- 扩展 `.env.example` 配置说明
- 更新 README.md 添加 AI 配置指南
- 新增 BUG 修复记录文档（`docs/FIXED_BUG.md`）
- 精简文档结构，移除冗余文档

#### 🐛 BUG 修复
- 修复 Ollama 无条件启用导致连接失败的问题
- 添加 `ENABLE_OLLAMA` 配置项
- 优化无配置时的行为（明确使用模拟模式）

#### 📦 新增文件
```
backend/
  config.py                  # 配置管理
  services/
    __init__.py
    ai_service.py            # AI 服务（核心）
  test_ai_mode.py            # AI 模式测试

docs/
  FIXED_BUG.md               # BUG 修复记录
```

#### ⚠️ 升级注意事项
- **新增依赖**: `pydantic-settings==2.5.2` 和 `openai==1.12.0`
- **升级步骤**: 运行 `pip install -r requirements.txt`
- **详见**: `docs/FIXED_BUG.md`

---

### v1.1.0 (2025-01-19) - AI 对话系统

#### ✨ 新增功能
- AI 对话列表页（创建、删除、搜索）
- AI 对话详情页（ChatGPT 风格）
- 流式输出（Server-Sent Events）
- 对话导出（Markdown/JSON/TXT）
- 消息反馈机制

#### 🔌 API 接口（10 个）
- 对话管理：5 个接口
- 消息管理：4 个接口
- 导出功能：1 个接口

#### 🗄️ 数据库
- `conversations` 表
- `messages` 表

#### 📦 新增文件
```
backend/
  models/conversation.py
  models/message.py
  schemas/chat.py
  routers/chat.py

frontend/
  src/types/chat.ts
  src/api/chat.ts
  src/routes/ChatList.tsx
  src/routes/ChatDetail.tsx
```

---

### v1.0.0 (2025-01-12) - 基础功能完成

#### ✨ 已完成功能
- 用户认证系统（注册、登录、JWT）
- 博客系统（CRUD、Markdown）
- 用户管理（个人中心、头像上传）
- 成员系统（列表、搜索）

---

## 开发中功能 🚧

- [ ] 上下文管理优化（智能摘要、长对话处理）
- [ ] Token 配额系统
- [ ] 对话自动命名
- [ ] 评论系统
- [ ] 文件上传优化
- [ ] 全站搜索
- [ ] 通知系统
- [ ] 数据统计

---

## 技术债务 🔧

### 前端优化
- [ ] 完整的 Markdown 渲染（react-markdown + highlight.js）
- [ ] 虚拟滚动（长消息列表）
- [ ] 错误边界（Error Boundary）

### 后端优化
- [ ] 数据库索引优化
- [ ] API 限流（Rate Limiting）
- [ ] 缓存层（Redis）
- [ ] 单元测试

### 部署
- [ ] CI/CD 配置
- [ ] 生产环境配置
- [ ] 监控和日志

---

## 开发团队

**行健-车辆4班**

---

## 相关链接

- [API 接口文档](docs/API.md)
- [BUG 修复记录](docs/FIXED_BUG.md)
- [网页原型](docs/prototype.html)
- [开发规范](docs/WORKFLOW.md)

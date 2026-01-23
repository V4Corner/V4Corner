# V4Corner 开发进度

> 最后更新：2026-01-23

---

## 版本历史

### v1.4.0 (2026-01-23) - 邮件验证码功能

#### ✨ 新增功能

**邮件验证码系统（完整）**
- 用户注册时发送邮箱验证码
- 验证码按钮带 60 秒冷却时间
- 验证码在页面刷新后保持冷却状态

#### 🐛 Bug 修复

**验证码冷却时间持久化**
- 修复页面刷新后验证码冷却时间丢失的问题
- 使用 localStorage 保持冷却状态

---

### v1.6.0 (2026-01-22) - 最新动态系统

#### ✨ 新增功能

**最新动态系统（完整）**
- 动态记录：自动记录用户行为（博客发布、通知发布、签到里程碑、用户加入）
- 动态展示：首页中栏显示最新动态列表，支持时间显示（"刚刚"、"2小时前"）
- 动态图标：不同类型动态带彩色图标和 emoji（博客📝、通知📢、签到🔥、用户✨）
- 动态链接：点击关联对象标题可跳转到详情页

#### 🔧 技术改进

**后端实现**
- 新增 Activity 模型：记录用户行为、关联对象、时间戳
- 新增 3 个 API 接口：
  - `GET /api/activities` - 分页获取动态列表（支持类型筛选）
  - `GET /api/activities/latest` - 获取最新动态（首页用）
  - `POST /api/activities` - 创建动态记录（内部接口）
- 集成到各模块：博客创建、通知发布、签到里程碑、用户注册
- 时间显示优化：修复时区问题（naive/aware datetime）

**前端实现**
- 新增 Activity 类型定义：ActivityListItem、ActivityListResponse
- 新增 Activity API 客户端：getActivities()、getLatestActivities()
- 新增 ActivityFeed 组件：动态列表展示，带图标和时间
- 首页集成：替换占位区域，实时显示动态

#### 📝 文档更新
- 更新 API.md：添加最新动态系统 API 文档

---

### v1.5.1 (2026-01-22) - 密码可见性切换

#### ✨ 新增功能
- **登录页面密码可见性切换**
  - 密码框右侧添加眼睛图标
  - 点击图标可切换密码显示/隐藏状态

- **注册页面密码可见性切换**
  - 密码和确认密码框均添加眼睛图标
  - 每个密码框可独立切换显示/隐藏状态

#### 🔧 技术改进
- 使用 SVG 图标实现眼睛图标（显示/隐藏）
- 通过 React state 管理密码可见性
- 使用内联样式保持图标定位

---

### v1.5.0 (2026-01-22) - 邮箱验证码 + 班级通知/签到系统

#### ✨ 新增功能

**注册邮箱验证**
- 用户注册时需要验证邮箱
- 验证码通过邮件发送到用户邮箱
- 支持邮箱/手机号切换（UI）

**验证码管理**
- 验证码生成与发送
- 6 位数字验证码，5 分钟有效期
- 60 秒发送间隔限制
- 验证码使用后自动失效

**邮件发送服务**
- 支持 QQ 邮箱 SMTP 发送
- 精美的 HTML 邮件模板
- 支持模拟模式（开发测试）
- 邮件发送失败时自动降级到模拟模式

**班级通知系统（完整）**
- 通知列表页：卡片式布局、分页浏览、重要通知标记
- 通知详情页：Markdown 内容渲染、浏览量统计、面包屑导航
- 首页集成：左栏显示最新 3 条通知
- 完整 CRUD：创建、查看、编辑、删除通知
- 权限控制：发布者可编辑/删除，支持重要标记

**签到系统（完整）**
- 签到卡片：农历日期显示、倒计时、欢迎状态
- 运势抽签：大吉/中吉/小吉/中平/凶/大凶 6 种运势
- 宜忌建议：114 条校园生活主题建议（标题+描述）
- 连续签到：自动计算连续天数和最长记录
- 数据持久化：localStorage 保存签到结果（按用户隔离）

**班级数据统计**
- 左栏数据卡片：班级成员数、发布博客数、最长连续签到
- 后端统计 API：聚合查询数据库

**日历交互优化**
- 三栏布局：左栏（320px）、中栏（flex:1, max 960px）、右栏（320px, sticky）
- 日历事件指示：单个圆点在右下角（不影响日期数字）
- 优先级颜色：重要日程红色圆点、普通深灰色、低优先级浅灰色
- 事件详情：点击日期在日历下方展开详情（非悬浮）

#### 🔧 技术改进
- 新增验证码模型、邮件服务模块
- 新增验证码 API（发送、验证）
- 注册接口集成验证码验证
- 注册成功后自动登录（返回 access_token）
- 新增通知模型、路由、Schema（6 个 API 接口）
- 新增签到模型、路由、Schema（3 个 API 接口）
- 新增统计 API 接口
- 前端组件：NoticeList、NoticeDetail、CheckInCard
- CSS 优化：三栏响应式布局、日历事件指示器样式
- 日历格子改为小方块，hover 效果优化

#### 📦 新增文件
```
backend/
  models/verification.py       # 验证码模型
  schemas/verification.py      # 验证码 Schema
  schemas/auth.py              # 认证 Schema（新增）
  routers/verification.py      # 验证码路由
  services/email_service.py    # 邮件发送服务
  test_verification.py         # 验证码测试脚本
  test_email.py               # 邮件发送测试脚本

frontend/
  src/types/verification.ts    # 验证码类型
  src/api/verification.ts     # 验证码 API
```

#### 📝 文档更新
- 更新 README.md 添加邮件配置说明
- 更新 backend/.env.example 添加 QQ 邮箱配置说明
- 更新 backend/.env 配置文件
- 添加邮件配置获取步骤说明
- 更新 API.md：添加通知和日历 API 文档
- 更新 PROTOTYPE.md：整合原型设计变更

#### ⚠️ 升级注意事项
- 新增数据库表：`verification_codes`
- 如需启用真实邮件发送，需要配置 QQ 邮箱授权码
- 详见：README.md 中的"启用邮件验证码功能"部分

#### 🐛 BUG 修复
- 修复今日日期 hover 不变深的问题（CSS 优先级）
- 修复多用户 localStorage 共用问题（使用 user.id 作为 key）

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

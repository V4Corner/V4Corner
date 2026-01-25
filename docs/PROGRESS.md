# V4Corner 开发进度

> 最后更新：2026-01-25

---

## 版本历史

### v2.1.2 (2026-01-25) - 图标系统统一 🎨

#### ✨ 新增功能

**SVG 简笔线条风格**
- 搜索框：放大镜、清除按钮（SVG 图标）
- 筛选面板：升降序箭头、日历、视图切换（SVG 图标）
- 最新动态：5 种动态类型图标（SVG 图标）
- 统一设计：`strokeWidth="2"`、`strokeLinecap="round"`、无填充

**最新动态图标优化**
- 黑色线条圆圈（边框）
- 黑色 SVG 图标（内部）
- 移除彩色背景，统一为简笔风格

#### 🔧 技术改进

**前端修改**
- `frontend/src/components/SearchBar.tsx`
  - 搜索放大镜：SVG 圆形镜框 + 手柄
  - 清除按钮：SVG 交叉线
- `frontend/src/components/BlogFilters.tsx`
  - 升降序箭头：SVG 向下箭头（可旋转）
  - 日历图标：SVG 日历框
  - 方格/列表视图：SVG 图标
- `frontend/src/components/ActivityFeed.tsx`
  - 5 种动态类型：SVG 图标
  - 移除动态颜色，统一黑色
- `frontend/src/styles.css`
  - `.activity-icon` 添加黑色边框

#### 📝 设计决策

- **视觉一致性**：所有图标统一为简笔线条风格
- **颜色统一**：图标使用黑色，不再根据类型区分颜色
- **轻量化**：移除实心背景，改用线条边框
- **可维护性**：SVG 图标比 emoji 更清晰，支持动态样式

---

### v2.1.1 (2026-01-25) - 限制系统与体验优化 🚦🎨

> 详细内容请参阅：[博客系统升级详解 - v2.1.1](./progress-details/BLOG_UPGRADE.md#v211-2026-01-25---限制系统与体验优化-)

#### ✨ 新增功能

**每日限制系统**
- 博客发布限制：50条/天（仅计算发布状态）
- 评论数量限制：500条/天
- 草稿箱容量限制：20条
- 从草稿发布同样检查每日限制

**分页系统**
- 博客总览页分页：每页15条
- 上一页/下一页按钮
- 搜索/筛选时自动重置到第一页

#### 🎨 界面优化

**通知系统重构**
- 详情页布局：采用博客详情页样式
- "重要"标识：红圆圈替代文字标签
- 权限修复：移除 `role` 字段检查

**编辑体验优化**
- 编辑博客保存草稿：自动跳转回草稿箱
- 评论区编辑框：禁止手动调整大小

---

### v2.1.0 (2026-01-25) - 博客总览升级 🔍📊

> 详细内容请参阅：[博客系统升级详解 - v2.1.0](./progress-details/BLOG_UPGRADE.md#v210-2026-01-25---博客总览升级-)

#### ✨ 新增功能

**搜索与筛选系统**
- 关键词搜索：支持标题和内容搜索
- 排序功能：发布时间、浏览量、点赞数、收藏数
- 日期范围筛选：起始日期和结束日期
- 手动搜索按钮：不再每次输入自动刷新

**双视图模式**
- 网格视图：卡片式布局，图文并茂
- 列表视图：紧凑布局，实线分隔

**SVG 图标系统**
- 点赞按钮：红色爱心（空心/实心）
- 收藏按钮：黄色五角星（空心/实心）
- 智能显示：数量为 0 时显示文字，大于 0 显示数字

**数字格式化**
- 大数字简化：999、1.2k、1.5M

**个人中心升级**
- "TA的博客"应用相同设计
- 支持搜索和筛选
- 支持网格/列表视图切换

---

### v2.0.0 (2026-01-25) - 点赞收藏系统 ⭐📁

#### ✨ 新增功能

**点赞功能**
- 用户可为博客点赞/取消点赞
- 博客列表显示点赞数
- 博客详情页显示点赞按钮
- 点赞后通知作者（非自己点赞时）
- 乐观更新 UI，失败自动回滚

**收藏功能**
- 用户可收藏博客到文件夹
- 创建收藏文件夹（名称、公开/私有权限）
- 默认文件夹：公开的"我的收藏"
- 一个博客可收藏到多个文件夹
- 收藏后通知作者（非自己收藏时）
- 文件夹管理：创建、编辑、删除
- 查看所有收藏（去重，分页）
- 查看特定文件夹的收藏
- 乐观更新 UI，失败自动回滚

**我的收藏页面**
- 新增路由：`/favorites`
- 显示所有收藏的博客（按收藏时间倒序）
- 分页显示（每页 20 篇）
- 显示收藏所在的文件夹列表
- 快速跳转到文件夹管理

**数据库设计**
- `likes` 表：用户点赞记录
- `favorite_folders` 表：收藏文件夹
- `favorites` 表：博客收藏记录（支持多文件夹）
- `blogs` 表新增：`likes_count`, `favorites_count` 字段
- 级联删除：删除博客时自动删除点赞/收藏

#### 🔧 技术改进

**后端 API (11 个接口)**
- `POST /api/blogs/{blog_id}/like` - 点赞博客
- `DELETE /api/blogs/{blog_id}/like` - 取消点赞
- `GET /api/blogs/{blog_id}/like/status` - 查询点赞状态

- `POST /api/users/favorites/folders` - 创建收藏文件夹
- `GET /api/users/favorites/folders` - 获取文件夹列表
- `PUT /api/users/favorites/folders/{folder_id}` - 更新文件夹
- `DELETE /api/users/favorites/folders/{folder_id}` - 删除文件夹
- `POST /api/blogs/{blog_id}/favorite` - 收藏博客
- `DELETE /api/blogs/{blog_id}/favorite` - 取消收藏
- `GET /api/blogs/{blog_id}/favorite/status` - 查询收藏状态
- `GET /api/users/favorites` - 获取所有收藏
- `GET /api/users/favorites/folders/{folder_id}` - 获取文件夹收藏

**前端组件**
- `LikeButton.tsx` - 点赞按钮（支持 sm/md 尺寸）
- `FavoriteButton.tsx` - 收藏按钮（文件夹选择菜单）
- `Favorites.tsx` - 我的收藏页面

**类型定义**
- `types/like.ts` - 点赞相关类型
- `types/favorite.ts` - 收藏相关类型
- `types/blog.ts` - 新增字段

#### 🐛 已修复问题

1. **路由顺序问题** - `favorites.router` 必须在 `users.router` 之前注册，避免 `/api/users/favorites` 被 `/api/users/{user_id}` 匹配
2. **重复函数定义** - 移除 `favorites.py` 中的重复 `get_folder_favorites` 函数
3. **认证加载时序** - `Favorites.tsx` 等待 `isLoading` 完成后再检查 `isAuthenticated`
4. **索引名称冲突** - 数据库索引添加表前缀避免冲突

#### 📝 设计决策

- **允许自赞/自藏** - 用户可以点赞和收藏自己的博客
- **默认公开** - 收藏文件夹默认为公开，便于分享
- **文件夹组织** - 支持将博客收藏到多个文件夹，方便分类管理
- **无确认对话框** - 取消点赞/收藏直接执行，提升操作效率
- **乐观更新** - UI 立即响应，失败时自动回滚状态

---

### v1.9.1 (2026-01-25) - 博客媒体系统优化 🎬

#### ✨ 新增功能

**智能媒体统计**
- 实时媒体文件大小统计（上传时+编辑加载时）
- 纯文本字数统计（排除 HTML 标签）
- 媒体文件数量统计（图片+视频）
- 三行统计显示：
  - 📝 纯文本字数: 123 / 5,000
  - 🖼️ 媒体文件: 2 / 20
  - 💾 媒体大小: 15.3 MB / 2 GB
- 接近限制（90%）时红色警示

**媒体文件管理 API**
- 新增 `POST /api/uploads/media/sizes` - 批量获取媒体文件大小
- 返回每个 URL 的实际字节数
- 支持编辑页面加载已有媒体大小

**优化的媒体上传体验**
- **图片上传**：
  - 移除后端大小限制
  - 前端智能检测：> 20MB 询问用户是否压缩
  - 用户可选择压缩或直接上传
  - 压缩配置：最大 1MB，分辨率 1920px，质量 80%

- **视频上传**：
  - 移除后端大小限制和自动压缩
  - 前端容量检查：超过剩余空间则拒绝
  - 友好提示："请先压缩视频或删除一些媒体文件"
  - 支持 2GB 总容量限制

- **流式上传优化**：
  - 后端使用分块读取（1MB/次）
  - 避免大文件内存溢出
  - 10 分钟超时设置
  - 详细错误日志和堆栈跟踪

#### 🔧 技术改进

**后端实现**
- 优化 `generate_excerpt()` 函数：
  - 移除所有 HTML 标签
  - 媒体文件替换为占位符：【图片】/【视频】
  - 每个媒体文件独占一行
  - 智能截断到 150 字符
- 图片/视频上传改为流式处理：
  - `while chunk := await file.read(1024 * 1024)`
  - 直接写入最终位置，无需临时文件
  - 添加 `compress_video()` 函数备用
- 新增媒体大小 API：
  - 批量查询文件大小
  - 返回 URL → Size 映射
- 图片上传返回实际文件大小（压缩后）
- 视频上传返回实际文件大小

**前端实现**
- RichTextEditor 新增 Props：
  - `onMediaUpload(url, size)` - 上传回调
  - `getRemainingCapacity()` - 获取剩余容量
- CreateBlog/EditBlog 组件：
  - `mediaFilesRef` - 存储媒体文件大小 Map
  - `getPlainTextLength()` - 纯文本字数统计
  - `getMediaCount()` - 媒体文件数量统计
  - `extractMediaUrls()` - 提取所有媒体 URL
  - 实时统计更新
  - 验证逻辑：字数、媒体数量、媒体大小
- BlogCard 组件：
  - CSS 两行截断（`-webkit-line-clamp: 2`）
  - 保留换行符（`white-space: pre-line`）
- Comments 组件：
  - 强制长单词换行（`word-break: break-word`）
  - 防止评论溢出容器

#### 📝 文档更新
- 更新 PROGRESS.md：添加 v1.9.1 版本记录
- 更新 API.md：添加媒体大小 API 文档
- 更新 BLOG_UPGRADE.md：标记媒体系统优化为已完成

#### 🐛 BUG 修复
- 修复：大文件上传临时文件丢失问题（改用流式处理）
- 修复：编辑页面媒体大小不显示问题（异步加载大小）
- 修复：视频 URL 提取不完整（支持 `<video src="">` 和 `<source>`）
- 修复：评论长字符串溢出容器（添加 word-break）

---

### v1.9.0 (2026-01-24) - 评论与通知系统 ✨

#### ✨ 新增功能

**评论系统**
- 楼中楼回复（最多2层嵌套）
- 编辑评论（仅限评论作者）
- 删除评论（软删除，评论作者或博客作者可删除）
- 三种排序方式：时间正序、时间倒序、热度排序
- 评论权限控制：
  - 发表评论需登录
  - 编辑评论仅限作者
  - 删除评论：作者或博客作者
- 博客详情页集成评论区
- 实时评论数量统计
- 头像显示（上传头像或默认首字母）

**通知系统**
- 三种通知类型：
  - 评论回复：有人回复了你的评论
  - 博客评论：有人评论了你的博客
  - 评论回复博客：有人回复了你博客下的评论
- 下拉式通知中心（铃铛图标）
- 未读数量徽章（实时显示）
- 通知操作：
  - 点击通知跳转到相关内容
  - 单个标记已读
  - 全部标记已读
  - 清除已读通知
  - 删除单个通知
- 通知列表分页加载
- 相对时间显示（刚刚、5分钟前、昨天等）

#### 🔧 技术改进

**后端实现**
- Comment 模型：
  - 支持楼中楼（parent_id 自引用）
  - 软删除（is_deleted 字段）
  - 级联删除（删除父评论时递归删除所有子评论）
  - 复合索引优化查询
- Notification 模型：
  - 支持多种通知类型
  - 已读/未读状态
  - 关联内容跳转（related_type, related_id, related_url）
- Comment API：
  - `GET /api/blogs/:blog_id/comments` - 获取评论列表（支持排序、分页）
  - `POST /api/blogs/:blog_id/comments` - 发表评论
  - `PUT /api/comments/:id` - 编辑评论
  - `DELETE /api/comments/:id` - 删除评论（软删除+级联）
- Notification API：
  - `GET /api/notifications` - 获取通知列表（支持筛选、分页）
  - `GET /api/notifications/unread-count` - 获取未读数量
  - `PUT /api/notifications/:id/read` - 标记单个已读
  - `POST /api/notifications/read-all` - 标记全部已读
  - `DELETE /api/notifications` - 清除通知（支持已读/全部）
  - `DELETE /api/notifications/:id` - 删除单个通知
- 评论创建时自动发送通知：
  - 回复评论时通知被回复的用户
  - 评论博客时通知博客作者
  - 避免重复通知（自己不通知自己）
- 孤儿评论处理：父评论已删除时，子评论自动作为顶级评论显示
- 使用 `func.count()` 确保统计数据准确性

**前端实现**
- Comment 类型定义（与后端 Schema 完全同步）
- Notification 类型定义
- Comments 组件：
  - 嵌套评论展示（最多2层）
  - 评论/回复/编辑/删除操作
  - 排序切换（时间正序/倒序/热度）
  - 分页加载
  - 未登录提示登录
- NotificationCenter 组件：
  - 下拉菜单设计
  - 未读数量徽章
  - 点击外部关闭
  - 定时刷新未读数量（30秒）
- Navbar 组件：
  - 集成通知中心铃铛图标
  - 仅登录用户可见
- BlogDetail 组件：
  - 集成 Comments 组件
  - 传递 blogId 和 blogAuthorId
- 评论 API 客户端（comments.ts）
- 通知 API 客户端（notifications.ts）

#### 📝 文档更新
- 更新 BLOG_UPGRADE.md：标记评论和通知系统为已完成
- 更新 API.md：添加评论和通知 API 文档
- 更新 PROGRESS.md：添加 v1.9.0 版本记录

#### 🐛 BUG 修复
- 修复：评论删除后总数不更新（使用 func.count 替代 query.count）
- 修复：孤儿评论问题（父评论删除后子评论被忽略）
- 修复：多个后端进程同时运行导致请求随机分发到旧代码

---

### v1.8.0 (2026-01-24) - 草稿功能 ✨

#### ✨ 新增功能

**草稿系统**
- 创建博客时支持保存为草稿（只需填写标题，内容可选）
- 编辑博客时显示当前状态（草稿/已发布标签）
- 支持状态转换：
  - 草稿 → 已发布：一键发布
  - 已发布 → 草稿：内容降级为草稿
  - 草稿 → 草稿：更新草稿内容
- 草稿箱页面：
  - 显示所有草稿列表
  - 草稿卡片：标题、内容预览、最后编辑时间
  - 操作按钮：继续编辑、发布、删除
  - 空状态提示
  - 草稿数量统计
- 博客列表页：添加"草稿箱(n)"入口（仅登录用户可见）
- 权限控制：草稿仅作者可见，其他人访问返回 404

#### 🔧 技术改进

**后端实现**
- Blog 模型添加 `status` 字段（`draft`/`published`，默认 `published`）
- 添加复合索引 `idx_author_status` 优化查询
- Blog Schema 更新：
  - BlogCreate 添加 `status` 字段（可选）
  - BlogUpdate 支持状态更新
  - BlogListItem/BlogRead 添加 `status` 字段
  - 草稿内容验证：保存草稿时内容可为空
- Blog API 更新：
  - `GET /api/blogs` 支持 `status` 参数筛选
  - 草稿筛选：`status=draft` 仅返回自己的草稿
  - `GET /api/blogs/:id` 草稿权限检查
  - `POST /api/blogs` 支持发布/草稿
  - `PUT /api/blogs/:id` 支持状态转换
  - 草稿不统计浏览次数
  - 仅已发布博客记录动态
- Users API 更新：
  - `GET /api/users/:id/blogs` 只返回已发布博客
  - 添加 `status` 字段到响应
- 数据库迁移脚本：`migrate_add_status.py`

**前端实现**
- 类型定义更新：所有 Blog 类型添加 `status` 字段
- API 客户端更新：
  - `getBlogs()` 支持 `status` 参数
  - 新增 `getDrafts()` 函数
- CreateBlog 组件：
  - 三按钮设计：取消、保存草稿、发布博客
  - 保存草稿只需标题验证
  - 发布博客需要标题和内容
- EditBlog 组件：
  - 状态标签显示（黄色草稿/绿色已发布）
  - 三按钮设计：取消、保存草稿、发布博客
  - 支持状态转换
- Blogs 组件：
  - 添加"草稿箱(n)"入口
  - 加载并显示草稿数量
- Drafts 组件（新建）：
  - 草稿列表展示
  - 相对时间显示（刚刚、2小时前、昨天等）
  - 操作功能：继续编辑、发布、删除
  - 空状态页面
- App.tsx：添加 `/blogs/drafts` 路由

#### 📝 文档更新
- 更新 PROTOTYPE.md：添加草稿箱页面设计（v1.8.0）
- 更新 API.md：添加草稿相关 API 文档（v1.8.0）
- 更新 prototype.html：添加草稿箱页面和按钮
- 更新 README.md：添加草稿功能说明

#### 🐛 BUG 修复
- 修复数据库迁移：添加 `blogs.status` 列（migrate_add_status.py）
- 修复 EditBlog 组件：移除表单 `onSubmit`，改为按钮 `onClick` 处理
- 修复 users.py 路由：`get_user_blogs` 添加 `status` 字段和状态过滤
- 修复签到卡片样式：
  - 运势颜色：大吉/中吉/小吉显示红色，其他为黑色
  - 宜忌卡片：去除边框，保留背景色和hover效果

#### ⚠️ 升级注意事项
- **数据库迁移**：运行 `python backend/migrate_add_status.py` 添加 `status` 列
- **现有数据**：所有现有博客自动设置为 `published` 状态

---

### v1.7.0 (2026-01-23) - 博客系统重大升级 ✨

#### ✨ 新增功能

**富文本编辑器（TipTap）**
- 所见即所得编辑体验，实时预览
- 完整工具栏：粗体、斜体、删除线、代码、标题（H1-H6）
- 列表支持：有序列表、无序列表、引用块
- 链接管理：插入、删除链接
- 文本对齐：左对齐、居中、右对齐
- 撤销/重做功能
- 分割线插入
- 自定义 Video 节点支持视频嵌入

**智能媒体管理**
- 图片上传与自动压缩（浏览器端）
  - 使用 browser-image-compression 库
  - 自动压缩至最大 1MB
  - 最大分辨率 1920px
  - 压缩质量 80%
  - 显示压缩前后大小对比和节省比例

- 视频上传与服务器端压缩
  - 支持最大 2GB 视频上传
  - 大于 20MB 自动触发压缩
  - 智能码率计算（目标 50MB）
  - 最大分辨率 1920x1080
  - 视频码率最高 2Mbps
  - 音频码率 128kbps
  - 流媒体优化（faststart）
  - FFmpeg 配置化管理

- 自动清理未使用媒体
  - 编辑博客时对比原始内容
  - 自动识别删除的图片/视频
  - 保存时从服务器删除未使用文件
  - 显示清理结果提示

#### 🔧 技术改进

**后端实现**
- 新增 uploads 路由：媒体文件管理
  - `POST /api/uploads/image` - 图片上传接口
  - `POST /api/uploads/video` - 视频上传与压缩接口
  - `DELETE /api/uploads/media` - 批量删除媒体接口
- 新增 ffmpeg_config.py：FFmpeg 路径配置
- 视频压缩函数：智能码率计算、FFmpeg 调用
- 跨平台文件移动：使用 shutil.move 替代 Path.rename

**前端实现**
- 新增 RichTextEditor 组件：
  - 基于 TipTap 的富文本编辑器
  - 自定义 Video 扩展节点
  - 图片上传预检查与压缩
  - 视频上传大小提示
  - 上传进度提示（图片 KB，视频 MB）
  - 成功提示显示压缩信息
- 更新 CreateBlog/EditBlog：
  - 集成富文本编辑器
  - 移除左右分栏预览布局
  - 添加媒体清理逻辑
- 更新 BlogDetail：
  - 支持富文本内容渲染
  - 添加 .rich-text-content 样式

**依赖更新**
- 前端新增：
  - @tiptap/react
  - @tiptap/starter-kit
  - @tiptap/extension-image
  - @tiptap/extension-link
  - @tiptap/extension-text-align
  - @tiptap/extension-placeholder
  - browser-image-compression
- 后端新增：
  - ffmpeg-python
  - shutil（标准库）

#### 📝 文档更新
- 更新 README.md：v1.7.0 功能说明
- 新增 BLOG_UPGRADE.md：博客升级任务跟踪
- 更新技术栈：添加 TipTap 和 browser-image-compression
- 添加 FFmpeg 配置指南

#### 🐛 BUG 修复
- 修复 Windows 跨驱动器文件移动问题（Path.rename → shutil.move）
- 修复 FastAPI JSON body 接收问题（使用 Body(..., embed=True)）
- 修复 token 键名不一致问题（'token' → 'access_token'）

#### ⚠️ 升级注意事项
- **新增依赖**：
  - 前端：运行 `npm install` 安装 TipTap 相关包
  - 后端：运行 `pip install -r requirements.txt` 安装 ffmpeg-python
- **FFmpeg 配置**（可选）：
  - 视频压缩功能需要 FFmpeg
  - 编辑 `backend/ffmpeg_config.py` 配置路径
  - 详见 README.md 中的配置说明
### v1.6.1 (2026-01-23) - 邮件验证码功能

#### ✨ 新增功能

**邮件验证码系统（完整）**
- 用户注册时发送邮箱验证码
- 验证码按钮带 60 秒冷却时间
- 验证码在页面刷新后保持冷却状态

#### 🐛 Bug 修复

**验证码冷却时间持久化**
- 修复页面刷新后验证码冷却时间丢失的问题
- 使用 localStorage 保持冷却状态

**验证码冷却倒计时优化（v1.4.1）**
- 修复倒计时显示异常（2秒1跳问题）
- 移除频繁更新 localStorage 的性能损耗
- 优化冷却时间计算逻辑，确保刷新后时间准确
- 添加定时器清理函数防止内存泄漏

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

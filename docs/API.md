# V4Corner API 接口文档

> 基于网页原型设计 v1.3.2
>
> 最后更新：2026-01-25（v2.1.2 - 图标系统统一）

## 目录

- [基础信息](#基础信息)
- [通用说明](#通用说明)
- [用户认证](#用户认证)
- [用户管理](#用户管理)
- [博客管理](#博客管理)
- [点赞与收藏系统 (Likes & Favorites)](#点赞与收藏系统-likes--favorites)
- [文件上传 (Uploads)](#文件上传-uploads)
- [成员管理](#成员管理)
- [班级通知与日历](#班级通知与日历)
- [班级通知系统 (Notices)](#班级通知系统-notices)
- [签到系统 (CheckIn)](#签到系统-checkin)
- [统计数据 (Stats)](#统计数据-stats)
- [最新动态系统 (Activity)](#最新动态系统-activity)
- [评论系统 (Comments)](#评论系统-comments)
- [用户通知 (Notifications)](#用户通知-notifications)
- [AI对话管理](#ai对话管理)
- [数据模型](#数据模型)
- [错误码说明](#错误码说明)
- [使用示例](#使用示例)

---

## 基础信息

### Base URL

```
开发环境: http://localhost:8000
生产环境: {待配置}
```

### API 版本

当前版本: `v2.1.2`（开发中）

**版本历史：**
- v2.1.2 (2026-01-25): 图标系统统一（SVG 简笔线条风格替代 emoji）
- v2.1.1 (2026-01-25): 限制系统与体验优化（每日发布限制、草稿箱上限、分页系统、通知详情页重构）
- v2.1.0 (2026-01-25): 博客搜索与筛选系统（标题/内容搜索、日期范围筛选、多种排序方式、组合筛选）
- v2.0.0 (2026-01-25): 点赞与收藏系统（点赞、收藏文件夹、权限控制、作者通知）
- v1.9.0 (2026-01-24): 评论系统（楼中楼、编辑、删除、排序、级联删除）+ 通知系统（评论通知、通知中心）
- v1.8.0 (2026-01-23): 草稿功能（博客状态、草稿箱、保存草稿/发布）
- v1.7.0 (2026-01-23): 富文本编辑器与媒体管理（图片自动压缩、视频服务器端压缩、媒体自动清理）
- v1.6.0 (2026-01-22): 最新动态系统（活动流、自动记录、时间显示）
- v1.5.0 (2026-01-22): 班级通知系统（完整CRUD）、签到系统（运势抽签）、统计数据 API
- v1.4.0 (2025-01-21): 新增班级通知与日历 API
- v1.3.0 (2025-01-20): AI 对话 BUG 修复
- v1.2.0 (2025-01-19): 集成真实 AI API（8 种服务商、智能降级）
- v1.1.0 (2025-01-19): 新增 AI 对话系统
- v1.0.0 (2025-01-12): 基础功能完成（认证、博客、用户、成员）

### 认证方式

使用 JWT Bearer Token 认证：

```
Authorization: Bearer {access_token}
```

**需要认证的接口：**
- 用户管理（查看/更新个人信息）
- 创建博客
- 编辑/删除博客
- 点赞/收藏功能
- 评论功能

**公开接口：**
- 注册/登录
- 查看博客列表
- 查看博客详情
- 查看用户公开信息
- 查看成员列表

### 响应格式

所有接口返回 JSON 格式数据。

### 时区

所有时间字段使用 UTC 时区，格式为 ISO 8601 字符串：

```json
"created_at": "2025-01-10T08:30:00.000000Z"
```

---

## 通用说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200    | 请求成功 |
| 201    | 创建成功 |
| 400    | 请求参数错误 |
| 401    | 未认证 |
| 403    | 无权限 |
| 404    | 资源不存在 |
| 422    | 数据验证失败 |
| 500    | 服务器内部错误 |

### 分页参数

```
?page=1&size=20
```

- `page`: 页码（从 1 开始）
- `size`: 每页数量（默认 20，最大 100）

### 分页响应格式

```json
{
  "total": 50,
  "page": 1,
  "size": 20,
  "items": [...]
}
```

---

## 用户认证

### POST /api/auth/register

用户注册

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "nickname": "张三"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| username | string | 是 | 3-20字符，字母数字下划线，唯一 |
| email | string | 是 | 邮箱格式，唯一 |
| password | string | 是 | 6-20字符 |
| password_confirm | string | 是 | 与 password 一致 |
| nickname | string | 否 | 2-20字符 |

**成功响应（201）：**
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "nickname": "张三",
  "created_at": "2025-01-10T08:30:00.000000Z"
}
```

**失败响应（422）：**
```json
{
  "detail": "用户名已存在"
}
```

或

```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "密码长度至少为6个字符",
      "type": "value_error"
    }
  ]
}
```

---

### POST /api/auth/login

用户登录

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "username_or_email": "zhangsan",
  "password": "password123",
  "remember_me": false
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username_or_email | string | 是 | 用户名或邮箱 |
| password | string | 是 | 密码 |
| remember_me | boolean | 否 | 记住登录状态（7天有效） |

**成功响应（200）：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": 1,
    "username": "zhangsan",
    "nickname": "张三",
    "avatar_url": null
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| access_token | string | JWT 访问令牌 |
| token_type | string | 固定值 "bearer" |
| expires_in | integer | 过期时间（秒），默认 604800（7天） |
| user | object | 当前用户信息 |

**失败响应（401）：**
```json
{
  "detail": "用户名或密码错误"
}
```

---

### POST /api/auth/logout

用户登出（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "message": "退出登录成功"
}
```

**注意：** 客户端应删除本地存储的 Token。

---

### POST /api/auth/refresh

刷新 Token（可选，用于延长登录状态）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

---

## 用户管理

### GET /api/users/me

获取当前用户信息（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "nickname": "张三",
  "avatar_url": null,
  "class": "车辆4班 · 清华大学",
  "bio": "热爱编程，专注于机器学习和深度学习领域。",
  "stats": {
    "blog_count": 15,
    "total_views": 1280
  },
  "created_at": "2024-09-01T10:00:00.000000Z"
}
```

**失败响应（401）：**
```json
{
  "detail": "未认证"
}
```

---

### PUT /api/users/me

更新当前用户信息（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "nickname": "张三丰",
  "class": "车辆4班 · 清华大学",
  "bio": "热爱编程和机器学习。"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| nickname | string | 否 | 2-20字符 |
| class | string | 否 | 最多100字符 |
| bio | string | 否 | 最多200字符 |

**成功响应（200）：**
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "nickname": "张三丰",
  "avatar_url": null,
  "class": "车辆4班 · 清华大学",
  "bio": "热爱编程和机器学习。",
  "stats": {
    "blog_count": 15,
    "total_views": 1280
  },
  "updated_at": "2025-01-11T10:00:00.000000Z"
}
```

---

### POST /api/users/me/avatar

上传用户头像（需要认证）

**请求类型：** `multipart/form-data`

**请求参数：**
```
avatar: 图片文件
```

**文件限制：**
- 格式：jpg, jpeg, png, webp
- 最大大小：2MB

**成功响应（200）：**
```json
{
  "avatar_url": "http://localhost:8000/uploads/avatars/user_1.jpg"
}
```

**失败响应（400）：**
```json
{
  "detail": "文件大小超过2MB限制"
}
```

---

### GET /api/users/:user_id

获取指定用户的公开信息

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |

**成功响应（200）：**
```json
{
  "id": 1,
  "username": "zhangsan",
  "nickname": "张三",
  "avatar_url": null,
  "class": "车辆4班 · 清华大学",
  "bio": "热爱编程，专注于机器学习和深度学习领域。",
  "stats": {
    "blog_count": 15,
    "total_views": 1280
  },
  "created_at": "2024-09-01T10:00:00.000000Z"
}
```

**注意：** 此接口不返回用户的邮箱信息。

**失败响应（404）：**
```json
{
  "detail": "用户不存在"
}
```

---

### GET /api/users/:user_id/blogs

获取指定用户的博客列表（仅已发布，支持搜索、筛选、排序）

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |

**查询参数：**
```
?q=机器学习&sort_by=created_at&sort_order=desc&date_from=2025-01-01&date_to=2025-01-31&page=1&size=10
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词（搜索标题和内容） |
| sort_by | string | 否 | 排序字段：`created_at`（发布时间）、`views`（浏览量）、`likes_count`（点赞数）、`favorites_count`（收藏数） |
| sort_order | string | 否 | 排序方向：`asc`（升序）、`desc`（降序，默认） |
| date_from | date | 否 | 起始日期（格式：YYYY-MM-DD） |
| date_to | date | 否 | 结束日期（格式：YYYY-MM-DD） |
| page | integer | 否 | 页码（默认 1） |
| size | integer | 否 | 每页数量（默认 10） |

**说明：**
- 此接口仅返回该用户**已发布**的博客
- 草稿不会出现在此列表中
- 支持组合查询：可以同时使用搜索、筛选和排序
- 如果当前用户已登录，响应会包含 `is_liked` 和 `is_favorited` 字段

**成功响应（200）：**
```json
{
  "total": 15,
  "page": 1,
  "size": 10,
  "items": [
    {
      "id": 1,
      "title": "机器学习入门指南",
      "excerpt": "机器学习是人工智能的核心技术之一...",
      "author": "张三",
      "author_id": 1,
      "author_avatar_url": null,
      "status": "published",
      "views": 128,
      "likes_count": 15,
      "favorites_count": 8,
      "is_liked": true,
      "is_favorited": false,
      "created_at": "2025-01-10T08:30:00.000000Z"
    }
  ]
}
```

**使用示例：**
```bash
# 搜索包含"机器学习"的博客
curl -X GET "http://localhost:8000/api/users/1/blogs?q=机器学习"

# 按浏览量降序排列
curl -X GET "http://localhost:8000/api/users/1/blogs?sort_by=views&sort_order=desc"

# 查询 2025 年 1 月的博客
curl -X GET "http://localhost:8000/api/users/1/blogs?date_from=2025-01-01&date_to=2025-01-31"
```

---

## 博客管理

### GET /api/blogs

获取博客列表（支持搜索、筛选、排序、分页）

**查询参数：**
```
?q=机器学习&search_in=title,content&author=zhangsan&status=published&date_from=2025-01-01&date_to=2025-01-31&sort_by=views&sort_order=desc&page=1&size=20
```

**参数说明：**

#### 搜索参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词（在标题和/或内容中搜索） |
| search_in | string | 否 | 搜索字段（`title` 仅标题、`content` 仅内容、`title,content` 同时搜索，默认 `title,content`） |

#### 筛选参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| author | string | 否 | 按作者筛选（用户名） |
| status | string | 否 | 状态筛选（`draft` 仅返回自己的草稿，`published` 返回已发布，默认 `published`） |
| date_from | string | 否 | 起始日期（格式：YYYY-MM-DD） |
| date_to | string | 否 | 结束日期（格式：YYYY-MM-DD） |

#### 排序参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sort_by | string | 否 | 排序字段（`created_at` 创建时间、`views` 浏览量、`likes` 点赞数、`favorites` 收藏数，默认 `created_at`） |
| sort_order | string | 否 | 排序方向（`asc` 升序、`desc` 降序，默认 `desc`） |

#### 分页参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20，最大100） |

**功能说明：**

1. **搜索功能（v2.1.0）：**
   - 支持按标题搜索：`q=关键词&search_in=title`
   - 支持按内容搜索：`q=关键词&search_in=content`
   - 支持同时搜索标题和内容：`q=关键词&search_in=title,content`（默认）

2. **筛选功能：**
   - 按作者筛选：`author=zhangsan`
   - 按状态筛选：`status=published` 或 `status=draft`
   - 按日期范围筛选：`date_from=2025-01-01&date_to=2025-01-31`

3. **排序功能（v2.1.0）：**
   - 按创建时间排序：`sort_by=created_at`（默认）
   - 按浏览量排序：`sort_by=views`
   - 按点赞数排序：`sort_by=likes`
   - 按收藏数排序：`sort_by=favorites`
   - 升序/降序：`sort_order=asc` 或 `sort_order=desc`

4. **组合筛选（v2.1.0）：**
   - 所有参数可以组合使用，例如：搜索「机器学习」+ 按浏览量降序 + 2025年1月：
   ```
   ?q=机器学习&sort_by=views&sort_order=desc&date_from=2025-01-01&date_to=2025-01-31
   ```

**注意：**
- 未登录用户：`status` 参数无效，只能查看已发布的博客
- 已登录用户：
  - `status=published`：查看所有已发布的博客
  - `status=draft`：仅查看自己的草稿
- 日期参数必须符合 `YYYY-MM-DD` 格式

**成功响应（200）：**
```json
{
  "total": 50,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "title": "机器学习入门指南",
      "excerpt": "机器学习是人工智能的核心技术之一，本文将介绍机器学习的基本概念、常见算法和实际应用...",
      "author": "张三",
      "author_id": 1,
      "author_avatar_url": "/uploads/avatars/avatar1.jpg",
      "status": "published",
      "views": 128,
      "likes_count": 15,
      "favorites_count": 8,
      "is_liked": false,
      "is_favorited": false,
      "created_at": "2025-01-10T08:30:00.000000Z"
    },
    {
      "id": 2,
      "title": "数据结构与算法",
      "excerpt": "学习数据结构与算法是每个程序员的必修课，本文将总结常用的数据结构和算法技巧...",
      "author": "李四",
      "author_id": 2,
      "author_avatar_url": null,
      "status": "published",
      "views": 95,
      "likes_count": 12,
      "favorites_count": 5,
      "is_liked": true,
      "is_favorited": false,
      "created_at": "2025-01-09T15:20:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| excerpt | string | 博客摘要（内容前150字，媒体文件替换为占位符） |
| author_id | integer | 作者 ID（用于跳转到用户中心） |
| author_avatar_url | string \| null | 作者头像 URL |
| status | string | 状态（`draft` 或 `published`） |
| likes_count | integer | 点赞数 |
| favorites_count | integer | 收藏数 |
| is_liked | boolean | 当前用户是否已点赞（未登录为 false） |
| is_favorited | boolean | 当前用户是否已收藏（未登录为 false） |

---

### GET /api/blogs/:blog_id

获取博客详情

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南",
  "content": "机器学习是人工智能的核心技术之一...\n\n## 什么是机器学习\n\n...",
  "author": "张三",
  "author_id": 1,
  "status": "published",
  "views": 128,
  "is_owner": false,
  "created_at": "2025-01-10T08:30:00.000000Z",
  "updated_at": "2025-01-10T08:30:00.000000Z"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | 富文本格式的完整内容 |
| status | string | 状态（`draft` 或 `published`） |
| is_owner | boolean | 当前用户是否为作者（未登录为 false） |
| updated_at | string | 最后更新时间（可选） |

**注意：**
- 每次调用此接口，博客的 `views` 字段会自动 +1（仅已发布博客）。
- **权限控制**：
  - 草稿博客：仅作者可查看，其他用户访问返回 404
  - 已发布博客：所有人可查看

**失败响应（403）：**
```json
{
  "detail": "无权限查看此草稿"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

---

### POST /api/blogs

创建新博客（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体（发布博客）：**
```json
{
  "title": "机器学习入门指南",
  "content": "<p>机器学习是人工智能的核心技术之一...</p>",
  "status": "published"
}
```

**请求体（保存草稿）：**
```json
{
  "title": "未命名草稿",
  "content": "<p>暂未完成的内容...</p>",
  "status": "draft"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-200字符 |
| content | string | 发布时是，草稿时否 | 富文本格式 |
| status | string | 否 | `draft`（草稿）或 `published`（发布），默认 `published` |

**验证规则：**
- **发布博客** (`status=published`)：
  - 标题：必填，1-200字符
  - 内容：必填，不能为空
- **保存草稿** (`status=draft`)：
  - 标题：必填，1-200字符
  - 内容：可选

**成功响应（201）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南",
  "content": "<p>机器学习是人工智能的核心技术之一...</p>",
  "author": "张三",
  "author_id": 1,
  "status": "published",
  "views": 0,
  "created_at": "2025-01-11T10:00:00.000000Z"
}
```

**失败响应（401）：**
```json
{
  "detail": "请先登录"
}
```

---

### PUT /api/blogs/:blog_id

更新博客（需要认证，仅作者）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**请求体（更新内容并保持状态）：**
```json
{
  "title": "机器学习入门指南（更新版）",
  "content": "<p>机器学习是...</p>"
}
```

**请求体（草稿→发布）：**
```json
{
  "title": "机器学习入门指南",
  "content": "<p>机器学习是...</p>",
  "status": "published"
}
```

**请求体（已发布→草稿）：**
```json
{
  "title": "机器学习入门指南",
  "content": "<p>机器学习是...</p>",
  "status": "draft"
}
```

**字段说明：** 同创建博客

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南（更新版）",
  "content": "<p>机器学习是...</p>",
  "author": "张三",
  "author_id": 1,
  "status": "published",
  "views": 128,
  "updated_at": "2025-01-11T14:30:00.000000Z"
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限编辑此博客"
}
```

---

### DELETE /api/blogs/:blog_id

删除博客（需要认证，仅作者）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**成功响应（204）：**
无内容

**失败响应（403）：**
```json
{
  "detail": "无权限删除此博客"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

---

## 点赞与收藏系统 (Likes & Favorites)

点赞与收藏系统允许用户表达对博客的喜爱，并支持收藏文件夹管理、权限控制和作者通知功能。

**功能特性：**
- 点赞/收藏博客（允许作者对自己的博客点赞/收藏）
- 收藏文件夹管理（创建、重命名、设置权限）
- 文件夹权限：公开（其他用户可查看）/ 私有（仅自己可见）
- 作者通知：点赞/收藏后通知博客作者
- 一键切换：点击即可点赞/取消点赞、收藏/取消收藏（无需确认）

**设计要点：**
- 防重复：同一用户对同一博客只能点赞/收藏一次
- 乐观更新：前端点击立即更新 UI，失败时回滚
- 级联删除：博客或用户删除时自动清理关联数据
- 计数冗余：Blog 表存储 `likes_count` 和 `favorites_count`，避免频繁 COUNT 查询

---

### 1.1 点赞博客

点赞博客（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**成功响应（200）：**
```json
{
  "liked": true,
  "likes_count": 42
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| liked | boolean | 是否已点赞（始终为 true） |
| likes_count | integer | 当前点赞总数 |

**失败响应（401）：**
```json
{
  "detail": "请先登录"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

**失败响应（409）：**
```json
{
  "detail": "已经点赞过了"
}
```

**后端逻辑：**
1. 检查博客是否存在
2. 检查用户是否已点赞（复合唯一索引 `user_id + blog_id`）
3. 创建 Like 记录，递增 `blogs.likes_count`
4. 创建通知（如果点赞者不是作者）：
   ```json
   {
     "type": "blog_liked",
     "user_id": {作者ID},
     "content": "{点赞者昵称} 点赞了你的博客《{博客标题}》",
     "target_type": "blog",
     "target_id": {博客ID}
   }
   ```
5. 返回点赞状态和总数

---

### 1.2 取消点赞

取消点赞博客（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**成功响应（200）：**
```json
{
  "liked": false,
  "likes_count": 41
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| liked | boolean | 是否已点赞（始终为 false） |
| likes_count | integer | 当前点赞总数 |

**失败响应（401）：**
```json
{
  "detail": "请先登录"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

**失败响应（404）：**
```json
{
  "detail": "未点赞过该博客"
}
```

**后端逻辑：**
1. 检查点赞记录是否存在
2. 删除 Like 记录，递减 `blogs.likes_count`
3. 返回点赞状态和总数

---

### 1.3 查询点赞状态

查询当前用户对博客的点赞状态（可选认证）

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**成功响应（200）- 已登录：**
```json
{
  "is_liked": true,
  "likes_count": 42
}
```

**成功响应（200）- 未登录：**
```json
{
  "is_liked": false,
  "likes_count": 42
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| is_liked | boolean | 当前用户是否已点赞（未登录时为 false） |
| likes_count | integer | 当前点赞总数 |

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

**后端逻辑：**
- 已登录：查询 Like 表判断 `is_liked`
- 未登录：`is_liked = false`
- 始终返回 `likes_count`（从 Blog 表）

---

### 2.1 创建收藏文件夹

创建收藏文件夹（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "name": "前端技术",
  "is_public": true
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 文件夹名称（1-50字符） |
| is_public | boolean | 否 | 是否公开，默认 `true` |

**成功响应（201）：**
```json
{
  "id": 1,
  "name": "前端技术",
  "is_public": true,
  "favorites_count": 0,
  "created_at": "2025-01-25T10:00:00.000000Z"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 文件夹 ID |
| name | string | 文件夹名称 |
| is_public | boolean | 是否公开 |
| favorites_count | integer | 收藏数量 |
| created_at | string | 创建时间 |

**失败响应（400）：**
```json
{
  "detail": "文件夹名称不能为空"
}
```

或

```json
{
  "detail": "文件夹名称已存在"
}
```

**后端逻辑：**
1. 验证名称非空、长度限制
2. 检查同名文件夹（同一用户下）
3. 创建 FavoriteFolder 记录
4. 返回文件夹信息

---

### 2.2 获取收藏文件夹列表

获取当前用户的收藏文件夹列表（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "folders": [
    {
      "id": 1,
      "name": "前端技术",
      "is_public": true,
      "favorites_count": 5,
      "created_at": "2025-01-25T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "算法学习",
      "is_public": false,
      "favorites_count": 3,
      "created_at": "2025-01-25T11:30:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| folders | array | 文件夹列表 |
| folders[].id | integer | 文件夹 ID |
| folders[].name | string | 文件夹名称 |
| folders[].is_public | boolean | 是否公开 |
| folders[].favorites_count | integer | 收藏数量 |
| folders[].created_at | string | 创建时间 |

**后端逻辑：**
1. 查询当前用户的所有文件夹
2. 统计每个文件夹的收藏数量（LEFT JOIN Favorite 表）
3. 按创建时间倒序返回

---

### 2.3 更新收藏文件夹

更新收藏文件夹名称或权限（需要认证，仅创建者）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| folder_id | integer | 文件夹 ID |

**请求体：**
```json
{
  "name": "前端开发技术",
  "is_public": false
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 新文件夹名称（1-50字符） |
| is_public | boolean | 否 | 是否公开 |

**成功响应（200）：**
```json
{
  "id": 1,
  "name": "前端开发技术",
  "is_public": false,
  "favorites_count": 5,
  "created_at": "2025-01-25T10:00:00.000000Z"
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限修改此文件夹"
}
```

**失败响应（404）：**
```json
{
  "detail": "文件夹不存在"
}
```

**后端逻辑：**
1. 检查文件夹是否存在
2. 验证是否为创建者
3. 更新指定字段（仅更新提供的字段）
4. 返回更新后的文件夹信息

---

### 2.4 删除收藏文件夹

删除收藏文件夹（需要认证，仅创建者）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| folder_id | integer | 文件夹 ID |

**成功响应（204）：**
无内容

**失败响应（403）：**
```json
{
  "detail": "无权限删除此文件夹"
}
```

**失败响应（404）：**
```json
{
  "detail": "文件夹不存在"
}
```

**后端逻辑：**
1. 检查文件夹是否存在
2. 验证是否为创建者
3. 删除文件夹及其所有收藏记录（CASCADE）

---

### 2.5 收藏博客

收藏博客到指定文件夹（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**请求体：**
```json
{
  "folder_id": 1
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folder_id | integer | 是 | 目标文件夹 ID |

**成功响应（200）：**
```json
{
  "favorited": true,
  "favorites_count": 15
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| favorited | boolean | 是否已收藏（始终为 true） |
| favorites_count | integer | 当前收藏总数 |

**失败响应（400）：**
```json
{
  "detail": "文件夹不存在"
}
```

或

```json
{
  "detail": "不能收藏到别人的私有文件夹"
}
```

**失败响应（401）：**
```json
{
  "detail": "请先登录"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

**失败响应（409）：**
```json
{
  "detail": "该博客已在此文件夹中"
}
```

**后端逻辑：**
1. 检查博客和文件夹是否存在
2. 验证文件夹权限（私有文件夹仅创建者可添加）
3. 检查是否已收藏（复合唯一索引 `user_id + blog_id + folder_id`）
4. 创建 Favorite 记录，递增 `blogs.favorites_count`
5. 创建通知（如果收藏者不是作者）：
   ```json
   {
     "type": "blog_favorited",
     "user_id": {作者ID},
     "content": "{收藏者昵称} 收藏了你的博客《{博客标题}》",
     "target_type": "blog",
     "target_id": {博客ID}
   }
   ```
6. 返回收藏状态和总数

**注意：**
- 允许收藏博客到多个文件夹
- 同一文件夹内不能重复收藏

---

### 2.6 取消收藏

取消收藏博客（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**请求体（可选）：**
```json
{
  "folder_id": 1
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folder_id | integer | 否 | 指定文件夹 ID（不提供则从所有文件夹移除） |

**成功响应（200）：**
```json
{
  "favorited": false,
  "favorites_count": 14
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| favorited | boolean | 是否已收藏（如果从所有文件夹移除则为 false） |
| favorites_count | integer | 当前收藏总数 |

**失败响应（401）：**
```json
{
  "detail": "请先登录"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

或

```json
{
  "detail": "未收藏过该博客"
}
```

**后端逻辑：**
1. 检查收藏记录是否存在
2. 删除 Favorite 记录，递减 `blogs.favorites_count`
3. 如果博客在其他文件夹中仍有收藏，`favorited` 返回 `true`
4. 返回收藏状态和总数

---

### 2.7 查询收藏状态

查询当前用户对博客的收藏状态（可选认证）

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folder_id | integer | 否 | 筛选指定文件夹的收藏状态 |

**成功响应（200）- 已登录：**
```json
{
  "is_favorited": true,
  "folders": [
    {
      "id": 1,
      "name": "前端技术"
    },
    {
      "id": 3,
      "name": "必读文章"
    }
  ],
  "favorites_count": 15
}
```

**成功响应（200）- 未登录：**
```json
{
  "is_favorited": false,
  "folders": [],
  "favorites_count": 15
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| is_favorited | boolean | 当前用户是否已收藏（未登录时为 false） |
| folders | array | 收藏所在的文件夹列表 |
| folders[].id | integer | 文件夹 ID |
| folders[].name | string | 文件夹名称 |
| favorites_count | integer | 当前收藏总数 |

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

**后端逻辑：**
- 已登录：查询 Favorite 表，返回收藏的文件夹列表
- 未登录：`is_favorited = false`，`folders = []`
- 始终返回 `favorites_count`（从 Blog 表）

---

### 2.8 获取文件夹收藏列表

获取指定文件夹的收藏博客列表（需要认证，仅创建者可查看私有文件夹）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| folder_id | integer | 文件夹 ID |

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20，最大 100 |

**成功响应（200）：**
```json
{
  "folder": {
    "id": 1,
    "name": "前端技术",
    "is_public": true,
    "favorites_count": 5
  },
  "total": 5,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 10,
      "title": "React Hooks 完全指南",
      "excerpt": "React Hooks 是 React 16.8 引入的新特性...",
      "author": "张三",
      "author_id": 2,
      "author_avatar_url": "/static/avatars/abc123.jpg",
      "views": 128,
      "likes_count": 42,
      "favorites_count": 15,
      "is_liked": true,
      "is_favorited": true,
      "created_at": "2025-01-25T10:00:00.000000Z",
      "favorited_at": "2025-01-25T12:30:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| folder | object | 文件夹信息 |
| total | integer | 总收藏数 |
| page | integer | 当前页码 |
| size | integer | 每页数量 |
| items | array | 博客列表 |
| items[].favorited_at | string | 收藏时间（按此倒序） |

**失败响应（403）：**
```json
{
  "detail": "无权限查看此文件夹"
}
```

**失败响应（404）：**
```json
{
  "detail": "文件夹不存在"
}
```

**后端逻辑：**
1. 检查文件夹是否存在
2. 验证权限（创建者或公开文件夹）
3. 查询收藏记录，LEFT JOIN Blog 和 Author
4. 按收藏时间倒序分页返回
5. 附带当前用户的点赞/收藏状态

---

### 3.1 获取用户的所有收藏

获取当前用户在所有文件夹中的收藏博客（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20，最大 100 |

**成功响应（200）：**
```json
{
  "total": 12,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 10,
      "title": "React Hooks 完全指南",
      "excerpt": "React Hooks 是 React 16.8 引入的新特性...",
      "author": "张三",
      "author_id": 2,
      "author_avatar_url": "/static/avatars/abc123.jpg",
      "views": 128,
      "likes_count": 42,
      "favorites_count": 15,
      "is_liked": true,
      "is_favorited": true,
      "created_at": "2025-01-25T10:00:00.000000Z",
      "folders": [
        {
          "id": 1,
          "name": "前端技术"
        }
      ],
      "favorited_at": "2025-01-25T12:30:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| items[].folders | array | 收藏所在的文件夹列表 |
| items[].favorited_at | string | 最早收藏时间 |

**后端逻辑：**
1. 查询当前用户的所有收藏记录
2. 使用 DISTINCT ON (blog_id) 去重（同一博客可能在多个文件夹）
3. 按收藏时间倒序分页返回
4. 附带文件夹列表和点赞/收藏状态

---

### 3.2 获取公开收藏

获取指定用户的公开收藏（可选认证）

**请求头：**
```
Authorization: Bearer {access_token} (可选)
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folder_id | integer | 否 | 筛选指定文件夹 |
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20，最大 100 |

**成功响应（200）：**
```json
{
  "user": {
    "id": 2,
    "nickname": "张三",
    "avatar_url": "/static/avatars/abc123.jpg"
  },
  "folder": {
    "id": 1,
    "name": "前端技术",
    "favorites_count": 5
  },
  "total": 5,
  "page": 1,
  "size": 20,
  "items": [...]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| user | object | 用户信息 |
| folder | object | 文件夹信息（如果指定 folder_id） |
| items | array | 博客列表 |

**失败响应（403）：**
```json
{
  "detail": "该文件夹未公开"
}
```

**失败响应（404）：**
```json
{
  "detail": "用户不存在"
}
```

**后端逻辑：**
1. 检查用户是否存在
2. 查询用户的公开文件夹（`is_public = true`）
3. 如果指定 `folder_id`，验证是否为公开文件夹
4. 返回收藏列表

---

## 文件上传 (Uploads)

文件上传接口用于博客系统的富文本编辑器，支持图片和视频上传，并提供自动压缩和媒体清理功能。

### POST /api/uploads/image

上传博客图片（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**请求参数：**
```
file: 图片文件
```

**文件限制：**
- 支持格式：jpg, jpeg, png, gif, webp
- 最大大小：10MB
- 前端自动压缩：最大 1MB，最大分辨率 1920px，压缩质量 80%

**成功响应（200）：**
```json
{
  "url": "/static/blog/images/abc123-def456.jpg",
  "type": "image"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 图片访问 URL（相对路径） |
| type | string | 固定值 "image" |

**失败响应（422）：**
```json
{
  "detail": "不支持的图片类型，请上传 image/jpeg, image/jpg, image/png, image/gif, image/webp 格式的图片"
}
```

或

```json
{
  "detail": "图片大小不能超过 10MB"
}
```

---

### POST /api/uploads/video

上传博客视频（需要认证，服务器端自动压缩）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**请求参数：**
```
file: 视频文件
```

**文件限制：**
- 支持格式：mp4, webm, mov
- 最大大小：2GB
- 自动压缩：大于 20MB 时自动触发压缩（目标 50MB）

**压缩配置：**
- 最大分辨率：1920x1080
- 视频码率：最高 2Mbps（智能计算）
- 音频码率：128kbps
- 流媒体优化：faststart

**成功响应（200）- 已压缩：**
```json
{
  "url": "/static/blog/videos/abc123-def456.mp4",
  "type": "video",
  "compressed": true,
  "message": "压缩成功: 120.5MB → 45.2MB (节省 62.5%)"
}
```

**成功响应（200）- 无需压缩：**
```json
{
  "url": "/static/blog/videos/abc123-def456.mp4",
  "type": "video",
  "compressed": false,
  "message": "视频无需压缩 (15.3MB)"
}
```

**成功响应（200）- 压缩失败：**
```json
{
  "url": "/static/blog/videos/abc123-def456.mp4",
  "type": "video",
  "compressed": false,
  "message": "压缩失败，使用原始文件: FFmpeg 未找到，请在 ffmpeg_config.py 中配置 FFMPEG_PATH"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 视频访问 URL（相对路径） |
| type | string | 固定值 "video" |
| compressed | boolean | 是否进行了压缩 |
| message | string | 压缩结果信息或错误提示 |

**失败响应（422）：**
```json
{
  "detail": "不支持的视频类型，请上传 video/mp4, video/webm, video/quicktime 格式的视频"
}
```

或

```json
{
  "detail": "视频大小为 2.5GB，超过限制 2GB"
}
```

**注意：**
- FFmpeg 配置：编辑 `backend/ffmpeg_config.py` 配置 FFmpeg 路径
- 压缩失败时自动使用原始文件，不影响上传
- 详见 README.md 中的 FFmpeg 配置指南

---

### DELETE /api/uploads/media

批量删除媒体文件（需要认证，用于编辑博客时清理未使用的媒体）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "urls": [
    "/static/blog/images/abc123-def456.jpg",
    "/static/blog/videos/xyz789-uvw012.mp4"
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| urls | array | 是 | 要删除的媒体 URL 列表 |

**成功响应（204 No Content）：**
- 无响应体，删除成功

**注意：**
- 只能删除 `/static/blog/` 路径下的文件
- 不存在的文件会自动跳过
- 失败不影响其他文件的删除

---

### POST /api/uploads/media/sizes

批量获取媒体文件大小（需要认证，用于编辑博客时加载已有媒体的大小）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "urls": [
    "/static/blog/images/abc123-def456.jpg",
    "/static/blog/videos/xyz789-uvw012.mp4"
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| urls | array | 是 | 要查询的媒体 URL 列表 |

**成功响应（200）：**
```json
{
  "sizes": {
    "/static/blog/images/abc123-def456.jpg": 524288,
    "/static/blog/videos/xyz789-uvw012.mp4": 15728640
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| sizes | object | URL → 文件大小（字节）的映射 |

**注意：**
- 返回的是实际文件系统的字节数
- 不存在的文件返回 0
- 非 `/static/` 开头的 URL 返回 0
- 用于前端实时统计媒体总大小

---

**成功响应（204）：**
无内容

**使用场景：**
- 用户编辑博客时，前端对比原始内容和当前内容
- 自动识别被删除的图片和视频
- 保存后调用此接口清理未使用的媒体文件

**示例流程：**
```typescript
// 1. 编辑博客时保存原始媒体 URL
const originalMediaUrls = ["/static/blog/images/old.jpg"];

// 2. 用户编辑内容，删除了某些图片
// 3. 提取当前内容中的媒体 URL
const currentMediaUrls = extractMediaUrls(newContent);

// 4. 找出被删除的 URL
const deletedUrls = originalMediaUrls.filter(url => !currentMediaUrls.includes(url));

// 5. 调用删除接口
await fetch('/api/uploads/media', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ urls: deletedUrls })
});
```

---

## 成员管理

### GET /api/members

获取班级成员列表

**查询参数：**
```
?q=张三&page=1&size=20
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词（用户名或昵称） |
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20） |

**成功响应（200）：**
```json
{
  "total": 5,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "username": "zhangsan",
      "nickname": "张三",
      "avatar_url": null,
      "class": "车辆4班 · 清华大学",
      "stats": {
        "blog_count": 15
      }
    },
    {
      "id": 2,
      "username": "lisi",
      "nickname": "李四",
      "avatar_url": null,
      "class": "车辆4班 · 清华大学",
      "stats": {
        "blog_count": 8
      }
    }
  ]
}
```

**搜索说明：**
- 搜索关键词匹配用户名或昵称
- 不区分大小写
- 支持模糊搜索

---

## 班级通知与日历

班级通知与日历用于首页展示最新通知和本月活动提醒，支持管理员发布与维护内容。

### GET /api/announcements

获取班级通知列表（公开接口）

**查询参数：**
```
?page=1&size=5
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认5，最大50） |

**成功响应（200）：**
```json
{
  "total": 12,
  "page": 1,
  "size": 5,
  "items": [
    {
      "id": 1,
      "title": "期中答辩时间调整",
      "content": "期中答辩时间调整至本周四下午 2:00。",
      "published_at": "2025-01-12T09:00:00.000000Z",
      "is_pinned": true
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 通知标题（简短） |
| content | string | 通知内容（全文或摘要） |
| published_at | string | 发布时间 |
| is_pinned | boolean | 是否置顶 |

---

### POST /api/announcements

创建班级通知（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "周五班会地点变更",
  "content": "周五班会地点变更为主楼 A201。",
  "is_pinned": false
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-100字符 |
| content | string | 是 | 1-1000字符 |
| is_pinned | boolean | 否 | 默认 false |

**成功响应（201）：**
```json
{
  "id": 2,
  "title": "周五班会地点变更",
  "content": "周五班会地点变更为主楼 A201。",
  "published_at": "2025-01-11T10:30:00.000000Z",
  "is_pinned": false
}
```

---

### PUT /api/announcements/:announcement_id

更新班级通知（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "周五班会地点变更（更新）",
  "content": "周五班会地点变更为主楼 A201，时间不变。",
  "is_pinned": true
}
```

**成功响应（200）：**
```json
{
  "id": 2,
  "title": "周五班会地点变更（更新）",
  "content": "周五班会地点变更为主楼 A201，时间不变。",
  "published_at": "2025-01-11T10:30:00.000000Z",
  "is_pinned": true
}
```

---

### DELETE /api/announcements/:announcement_id

删除班级通知（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（204）：**
无内容

---

### GET /api/calendar/events

获取班级日历活动（公开接口）

**查询参数：**
```
?month=2025-01
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | string | 否 | 月份（YYYY-MM），不传默认本月 |

**成功响应（200）：**
```json
{
  "month": "2025-01",
  "items": [
    {
      "id": 1,
      "title": "期中答辩",
      "date": "2025-01-03",
      "start_time": "14:00",
      "end_time": "16:00",
      "location": "主楼报告厅",
      "description": "期中答辩，请提前 10 分钟到场。",
      "is_all_day": false,
      "importance": "high"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| date | string | 活动日期（YYYY-MM-DD） |
| start_time | string | 开始时间（HH:mm，可选） |
| end_time | string | 结束时间（HH:mm，可选） |
| location | string | 地点（可选） |
| importance | string | 重要程度（`low`/`normal`/`high`） |
| is_all_day | boolean | 是否全天 |

---

### POST /api/calendar/events

创建班级日历活动（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "班会",
  "date": "2025-01-07",
  "start_time": "19:00",
  "end_time": "20:00",
  "location": "A201",
  "description": "班级例会",
  "is_all_day": false,
  "importance": "normal"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-100字符 |
| date | string | 是 | YYYY-MM-DD |
| start_time | string | 否 | HH:mm |
| end_time | string | 否 | HH:mm |
| location | string | 否 | 0-100字符 |
| description | string | 否 | 0-500字符 |
| is_all_day | boolean | 否 | 默认 false |
| importance | string | 否 | low/normal/high |
| importance | string | 否 | low/normal/high |

**成功响应（201）：**
```json
{
  "id": 2,
  "title": "班会",
  "date": "2025-01-07",
  "start_time": "19:00",
  "end_time": "20:00",
  "location": "A201",
  "description": "班级例会",
  "is_all_day": false,
  "importance": "normal"
}
```

---

### PUT /api/calendar/events/:event_id

更新班级日历活动（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "班会（改期）",
  "date": "2025-01-08",
  "start_time": "19:00",
  "end_time": "20:00",
  "location": "A201",
  "description": "班级例会改至周三",
  "is_all_day": false,
  "importance": "normal"
}
```

**成功响应（200）：**
```json
{
  "id": 2,
  "title": "班会（改期）",
  "date": "2025-01-08",
  "start_time": "19:00",
  "end_time": "20:00",
  "location": "A201",
  "description": "班级例会改至周三",
  "is_all_day": false,
  "importance": "normal"
}
```

---

### DELETE /api/calendar/events/:event_id

删除班级日历活动（需要认证，管理员/班委）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（204）：**
无内容

---

## 班级通知系统 (Notices)

完整的班级通知系统，支持富文本内容、重要标记、浏览量统计、权限控制等功能。

### GET /api/notices

获取通知列表（公开接口）

**查询参数：**
```
?page=1&size=10
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认10，最大50） |

**成功响应（200）：**
```json
{
  "total": 12,
  "page": 1,
  "size": 10,
  "items": [
    {
      "id": 1,
      "title": "期中答辩时间调整至本周四下午",
      "excerpt": "请各位同学做好准备，答辩地点：主楼 A301",
      "is_important": true,
      "author": "辅导员",
      "views": 156,
      "published_at": "2025-01-12T10:30:00.000000Z",
      "date_display": "01-12"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| excerpt | string | 通知摘要（内容前100字） |
| is_important | boolean | 是否为重要通知 |
| author | string | 发布者名称（冗余存储） |
| views | integer | 浏览次数 |
| published_at | string | 发布时间（ISO 8601） |
| date_display | string | 显示用日期（MM-DD） |

**排序规则：**
- 重要通知优先（`is_important = true`）
- 按发布时间倒序（最新的在前）

---

### GET /api/notices/latest

获取最新通知（用于首页展示）

**查询参数：**
```
?limit=3
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量（默认3，最大10） |

**成功响应（200）：**
```json
{
  "items": [
    {
      "id": 1,
      "title": "期中答辩时间调整",
      "is_important": true,
      "date_display": "01-12"
    }
  ]
}
```

---

### GET /api/notices/:notice_id

获取通知详情（公开接口，浏览量+1）

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| notice_id | integer | 通知 ID |

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "期中答辩时间调整至本周四下午",
  "content": "各位同学：\n\n由于教室安排冲突...",
  "is_important": true,
  "author": "辅导员",
  "author_id": 100,
  "views": 156,
  "published_at": "2025-01-12T10:30:00.000000Z",
  "updated_at": null,
  "is_owner": false,
  "can_edit": false
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | Markdown 格式的完整内容 |
| author_id | integer | 发布者 ID |
| updated_at | string | 最后更新时间（null 表示未更新过） |
| is_owner | boolean | 当前用户是否为发布者（未登录为 false） |
| can_edit | boolean | 当前用户是否可编辑（管理员或发布者） |

**注意：** 每次调用此接口，通知的 `views` 字段会自动 +1。

---

### POST /api/notices

创建通知（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "关于期末项目提交的通知",
  "content": "## 提交要求\n\n请各小组在1月20日前提交项目报告。",
  "is_important": false
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-200字符 |
| content | string | 是 | Markdown 格式，1-10000字符 |
| is_important | boolean | 否 | 默认 false |

**成功响应（201）：**
```json
{
  "id": 4,
  "title": "关于期末项目提交的通知",
  "content": "## 提交要求\n\n请各小组在1月20日前...",
  "is_important": false,
  "author": "张三",
  "author_id": 1,
  "views": 0,
  "published_at": "2025-01-12T15:00:00.000000Z",
  "updated_at": null
}
```

---

### PUT /api/notices/:notice_id

更新通知（需要认证，仅发布者或管理员）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "关于期末项目提交的通知（更新）",
  "content": "## 提交要求\n\n请各小组在1月25日前提交。",
  "is_important": true
}
```

**成功响应（200）：**
```json
{
  "id": 4,
  "title": "关于期末项目提交的通知（更新）",
  "content": "## 提交要求\n\n请各小组在1月25日前提交。",
  "is_important": true,
  "author": "张三",
  "author_id": 1,
  "views": 42,
  "published_at": "2025-01-12T15:00:00.000000Z",
  "updated_at": "2025-01-13T09:30:00.000000Z"
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限编辑此通知"
}
```

---

### DELETE /api/notices/:notice_id

删除通知（需要认证，仅发布者或管理员）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（204）：**
无内容

---

## 签到系统 (CheckIn)

签到系统提供每日签到、运势抽签、连续签到统计等功能。

### POST /api/checkins

创建签到（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（201）：**
```json
{
  "id": 1,
  "fortune": "大吉",
  "good": [
    {
      "title": "写代码",
      "desc": "灵感充沛，效率奇高"
    },
    {
      "title": "复习",
      "desc": "记忆清晰，理解透彻"
    }
  ],
  "bad": [
    {
      "title": "熬夜",
      "desc": "身体疲惫，效率低下"
    },
    {
      "title": "刷手机",
      "desc": "浪费时间，影响专注"
    }
  ],
  "streak": 7,
  "checkin_date": "2025-01-22"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| fortune | string | 运势等级（大吉/中吉/小吉/中平/凶/大凶） |
| good | array | 宜做事项（包含 title 和 desc） |
| bad | array | 忌做事项（包含 title 和 desc） |
| streak | integer | 当前连续签到天数 |
| checkin_date | string | 签到日期 |

**失败响应（400）：**
```json
{
  "detail": "今日已签到"
}
```

---

### GET /api/checkins/status

获取签到状态（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "checked_today": false,
  "current_streak": 6
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| checked_today | boolean | 今日是否已签到 |
| current_streak | integer | 当前连续签到天数 |

---

### GET /api/checkins/streak

获取签到统计（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "longest_streak": 15,
  "current_streak": 6
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| longest_streak | integer | 最长连续签到天数 |
| current_streak | integer | 当前连续签到天数 |

---

## 统计数据 (Stats)

班级统计数据接口，提供班级成员数、博客数、签到记录等聚合信息。

### GET /api/stats

获取班级统计数据（公开接口）

**成功响应（200）：**
```json
{
  "member_count": 28,
  "blog_count": 156,
  "longest_streak": 15
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| member_count | integer | 班级成员总数 |
| blog_count | integer | 发布的博客总数 |
| longest_streak | integer | 全班最长连续签到天数 |

---

## 最新动态系统 (Activity)

最新动态系统记录班级内的所有用户操作，提供类似社交网络的时间线功能，展示博客发布、通知发布、签到里程碑等动态。

### 动态类型说明

| 类型代码 | 说明 | 示例 |
|---------|------|------|
| `blog_created` | 发布博客 | `张三 发布了博客《机器学习入门指南》` |
| `notice_published` | 发布通知 | `管理员 发布了通知《期末考试安排》` |
| `checkin_streak` | 签到里程碑 | `李四 连续签到7天，获得"坚持不懈"徽章` |
| `checkin_first` | 首次签到 | `王五 完成了首次签到` |
| `user_joined` | 新成员加入 | `赵六 加入了班级空间` |

### GET /api/activities

获取动态列表（公开接口）

**查询参数：**
```
?page=1&size=20&type=blog_created
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20，最大50） |
| type | string | 否 | 筛选动态类型（不传则返回所有类型） |

**成功响应（200）：**
```json
{
  "total": 45,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "type": "blog_created",
      "user": {
        "id": 1,
        "username": "zhangsan",
        "nickname": "张三",
        "avatar": "/uploads/avatars/zhangsan.jpg"
      },
      "content": "发布了博客",
      "target": {
        "type": "blog",
        "id": 42,
        "title": "机器学习入门指南：从零到实战",
        "url": "/blogs/42"
      },
      "created_at": "2025-01-22T10:30:00.000000Z",
      "time_display": "2小时前"
    },
    {
      "id": 2,
      "type": "checkin_streak",
      "user": {
        "id": 2,
        "username": "lisi",
        "nickname": "李四",
        "avatar": null
      },
      "content": "连续签到7天，获得\"坚持不懈\"徽章",
      "target": null,
      "created_at": "2025-01-22T08:00:00.000000Z",
      "time_display": "4小时前"
    },
    {
      "id": 3,
      "type": "notice_published",
      "user": {
        "id": 100,
        "username": "admin",
        "nickname": "管理员",
        "avatar": "/uploads/avatars/admin.jpg"
      },
      "content": "发布了通知",
      "target": {
        "type": "notice",
        "id": 15,
        "title": "期末考试安排通知",
        "url": "/notices/15"
      },
      "created_at": "2025-01-21T16:20:00.000000Z",
      "time_display": "昨天"
    },
    {
      "id": 4,
      "type": "user_joined",
      "user": {
        "id": 3,
        "username": "wangwu",
        "nickname": "王五",
        "avatar": null
      },
      "content": "加入了班级空间",
      "target": null,
      "created_at": "2025-01-20T09:15:00.000000Z",
      "time_display": "2天前"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 动态记录 ID |
| type | string | 动态类型（blog_created/notice_published/checkin_streak等） |
| user | object | 执行操作的用户信息 |
| user.id | integer | 用户 ID |
| user.username | string | 用户名 |
| user.nickname | string | 昵称 |
| user.avatar | string\|null | 头像 URL（相对路径） |
| content | string | 动态描述文本（不包含对象标题） |
| target | object\|null | 关联对象信息（如果存在） |
| target.type | string | 对象类型（blog/notice） |
| target.id | integer | 对象 ID |
| target.title | string | 对象标题 |
| target.url | string | 对象链接 URL |
| created_at | string | 创建时间（ISO 8601） |
| time_display | string | 友好的时间显示（"2小时前"、"昨天"） |

**排序规则：**
- 按创建时间倒序（最新的在前）

---

### GET /api/activities/latest

获取最新动态（用于首页展示，简化版）

**查询参数：**
```
?limit=10
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量（默认10，最大20） |

**成功响应（200）：**
```json
{
  "items": [
    {
      "id": 1,
      "type": "blog_created",
      "user_name": "张三",
      "content": "发布了博客",
      "target_title": "机器学习入门指南",
      "target_url": "/blogs/42",
      "created_at": "2025-01-22T10:30:00.000000Z",
      "time_display": "2小时前"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| user_name | string | 用户昵称（简化版，不包含完整用户对象） |
| target_title | string\|null | 对象标题 |
| target_url | string\|null | 对象链接 |

---

### POST /api/activities

创建动态记录（内部接口，由后端其他模块调用）

**权限：** 需要认证（系统内部调用，通常不直接暴露给前端）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "type": "blog_created",
  "target_type": "blog",
  "target_id": 42,
  "target_title": "机器学习入门指南"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|----------|
| type | string | 是 | 动态类型（见上方类型表） |
| target_type | string | 否 | 关联对象类型（blog/notice） |
| target_id | integer | 否 | 关联对象 ID |
| target_title | string | 否 | 关联对象标题 |

**注意：**
- `user_id` 和 `user_name` 从认证 Token 中自动获取
- `created_at` 自动设置为当前时间
- 此接口主要用于系统内部调用，一般不需要前端直接请求

**成功响应（201）：**
```json
{
  "id": 1,
  "type": "blog_created",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "nickname": "张三"
  },
  "content": "发布了博客",
  "target": {
    "type": "blog",
    "id": 42,
    "title": "机器学习入门指南",
    "url": "/blogs/42"
  },
  "created_at": "2025-01-22T10:30:00.000000Z"
}
```

---

## 动态生成规则

### 博客发布
**触发时机：** 用户创建博客时

**动态内容：**
- `type`: `blog_created`
- `content`: `"发布了博客"`
- `target`: 博客对象（包含 id、title、url）

**显示示例：** `张三 发布了博客《机器学习入门指南》`

---

### 通知发布
**触发时机：** 管理员/班委发布通知时

**动态内容：**
- `type`: `notice_published`
- `content`: `"发布了通知"`
- `target`: 通知对象

**显示示例：** `管理员 发布了通知《期末考试安排》`

---

### 签到里程碑
**触发时机：** 用户签到时，检查连续天数

**动态内容：**
- `type`: `checkin_streak`
- `content`: `"连续签到7天，获得\"坚持不懈\"徽章"`
- `target`: null

**里程碑规则：**
- 首次签到：`checkin_first`
- 7天：`checkin_streak`
- 30天：`checkin_streak`
- 100天：`checkin_streak`

**显示示例：** `李四 连续签到7天，获得"坚持不懈"徽章`

---

### 新成员加入
**触发时机：** 用户注册时

**动态内容：**
- `type`: `user_joined`
- `content`: `"加入了班级空间"`
- `target`: null

**显示示例：** `王五 加入了班级空间`

---

## 使用示例

### 场景1：发布博客时记录动态

```python
# 在 blog 创建成功后
async def create_blog(blog: BlogCreate, current_user: User, db: Session):
    # 1. 创建博客
    new_blog = Blog(**blog.dict(), author_id=current_user.id)
    db.add(new_blog)
    db.commit()

    # 2. 记录动态
    activity = Activity(
        type="blog_created",
        user_id=current_user.id,
        user_name=current_user.nickname or current_user.username,
        content="发布了博客",
        target_type="blog",
        target_id=new_blog.id,
        target_title=new_blog.title
    )
    db.add(activity)
    db.commit()

    return new_blog
```

### 场景2：前端显示动态列表

```typescript
// 获取动态列表
const activities = await getActivities({ page: 1, size: 20 });

// 渲染动态
activities.items.map(activity => {
  if (activity.type === 'blog_created') {
    return (
      <div className="activity-item">
        <Avatar src={activity.user.avatar} />
        <span>{activity.user.nickname}</span>
        <span>{activity.content}</span>
        <Link to={activity.target.url}>{activity.target.title}</Link>
        <span className="activity-time">{activity.time_display}</span>
      </div>
    );
  }
});
```

---

## 评论系统 (Comments)

评论系统支持楼中楼回复、编辑评论、多种排序方式，并与通知系统集成。

### 功能特性

| 功能 | 说明 |
|------|------|
| 楼中楼 | 支持最多 2 层嵌套评论（顶级评论 → 一级回复 → 二级回复） |
| 编辑评论 | 评论作者可编辑自己的评论 |
| 删除评论 | 软删除，显示"已删除"而非物理删除 |
| 排序方式 | 时间正序（旧→新）/ 时间倒序（新→旧）/ 热度排序 |
| 权限控制 | 登录用户可评论，仅作者/博主可删除 |

---

### GET /api/blogs/:blog_id/comments

获取博客的评论列表（公开接口）

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**查询参数：**
```
?sort=asc&page=1&size=20
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sort | string | 否 | 排序方式：`asc`（时间正序，默认）、`desc`（时间倒序）、`hot`（热度） |
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20，最大50） |

**成功响应（200）：**
```json
{
  "total": 15,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "content": "这篇文章写得很好，学到了很多！",
      "author": {
        "id": 2,
        "username": "lisi",
        "nickname": "李四",
        "avatar_url": null
      },
      "parent_id": null,
      "parent_author": null,
      "replies_count": 2,
      "is_deleted": false,
      "created_at": "2025-01-24T10:00:00.000000Z",
      "updated_at": null,
      "is_author": false,
      "can_edit": false
    },
    {
      "id": 2,
      "content": "我同意楼上的观点，特别是关于梯度下降的部分。",
      "author": {
        "id": 3,
        "username": "wangwu",
        "nickname": "王五",
        "avatar_url": "/uploads/avatars/user_3.jpg"
      },
      "parent_id": 1,
      "parent_author": "李四",
      "replies_count": 0,
      "is_deleted": false,
      "created_at": "2025-01-24T10:05:00.000000Z",
      "updated_at": null,
      "is_author": false,
      "can_edit": false
    },
    {
      "id": 3,
      "content": "这篇博客很有启发，谢谢分享！",
      "author": {
        "id": 4,
        "username": "zhaoliu",
        "nickname": "赵六",
        "avatar_url": null
      },
      "parent_id": null,
      "parent_author": null,
      "replies_count": 0,
      "is_deleted": false,
      "created_at": "2025-01-24T09:30:00.000000Z",
      "updated_at": "2025-01-24T09:45:00.000000Z",
      "is_author": false,
      "can_edit": false
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | 评论内容（纯文本，已删除的评论显示"已删除"） |
| author | object | 评论作者信息 |
| author.id | integer | 作者 ID |
| author.username | string | 用户名 |
| author.nickname | string | 昵称 |
| author.avatar_url | string\|null | 头像 URL |
| parent_id | integer\|null | 父评论 ID（null 表示顶级评论） |
| parent_author | string\|null | 父评论作者昵称（用于楼中楼显示） |
| replies_count | integer | 子评论数量（用于热度排序） |
| is_deleted | boolean | 是否已删除（软删除标记） |
| updated_at | string\|null | 最后编辑时间（null 表示未编辑过） |
| is_author | boolean | 当前用户是否为博客作者（未登录为 false） |
| can_edit | boolean | 当前用户是否可编辑此评论（未登录为 false） |

**排序规则：**
- `asc`（默认）：按创建时间正序（旧评论在前）
- `desc`：按创建时间倒序（新评论在前）
- `hot`：按热度排序（回复数多的在前，同级按时间倒序）

**嵌套结构说明：**
- 前端需根据 `parent_id` 构建嵌套结构
- 最多支持 2 层嵌套：顶级评论 → 一级回复 → 二级回复
- `parent_id` 为 `null` 的评论是顶级评论
- `parent_id` 指向顶级评论的评论是一级回复
- `parent_id` 指向一级回复的评论是二级回复

---

### POST /api/blogs/:blog_id/comments

发表评论（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| blog_id | integer | 博客 ID |

**请求体（发表顶级评论）：**
```json
{
  "content": "这篇文章写得很好，学到了很多！"
}
```

**请求体（回复评论）：**
```json
{
  "content": "我同意楼上的观点",
  "parent_id": 1
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| content | string | 是 | 1-1000字符，纯文本 |
| parent_id | integer | 否 | 父评论 ID（不填则为顶级评论） |

**验证规则：**
- 嵌套深度限制：最多回复到第 2 层
- 如果 `parent_id` 对应的评论已经是二级回复，返回错误

**成功响应（201）：**
```json
{
  "id": 4,
  "content": "这篇文章写得很好，学到了很多！",
  "author": {
    "id": 2,
    "username": "lisi",
    "nickname": "李四",
    "avatar_url": null
  },
  "parent_id": null,
  "parent_author": null,
  "replies_count": 0,
  "is_deleted": false,
  "created_at": "2025-01-24T10:10:00.000000Z",
  "updated_at": null,
  "is_author": false,
  "can_edit": true
}
```

**失败响应（400）：**
```json
{
  "detail": "回复层级超过限制，最多支持2层嵌套"
}
```

**失败响应（404）：**
```json
{
  "detail": "博客不存在"
}
```

或

```json
{
  "detail": "父评论不存在或已删除"
}
```

**注意：**
- 发表评论成功后，自动创建通知给被回复的用户（如果是回复评论）
- 博客作者也会收到通知（如果评论者不是作者本人）

---

### PUT /api/comments/:comment_id

编辑评论（需要认证，仅评论作者）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| comment_id | integer | 评论 ID |

**请求体：**
```json
{
  "content": "更新后的评论内容"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| content | string | 是 | 1-1000字符，纯文本 |

**成功响应（200）：**
```json
{
  "id": 4,
  "content": "更新后的评论内容",
  "author": {
    "id": 2,
    "username": "lisi",
    "nickname": "李四",
    "avatar_url": null
  },
  "parent_id": null,
  "parent_author": null,
  "replies_count": 0,
  "is_deleted": false,
  "created_at": "2025-01-24T10:10:00.000000Z",
  "updated_at": "2025-01-24T10:15:00.000000Z",
  "is_author": false,
  "can_edit": true
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限编辑此评论"
}
```

**失败响应（404）：**
```json
{
  "detail": "评论不存在"
}
```

**注意：**
- 只能编辑自己的评论
- 已删除的评论不能编辑
- 编辑后 `updated_at` 字段会更新

---

### DELETE /api/comments/:comment_id

删除评论（需要认证，仅评论作者或博客作者）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| comment_id | integer | 评论 ID |

**成功响应（204）：**
无内容

**失败响应（403）：**
```json
{
  "detail": "无权限删除此评论"
}
```

**失败响应（404）：**
```json
{
  "detail": "评论不存在"
}
```

**权限说明：**
- 评论作者可以删除自己的评论
- 博客作者可以删除该博客下的任何评论

**软删除机制：**
- 删除评论为软删除，设置 `is_deleted = true`
- 删除后评论内容显示为"已删除"
- 子评论不会被删除，但会显示"父评论已删除"

---

## 用户通知 (Notifications)

用户通知系统用于向用户推送各类消息，如评论回复、系统通知等。

### 通知类型

| 类型代码 | 说明 | 触发条件 |
|---------|------|----------|
| `comment_reply` | 评论回复 | 有人回复了你的评论 |
| `blog_comment` | 博客评论 | 有人评论了你的博客 |
| `comment_reply_blog` | 博客评论回复 | 有人回复了你博客下的评论 |
| `system` | 系统通知 | 管理员发送的系统公告 |

---

### GET /api/notifications

获取当前用户的通知列表（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**查询参数：**
```
?unread_only=true&page=1&size=20
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| unread_only | boolean | 否 | 仅显示未读通知（默认 false） |
| type | string | 否 | 筛选通知类型（不传则返回所有类型） |
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20，最大50） |

**成功响应（200）：**
```json
{
  "total": 25,
  "unread_count": 5,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "type": "comment_reply",
      "title": "李四 回复了你的评论",
      "content": "我同意楼上的观点，特别是关于梯度下降的部分。",
      "related_type": "comment",
      "related_id": 2,
      "related_url": "/blogs/42?comment=2",
      "is_read": false,
      "created_at": "2025-01-24T10:05:00.000000Z",
      "time_display": "5分钟前"
    },
    {
      "id": 2,
      "type": "blog_comment",
      "title": "王五 评论了你的博客《机器学习入门指南》",
      "content": "这篇博客很有启发，谢谢分享！",
      "related_type": "blog",
      "related_id": 42,
      "related_url": "/blogs/42?comment=3",
      "is_read": false,
      "created_at": "2025-01-24T09:30:00.000000Z",
      "time_display": "40分钟前"
    },
    {
      "id": 3,
      "type": "system",
      "title": "系统通知",
      "content": "欢迎加入车辆4班班级空间！请完善您的个人信息。",
      "related_type": null,
      "related_id": null,
      "related_url": null,
      "is_read": true,
      "created_at": "2025-01-23T08:00:00.000000Z",
      "time_display": "昨天"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 通知 ID |
| type | string | 通知类型 |
| title | string | 通知标题（简短描述） |
| content | string | 通知内容（评论内容或系统消息） |
| related_type | string\|null | 关联对象类型（comment/blog/null） |
| related_id | integer\|null | 关联对象 ID |
| related_url | string\|null | 关联对象链接 URL |
| is_read | boolean | 是否已读 |
| time_display | string | 友好的时间显示 |

**排序规则：**
- 按创建时间倒序（最新的在前）

---

### POST /api/notifications/read-all

标记所有通知为已读（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "message": "已标记所有通知为已读",
  "marked_count": 25
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| marked_count | integer | 标记为已读的通知数量 |

---

### PUT /api/notifications/:notification_id/read

标记单个通知为已读（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| notification_id | integer | 通知 ID |

**成功响应（200）：**
```json
{
  "id": 1,
  "type": "comment_reply",
  "title": "李四 回复了你的评论",
  "content": "我同意楼上的观点...",
  "related_type": "comment",
  "related_id": 2,
  "related_url": "/blogs/42?comment=2",
  "is_read": true,
  "created_at": "2025-01-24T10:05:00.000000Z"
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限访问此通知"
}
```

**失败响应（404）：**
```json
{
  "detail": "通知不存在"
}
```

---

### DELETE /api/notifications

清除已读通知（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**查询参数：**
```
?all=false
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| all | boolean | 否 | 是否清除所有通知（true），仅清除已读（false，默认） |

**成功响应（200）：**
```json
{
  "message": "已清除 10 条通知",
  "deleted_count": 10
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| deleted_count | integer | 清除的通知数量 |

**注意：**
- `all=false`（默认）：仅清除已读通知
- `all=true`：清除所有通知（包括未读）

---

### DELETE /api/notifications/:notification_id

删除单个通知（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| notification_id | integer | 通知 ID |

**成功响应（204）：**
无内容

---

### GET /api/notifications/unread-count

获取未读通知数量（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**成功响应（200）：**
```json
{
  "unread_count": 5
}
```

**使用场景：**
- 导航栏显示通知铃铛的红点/数字
- 前端可轮询此接口获取最新未读数量

---

## AI对话管理

AI对话功能提供与 AI 助手的实时对话能力，支持流式输出、上下文管理、消息反馈等功能。

### GET /api/chat/conversations

获取用户的对话列表（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**查询参数：**
```
?q=机器&page=1&size=20
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词（对话标题） |
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20） |

**成功响应（200）：**
```json
{
  "total": 5,
  "page": 1,
  "size": 20,
  "items": [
    {
      "id": 1,
      "title": "机器学习入门指南",
      "last_message": "如何理解梯度下降算法的具体实现...",
      "message_count": 8,
      "created_at": "2025-01-15T14:30:00.000000Z",
      "updated_at": "2025-01-15T14:35:00.000000Z"
    },
    {
      "id": 2,
      "title": "Python代码调试帮助",
      "last_message": "感谢你的帮助！问题已经解决了",
      "message_count": 5,
      "created_at": "2025-01-14T09:15:00.000000Z",
      "updated_at": "2025-01-14T09:20:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| last_message | string | 最后一条消息的预览（最多50字） |
| message_count | integer | 对话中的消息总数 |

---

### POST /api/chat/conversations

创建新对话（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "title": "机器学习入门指南"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 否 | 1-100字符，不提供则自动生成 |

**成功响应（201）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南",
  "message_count": 0,
  "created_at": "2025-01-15T14:30:00.000000Z"
}
```

**注意：**
- 如果不提供 `title`，系统会在用户发送第一条消息后自动生成标题
- 自动生成规则：提取第一条消息的前30个字符作为标题

---

### GET /api/chat/conversations/:conversation_id

获取对话详情（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南",
  "message_count": 8,
  "created_at": "2025-01-15T14:30:00.000000Z",
  "updated_at": "2025-01-15T14:35:00.000000Z"
}
```

**失败响应（403）：**
```json
{
  "detail": "无权限访问此对话"
}
```

**失败响应（404）：**
```json
{
  "detail": "对话不存在"
}
```

---

### PUT /api/chat/conversations/:conversation_id

重命名对话（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**请求体：**
```json
{
  "title": "机器学习进阶讨论"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-100字符 |

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "机器学习进阶讨论",
  "updated_at": "2025-01-15T15:00:00.000000Z"
}
```

---

### DELETE /api/chat/conversations/:conversation_id

删除对话（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**成功响应（204）：**
无内容

**失败响应（403）：**
```json
{
  "detail": "无权限删除此对话"
}
```

---

### GET /api/chat/conversations/:conversation_id/messages

获取对话的消息列表（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**查询参数：**
```
?page=1&size=50
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认50，最大100） |

**成功响应（200）：**
```json
{
  "total": 8,
  "page": 1,
  "size": 50,
  "items": [
    {
      "id": 1,
      "role": "user",
      "content": "请帮我解释一下什么是梯度下降算法？",
      "created_at": "2025-01-15T14:30:00.000000Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "梯度下降是一种优化算法，主要用于最小化损失函数...",
      "created_at": "2025-01-15T14:30:05.000000Z",
      "tokens_used": 150
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| role | string | `user`（用户）或 `assistant`（AI助手） |
| tokens_used | integer | AI消息使用的 Token 数量（仅 assistant 消息） |

---

### POST /api/chat/conversations/:conversation_id/messages

发送消息（需要认证，支持流式输出）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**请求体：**
```json
{
  "content": "请帮我解释一下什么是梯度下降算法？"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| content | string | 是 | 1-4000字符 |

**成功响应（201）- 非流式：**
```json
{
  "id": 2,
  "role": "assistant",
  "content": "梯度下降是一种优化算法，主要用于最小化损失函数...",
  "tokens_used": 150,
  "created_at": "2025-01-15T14:30:05.000000Z"
}
```

**成功响应（200）- 流式输出（Server-Sent Events）：**
```
data: {"id": 2, "role": "assistant", "content": "梯度", "delta": "梯度"}

data: {"id": 2, "role": "assistant", "content": "梯度下降", "delta": "下降"}

data: {"id": 2, "role": "assistant", "content": "梯度下降是一种", "delta": "是一种"}

...

data: [DONE]
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | 完整内容（累积） |
| delta | string | 本次新增的内容片段 |

**查询参数：**
```
?stream=true
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stream | boolean | 否 | 是否使用流式输出（默认 false） |

**注意：**
- 流式输出使用 Server-Sent Events (SSE) 协议
- 每次返回一个 JSON 对象，包含 `delta`（新增内容）和 `content`（完整内容）
- 以 `data: [DONE]` 表示结束
- 建议前端使用流式输出以提升用户体验

---

### POST /api/chat/conversations/:conversation_id/messages/regenerate

重新生成最后一条 AI 消息（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**请求体：**
```json
{}
```

**成功响应（200）：**
```json
{
  "id": 3,
  "role": "assistant",
  "content": "让我用另一个角度来解释...",
  "tokens_used": 180,
  "created_at": "2025-01-15T14:32:00.000000Z"
}
```

**注意：**
- 替换对话中最后一条 AI 消息
- 支持流式输出（参数同发送消息）

---

### POST /api/chat/conversations/:conversation_id/messages/:message_id/feedback

对 AI 消息进行反馈（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |
| message_id | integer | 消息 ID |

**请求体：**
```json
{
  "feedback": "helpful"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| feedback | string | 是 | `helpful`（有帮助）或 `not_helpful`（无帮助） |

**成功响应（200）：**
```json
{
  "message": "反馈已记录"
}
```

**失败响应（400）：**
```json
{
  "detail": "只能对 AI 消息进行反馈"
}
```

---

### POST /api/chat/conversations/:conversation_id/export

导出对话（需要认证）

**请求头：**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | integer | 对话 ID |

**请求体：**
```json
{
  "format": "markdown"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 是 | 导出格式，支持 `markdown`、`json`、`txt` |

**成功响应（200）- Markdown 格式：**
```json
{
  "content": "# 机器学习入门指南\n\n**对话时间**：2025-01-15 14:30\n\n---\n\n## 用户\n\n请帮我解释一下什么是梯度下降算法？\n\n## AI\n\n梯度下降是一种优化算法...\n\n---",
  "filename": "machine-learning-guide.md"
}
```

---

## 数据模型

### User（用户）

**数据库表名：** `users`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| username | String(50) | 用户名 | UNIQUE, NOT NULL |
| email | String(100) | 邮箱 | UNIQUE, NOT NULL |
| password_hash | String(255) | 密码哈希 | NOT NULL |
| nickname | String(50) | 昵称 | |
| avatar_url | String(255) | 头像URL | |
| class | String(100) | 班级/学校 | |
| bio | String(200) | 个人简介 | |
| created_at | DateTime | 注册时间 | DEFAULT utcnow() |
| updated_at | DateTime | 更新时间 | |

**索引：**
- `idx_username`: username
- `idx_email`: email

### Blog（博客）

**数据库表名：** `blogs`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| title | String(200) | 标题 | NOT NULL |
| content | Text | 内容（富文本） | NOT NULL |
| status | String(20) | 状态 | DEFAULT 'published', values: 'draft', 'published' |
| author_id | Integer | 作者ID | FOREIGN KEY → users.id, NOT NULL |
| author_name | String(50) | 作者名（冗余） | NOT NULL |
| views | Integer | 阅读次数 | DEFAULT 0 |
| likes_count | Integer | 点赞数（冗余） | DEFAULT 0 |
| favorites_count | Integer | 收藏数（冗余） | DEFAULT 0 |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |
| updated_at | DateTime | 更新时间 | |

**索引：**
- `idx_author_id`: author_id
- `idx_status`: status
- `idx_created_at`: created_at (DESC)
- `idx_author_status`: (author_id, status) 复合索引

**外键：**
- `author_id` → `users.id` (ON DELETE CASCADE)

**字段说明：**
- `status`：博客状态
  - `draft`：草稿，仅作者可见
  - `published`：已发布，所有人可见
- 草稿不统计浏览次数（views 始终为 0）
- 草稿不出现在公开列表中

### Conversation（对话）

**数据库表名：** `conversations`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| user_id | Integer | 用户ID | FOREIGN KEY → users.id, NOT NULL |
| title | String(100) | 对话标题 | NOT NULL |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |
| updated_at | DateTime | 最后更新时间 | |

**索引：**
- `idx_user_id`: user_id
- `idx_updated_at`: updated_at (DESC)

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)

**说明：**
- `updated_at` 字段在每次有新消息时自动更新
- 对话标题可以由用户指定，或系统自动生成（基于第一条消息）

### Message（消息）

**数据库表名：** `messages`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| conversation_id | Integer | 对话ID | FOREIGN KEY → conversations.id, NOT NULL |
| role | String(20) | 角色 | NOT NULL, values: 'user', 'assistant' |
| content | Text | 消息内容（支持Markdown） | NOT NULL |
| tokens_used | Integer | 使用的Token数（AI消息） | DEFAULT NULL |
| feedback | String(20) | 用户反馈 | values: 'helpful', 'not_helpful', NULL |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |

**索引：**
- `idx_conversation_id`: conversation_id
- `idx_created_at`: created_at (ASC)

**外键：**
- `conversation_id` → `conversations.id` (ON DELETE CASCADE)

**说明：**
- `role` 字段区分用户消息（`user`）和AI助手消息（`assistant`）
- `tokens_used` 仅对 AI 消息有效，记录使用的 Token 数量
- `feedback` 用于记录用户对 AI 消息的反馈（有帮助/无帮助）

**关系：**
- 一个 Conversation 包含多个 Message（一对多）
- 一个 User 可以创建多个 Conversation（一对多）

---

### Comment（评论）

**数据库表名：** `comments`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| blog_id | Integer | 博客ID | FOREIGN KEY → blogs.id, NOT NULL |
| user_id | Integer | 评论者ID | FOREIGN KEY → users.id, NOT NULL |
| content | String(1000) | 评论内容 | NOT NULL |
| parent_id | Integer | 父评论ID | FOREIGN KEY → comments.id, NULL |
| is_deleted | Boolean | 是否已删除 | DEFAULT false |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |
| updated_at | DateTime | 更新时间 | |

**索引：**
- `idx_blog_id`: blog_id
- `idx_parent_id`: parent_id
- `idx_created_at`: created_at

**外键：**
- `blog_id` → `blogs.id` (ON DELETE CASCADE)
- `user_id` → `users.id` (ON DELETE CASCADE)
- `parent_id` → `comments.id` (ON DELETE SET NULL)

**说明：**
- `parent_id` 用于实现楼中楼回复功能
- `is_deleted` 实现软删除，删除后设置 `is_deleted = true`
- 嵌套深度限制：最多 2 层（顶级评论 → 一级回复 → 二级回复）
- 删除父评论时，子评论不删除但会显示"父评论已删除"

**楼层规则：**
- 顶级评论：`parent_id IS NULL`
- 一级回复：`parent_id` 指向顶级评论
- 二级回复：`parent_id` 指向一级回复
- 禁止回复二级回复（达到 2 层限制）

---

### Like（点赞）

**数据库表名：** `likes`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| user_id | Integer | 点赞者ID | FOREIGN KEY → users.id, NOT NULL |
| blog_id | Integer | 博客ID | FOREIGN KEY → blogs.id, NOT NULL |
| created_at | DateTime | 点赞时间 | DEFAULT utcnow() |

**索引：**
- `idx_user_blog`: (user_id, blog_id) 复合唯一索引（防止重复点赞）

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `blog_id` → `blogs.id` (ON DELETE CASCADE)

**说明：**
- 使用复合唯一索引 `(user_id, blog_id)` 防止用户重复点赞
- 用户可以点赞自己的博客
- 点赞后自动创建通知给博客作者（如果点赞者不是作者）

---

### FavoriteFolder（收藏文件夹）

**数据库表名：** `favorite_folders`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| user_id | Integer | 创建者ID | FOREIGN KEY → users.id, NOT NULL |
| name | String(50) | 文件夹名称 | NOT NULL |
| is_public | Boolean | 是否公开 | DEFAULT true |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |

**索引：**
- `idx_user_id`: user_id

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)

**说明：**
- `is_public`: 公开文件夹可被其他用户查看，私有文件夹仅创建者可见
- 默认文件夹为公开（`is_public = true`）
- 用户删除时，所有文件夹及收藏自动删除（CASCADE）

---

### Favorite（收藏）

**数据库表名：** `favorites`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| user_id | Integer | 收藏者ID | FOREIGN KEY → users.id, NOT NULL |
| blog_id | Integer | 博客ID | FOREIGN KEY → blogs.id, NOT NULL |
| folder_id | Integer | 文件夹ID | FOREIGN KEY → favorite_folders.id, NOT NULL |
| created_at | DateTime | 收藏时间 | DEFAULT utcnow() |

**索引：**
- `idx_user_blog_folder`: (user_id, blog_id, folder_id) 复合唯一索引（防止重复收藏）
- `idx_folder_id`: folder_id

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `blog_id` → `blogs.id` (ON DELETE CASCADE)
- `folder_id` → `favorite_folders.id` (ON DELETE CASCADE)

**说明：**
- 使用复合唯一索引 `(user_id, blog_id, folder_id)` 防止在同一文件夹重复收藏
- 允许将同一博客收藏到多个不同文件夹
- 用户可以收藏自己的博客
- 收藏后自动创建通知给博客作者（如果收藏者不是作者）
- 文件夹删除时，所有收藏自动删除（CASCADE）

---

### Notification（用户通知）

**数据库表名：** `notifications`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| user_id | Integer | 接收者ID | FOREIGN KEY → users.id, NOT NULL |
| type | String(50) | 通知类型 | NOT NULL |
| title | String(200) | 通知标题 | NOT NULL |
| content | String(1000) | 通知内容 | NOT NULL |
| related_type | String(50) | 关联对象类型 | values: 'blog', 'comment', NULL |
| related_id | Integer | 关联对象ID | |
| related_url | String(500) | 关联对象URL | |
| is_read | Boolean | 是否已读 | DEFAULT false |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |

**索引：**
- `idx_user_id`: user_id
- `idx_is_read`: is_read
- `idx_created_at`: created_at (DESC)
- `idx_user_read`: (user_id, is_read) 复合索引

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)

**说明：**
- `type` 字段定义通知类型（comment_reply, blog_comment, system 等）
- `related_type` 和 `related_id` 关联到具体对象（博客、评论等）
- `related_url` 用于前端跳转到关联对象
- 不同 `type` 值对应不同的通知场景

**通知类型详解：**

| type | title 模板 | 触发条件 | related_type | related_id |
|------|-----------|----------|-------------|-----------|
| `comment_reply` | "{nickname} 回复了你的评论" | 有人回复了你的评论 | comment | 被回复的评论 ID |
| `blog_comment` | "{nickname} 评论了你的博客《{blog_title}》" | 有人评论了你的博客 | blog | 博客 ID |
| `comment_reply_blog` | "{nickname} 回复了你博客下的评论" | 有人回复了你博客下的评论 | comment | 被回复的评论 ID |
| `blog_liked` | "{nickname} 点赞了你的博客《{blog_title}》" | 有人点赞了你的博客 | blog | 博客 ID |
| `blog_favorited` | "{nickname} 收藏了你的博客《{blog_title}》" | 有人收藏了你的博客 | blog | 博客 ID |
| `system` | "系统通知" | 管理员发送系统通知 | NULL | NULL |

---

### Announcement（班级通知）

**数据库表名：** `announcements`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| title | String(100) | 标题 | NOT NULL |
| content | String(1000) | 内容 | NOT NULL |
| is_pinned | Boolean | 是否置顶 | DEFAULT false |
| published_at | DateTime | 发布时间 | DEFAULT utcnow() |
| created_by | Integer | 创建者ID | FOREIGN KEY → users.id |

**索引：**
- `idx_published_at`: published_at (DESC)
- `idx_is_pinned`: is_pinned (DESC)

---

### CalendarEvent（班级日历活动）

**数据库表名：** `calendar_events`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| title | String(100) | 活动标题 | NOT NULL |
| date | Date | 活动日期 | NOT NULL |
| start_time | Time | 开始时间 | |
| end_time | Time | 结束时间 | |
| location | String(100) | 地点 | |
| description | String(500) | 描述 | |
| is_all_day | Boolean | 是否全天 | DEFAULT false |
| importance | String(20) | 重要程度 | DEFAULT low |
| created_by | Integer | 创建者ID | FOREIGN KEY → users.id |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |
| updated_at | DateTime | 更新时间 | |

**索引：**
- `idx_date`: date

---

### Activity（最新动态）

**数据库表名：** `activities`

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO INCREMENT |
| type | String(50) | 动态类型 | NOT NULL, values: 'blog_created', 'notice_published', 'checkin_streak', 'checkin_first', 'user_joined' |
| user_id | Integer | 用户ID | FOREIGN KEY → users.id, NOT NULL |
| user_name | String(50) | 用户名（冗余） | NOT NULL |
| content | String(200) | 动态描述文本 | NOT NULL |
| target_type | String(50) | 关联对象类型 | values: 'blog', 'notice', NULL |
| target_id | Integer | 关联对象ID | |
| target_title | String(200) | 关联对象标题 | |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |

**索引：**
- `idx_user_id`: user_id
- `idx_created_at`: created_at (DESC)
- `idx_type`: type

**外键：**
- `user_id` → `users.id` (ON DELETE CASCADE)

**说明：**
- `type` 字段定义动态类型，决定前端如何显示
- `user_name` 冗余存储避免每次查询都 join users 表
- `target_type` 和 `target_id` 关联到具体对象（博客、通知等）
- `target_title` 用于显示链接文本
- 不同的 `type` 值对应不同的 `content` 文案

**动态类型详解：**

| type | content 模板 | target_type | target_id | 示例 |
|------|-------------|-------------|-----------|------|
| `blog_created` | "发布了博客" | blog | 博客ID | `张三 发布了博客《机器学习入门》` |
| `notice_published` | "发布了通知" | notice | 通知ID | `管理员 发布了通知《期末安排》` |
| `checkin_first` | "完成了首次签到" | NULL | NULL | `李四 完成了首次签到` |
| `checkin_streak` | "连续签到N天，获得\"徽章名\"徽章" | NULL | NULL | `王五 连续签到7天，获得"坚持不懈"徽章` |
| `user_joined` | "加入了班级空间" | NULL | NULL | `赵六 加入了班级空间` |

---

## 错误码说明

### 标准错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### 验证错误响应格式（422）

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "错误信息",
      "type": "error_type"
    }
  ]
}
```

### 常见错误场景

| 错误码 | 场景 | 示例 |
|--------|------|------|
| 400 | 请求参数格式错误 | 无效的 JSON 格式 |
| 401 | 未认证 | 缺少 Token 或 Token 无效 |
| 403 | 无权限 | 普通用户尝试编辑他人博客 |
| 404 | 资源不存在 | 博客/用户 ID 不存在 |
| 422 | 数据验证失败 | 用户名已存在、密码格式错误 |
| 500 | 服务器错误 | 数据库连接失败 |

### 业务错误码

| 错误信息 | 场景 | HTTP 状态码 |
|----------|------|--------------|
| "用户名已存在" | 注册时用户名重复 | 422 |
| "邮箱已被注册" | 注册时邮箱重复 | 422 |
| "用户名或密码错误" | 登录失败 | 401 |
| "密码长度至少为6个字符" | 密码格式错误 | 422 |
| "两次密码不一致" | 确认密码不匹配 | 422 |
| "未认证" | 未提供有效 Token | 401 |
| "Token 已过期" | Token 超过有效期 | 401 |
| "无权限编辑此博客" | 非作者尝试编辑 | 403 |
| "无权限删除此博客" | 非作者尝试删除 | 403 |
| "博客不存在" | 博客 ID 无效 | 404 |
| "用户不存在" | 用户 ID 无效 | 404 |

---

## 使用示例

### JavaScript/TypeScript（前端）

```typescript
// API 客户端配置
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// 获取 Token
let accessToken = localStorage.getItem('access_token') || null;

// 请求拦截器（自动添加 Token）
async function apiRequest(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // 401 时跳转到登录页
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('未认证');
  }

  return response;
}

// 用户注册
async function register(data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  nickname?: string;
}) {
  const response = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

// 用户登录
async function login(username_or_email: string, password: string, remember_me: boolean = false) {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username_or_email, password, remember_me }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const data = await response.json();

  // 保存 Token
  accessToken = data.access_token;
  localStorage.setItem('access_token', data.access_token);

  return data;
}

// 获取当前用户信息
async function getCurrentUser() {
  const response = await apiRequest('/api/users/me');

  if (!response.ok) {
    throw new Error('获取用户信息失败');
  }

  return response.json();
}

// 获取博客列表
async function getBlogs(params: { page?: number; size?: number; author?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());
  if (params.author) queryParams.set('author', params.author);

  const response = await apiRequest(`/api/blogs?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('获取博客列表失败');
  }

  return response.json();
}

// 获取博客详情
async function getBlog(blogId: number) {
  const response = await apiRequest(`/api/blogs/${blogId}`);

  if (!response.ok) {
    throw new Error('博客不存在');
  }

  return response.json();
}

// 创建博客
async function createBlog(title: string, content: string) {
  const response = await apiRequest('/api/blogs', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

// 更新博客
async function updateBlog(blogId: number, title: string, content: string) {
  const response = await apiRequest(`/api/blogs/${blogId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

// 删除博客
async function deleteBlog(blogId: number) {
  const response = await apiRequest(`/api/blogs/${blogId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(error.detail);
  }
}

// 获取成员列表
async function getMembers(search: string = '', page: number = 1) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('q', search);
  queryParams.set('page', page.toString());

  const response = await apiRequest(`/api/members?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('获取成员列表失败');
  }

  return response.json();
}

// AI对话相关接口

// 获取对话列表
async function getConversations(search: string = '', page: number = 1) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('q', search);
  queryParams.set('page', page.toString());

  const response = await apiRequest(`/api/chat/conversations?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('获取对话列表失败');
  }

  return response.json();
}

// 创建新对话
async function createConversation(title?: string) {
  const payload = title ? { title } : {};

  const response = await apiRequest('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

// 发送消息（流式）
async function sendMessageStream(
  conversationId: number,
  content: string,
  onChunk: (delta: string, fullContent: string) => void
) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?stream=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    throw new Error('发送消息失败');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('无法读取响应流');
  }

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          onChunk(parsed.delta, parsed.content);
        } catch (e) {
          console.error('解析SSE数据失败:', e);
        }
      }
    }
  }
}

// 对AI消息进行反馈
async function submitFeedback(
  conversationId: number,
  messageId: number,
  feedback: 'helpful' | 'not_helpful'
) {
  const response = await apiRequest(
    `/api/chat/conversations/${conversationId}/messages/${messageId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}
```

### Python（后端测试）

```python
import requests

API_BASE_URL = "http://localhost:8000"

# 用户注册
def register(username: str, email: str, password: str):
    payload = {
        "username": username,
        "email": email,
        "password": password,
        "password_confirm": password
    }
    response = requests.post(f"{API_BASE_URL}/api/auth/register", json=payload)
    response.raise_for_status()
    return response.json()

# 用户登录
def login(username_or_email: str, password: str):
    payload = {
        "username_or_email": username_or_email,
        "password": password
    }
    response = requests.post(f"{API_BASE_URL}/api/auth/login", json=payload)
    response.raise_for_status()
    return response.json()

# 获取当前用户（需要 Token）
def get_current_user(access_token: str):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{API_BASE_URL}/api/users/me", headers=headers)
    response.raise_for_status()
    return response.json()

# 获取博客列表
def get_blogs(page: int = 1, author: str = None):
    params = {"page": page}
    if author:
        params["author"] = author
    response = requests.get(f"{API_BASE_URL}/api/blogs", params=params)
    response.raise_for_status()
    return response.json()

# 获取博客详情
def get_blog(blog_id: int):
    response = requests.get(f"{API_BASE_URL}/api/blogs/{blog_id}")
    response.raise_for_status()
    return response.json()

# 创建博客
def create_blog(title: str, content: str, access_token: str):
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"title": title, "content": content}
    response = requests.post(
        f"{API_BASE_URL}/api/blogs",
        json=payload,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# 更新博客
def update_blog(blog_id: int, title: str, content: str, access_token: str):
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"title": title, "content": content}
    response = requests.put(
        f"{API_BASE_URL}/api/blogs/{blog_id}",
        json=payload,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# 删除博客
def delete_blog(blog_id: int, access_token: str):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.delete(
        f"{API_BASE_URL}/api/blogs/{blog_id}",
        headers=headers
    )
    response.raise_for_status()

# 获取成员列表
def get_members(search: str = "", page: int = 1):
    params = {"q": search, "page": page}
    response = requests.get(f"{API_BASE_URL}/api/members", params=params)
    response.raise_for_status()
    return response.json()
```

### cURL 命令行

```bash
# 用户注册
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "nickname": "张三"
  }'

# 用户登录
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "zhangsan",
    "password": "password123"
  }'

# 获取博客列表
curl http://localhost:8000/api/blogs

# 获取博客详情
curl http://localhost:8000/api/blogs/1

# 创建博客（需要 Token）
curl -X POST http://localhost:8000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "我的第一篇博客",
    "content": "## 简介\n\n这是博客内容..."
  }'

# 更新博客（需要 Token）
curl -X PUT http://localhost:8000/api/blogs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "更新后的标题",
    "content": "更新后的内容..."
  }'

# 删除博客（需要 Token）
curl -X DELETE http://localhost:8000/api/blogs/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 获取成员列表
curl http://localhost:8000/api/members

# 搜索成员
curl http://localhost:8000/api/members?q=张三

# 获取当前用户信息（需要 Token）
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 更新用户信息（需要 Token）
curl -X PUT http://localhost:8000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "nickname": "张三丰",
    "class": "车辆4班 · 清华大学",
    "bio": "热爱编程和机器学习。"
  }'
```

---

## 开发注意事项

### 前端开发者

1. **Token 管理**：
   - 登录成功后保存 Token 到 localStorage
   - 每次请求在 Header 中携带 Token
   - 401 错误时清除 Token 并跳转到登录页

2. **类型定义**：
   - `frontend/src/types/auth.ts` - 认证相关类型
   - `frontend/src/types/user.ts` - 用户相关类型
   - `frontend/src/types/blog.ts` - 博客相关类型（已存在）

3. **权限控制**：
   - 博客详情页根据 `is_owner` 字段显示/隐藏"编辑"和"删除"按钮
   - 创建博客页面需要登录才能访问

4. **Markdown 渲染**：
   - 推荐使用 `react-markdown` 或 `marked` 库
   - 代码块使用 `react-syntax-highlighter` 高亮

### 后端开发者

1. **密码哈希**：
   - 使用 `passlib` 库的 `bcrypt` 或 `argon2` 算法
   - 永远不要存储明文密码

2. **JWT Token**：
   - 使用 `python-jose` 生成和验证 JWT
   - Secret Key 应从环境变量读取
   - Token 有效期：默认 7 天（可配置）

3. **数据验证**：
   - 使用 Pydantic 进行严格的数据验证
   - 用户名：3-20字符，字母数字下划线
   - 邮箱：标准邮箱格式
   - 密码：6-20字符

4. **数据库优化**：
   - 为 `username` 和 `email` 建立唯一索引
   - 为 `blogs.author_id` 和 `blogs.created_at` 建立索引
   - 考虑使用数据库连接池

5. **CORS 配置**：
   - 生产环境应限制允许的域名
   - 不要使用 `allow_origins=["*"]`

6. **文件上传**：
   - 头像上传需要验证文件类型和大小
   - 使用 `python-multipart` 处理文件上传
   - 文件存储在 `uploads/` 目录

### 数据库配置

```python
# backend/database.py
# 开发环境：SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./v4corner.db"

# 生产环境：PostgreSQL（推荐）
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/v4corner"

# 环境变量
import os
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./v4corner.db"
)
```

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.9.0 | 2026-01-24 | 评论系统（楼中楼、编辑、排序）+ 通知系统（设计） |
| v1.8.0 | 2026-01-23 | 草稿功能（博客状态、草稿箱、保存草稿/发布） |
| v1.7.0 | 2026-01-23 | 富文本编辑器与媒体管理（图片/视频上传、自动压缩、媒体清理） |
| v1.6.0 | 2026-01-22 | 最新动态系统（活动流、自动记录、时间显示） |
| v1.5.0 | 2026-01-22 | 班级通知系统（完整CRUD）、签到系统、统计数据 API |
| v1.4.0 | 2025-01-21 | 新增班级通知与日历 API |
| v1.1.0 | 2025-01-19 | 新增 AI 对话管理功能（对话、消息、流式输出） |
| v1.0.0 | 2025-01-11 | 基于网页原型的完整 API 设计 |
| v0.1.0 | 2025-01-10 | 初始版本，基础博客 CRUD |

---

## 后续计划

以下功能已预留接口，将在后续版本实现：

1. **搜索功能**：
   - `GET /api/search` - 全站搜索
   - 支持搜索博客、用户、评论等

2. **评论功能增强**（v1.9.0 已完成基础版）：
   - ✅ 楼中楼回复
   - ✅ 编辑评论
   - ✅ 排序方式
   - ⏳ 评论点赞
   - ⏳ @提及功能

---

如有问题或建议，请在项目中提交 Issue。

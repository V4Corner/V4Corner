# V4Corner API 接口文档

> 基于网页原型设计 v1.3.2
>
> 最后更新：2026-01-22（v1.6.0 - 最新动态系统 + 邮箱验证码功能）

## 目录

- [基础信息](#基础信息)
- [通用说明](#通用说明)
- [用户认证](#用户认证)
- [验证码管理](#验证码管理)
- [用户管理](#用户管理)
- [博客管理](#博客管理)
- [成员管理](#成员管理)
- [班级通知与日历](#班级通知与日历)
- [班级通知系统 (Notices)](#班级通知系统-notices)
- [签到系统 (CheckIn)](#签到系统-checkin)
- [统计数据 (Stats)](#统计数据-stats)
- [最新动态系统 (Activity)](#最新动态系统-activity)
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

当前版本: `v1.6.0`

**版本历史：**
- v1.6.0 (2026-01-22): 最新动态系统（活动流、自动记录、时间显示）+ 邮箱验证码功能
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
- 评论功能（计划中）

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
  "verification_code": "123456",
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
| verification_code | string | 是 | 邮箱验证码（4-6位），需先调用发送验证码接口 |
| nickname | string | 否 | 2-20字符 |

**注意：注册前需要先调用发送验证码接口 (`POST /api/verification/send`) 获取邮箱验证码。**

**成功响应（201）：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "nickname": "张三",
    "avatar_url": null
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| access_token | string | JWT 访问令牌（注册后自动登录） |
| token_type | string | 固定值 "bearer" |
| expires_in | integer | 过期时间（秒），默认 604800（7天） |
| user | object | 当前用户信息 |

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
    "email": "zhangsan@example.com",
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

## 验证码管理

### POST /api/verification/send

发送验证码到邮箱

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "email": "zhangsan@example.com",
  "type": "register"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| type | string | 否 | 验证码类型，默认 `register`（可选值：`register`, `reset_password`） |

**成功响应（200）：**
```json
{
  "success": true,
  "message": "验证码已发送",
  "expires_in": 300
}
```

**失败响应（200）：**
```json
{
  "success": false,
  "message": "请 45 秒后再试",
  "expires_in": 45
}
```

**限制：**
- 同一邮箱发送验证码间隔至少 60 秒
- 验证码有效期为 5 分钟
- 验证码长度为 4-6 位随机数字

---

### POST /api/verification/verify

验证验证码（注册时内部使用，无需单独调用）

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "email": "zhangsan@example.com",
  "code": "123456"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 验证码（4-6位） |

**成功响应（200）：**
```json
{
  "success": true,
  "message": "验证成功",
  "expires_in": 0
}
```

**失败响应（200）：**
```json
{
  "success": false,
  "message": "验证码无效或已过期",
  "expires_in": 0
}
```

**注意：此接口通常由注册接口内部调用，注册时会自动验证验证码。**

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

获取指定用户的博客列表

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 用户 ID |

**查询参数：**
```
?page=1&size=10
```

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
      "views": 128,
      "created_at": "2025-01-10T08:30:00.000000Z"
    }
  ]
}
```

---

## 博客管理

### GET /api/blogs

获取博客列表

**查询参数：**
```
?page=1&size=20&author=zhangsan
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码（默认1） |
| size | integer | 否 | 每页数量（默认20，最大100） |
| author | string | 否 | 按作者筛选（用户名） |

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
      "views": 128,
      "created_at": "2025-01-10T08:30:00.000000Z"
    },
    {
      "id": 2,
      "title": "数据结构与算法",
      "excerpt": "学习数据结构与算法是每个程序员的必修课，本文将总结常用的数据结构和算法技巧...",
      "author": "李四",
      "author_id": 2,
      "views": 95,
      "created_at": "2025-01-09T15:20:00.000000Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| excerpt | string | 博客摘要（内容前150字） |
| author_id | integer | 作者 ID（用于跳转到用户中心） |

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
  "views": 128,
  "is_owner": false,
  "created_at": "2025-01-10T08:30:00.000000Z",
  "updated_at": "2025-01-10T08:30:00.000000Z"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | Markdown 格式的完整内容 |
| is_owner | boolean | 当前用户是否为作者（未登录为 false） |
| updated_at | string | 最后更新时间（可选） |

**注意：** 每次调用此接口，博客的 `views` 字段会自动 +1。

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

**请求体：**
```json
{
  "title": "机器学习入门指南",
  "content": "## 简介\n\n机器学习是..."
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-200字符 |
| content | string | 是 | Markdown 格式，不能为空 |

**成功响应（201）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南",
  "content": "## 简介\n\n机器学习是...",
  "author": "张三",
  "author_id": 1,
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

**请求体：**
```json
{
  "title": "机器学习入门指南（更新版）",
  "content": "## 简介\n\n机器学习是..."
}
```

**字段说明：** 同创建博客

**成功响应（200）：**
```json
{
  "id": 1,
  "title": "机器学习入门指南（更新版）",
  "content": "## 简介\n\n机器学习是...",
  "author": "张三",
  "author_id": 1,
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
| content | Text | 内容（Markdown） | NOT NULL |
| author_id | Integer | 作者ID | FOREIGN KEY → users.id, NOT NULL |
| author_name | String(50) | 作者名（冗余） | NOT NULL |
| views | Integer | 阅读次数 | DEFAULT 0 |
| created_at | DateTime | 创建时间 | DEFAULT utcnow() |
| updated_at | DateTime | 更新时间 | |

**索引：**
- `idx_author_id`: author_id
- `idx_created_at`: created_at (DESC)

**外键：**
- `author_id` → `users.id` (ON DELETE CASCADE)

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
| v1.1.0 | 2025-01-19 | 新增 AI 对话管理功能（对话、消息、流式输出） |
| v1.0.0 | 2025-01-11 | 基于网页原型的完整 API 设计 |
| v0.1.0 | 2025-01-10 | 初始版本，基础博客 CRUD |

---

## 后续计划

以下功能已预留接口，将在后续版本实现：

1. **评论系统**：
   - `POST /api/blogs/:blog_id/comments` - 发表评论
   - `GET /api/blogs/:blog_id/comments` - 获取评论列表
   - `DELETE /api/comments/:comment_id` - 删除评论

2. **文件上传**：
   - `POST /api/upload/image` - 上传图片（用于博客内容）
   - `POST /api/users/me/avatar` - 上传用户头像

3. **搜索功能**：
   - `GET /api/search` - 全站搜索

4. **统计功能**：
   - `GET /api/stats` - 获取网站统计信息

---

如有问题或建议，请在项目中提交 Issue。

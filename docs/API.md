# V4Corner API 接口文档

> 基于网页原型设计 v1.0
>
> 最后更新：2025-01-11

## 目录

- [基础信息](#基础信息)
- [通用说明](#通用说明)
- [用户认证](#用户认证)
- [用户管理](#用户管理)
- [博客管理](#博客管理)
- [成员管理](#成员管理)
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

当前版本: `v1.0.0`

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

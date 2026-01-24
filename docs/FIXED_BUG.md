# BUG 修复记录

本文档记录项目开发过程中已修复的 BUG。

---

## v1.8.0 相关 BUG（2026-01-24）

### BUG #8: 数据库缺少 status 列导致查询失败

**问题描述：**
- 访问博客相关页面时出现 `sqlite3.OperationalError: no such column: blogs.status`
- F12 控制台显示 500 错误
- 影响功能：
  - 用户个人中心无法加载
  - 博客列表页无法显示

**根本原因：**
1. **模型更新但数据库未迁移**：
   - Blog 模型添加了 `status` 字段
   - SQLite 数据库中还没有这个列
   - SQLAlchemy 尝试查询不存在的列导致错误

2. **多处代码依赖 status 字段**：
   - `users.py` 中的 `get_user_blogs()` 函数查询博客时
   - 所有创建 BlogListItem 的地方都需要 status 字段

**修复方案：**

1. **创建数据库迁移脚本**：
   ```python
   # backend/migrate_add_status.py
   - ALTER TABLE blogs ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published'
   - CREATE INDEX idx_author_status ON blogs(author_id, status)
   ```

2. **执行迁移**：
   ```bash
   cd backend
   python migrate_add_status.py
   ```

3. **更新 users.py 路由**：
   ```python
   # 添加 status 字段到 BlogListItem
   items.append(schemas.BlogListItem(
       # ... 其他字段
       status=blog.status,  # ✅ 新增
   ))

   # 只显示已发布的博客
   .filter(
       models.Blog.author_id == user_id,
       models.Blog.status == "published"  # ✅ 新增
   )
   ```

**影响范围：**
- `backend/models/blog.py`
- `backend/schemas/blog.py`
- `backend/routers/blogs.py`
- `backend/routers/users.py`
- 数据库（添加列和索引）

**测试验证：**
1. 运行迁移脚本 ✅
2. 验证 status 列已添加 ✅
3. 现有博客自动设置为 published ✅
4. 个人中心页面正常显示 ✅
5. 博客列表页正常显示 ✅

**预防措施：**
- SQLAlchemy 更改模型后及时执行数据库迁移
- 生产环境应使用 Alembic 管理数据库迁移
- 开发环境可提供迁移脚本

---

### BUG #9: EditBlog 组件函数引用错误

**问题描述：**
- 访问编辑博客页面时显示空白页
- F12 控制台显示：`Uncaught ReferenceError: handleSubmit is not defined`
- React 错误边界捕获错误

**根本原因：**
1. **函数重命名但未更新引用**：
   - 在代码重构时将 `handleSubmit` 重命名为 `handlePublish`
   - 但表单的 `onSubmit={handleSubmit}` 还在引用旧函数名
   - 导致运行时找不到函数

2. **按钮类型错误**：
   - 发布按钮使用 `type="submit"`
   - 会触发表单的 `onSubmit` 事件
   - 导致函数调用链断裂

**修复方案：**

1. **移除表单提交逻辑**：
   ```tsx
   // 旧代码
   <form onSubmit={handleSubmit}>

   // 新代码
   <div className="card">  // 移除 form 标签
   ```

2. **改为按钮 onClick 处理**：
   ```tsx
   // 所有按钮都使用 type="button"
   <button
     type="button"  // ✅ 不再是 type="submit"
     onClick={handlePublish}  // ✅ 直接调用函数
   >
     发布博客
   </button>
   ```

**影响范围：**
- `frontend/src/routes/EditBlog.tsx`

**测试验证：**
1. 刷新编辑博客页面 ✅
2. 页面正常显示 ✅
3. 点击"发布博客"按钮正常工作 ✅
4. 点击"保存草稿"按钮正常工作 ✅

**预防措施：**
- 重命名函数时使用 IDE 的重命名功能（自动更新引用）
- 避免在表单中使用多个提交按钮，改为 button + onClick
- 添加 PropTypes 或 TypeScript 检查

---

### BUG #10: 活动动态链接显示错误

**问题描述：**
- 最新动态中，成员加入和签到里程碑也显示了超链接
- 这些活动类型不应该有关联对象的链接
- 只有博客创建和通知发布才应该显示链接

**根本原因：**
1. **缺少活动类型检查**：
   - ActivityFeed 组件渲染链接时没有检查活动类型
   - 只要 `target_title` 和 `target_url` 存在就显示链接
   - 但成员加入和签到活动不应该有链接

**修复方案：**

1. **添加活动类型检查**：
   ```tsx
   // frontend/src/components/ActivityFeed.tsx
   {activity.target_title && activity.target_url &&
    (activity.type === 'blog_created' || activity.type === 'notice_published') && (
     <Link to={activity.target_url}>{activity.target_title}</Link>
   )}
   ```

**影响范围：**
- `frontend/src/components/ActivityFeed.tsx`

**测试验证：**
1. 成员加入活动不显示链接 ✅
2. 签到里程碑活动不显示链接 ✅
3. 博客创建活动显示链接 ✅
4. 通知发布活动显示链接 ✅

**预防措施：**
- 条件渲染时应该明确检查类型，而不是依赖字段是否存在
- 后端 API 应该保证数据结构的一致性

---

### BUG #11: 签到卡片样式错误

**问题描述：**
- 运势文字颜色不符合预期（应该大吉/中吉/小吉为红色，其他为黑色）
- 宜忌卡片有不需要的边框
- 忌卡片背景色显示为红色（应该是灰色）

**根本原因：**
1. **缺少颜色逻辑函数**：
   - CheckInCard 组件直接使用固定颜色
   - 没有根据运势内容动态判断颜色

2. **CSS 样式冲突**：
   - 宜忌卡片在 CSS 中定义了边框
   - 忌卡片有特殊的红色背景样式

**修复方案：**

1. **添加运势颜色函数**：
   ```tsx
   // frontend/src/components/CheckInCard.tsx
   function getFortuneColor(fortune: string): string {
     if (fortune.includes('大吉') || fortune.includes('中吉') || fortune.includes('小吉')) {
       return '#dc2626'; // 红色
     }
     return '#1f2937'; // 黑色
   }

   // 应用颜色
   <div style={{ color: getFortuneColor(result.fortune) }}>
     {result.fortune}
   </div>
   ```

2. **宜忌卡片颜色和样式**：
   ```tsx
   // 宜：红色
   <div className="advice-section-label" style={{ color: '#dc2626' }}>宜</div>
   <div className="advice-card-title" style={{ color: '#dc2626' }}>{item.title}</div>

   // 忌：黑色
   <div className="advice-section-label" style={{ color: '#1f2937' }}>忌</div>
   <div className="advice-card-title" style={{ color: '#1f2937' }}>{item.title}</div>
   ```

3. **移除卡片边框**：
   ```css
   /* frontend/src/styles.css */
   .advice-card {
     border: none;  /* 移除边框 */
   }

   .advice-card.bad {
     background-color: #f9fafb;  /* 灰色背景 */
     border: none;
   }
   ```

**影响范围：**
- `frontend/src/components/CheckInCard.tsx`
- `frontend/src/styles.css`

**测试验证：**
1. 大吉/中吉/小吉运势显示红色 ✅
2. 其他运势显示黑色 ✅
3. 宜标签和标题显示红色 ✅
4. 忌标签和标题显示黑色 ✅
5. 忌卡片背景为灰色 ✅
6. 所有卡片无边框 ✅

**预防措施：**
- 使用语义化的颜色变量而不是硬编码颜色值
- 复杂的条件样式应该使用函数而不是内联三元表达式

---

## v1.3.0 相关 BUG（2025-01-20）

### BUG #3: AI 对话功能 CORS 错误和验证错误

**问题描述：**
- 访问 AI 对话页面时出现 CORS 错误和 500 状态码
- F12 控制台显示：
  - `已拦截跨源请求：同源策略禁止读取位于 http://localhost:8000/api/chat/conversations 的远程资源。（原因：CORS 头缺少 'Access-Control-Allow-Origin'）。状态码：500。`
  - `1 validation error for ConversationListItem updated_at Input should be a valid datetime [type=datetime_type, input_value=None, input_type=NoneType]`
- 创建新对话时显示 "NetworkError when attempting to fetch resource"

**根本原因：**
1. **Conversation 模型缺陷**：`updated_at` 字段没有设置 `default` 值
   ```python
   # backend/models/conversation.py (旧代码)
   updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)
   # ❌ 只有 onupdate，没有 default
   ```

2. **数据库中的 NULL 值**：
   - 已存在的对话记录的 `updated_at` 字段为 None
   - Pydantic schema 验证要求该字段必须是有效的 datetime
   - 验证失败导致 500 错误

3. **错误处理缺失**：
   - 没有全局异常处理器捕获未处理的异常
   - 500 错误导致 CORS headers 未正确发送

**修复方案：**

1. **修复 Conversation 模型**：
   ```python
   # backend/models/conversation.py (新代码)
   updated_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
   # ✅ 添加了 default=datetime.utcnow
   ```

2. **添加全局异常处理器**：
   ```python
   # backend/main.py
   @app.exception_handler(Exception)
   async def global_exception_handler(request: Request, exc: Exception):
       logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
       return JSONResponse(
           status_code=500,
           content={"detail": f"内部服务器错误: {str(exc)}"}
       )
   ```

3. **添加端点级错误处理**：
   ```python
   # backend/routers/chat.py
   @router.get("/conversations", response_model=schemas.ConversationListResponse)
   async def list_conversations(...):
       try:
           # 业务逻辑
       except Exception as e:
           logger.error(f"Error in list_conversations: {str(e)}", exc_info=True)
           raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")
   ```

4. **数据库迁移**：
   - 删除旧数据库文件 `v4corner.db`
   - 后端重启时自动创建新数据库
   - 新记录都会有正确的 `updated_at` 默认值

**影响范围：**
- `backend/models/conversation.py`
- `backend/main.py`
- `backend/routers/chat.py`

**测试验证：**
1. 重启后端服务器 ✅
2. 删除数据库并重新创建 ✅
3. 访问 `/chat` 页面加载对话列表 ✅
4. 创建新对话 ✅

**预防措施：**
- 所有 datetime 字段都应该设置合理的 default 值
- 添加全局异常处理器确保错误被正确记录和返回
- 端点应添加适当的错误处理和日志记录

---

## v1.2.0 相关 BUG（2025-01-19）

### BUG #0: 缺少新依赖导致启动失败

**问题描述：**
- 更新到 v1.2.0 后，后端启动时报错：
  ```
  ModuleNotFoundError: No module named 'pydantic_settings'
  ```
- 原因：v1.2.0 新增了 `pydantic-settings` 和 `openai` 依赖

**影响范围：**
- 所有更新到 v1.2.0 的现有环境

**修复方案：**
```bash
cd backend
pip install -r requirements.txt
```

**或手动安装：**
```bash
pip install pydantic-settings==2.5.2
pip install openai==1.12.0
```

**预防措施：**
- README.md 已添加依赖安装说明
- 提示用户在启动失败时重新安装依赖

---

### BUG #1: Ollama 无条件启用导致连接失败

**问题描述：**
- 系统会无条件尝试连接 Ollama，即使未配置任何 API Key
- 如果 Ollama 服务未运行，会导致后端启动时尝试连接失败
- 影响用户体验，因为不是所有人都使用 Ollama

**根本原因：**
```python
# backend/config.py (旧代码)
def get_ai_providers() -> list[str]:
    providers = []
    # ... 其他服务商检查 ...

    # Ollama 不需要 API Key，始终可用
    providers.append("ollama")  # ❌ 无条件添加

    return providers
```

**修复方案：**
1. 添加 `ENABLE_OLLAMA` 配置项（默认 `False`）
2. 只有显式启用时才将 Ollama 加入可用服务商列表

**修复代码：**
```python
# backend/config.py (新代码)
class Settings(BaseSettings):
    # ...
    ENABLE_OLLAMA: bool = False  # 默认不启用

def get_ai_providers() -> list[str]:
    providers = []
    # ... 其他服务商检查 ...

    # Ollama 只有显式启用时才使用
    if settings.ENABLE_OLLAMA:
        providers.append("ollama")

    return providers
```

**影响范围：**
- `backend/config.py`
- `backend/.env.example`
- `README.md`（更新 Ollama 配置说明）

**测试验证：**
```bash
cd backend
python test_ai_mode.py
# 测试用例 4: 启用 Ollama → ollama ✅
```

---

### BUG #2: 无配置时行为不明确

**问题描述：**
- 用户不清楚没有配置 API Key 时系统会使用模拟模式
- 缺少清晰的配置说明和提示

**修复方案：**
1. 在 `ai_service.py` 中添加清晰的日志输出
2. 文档中明确说明模拟模式的行为
3. 添加测试用例验证无配置时的行为

**修复代码：**
```python
# backend/services/ai_service.py
def _initialize_provider(self):
    provider = get_primary_ai_provider()

    if not provider:
        logger.warning("未配置任何 AI 服务，使用模拟模式")
        self.provider = "mock"
        return

    logger.info(f"初始化 AI 服务: {provider}")
    # ...
```

**测试验证：**
```bash
# 测试用例 1: 无任何配置 → mock ✅
```

---

## 其他已修复问题

### 博客阅读量重复计数（2025-01-19）

**问题描述：**
- 博客每次浏览时，阅读量会增加 2 而不是 1
- 影响所有博客文章的浏览统计

**根本原因：**
React 18 的 StrictMode 在开发模式下会故意双重调用组件的 `useEffect`，以便发现副作用问题。这导致：

1. 组件第一次挂载 → 调用 `getBlog()` API → `blog.views += 1`
2. 组件第二次挂载（StrictMode）→ 再次调用 `getBlog()` API → `blog.views += 1`
3. 结果：浏览量增加了 2

**后端代码（问题所在）：**
```python
# backend/routers/blog.py
@router.get("/{blog_id}")
async def get_blog(blog_id: int, ...):
    blog = db.query(models.Blog).filter(...).first()

    # 每次请求都增加阅读次数
    blog.views += 1  # ❌ 问题：StrictMode 导致调用两次
    db.commit()
```

**前端代码（问题所在）：**
```tsx
// frontend/src/routes/BlogDetail.tsx
useEffect(() => {
  const fetchBlog = async () => {
    const data = await getBlog(parseInt(blogId));
    setBlog(data);
  };

  fetchBlog();  // ❌ StrictMode 会执行两次
}, [blogId]);
```

**修复方案：**
在前端使用 `useRef` 跟踪请求状态，防止重复请求：

```tsx
// frontend/src/routes/BlogDetail.tsx（修复后）
const isFetchingRef = useRef(false);

useEffect(() => {
  if (!blogId) return;

  // 防止重复请求
  if (isFetchingRef.current) {
    return;  // ✅ 第二次调用会被阻止
  }

  const fetchBlog = async () => {
    isFetchingRef.current = true;  // 标记正在请求

    try {
      const data = await getBlog(parseInt(blogId));
      setBlog(data);
    } finally {
      isFetchingRef.current = false;  // 请求完成
    }
  };

  fetchBlog();

  // cleanup 函数
  return () => {
    isFetchingRef.current = false;
  };
}, [blogId]);
```

**影响范围：**
- `frontend/src/routes/BlogDetail.tsx`

**测试验证：**
1. 开发环境（StrictMode 启用）：浏览量增加 1 ✅
2. 生产环境（StrictMode 禁用）：浏览量增加 1 ✅

**预防措施：**
- 所有涉及副作用（API 请求、订阅等）的 useEffect 都应该考虑 StrictMode
- 使用 useRef 或 AbortController 防止重复请求
- 参考文档：[React StrictMode](https://react.dev/reference/react/StrictMode)

---

### 前端相关问题（v1.1.0）

#### 问题 1: App.tsx 重复导入
- **日期**: 2025-01-19
- **描述**: ChatDetail 导入重复导致语法错误
- **修复**: 手动删除重复的导入语句
- **文件**: `frontend/src/App.tsx`

#### 问题 2: apiRequest 未导出
- **日期**: 2025-01-19
- **描述**: apiRequest 函数缺少 export 关键字
- **修复**: 添加 `export` 关键字
- **文件**: `frontend/src/api/client.ts`

---

## 报告新 BUG

如果你发现了新的 BUG，请：

1. 在 GitHub Issues 中提交问题
2. 包含以下信息：
   - BUG 描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（浏览器、操作系统等）
   - 截图或错误日志

---

**最后更新**: 2026-01-24

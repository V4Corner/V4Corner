# V4Corner 团队开发工作流

本文档为 V4Corner 项目团队提供完整的开发流程指导，包含**开发流程**和**开发规范**两个核心板块。

- **开发流程**：按步骤指导如何从想法到完成功能的完整过程
- **开发规范**：说明流程中需要遵守的规则和注意事项

---

## 开发流程

### 概览：四阶段开发流程

所有功能开发必须遵循以下阶段：

```
(a) 原型设计 → (b) 接口设计 → (c) 前后端开发 → (d) 修缮测试
```

---

## 流程 (a) - 原型设计

### 步骤 1：让AI查看项目结构

- 当开启新对话时执行

### 步骤 2：使用 AI 工具生成原型

**与 AI 交流提示词**：
```
我要添加...功能，请帮我设计界面原型。
```

### 步骤 3：更新原型文档

- 更新 `docs/PROTOTYPE.md`，添加新页面设计说明
- 更新 `docs/prototype.html`，添加可交互原型

### 步骤 4：提交并创建 PR

```bash
# 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/功能名称

# 提交原型
git add docs/PROTOTYPE.md docs/prototype.html
git commit -m "YYYY-M-D[功能名称]原型设计"
git push -u origin feature/功能名称

# 在 GitHub 创建 Pull Request
```

## 流程 (b) - 接口设计

**与 AI 交流提示词**：
```
（基于 docs/PROTOTYPE.md 中的 [功能名称] 原型的某某功能）补充设计完整的 API 接口，并更新 docs/API.md 。
```

## 流程 (c) - 前后端开发

**提示词**：
```
设计开发流程，实现前后端。
```

## 流程 (d) - 修缮测试

### 步骤 1：编写测试用例

### 步骤 2：修复 bug

**与 AI 交流提示词**：
```
[功能名称] 在以下场景有问题：

[描述问题或贴上错误信息]

请帮我修复这个问题。
```

### 步骤 3：更新文档

**与 AI 交流提示词**：
```
请根据之前的对话，更新相关文档：
```

更新文件：
- `PROGRESS.md` - 记录已完成的功能
- `README.md` - 更新功能介绍（如需要）
- `API.md` - 更新接口定义（仅在此情况修改：一开始设计的API接口有问题，BUG修复时修改了API接口定义，并且没有同步修改API.md）


### 步骤 4：最终提交

```bash
git add .
git commit -m "YYYY-MM-DD[功能名称]"
git push origin feature/功能名称
```

---

## 开发规范

### 1. 分支管理规范

#### 分支策略

```
main (主分支 + 开发分支)
  ↑
  ├── feature/功能名称 (功能开发)
  ├── bugfix/问题描述 (bug 修复)
  └── hotfix/紧急问题 (紧急修复)
```

**重要规则**：
- `main` 分支同时作为开发和生产分支
- **无需单独的 develop 分支**
- 所有功能开发完成后直接合并到 `main`

#### 分支命名

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 功能分支 | `feature/功能名称` | `feature/comments-system` |
| 修复分支 | `bugfix/问题描述` | `bugfix/login-error` |
| 紧急修复 | `hotfix/紧急问题` | `hotfix/database-crash` |

#### 创建功能分支

```bash
# 1. 切换到 main 并更新
git checkout main
git pull origin main

# 2. 创建新分支
git checkout -b feature/功能名称

# 3. 开发...
# git add .
# git commit -m "提交信息"
# git push -u origin feature/功能名称
```

---

### 2. 提交规范

#### Commit Message 格式

```
YYYY-M-D简短描述

可选的详细说明
```

**示例**：

```bash
# ✅ 推荐
2026-1-15增加评论系统功能

- 实现评论的创建、获取、删除
- 添加评论 API 接口
- 实现前端评论区组件
- 更新 API.md 和 PROGRESS.md

# ✅ 简短提交
2026-1-15修复评论排序问题

# ❌ 不推荐
update
fix bug
测试
```

#### 提交频率建议

- **小步提交**：完成一个阶段就提交一次
- **逻辑完整**：每次提交应该是功能完整的单元
- **及时同步**：每天工作结束前必须提交

#### 提交前检查

- [ ] 代码已通过本地测试
- [ ] 没有调试代码（console.log、debugger）
- [ ] 没有敏感信息（密码、密钥）
- [ ] 配置文件（.env）未被误提交
- [ ] 代码符合项目规范
- [ ] 必要的文档已更新

---

### 3. 文档管理规范

#### 文档更新频率

**每完成约 10 次 AI 对话**，检查并更新以下文档：

| 文档 | 更新内容 | 更新时机 |
|------|----------|----------|
| `PROGRESS.md` | 添加新功能说明、修复的问题 | 每个功能完成后 |
| `README.md` | 新功能介绍、使用说明 | 有重大功能时 |
| `docs/API.md` | 新增/修改 API 接口 | 接口变更时 |
| `docs/PROTOTYPE.md` | 新页面设计 | 新功能原型时 |

#### 受保护文档

以下文档**严禁 AI 任意修改**：

| 文档 | 保护级别 | 修改要求 |
|------|----------|----------|
| `CLAUDE.md` | 🔴 严格禁止 | 只有项目架构变更时由人工修改 |
| `docs/API.md` | 🟡 需确认 | 只有新增/修改 API 时更新，需保持与代码一致 |

**⚠️ API.md 修改流程**：
1. AI 更新后，使用 `git diff docs/API.md` 查看改动
2. 确认改动正确且符合规范
3. 如有问题，使用 `git checkout docs/API.md` 恢复
4. 告诉 AI 修改要求后重新生成

---

### 4. AI 协作规范

#### 与 AI 交流的最佳实践

**1. 提供清晰的上下文**

```
✅ 好的提示词：
我正在开发 V4Corner 项目的评论功能。
- 项目使用 FastAPI + React + TypeScript
- 已有的博客功能在 backend/routers/blogs.py
- 请参考现有代码实现评论 API

❌ 不好的提示词：
帮我实现评论功能
```

**2. 分步骤执行**

```
✅ 推荐：
1. "先帮我设计评论的数据模型"
2. "然后实现创建评论的 API"
3. "最后实现前端评论区"

❌ 不推荐：
"一次性实现所有评论相关功能"
```

**3. 充分利用现有代码**

```
提示词示例：
请阅读 backend/routers/blogs.py，理解代码风格和模式，
然后用相同的风格实现 backend/routers/comments.py
```

**4. 保持类型安全**

```
提示词示例：
实现评论 API，同时创建完整的 Pydantic schemas 和 TypeScript types，
确保前后端类型完全匹配
```

#### 常用提示词模板

**开始新功能**：
```
我要为 V4Corner 添加 [功能名称] 功能。
请先阅读 docs/PROTOTYPE.md 了解项目风格，
然后帮我设计功能原型。
```

**实现 API**：
```
参考 docs/API.md 的格式和 backend/routers/blogs.py 的实现，
创建 [功能名称] 的 API 接口。
```

**实现前端页面**：
```
参考 docs/PROTOTYPE.md 的设计和 frontend/src/routes/Blogs.tsx 的实现，
创建 [页面名称] 页面组件。
```

**更新文档**：
```
我完成了 [功能名称]，请帮我更新 PROGRESS.md，
说明已完成的功能和修复的问题。

注意：
- CLAUDE.md 严禁修改
- 保持与现有文档格式一致
```

**代码审查**：
```
请检查以下代码是否有问题：
[贴上代码]

关注点：
1. 安全性（SQL注入、XSS等）
2. 性能问题
3. 错误处理
4. 代码风格
```

---

### 5. 代码质量规范

#### 后端代码检查清单

- [ ] **安全防护**
  - [ ] SQL 注入防护（使用参数化查询）
  - [ ] 密码哈希（bcrypt）
  - [ ] 输入验证（Pydantic schemas）
  - [ ] 权限检查（认证依赖）

- [ ] **错误处理**
  - [ ] 所有可能的异常都有 try-except
  - [ ] 返回友好的错误信息
  - [ ] 正确的 HTTP 状态码

- [ ] **代码风格**
  - [ ] 遵循 PEP 8 规范
  - [ ] 使用绝对导入
  - [ ] 函数有清晰的命名
  - [ ] 必要时添加注释

#### 前端代码检查清单

- [ ] **安全防护**
  - [ ] XSS 防护（避免 dangerouslySetInnerHTML）
  - [ ] Token 安全存储（localStorage）
  - [ ] 敏感信息不暴露在前端

- [ ] **用户体验**
  - [ ] 友好的错误提示
  - [ ] 加载状态显示
  - [ ] 响应式设计
  - [ ] 空状态处理

- [ ] **类型安全**
  - [ ] 所有数据有类型定义
  - [ ] 避免使用 any
  - [ ] 正确的可选类型标注

- [ ] **代码风格**
  - [ ] 组件命名清晰
  - [ ] Props 有类型定义
  - [ ] 必要时添加注释

#### 自动化检查

```bash
# 后端测试
cd backend
python test_api.py

# 前端类型检查
cd frontend
npm run build
```

---

### 6. Pull Request 规范

#### PR 标题格式

```
[类型] 简短描述
```

**类型标签**：
- `[原型]` - 原型设计（阶段 a）
- `[接口]` - 接口设计（阶段 b）
- `[功能]` - 功能实现（阶段 c）
- `[完成]` - 完整实现（阶段 d）
- `[修复]` - Bug 修复

**示例**：
```
[原型] 评论系统界面设计
[接口] 评论系统 API 定义
[功能] 评论系统基础实现
[完成] 评论系统完整功能
[修复] 修复评论排序错误
```

#### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 接口设计
- [ ] 原型设计
- [ ] 文档更新

## 变更说明
<!-- 描述本次 PR 的主要改动内容 -->

## 相关文档
- 原型：docs/PROTOTYPE.md
- API：docs/API.md

## 测试情况
<!-- 说明测试方法和结果 -->
- [ ] 本地测试通过
- [ ] 功能正常工作
- [ ] 类型检查无错误

## 检查清单
- [ ] 代码已通过本地测试
- [ ] 已更新相关文档
- [ ] 代码符合项目规范
- [ ] 没有引入新的警告
```

#### PR 审查要点

审查者应关注：

- **功能正确性**：实现了预期功能
- **代码质量**：逻辑清晰、易于理解
- **边界情况**：处理了异常情况
- **安全性**：无安全漏洞
- **文档完整性**：相关文档已更新

---

### 7. 应急处理规范

#### 1. AI 生成的代码有误

**正确处理流程**：

```
步骤 1：先告诉 AI 修复
"你生成的代码有问题：[描述错误或贴上错误信息]
请帮我修复"

步骤 2：如果 AI 无法修复
- 记录错误信息
- 回滚到上一个可用提交
- 寻求团队帮助
```

#### 2. 破坏了现有功能

**回滚并修复**：

```bash
# 查看最近的提交
git log --oneline -5

# 回滚到上一个可用版本
git reset --soft HEAD~1

# 告诉 AI 重新实现
"你生成的代码破坏了现有功能：[描述问题]
请重新实现，确保不影响现有功能"
```

#### 3. 类型不匹配

**前后端类型不一致时**：

```
提示词：
前端类型定义和后端 schema 不匹配：
前端：[贴上 frontend/src/types/*.ts]
后端：[贴上 backend/schemas/*.py]

请修正其中一方，确保完全匹配。
```

#### 4. 文档冲突

**AI 修改了受保护的文档**：

```bash
# 查看改动
git diff docs/API.md

# 如果不合理，恢复文件
git checkout docs/API.md

# 告诉 AI
"docs/API.md 是受保护文档，请勿修改。
如有需要，请先告诉我改动了什么"
```

---

### 8. 常用命令参考

#### 日常开发流程

```bash
# 1. 更新本地 main 分支
git checkout main
git pull origin main

# 2. 创建新的功能分支
git checkout -b feature/your-feature

# 3. 开发并提交代码
git add .
git commit -m "YYYY-M-D提交说明"

# 4. 推送到远程
git push -u origin feature/your-feature

# 5. 在 GitHub 上创建 Pull Request
```

#### 常用 Git 命令

```bash
# 查看当前状态
git status

# 查看提交历史
git log --oneline -10

# 查看分支
git branch -a

# 切换分支
git checkout branch-name

# 合并分支
git merge branch-name

# 暂存当前改动
git stash
git stash pop

# 撤销最后一次提交（保留改动）
git reset --soft HEAD~1

# 修改最后一次提交信息
git commit --amend
```

#### 处理冲突

```bash
# 1. 更新 main 分支
git checkout main
git pull origin main

# 2. 切换回功能分支并合并 main
git checkout feature/your-feature
git merge main

# 3. 如果有冲突，手动解决冲突文件
# 4. 标记冲突已解决
git add .
git commit -m "解决合并冲突"
```

---

## 附录：项目文档索引

| 文档 | 用途 | 更新频率 |
|------|------|----------|
| `CLAUDE.md` | AI 工具使用指南 | 仅架构变更时 |
| `README.md` | 项目介绍和快速开始 | 重大功能时 |
| `PROGRESS.md` | 开发进度记录 | 每个功能完成后 |
| `docs/API.md` | API 接口文档 | 接口变更时 |
| `docs/PROTOTYPE.md` | 网页原型设计 | 新功能时 |
| `docs/prototype.html` | 可交互原型 | UI 变更时 |
| `docs/WORKFLOW.md` | 本文档 - 开发工作流 | 流程变更时 |
| `backend/TESTS_README.md` | 测试说明 | 测试变更时 |

---

## 快速参考卡

### 完整开发流程示例

以"添加评论功能"为例：

```bash
# ========== 阶段 (a) - 原型设计 ==========
git checkout -b feature/comments
# [与 AI 讨论原型设计]
# [更新 docs/PROTOTYPE.md]
git add docs/PROTOTYPE.md
git commit -m "2026-1-15[原型]评论功能"
git push origin feature/comments
# [创建 PR，等待审查通过]

# ========== 阶段 (b) - 接口设计 ==========
# [与 AI 讨论 API 设计]
# [更新 docs/API.md]
# [创建 backend/schemas/comment.py]
# [创建 frontend/src/types/comment.ts]
git add docs/API.md backend/schemas frontend/src/types
git commit -m "2026-1-15[接口]评论功能"
git push origin feature/comments

# ========== 阶段 (c) - 前后端开发 ==========
# [与 AI 实现后端]
# [与 AI 实现前端]
# [本地测试]
git add backend frontend
git commit -m "2026-1-15[功能]评论功能"
git push origin feature/comments

# ========== 阶段 (d) - 修缮测试 ==========
# [编写测试]
# [修复 bug]
# [更新 PROGRESS.md]
git add .
git commit -m "2026-1-15[完成]评论功能"
git push origin feature/comments

# ========== 合并到 main ==========
# [创建最终 PR]
# [通过审查后合并]
git checkout main
git pull origin main
git branch -d feature/comments
```

### PR 标签速查

| 阶段 | 标签 | 说明 |
|------|------|------|
| (a) | `[原型]` | 原型设计，需审查通过 |
| (b) | `[接口]` | 接口设计，确认类型匹配 |
| (c) | `[功能]` | 功能实现，基础开发完成 |
| (d) | `[完成]` | 完整实现，测试通过，可合并 |
| 修复 | `[修复]` | Bug 修复 |

---

**版本**: v1.0
**更新日期**: 2026-01-16
**维护者**: V4Corner 开发团队

如有疑问或建议，请在团队群中讨论。

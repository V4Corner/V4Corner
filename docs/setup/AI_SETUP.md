# AI 服务配置指南

本文档详细介绍如何为 V4Corner 配置真实的 AI 服务。

---

## 📑 目录

- [快速开始](#快速开始)
- [模拟模式说明](#模拟模式说明)
- [支持的 AI 服务商](#支持的-ai-服务商)
- [配置示例](#配置示例)
- [高级配置](#高级配置)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 最简单的配置方式（推荐）

```bash
cd backend

# 1. 复制环境变量模板
cp .env.example .env

# 2. 编辑 .env 文件，选择一个 AI 服务商配置
# 例如使用 OpenAI：
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo

# 3. 安装对应的 AI SDK（如果还没安装）
pip install openai

# 4. 重启后端服务
uvicorn main:app --reload
```

---

## 🧪 模拟模式说明

系统默认使用**模拟 AI 回复**，无需配置任何 API Key 即可测试对话功能。

### 模拟模式特点

- ✅ **无需 API Key**：开箱即用，无需注册或配置任何 AI 服务
- ✅ **完整流程测试**：支持创建对话、发送消息、流式输出等所有功能
- ✅ **快速验证**：用于验证前后端集成和 UI 交互
- ⚠️ **仅供开发测试**：AI 回复为预设的模拟内容，非真实 AI 生成

### 模拟模式测试步骤

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

---

## 🔧 支持的 AI 服务商

系统支持 **8 种主流 AI 服务商**，可根据需求选择使用。

### 服务商对比

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

---

## 📝 配置示例

### 1. OpenAI（推荐）

**适用场景**：生产环境、需要最佳质量

**配置步骤**：

1. 注册并获取 API Key：https://platform.openai.com/api-keys
2. 编辑 `backend/.env` 文件：
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   OPENAI_MODEL=gpt-3.5-turbo
   ```
3. 安装依赖：
   ```bash
   pip install openai
   ```
4. 重启后端

**支持的模型**：
- `gpt-4` - 最强模型
- `gpt-4-turbo` - 性价比高
- `gpt-3.5-turbo` - 最经济

---

### 2. DeepSeek（性价比高）

**适用场景**：个人开发、小团队、中文场景

**配置步骤**：

1. 注册并获取 API Key：https://platform.deepseek.com/
2. 编辑 `backend/.env` 文件：
   ```bash
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
   DEEPSEEK_MODEL=deepseek-chat
   ```
3. 安装依赖：
   ```bash
   pip install openai
   ```
4. 重启后端

**支持的模型**：
- `deepseek-chat` - 通用对话
- `deepseek-coder` - 代码生成

**优势**：
- 价格是 OpenAI 的 1/10
- 中文表现优秀
- API 兼容 OpenAI

---

### 3. Ollama（完全免费，本地运行）

**适用场景**：隐私敏感、离线使用、零成本

**配置步骤**：

1. **安装 Ollama**
   - 访问 https://ollama.ai/
   - 下载并安装对应系统的版本

2. **下载模型**
   ```bash
   # 下载 Llama 3.1（推荐）
   ollama pull llama3.1

   # 或其他模型
   ollama pull mistral
   ollama pull phi3
   ```

3. **启动 Ollama 服务**
   ```bash
   ollama serve
   ```

4. **配置 `backend/.env`**
   ```bash
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1
   ENABLE_OLLAMA=True  # 重要：需要显式启用
   ```

5. **重启后端**

**优势**：
- ✅ 完全免费
- ✅ 数据不离开本地
- ✅ 支持多种开源模型
- ⚠️ 需要较好的硬件配置

**注意**：
- 需要确保 Ollama 服务正在运行
- 首次使用会下载模型文件（几 GB）

---

### 4. Anthropic Claude

**适用场景**：长文本处理、复杂推理任务

**配置步骤**：

1. 注册并获取 API Key：https://console.anthropic.com/
2. 编辑 `backend/.env` 文件：
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ANTHROPIC_MODEL=claude-3-sonnet-20240229
   ```
3. 安装依赖：
   ```bash
   pip install anthropic
   ```
4. 重启后端

**支持的模型**：
- `claude-3-opus-20240229` - 最强
- `claude-3-sonnet-20240229` - 平衡
- `claude-3-haiku-20240307` - 快速

---

### 5. Google Gemini

**适用场景**：测试、学习（有免费额度）

**配置步骤**：

1. 注册并获取 API Key：https://makersuite.google.com/app/apikey
2. 编辑 `backend/.env` 文件：
   ```bash
   GEMINI_API_KEY=your-gemini-api-key-here
   GEMINI_MODEL=gemini-pro
   ```
3. 安装依赖：
   ```bash
   pip install google-generativeai
   ```
4. 重启后端

**支持的模型**：
- `gemini-pro` - 通用
- `gemini-pro-vision` - 多模态

---

### 6. 智谱 GLM（国产）

**适用场景**：个人开发、中文场景

**配置步骤**：

1. 注册并获取 API Key：https://open.bigmodel.cn/
2. 编辑 `backend/.env` 文件：
   ```bash
   ZHIPUAI_API_KEY=your-zhipuai-api-key-here
   ZHIPUAI_MODEL=glm-4
   ```
3. 安装依赖：
   ```bash
   pip install zhipuai
   ```
4. 重启后端

**支持的模型**：
- `glm-4` - 最新版本
- `glm-3-turbo` - 快速响应

---

### 7. 阿里云通义千问（国产）

**适用场景**：企业应用、国内稳定服务

**配置步骤**：

1. 注册并获取 API Key：https://dashscope.aliyun.com/
2. 编辑 `backend/.env` 文件：
   ```bash
   DASHSCOPE_API_KEY=sk-your-dashscope-api-key
   DASHSCOPE_MODEL=qwen-turbo
   ```
3. 安装依赖：
   ```bash
   pip install dashscope
   ```
4. 重启后端

**支持的模型**：
- `qwen-turbo` - 快速
- `qwen-plus` - 平衡
- `qwen-max` - 最强

---

### 8. 百度文心一言（国产）

**适用场景**：百度生态集成

**配置步骤**：

1. 注册并获取 API Key：https://cloud.baidu.com/product/wenxinworkshop
2. 编辑 `backend/.env` 文件：
   ```bash
   QIANFAN_API_KEY=your-qianfan-api-key
   QIANFAN_MODEL=ernie-bot-turbo
   ```
3. 重启后端

**支持的模型**：
- `ernie-bot-4` - 最新版本
- `ernie-bot-turbo` - 快速响应

---

### 9. 同时配置多个（自动切换）

系统支持配置多个 AI 服务商，会按优先级自动尝试：

**配置示例**：

```bash
# .env 文件
OPENAI_API_KEY=sk-xxxx
DEEPSEEK_API_KEY=sk-xxxx
OLLAMA_MODEL=llama3.1

# 系统会按配置顺序自动尝试：
# 1. 优先使用 OpenAI
# 2. OpenAI 失败则使用 DeepSeek
# 3. 都失败则使用 Ollama（如果启用）
```

**优势**：
- ✅ 提高可用性
- ✅ 自动容错
- ✅ 降低成本（优先使用免费的）

---

## ⚙️ 高级配置

### 生成参数控制

在 `backend/.env` 中添加以下配置：

```bash
# 指定 AI 服务商（可选，不指定则自动选择）
AI_PROVIDER=openai

# 调整生成参数
AI_MAX_TOKENS=2000      # 最大生成 Token 数（默认：2000）
AI_TEMPERATURE=0.7      # 创造性（0-2，越高越随机，默认：0.7）
AI_TIMEOUT=30           # API 超时时间（秒，默认：30）
```

**参数说明**：

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `AI_MAX_TOKENS` | 限制 AI 回复长度 | 2000（约 1500 字） |
| `AI_TEMPERATURE` | 控制创造性 | 0.3（稳定）- 1.0（创意） |
| `AI_TIMEOUT` | API 超时时间 | 30 秒 |
| `AI_PROVIDER` | 强制使用指定服务商 | 留空（自动选择） |

---

## ❓ 常见问题

### Q1: 如何验证 AI 配置是否成功？

**方法 1：查看后端日志**

启动后端时，观察日志输出：

```bash
# 成功配置 OpenAI
INFO:     AI 模式: REAL (provider=openai)
INFO:     AI 配置: model=gpt-3.5-turbo

# 未配置，使用模拟模式
INFO:     AI 模式: MOCK (无 API Key)
```

**方法 2：使用测试脚本**

```bash
cd backend
python test_ai_mode.py
```

---

### Q2: API 调用失败怎么办？

**检查清单**：

1. **API Key 是否正确**
   ```bash
   # 检查 .env 文件中的 API Key
   cat backend/.env | grep API_KEY
   ```

2. **网络是否正常**
   ```bash
   # 测试连接（以 OpenAI 为例）
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **依赖是否安装**
   ```bash
   # 检查对应的 AI SDK 是否安装
   pip list | grep -i openai
   ```

4. **余额是否充足**
   - 登录对应平台的控制台查看账户余额

---

### Q3: Ollama 连接失败？

**问题症状**：
```
Error: Connection refused to Ollama at http://localhost:11434
```

**解决方法**：

1. **确认 Ollama 服务正在运行**
   ```bash
   # Windows
   tasklist | findstr ollama

   # macOS/Linux
   ps aux | grep ollama
   ```

2. **启动 Ollama 服务**
   ```bash
   ollama serve
   ```

3. **测试连接**
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **检查 .env 配置**
   ```bash
   # 确保设置了 ENABLE_OLLAMA=True
   cat backend/.env | grep OLLAMA
   ```

---

### Q4: 如何切换不同的 AI 服务商？

**方法 1：修改 .env 文件**

```bash
# 注释掉当前的服务商
# OPENAI_API_KEY=sk-xxxx

# 启用新的服务商
DEEPSEEK_API_KEY=sk-xxxx
DEEPSEEK_MODEL=deepseek-chat
```

**方法 2：使用环境变量覆盖**

```bash
# 临时切换（不修改 .env）
export AI_PROVIDER=deepseek
uvicorn main:app --reload
```

---

### Q5: 同时配置了多个 AI，如何知道使用了哪个？

**查看后端日志**：

```bash
INFO:     AI 模式: REAL (provider=auto)
INFO:     检测到 2 个可用 AI 服务
INFO:     优先使用: openai (gpt-3.5-turbo)
```

**测试时观察**：

```bash
# 第一次对话
INFO:     [AI] 使用 provider=openai

# 如果 OpenAI 失败
WARNING:  [AI] OpenAI 调用失败，切换到 deepseek
INFO:     [AI] 使用 provider=deepseek
```

---

### Q6: 如何降低 AI 调用成本？

**策略**：

1. **使用 Ollama（完全免费）**
   ```bash
   OLLAMA_MODEL=llama3.1
   ENABLE_OLLAMA=True
   ```

2. **使用 DeepSeek（性价比高）**
   ```bash
   DEEPSEEK_API_KEY=sk-xxxx
   DEEPSEEK_MODEL=deepseek-chat
   ```

3. **使用有免费额度的平台**
   - Google Gemini：免费 15 次/天
   - 智谱 GLM：免费额度

4. **限制回复长度**
   ```bash
   AI_MAX_TOKENS=1000  # 减半
   ```

5. **配置多个服务商（自动降级）**
   ```bash
   # 主力使用免费的，付费的作为备用
   OLLAMA_MODEL=llama3.1
   ENABLE_OLLAMA=True
   DEEPSEEK_API_KEY=sk-xxxx  # Ollama 失败时使用
   ```

---

### Q7: API 响应太慢怎么办？

**优化方法**：

1. **调整超时时间**
   ```bash
   AI_TIMEOUT=60  # 增加到 60 秒
   ```

2. **使用更快的模型**
   ```bash
   # OpenAI
   OPENAI_MODEL=gpt-3.5-turbo  # 比 gpt-4 快

   # Anthropic
   ANTHROPIC_MODEL=claude-3-haiku-20240307  # 最快

   # 文心一言
   QIANFAN_MODEL=ernie-bot-turbo  # turbo 版本更快
   ```

3. **使用本地 Ollama**
   ```bash
   OLLAMA_MODEL=llama3.1
   ENABLE_OLLAMA=True
   ```

---

### Q8: 如何启用调试模式？

**编辑 `backend/.env`**：

```bash
DEBUG=True
```

重启后端后会输出详细的 AI 调用日志：

```bash
DEBUG:    [AI] 请求参数: {"model": "gpt-3.5-turbo", "messages": [...]}
DEBUG:    [AI] 响应时间: 1.23s
DEBUG:    [AI] Token 使用: prompt=100, completion=50
```

---

## 📚 参考资料

- [FastAPI BackgroundTasks 文档](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Ollama 官方文档](https://github.com/ollama/ollama)
- [V4Corner API 文档](../API.md)

---

**最后更新**：2026-01-26
**推荐方案**：OpenAI（生产）/ Ollama（开发）
**实施状态**：✅ 已完成

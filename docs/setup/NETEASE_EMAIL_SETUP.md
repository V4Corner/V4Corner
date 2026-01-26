# 网易邮箱配置指南

本文档详细说明如何配置网易邮箱（163邮箱、126邮箱、yeah邮箱）用于发送验证码邮件。

---

## 一、支持的网易邮箱类型

V4Corner 支持以下网易邮箱：

| 邮箱类型 | 地址示例 | SMTP 服务器 |
|---------|---------|------------|
| 163 邮箱 | your-email@163.com | smtp.163.com |
| 126 邮箱 | your-email@126.com | smtp.126.com |
| yeah 邮箱 | your-email@yeah.net | smtp.yeah.net |

---

## 二、获取网易邮箱授权码

### 步骤详解（以 163 邮箱为例）

#### 1. 登录网易邮箱

访问 [https://mail.163.com](https://mail.163.com) 并登录你的邮箱。

> **提示**：如果你使用 126 邮箱，请访问 [https://mail.126.com](https://mail.126.com)

#### 2. 进入设置页面

点击邮箱页面顶部的 **"设置"** 按钮，选择 **"POP3/SMTP/IMAP"**。

#### 3. 开启 SMTP 服务

在 **"POP3/SMTP服务"** 或 **"IMAP/SMTP服务"** 选项卡中：

1. 找到 **"开启 POP3/SMTP服务"** 或 **"开启 IMAP/SMTP服务"**
2. 点击右侧的开关，开启服务
3. 系统会提示你需要验证手机号

#### 4. 获取授权码

开启服务后：

1. 找到 **"客户端授权密码"** 选项
2. 点击 **"新增授权密码"**
3. 按提示发送短信验证
4. 验证成功后，系统会显示一个 **16位的授权码**（例如：`ABCDEFGH12345678`）

> **重要**：
> - 授权码只显示一次，请立即复制保存
> - 授权码不是你的邮箱登录密码
> - 请妥善保管授权码，不要泄露给他人

---

## 三、配置 V4Corner

### 方式 1：使用 .env 文件（推荐）

编辑 `backend/.env` 文件：

```bash
# 网易邮箱配置
ALIYUN_ACCOUNT_NAME=your-email@163.com
ALIYUN_FROM_ALIAS=V4Corner
NETEASE_MAIL_PASSWORD=your-16-digit-authorization-code
```

**配置说明：**

| 配置项 | 说明 | 示例 |
|-------|------|------|
| `ALIYUN_ACCOUNT_NAME` | 你的网易邮箱地址 | `example@163.com` |
| `ALIYUN_FROM_ALIAS` | 发件人昵称（显示在邮件中） | `V4Corner` |
| `NETEASE_MAIL_PASSWORD` | 网易邮箱授权码（16位） | `ABCDEFGH12345678` |

### 方式 2：直接设置环境变量（适用于 Docker）

在运行命令前设置环境变量：

```bash
export ALIYUN_ACCOUNT_NAME=your-email@163.com
export ALIYUN_FROM_ALIAS=V4Corner
export NETEASE_MAIL_PASSWORD=your-16-digit-authorization-code
```

---

## 四、使用不同类型的网易邮箱

### 163 邮箱

```bash
ALIYUN_ACCOUNT_NAME=your-email@163.com
NETEASE_MAIL_PASSWORD=your-163-authorization-code
```

### 126 邮箱

```bash
ALIYUN_ACCOUNT_NAME=your-email@126.com
NETEASE_MAIL_PASSWORD=your-126-authorization-code
```

> **注意**：126 邮箱的 SMTP 服务器是 `smtp.126.com`，系统会自动识别。

### yeah 邮箱

```bash
ALIYUN_ACCOUNT_NAME=your-email@yeah.net
NETEASE_MAIL_PASSWORD=your-yeah-authorization-code
```

---

## 五、修改 SMTP 服务器（如需要）

默认情况下，系统会根据邮箱地址自动选择 SMTP 服务器。但如果需要手动指定，可以修改 `backend/services/email_service.py`：

```python
class EmailConfig:
    # 网易 163 邮箱（默认）
    SMTP_HOST: str = "smtp.163.com"
    SMTP_PORT: int = 465
    SMTP_USE_SSL: bool = True

    # 网易 126 邮箱
    # SMTP_HOST: str = "smtp.126.com"
    # SMTP_PORT: int = 465
    # SMTP_USE_SSL: bool = True

    # 网易 yeah 邮箱
    # SMTP_HOST: str = "smtp.yeah.net"
    # SMTP_PORT: int = 465
    # SMTP_USE_SSL: bool = True
```

---

## 六、测试邮件发送

配置完成后，重启后端服务：

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 测试步骤：

1. 打开浏览器，访问注册页面：`http://localhost:3000/register`
2. 输入你的网易邮箱地址
3. 点击"发送验证码"
4. 检查邮箱是否收到验证码邮件

### 查看日志（如果发送失败）：

在后端控制台中，你应该看到类似日志：

```
[INFO] 邮件已成功发送到 your-email@163.com
```

如果发送失败，会显示错误信息：

```
[ERROR] 发送邮件失败: ...
```

---

## 七、常见问题

### Q1: 收不到验证码邮件？

**可能原因：**

1. **授权码错误**
   - 检查 `NETEASE_MAIL_PASSWORD` 是否填写正确
   - 确保填写的是授权码，不是登录密码

2. **SMTP 服务未开启**
   - 登录网易邮箱，确认 SMTP 服务已开启
   - 重新获取授权码

3. **邮件被垃圾箱拦截**
   - 检查邮箱的"垃圾箱"或"推广邮件"文件夹
   - 将发件人添加到白名单

### Q2: 提示"发送失败"或"认证失败"？

**解决方法：**

1. 确认授权码是否正确（16位字符，不含空格）
2. 确认邮箱地址是否正确（例如：`example@163.com`）
3. 重新生成授权码（授权码可能已过期）

### Q3: 限制发送频率？

网易邮箱有发送频率限制：

- **每天最多发送 200 封邮件**
- **每分钟最多发送 10 封邮件**

如果超过限制，邮件会发送失败。建议：
- 开发环境使用模拟模式（不配置授权码）
- 生产环境才启用真实邮件发送

### Q4: 如何切换回模拟模式？

只需删除或注释掉 `.env` 文件中的授权码配置：

```bash
# NETEASE_MAIL_PASSWORD=your-16-digit-authorization-code
```

系统会自动使用模拟模式，验证码会输出到后端控制台。

---

## 八、安全建议

1. **不要将 .env 文件提交到 Git**
   - `.env` 文件包含敏感信息（授权码）
   - 已在 `.gitignore` 中排除

2. **定期更换授权码**
   - 建议每 3-6 个月更换一次
   - 在网易邮箱设置中重新生成授权码

3. **使用专用邮箱**
   - 建议为 V4Corner 创建一个专门的网易邮箱
   - 不要使用个人主邮箱

4. **限制发送频率**
   - 前端有 60 秒冷却时间限制
   - 避免被网易邮箱识别为垃圾邮件

---

## 九、从 QQ 邮箱迁移

如果你之前使用的是 QQ 邮箱，现在想切换到网易邮箱：

### 修改步骤：

1. **修改 .env 文件**
   ```bash
   # 旧配置（QQ 邮箱）
   # QQ_MAIL_PASSWORD=your-qq-authorization-code

   # 新配置（网易邮箱）
   NETEASE_MAIL_PASSWORD=your-netease-authorization-code
   ALIYUN_ACCOUNT_NAME=your-email@163.com
   ```

2. **重启后端服务**
   ```bash
   cd backend
   # 停止当前服务
   # 重新启动
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **测试邮件发送**
   - 访问注册页面
   - 发送验证码测试

---

## 十、参考链接

- **网易 163 邮箱**：https://mail.163.com
- **网易 126 邮箱**：https://mail.126.com
- **网易 yeah 邮箱**：https://mail.yeah.net
- **网易邮箱帮助中心**：https://help.mail.163.com/

---

**最后更新**：2026-01-26

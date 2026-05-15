# 生产环境部署指南

本文档介绍如何将 V4Corner 部署到生产环境。

## ⚠️ 生产环境安全检查清单（部署前必读）

部署到生产环境前，**务必**完成以下检查：

| 检查项 | 要求 | 说明 |
|--------|------|------|
| 🔒 **关闭开发模式** | `SKIP_EMAIL_VERIFICATION=False` | 防止任何人随意注册 |
| 🔑 **强随机密钥** | 至少 32 位随机字符串 | JWT 签名安全 |
| 📧 **真实邮箱** | 配置 SMTP 授权码 | 发送验证码 |
| 🔐 **HTTPS** | 启用 SSL 证书 | 保护用户数据 |
| 🗄️ **生产数据库** | 使用 PostgreSQL | 不使用 SQLite |

### 生成强密钥

```bash
# Linux/macOS
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Docker 生产环境 `.env` 配置示例

仓库根目录提供了 `.env.production.example`。服务器部署时复制为 `.env`，再填入真实值：

```bash
cp .env.production.example .env
vim .env
```

关键配置：

```bash
DOMAIN=your-domain.com

POSTGRES_DB=v4corner
POSTGRES_USER=v4corner
POSTGRES_PASSWORD=your-strong-db-password
DATABASE_URL=postgresql+psycopg2://v4corner:your-strong-db-password@postgres:5432/v4corner

ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-super-secret-random-64-char-string-here
ALLOWED_ORIGINS=https://your-domain.com
SKIP_EMAIL_VERIFICATION=False

ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NICKNAME=管理员

ALIYUN_ACCOUNT_NAME=your-email@163.com
ALIYUN_FROM_ALIAS=V4Corner
NETEASE_MAIL_PASSWORD=your-real-authorization-code

AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```

---

## 📋 推荐部署步骤（Docker + Caddy）

### 1. 域名解析

在域名 DNS 控制台添加 `A` 记录：

```text
your-domain.com -> 服务器公网 IP
```

如使用 `www.your-domain.com`，也添加对应 `A` 记录，并把 `ALLOWED_ORIGINS` 和 Caddy 域名配置扩展到该域名。

### 2. 准备服务器

服务器只需要 Docker、Docker Compose 和开放端口：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y ca-certificates curl git ufw

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

重新登录 SSH，让 Docker 用户组生效。

### 3. 拉取代码并写入生产配置

```bash
git clone https://github.com/V4Corner/V4Corner.git
cd V4Corner

cp .env.production.example .env
vim .env
```

必须修改：

- `DOMAIN`：你的域名
- `POSTGRES_PASSWORD` 和 `DATABASE_URL` 中的数据库密码
- `SECRET_KEY`：使用 `openssl rand -hex 32` 生成
- `ALLOWED_ORIGINS=https://你的域名`
- `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- 邮箱验证码配置
- 至少一个 AI 服务 API key

### 4. 首次启动

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

启动后会自动完成：

- 创建 PostgreSQL 数据卷
- 后端建表
- 根据 `ADMIN_*` 环境变量创建或提升首个管理员
- Caddy 为 `DOMAIN` 自动申请 HTTPS 证书

### 5. 验证服务

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f caddy
```

浏览器访问：

- `https://your-domain.com`
- 使用 `.env` 中的管理员账号登录
- 进入 `/admin/roles` 管理用户角色
- 测试注册、邮箱验证码、AI 对话、头像/博客媒体上传

### 6. 后续更新

```bash
cd V4Corner
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

PostgreSQL、上传文件和 Caddy 证书都使用 Docker volume 持久化，重建容器不会丢失。

### 7. 账号和角色

- `student`：普通学生，注册后的默认角色。
- `committee`：班委，可发布和管理班级通知、日历等内容。
- `admin`：管理员，拥有班委权限，并可进入 `/admin/roles` 调整用户角色。

---

## 📋 传统部署步骤（systemd + Nginx，可选）

### 1. 准备服务器

#### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Python**: 3.10+
- **Node.js**: 18+
- **内存**: 至少 2GB RAM
- **存储**: 至少 20GB

#### 安装系统依赖

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3.10 python3-pip python3-venv nodejs npm postgresql nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo dnf install -y python3.10 python3-pip nodejs npm postgresql-server nginx
```

### 2. 配置数据库

#### 安装 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行
CREATE DATABASE v4corner;
CREATE USER v4corner_user WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE v4corner TO v4corner_user;
\q
```

### 3. 配置后端

```bash
# 克隆仓库（如果还没有）
git clone <repository-url>
cd V4Corner/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建生产环境配置
cp .env.example .env
vim .env  # 编辑配置文件

# 重要：确保以下配置正确
# - SKIP_EMAIL_VERIFICATION=False
# - SECRET_KEY=<强随机密钥>
# - DATABASE_URL=postgresql://v4corner_user:password@localhost:5432/v4corner
# - NETEASE_MAIL_PASSWORD=<真实授权码>
```

#### 创建数据库表

```bash
# FastAPI 会自动创建表，首次启动时：
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

#### 创建 systemd 服务

```bash
# 创建服务文件
sudo vim /etc/systemd/system/v4corner-backend.service
```

内容如下：

```ini
[Unit]
Description=V4Corner Backend FastAPI Application
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/V4Corner/backend
Environment="PATH=/path/to/V4Corner/backend/venv/bin"
ExecStart=/path/to/V4Corner/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start v4corner-backend

# 设置开机自启
sudo systemctl enable v4corner-backend

# 检查服务状态
sudo systemctl status v4corner-backend
```

### 4. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 创建生产环境配置
vim .env.production
```

`.env.production` 内容：

```bash
# 后端 API 地址
VITE_BACKEND_URL=https://your-domain.com/api
```

构建前端：

```bash
# 构建生产版本
npm run build

# 构建产物在 dist/ 目录
```

### 5. 配置 Nginx 和 HTTPS

#### 安装 SSL 证书（Let's Encrypt）

```bash
# 停止 Nginx（如果正在运行）
sudo systemctl stop nginx

# 获取 SSL 证书
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 证书路径：
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

#### 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo vim /etc/nginx/sites-available/v4corner
```

内容如下：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置（推荐）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/v4corner-access.log;
    error_log /var/log/nginx/v4corner-error.log;

    # 前端静态文件
    location / {
        root /path/to/V4Corner/frontend/dist;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 后端文档（可选，生产环境建议关闭）
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    # 文件上传大小限制
    client_max_body_size 2M;
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/v4corner /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 6. 配置防火墙

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 7. 验证部署

```bash
# 1. 检查后端服务
sudo systemctl status v4corner-backend

# 2. 检查 Nginx 服务
sudo systemctl status nginx

# 3. 测试 API 访问
curl https://your-domain.com/api/docs

# 4. 测试前端访问
curl -I https://your-domain.com

# 5. 测试注册功能
# 访问 https://your-domain.com
# 尝试注册，应该收到真实邮件验证码
```

---

## 🔧 运维管理

### 查看日志

```bash
# 后端日志
sudo journalctl -u v4corner-backend -f

# Nginx 访问日志
sudo tail -f /var/log/nginx/v4corner-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/v4corner-error.log
```

### 重启服务

```bash
# 重启后端
sudo systemctl restart v4corner-backend

# 重启 Nginx
sudo systemctl restart nginx
```

### 更新应用

```bash
# 1. 拉取最新代码
cd /path/to/V4Corner
git pull

# 2. 更新后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart v4corner-backend

# 3. 更新前端
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

### 数据库备份

```bash
# 手动备份
sudo -u postgres pg_dump v4corner > v4corner_backup_$(date +%Y%m%d).sql

# 自动备份（添加到 crontab）
crontab -e

# 每天凌晨 2 点备份
0 2 * * * sudo -u postgres pg_dump v4corner > /backups/v4corner_$(date +\%Y\%m\%d).sql
```

### SSL 证书自动续期

```bash
# Certbot 会自动配置续期
# 测试续期
sudo certbot renew --dry-run

# 查看续期配置
sudo systemctl list-timers | grep certbot
```

---

## 🚨 常见问题

### 1. 502 Bad Gateway

**原因**: 后端服务未启动

**解决**:
```bash
sudo systemctl status v4corner-backend
sudo systemctl start v4corner-backend
```

### 2. 静态文件 404

**原因**: 前端构建路径不正确

**解决**:
```bash
cd frontend
npm run build
# 检查 dist/ 目录是否生成
# 更新 Nginx 配置中的 root 路径
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 验证码发送失败

**原因**: 邮箱配置错误

**解决**:
```bash
# 检查后端日志
sudo journalctl -u v4corner-backend -n 50

# 确认配置
cat backend/.env | grep MAIL
```

### 4. 数据库连接失败

**原因**: PostgreSQL 未启动或配置错误

**解决**:
```bash
sudo systemctl status postgresql
# 检查 DATABASE_URL 配置
```

---

## 📊 性能优化建议

### 后端优化

1. **使用 Gunicorn + Uvicorn Workers**

```bash
# 安装 Gunicorn
pip install gunicorn

# 修改 systemd 服务
ExecStart=/path/to/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

2. **启用数据库连接池**

```python
# backend/database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

### 前端优化

1. **启用 Gzip 压缩**（Nginx）

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

2. **配置 CDN**（可选）

将静态资源上传到 CDN，减轻服务器压力。

---

## 🔒 安全加固建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **限制 SSH 访问**
   - 禁用 root 登录
   - 使用密钥认证
   - 修改默认端口

3. **配置 Fail2ban**（防止暴力破解）
   ```bash
   sudo apt install fail2ban
   ```

4. **定期备份**
   - 数据库备份
   - 配置文件备份
   - 用户上传文件备份

5. **监控告警**
   - 配置服务器监控（如 Prometheus + Grafana）
   - 设置邮件/短信告警

---

## 📞 技术支持

如遇到部署问题，请检查：
1. 系统日志: `sudo journalctl -xe`
2. Nginx 日志: `/var/log/nginx/`
3. 后端日志: `sudo journalctl -u v4corner-backend`

---

**最后更新**: 2026-01-26

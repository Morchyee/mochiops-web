# mochiops-web 服务器部署指南

目标：将前端部署到 `159.195.158.129`，通过 `https://ops.morchyee.top` 访问。

## 架构

```text
浏览器
  └─ https://ops.morchyee.top:443  (宿主机 Nginx + Let's Encrypt)
       └─ http://127.0.0.1:8080   (docker-compose 中的 nginx 容器)
            ├─ / -> 静态文件 (dist)
            └─ /api/ -> http://159.195.158.129:8000/ (FastAPI 后端)
```

## 服务器初始化步骤

### 1. DNS

给域名添加 A 记录：

```text
ops.morchyee.top  A  159.195.158.129
```

### 2. 安装 Docker 与 Compose（如未安装）

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker compose version   # 确认可用
```

### 3. 创建前端部署目录并放入 compose 文件

把仓库根目录的 `docker-compose.yml` 复制到服务器：

```bash
mkdir -p /opt/mochiops-web
cd /opt/mochiops-web
# 将 docker-compose.yml 放到这里
docker compose pull
docker compose up -d
curl -s http://127.0.0.1:8080/ | head   # 验证容器内 nginx 正常
```

### 4. 宿主机 Nginx + HTTPS（Let's Encrypt）

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
mkdir -p /var/www/certbot

# 复制本目录的 ops.morchyee.top.conf 到 sites-available
cp ops.morchyee.top.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/ops.morchyee.top.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 申请并自动配置证书（certbot 会自动改写 nginx 配置并设置续期）
certbot --nginx -d ops.morchyee.top

# 测试自动续期
certbot renew --dry-run
```

之后验证 `https://ops.morchyee.top` 可访问。

### 5. 配置 GitHub Actions Secrets

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret | 值 |
|---|---|
| `SERVER_WEBHOOK_URL` | 服务器部署 Webhook 地址（与后端 MochiOps 使用同一个） |
| `MOCHIOPS_API_KEY` | 与服务器 `MOCHIOPS_API_KEY` 一致 |

前端镜像会通过 `ghcr.io/morchyee/mochiops-web:latest` 推送，Webhook 部署时容器名为 `mochiops-web`（服务器上需有对应的 compose 服务/拉取脚本）。

如果服务器不使用 Webhook 而是 SSH，在 `.github/workflows/deploy.yml` 中改用 `appleboy/ssh-action`，并添加 `SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY` 三个 Secret。

## 环境变量说明

- `.env.production` 中 `VITE_API_BASE_URL` 已改为 `https://ops.morchyee.top/api`，同源请求会走宿主机 Nginx → 容器 Nginx → FastAPI，避免 HTTPS 页面请求 HTTP 接口产生混合内容拦截。
- 如果暂时没有域名/证书，可临时改回 `http://159.195.158.129:8000`，但 HTTPS 上线前必须改回。

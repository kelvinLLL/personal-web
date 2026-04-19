# personal-web 阿里云部署指南

这份文档对应的是你现在真正要上线的项目：

- 主仓库：`personal-web`
- Agent runtime：`apps/superhaojun` submodule
- 最终部署对象：`personal-web`

如果你的网站要带上 `SuperHaojun` 集成，请以这份文档为准，不要单独部署 `SuperHaojun` 仓库。

## 一、推荐方案

当前最省心的部署结构是：

- 平台：阿里云 ECS
- 系统：Ubuntu 24.04 LTS
- 反向代理：`nginx`
- 进程管理：`systemd`
- HTTPS：Let's Encrypt + Certbot

站点运行结构：

- `nginx`
  - 直接托管 `personal-web/dist`
  - 反向代理 `/api/*` 到 FastAPI backend
- `FastAPI backend`
  - 提供 `ideas / workflow / models / auth / site-agent`
  - 运行时从 `apps/superhaojun` 加载 harness runtime

## 二、服务器建议

建议第一台机器直接选：

- 2 vCPU
- 4 GB 内存
- 40 GB 以上系统盘
- Ubuntu 24.04

如果后面 `workflow`、agent 使用频率明显上升，再往上加即可。

## 三、部署前准备

你需要准备：

1. 阿里云 ECS 一台
2. 域名或子域名
3. SSH 密钥
4. 生产环境配置文件

至少包括：

- `personal-web/backend/.env`
- `personal-web/apps/superhaojun/.env`

## 四、安全组与域名

安全组入方向建议只放行：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS

域名解析加一条 `A` 记录指向 ECS 公网 IP。

## 五、登录服务器并安装基础环境

先安装基础依赖：

```bash
sudo apt update
sudo apt install -y git curl unzip build-essential nginx python3 python3-venv ca-certificates
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

安装 `uv`：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source "$HOME/.local/bin/env"
```

确认版本：

```bash
node -v
npm -v
uv --version
python3 --version
```

## 六、拉取代码

建议统一放到 `/srv`：

```bash
sudo mkdir -p /srv
sudo chown "$USER":"$USER" /srv
cd /srv
git clone --recurse-submodules https://github.com/kelvinLLL/personal-web.git
cd personal-web
```

如果仓库已经拉过，但 submodule 还没初始化：

```bash
git submodule update --init --recursive
```

如果之后主仓库更新了 submodule 指针：

```bash
git pull
git submodule update --init --recursive
```

## 七、准备环境变量

### `backend/.env`

至少需要：

```env
ADMIN_PASSWORD=你的管理密码
JWT_SECRET=一段随机长字符串
TAVILY_API_KEY=你的真实Key
OPENROUTER_API_KEY=你的真实Key
```

### `apps/superhaojun/.env`

至少需要：

```env
OPENROUTER_API_KEY=你的真实Key
```

注意：

- 这两个文件都不要提交到 GitHub
- `personal-web` 部署时，`SuperHaojun` 仍然通过 submodule 内自己的 `.env` 读取模型服务 key

## 八、安装依赖

### 根前端依赖

```bash
cd /srv/personal-web
npm ci
```

### 后端依赖

```bash
cd /srv/personal-web/backend
uv sync
```

### legacy reader 依赖

```bash
cd /srv/personal-web/apps/book-reader
npm ci
```

如果后面你还需要在服务器上单独维护 `apps/superhaojun` 的开发命令，再进入它自己的目录安装依赖；但对于网站正式部署，核心运行入口仍然是 `personal-web/backend`，不是 `superhaojun-web`。

## 九、构建站点

回到主仓库根目录：

```bash
cd /srv/personal-web
npm run build
```

这一步会产出：

- `dist/`
- 包含主站静态资源
- 包含 `book-reader-legacy`
- 包含静态 snapshot 数据

## 十、创建 backend systemd 服务

新建：

```bash
sudo nano /etc/systemd/system/personal-web-backend.service
```

填入：

```ini
[Unit]
Description=personal-web backend
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/srv/personal-web/backend
Environment=HOME=/home/deploy
Environment=PATH=/home/deploy/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/deploy/.local/bin/uv run uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

然后启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable personal-web-backend
sudo systemctl start personal-web-backend
sudo systemctl status personal-web-backend
```

## 十一、配置 Nginx

新建站点配置：

```bash
sudo nano /etc/nginx/sites-available/personal-web
```

填入：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /srv/personal-web/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/personal-web /etc/nginx/sites-enabled/personal-web
sudo nginx -t
sudo systemctl reload nginx
```

## 十二、配置 HTTPS

安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

申请证书：

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 十三、更新发布流程

以后更新时按这个顺序：

```bash
cd /srv/personal-web
git pull
git submodule update --init --recursive

cd /srv/personal-web/apps/book-reader
npm ci

cd /srv/personal-web/backend
uv sync

cd /srv/personal-web
npm run build

sudo systemctl restart personal-web-backend
sudo systemctl reload nginx
```

## 十四、排查要点

### 后端起不来

看日志：

```bash
sudo journalctl -u personal-web-backend -n 100 --no-pager
```

重点检查：

- `backend/.env` 是否存在
- `apps/superhaojun/.env` 是否存在
- `apps/superhaojun` submodule 是否已初始化

### 页面能打开但 API 失败

先确认 backend：

```bash
curl http://127.0.0.1:8000/api/health
```

再确认 nginx 代理：

```bash
curl https://yourdomain.com/api/health
```

### submodule 版本不对

执行：

```bash
git submodule status
```

如果主仓库已经更新了指针但服务器没同步，重新执行：

```bash
git submodule update --init --recursive
```

## 十五、一句话原则

如果是网站正式上线：

- 部署仓库永远是 `personal-web`
- `SuperHaojun` 只是 `apps/superhaojun` submodule
- 先同步 submodule，再构建，再重启 backend

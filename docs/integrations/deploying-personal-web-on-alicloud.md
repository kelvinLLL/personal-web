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

这里选择 `ECS + nginx`，不是因为 `Vercel` 只能做静态，而是因为你当前正式版本已经不只是纯前端：

- 主站静态资源需要从 `dist/` 提供
- `backend` 需要长期运行 `FastAPI`
- `apps/superhaojun` 需要作为 submodule runtime 被后端加载
- `site-agent`、SSE、模型服务和管理接口都更适合放在一台可控的常驻服务器上

## 二、服务器建议

如果你现在是第一次上线，机器不用一步到位拉满。

更实际的建议是：

- `2 vCPU / 2 GB`：可以作为第一台正式机，足够先把站点和 agent 集成跑起来
- `2 vCPU / 4 GB`：更稳妥，后面跑 workflow、更多 agent 请求时余量更大
- 40 GB 以上系统盘
- Ubuntu 24.04

如果你预算敏感，先上 `2C2G` 没问题；如果你想少折腾扩容，直接 `2C4G` 更省心。

### 购买页几个常见选项

#### 1. 应用型负载均衡 ALB

单台 ECS 阶段先不要选。

`ALB` 主要用于：

- 多台服务器之间分发流量
- 健康检查和故障切换
- 按域名或路径做更复杂的转发

你现在的目标是先把一台机器上的 `nginx + FastAPI + personal-web` 跑通，这个阶段 `ALB` 只会增加复杂度和费用。

#### 2. 专有网络 VPC

默认即可。

可以把 `VPC` 理解成你在云上划出来的一块私有网络空间。对你现在的单机部署来说，不需要自己做复杂网络规划。

#### 3. 虚拟交换机 vSwitch

默认即可。

可以把 `vSwitch` 理解成 `VPC` 里的一个子网。单台 ECS 阶段，跟着默认配置走就够用了。

#### 4. 公网 IP

要开。

你需要让域名解析到这台机器，并让外部用户访问 `80/443`。

#### 5. 安全组

这是比 `VPC / vSwitch` 更值得认真看的选项。入方向建议只放行：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS

## 三、部署前准备

你需要准备：

1. 阿里云 ECS 一台
2. 域名或子域名（可选，首轮也可以先只用公网 IP）
3. SSH 密钥
4. 生产环境配置文件

至少包括：

- `personal-web/backend/.env`

当前集成模式下，`personal-web/backend/.env` 是必需的；`apps/superhaojun/.env` 只有在你还想单独运行 submodule 自己的 WebUI / TUI / CLI 时才需要。

## 四、安全组、IP 与域名

你现在可以按两种阶段理解：

- `阶段一：先用公网 IP 跑通`
  - 可行
  - 适合你现在这种“先把服务部署起来并验证功能”的阶段
  - 这时可以先不配置域名解析，也先不做 HTTPS
- `阶段二：备案后再切域名`
  - 如果你的网站部署在中国内地并准备正式对外提供网站服务，后续还是建议完成备案后再绑定域名
  - 备案完成后，再把域名解析到 ECS 公网 IP，并补 HTTPS

如果你当前先不用域名：

- 安全组继续放行 `80`
- 如果暂时不做 HTTPS，可以先不依赖 `443`
- 当前 Vercel 静态首页会提供一个手动跳转按钮，指向 ECS 公网服务 `http://47.99.200.227`
- 这个跳转是首页里的显式外链，不要求你把域名解析到阿里云，也不会自动把所有 Vercel 路由代理到 ECS
- Vercel 主站默认不会直连独立 `SuperHaojun` WebUI；只有你显式配置 `VITE_SUPERHAOJUN_WEBUI_URL` 后才会从 `/superhaojun` 跳转过去
- 如果临时配置公网 IP 加 `8765` 直连 WebUI，需要额外放行 `8765` 并确保 `superhaojun-web` 已常驻；后续改成域名或 Nginx 反代后，应优先收回这个公网端口
- 浏览器访问时先用：

```text
http://你的公网IP
```

如果你后面切到域名：

- 在域名 DNS 里加 `A` 记录指向 ECS 公网 IP
- 再把下面 Nginx 里的 `server_name` 改成你的真实域名
- 最后再申请 HTTPS 证书

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

注意：

- `backend/.env` 不要提交到 GitHub
- 当前 `personal-web` 集成运行 `SuperHaojun` 时，会跟随后端进程工作目录默认读取 `backend/models.yaml` 和 `backend/.env`
- `apps/superhaojun/.env` 只在你还要单独运行 `uv run superhaojun`、`uv run superhaojun-tui` 或 `uv run superhaojun-web` 时才需要

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

填入前先确认你准备让哪个系统用户跑服务。

如果你前面一直用当前 SSH 用户在 `/srv/personal-web` 下安装依赖，那这里最简单的做法就是继续用同一个用户。下面示例里的 `YOUR_USER` 和 `/home/YOUR_USER` 请替换成你的真实用户名和 home 路径；如果你就是用 `root`，那路径应改成 `/root`。

注意：

- 阿里云网页终端或 Cloud Assistant 里常见的 `ecs-assist-user` 不是适合作为长期 `systemd` 服务用户的目标值
- 如果你把 `User=` 配成一个不存在或不可用的用户，`systemd` 会报：
  - `status=217/USER`
  - `Failed to determine user credentials`
- 对个人站最省事的做法通常是：
  - 要么用你真实创建的 Linux 用户
  - 要么直接用 `root`

填入：

```ini
[Unit]
Description=personal-web backend
After=network.target

[Service]
Type=simple
User=YOUR_USER
Group=YOUR_USER
WorkingDirectory=/srv/personal-web/backend
Environment=HOME=/home/YOUR_USER
Environment=PATH=/home/YOUR_USER/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/YOUR_USER/.local/bin/uv run uvicorn main:app --host 127.0.0.1 --port 8000
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

### 方案 A：先只用公网 IP

如果你当前还没有备案完成，或者只是想先跑通网站，推荐先用这个版本。

新建站点配置：

```bash
sudo nano /etc/nginx/sites-available/personal-web
```

填入：

```nginx
server {
    listen 80;
    server_name _;

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

这里的 `server_name _;` 表示先接这台机器上的默认 HTTP 请求，不要求你已经有域名。

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/personal-web /etc/nginx/sites-enabled/personal-web
sudo nginx -t
sudo systemctl reload nginx
```

然后先直接访问：

```text
http://你的公网IP
```

### 方案 B：备案后切换域名

如果你已经完成备案并准备正式使用域名，把上面的 `server_name _;` 改成：

```nginx
server_name yourdomain.com www.yourdomain.com;
```

同时在 DNS 中添加：

- `A @ -> 你的 ECS 公网 IP`
- `A www -> 你的 ECS 公网 IP`

## 十二、配置 HTTPS

这一步只在你已经准备好域名时再做。

安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

申请证书：

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

如果你当前还只是用公网 IP：

- 先跳过这一步
- 先用 `HTTP + 公网 IP` 验证站点和 API 都正常
- 等备案和域名都准备好后，再回来补 HTTPS

## 十三、更新发布流程

如果你重新登录后需要恢复给 Codex 的维护权限，先用 root 跑一次：

```bash
cd /srv/personal-web
sudo bash scripts/ops/bootstrap-codex-maintainer.sh
```

当前 ECS 上也安装了同等快捷命令：

```bash
sudo personal-web-bootstrap-codex
```

以后更新服务时，推荐直接跑：

```bash
cd /srv/personal-web
scripts/ops/update-aliyun-service.sh
```

当前 ECS 上也安装了同等快捷命令：

```bash
personal-web-update
```

它会自动完成：暂存本地已跟踪改动、拉取最新 `main`、更新 submodule、重新构建 `dist`、同步 backend 依赖、重启 `personal-web-backend`、检查 nginx 并 reload。如果 ECS 当时无法连通 GitHub，脚本会在 fetch 阶段失败，而不是静默部署旧缓存；线上服务会继续停留在上一次成功部署的版本。

手动等价流程如下：

```bash
cd /srv/personal-web

git status --short --branch
git pull --ff-only
git submodule update --init --recursive

npm ci
npm run build

cd /srv/personal-web/backend
uv sync

sudo systemctl restart personal-web-backend
sudo nginx -t
sudo systemctl reload nginx
```

验证：

```bash
curl -s http://47.99.200.227 | grep -o 'assets/index-[^"]*\.js'
curl http://127.0.0.1:8000/api/health
sudo systemctl status personal-web-backend --no-pager
```

## 十四、排查要点

### 后端起不来

看日志：

```bash
sudo journalctl -u personal-web-backend -n 100 --no-pager
```

重点检查：

- `backend/.env` 是否存在
- `apps/superhaojun` submodule 是否已初始化
- 如果你走的是网站集成模式，不要先被 `apps/superhaojun/.env` 缺失误导；它默认不是 `/api/agent/query` 这条链路的主配置源
- 如果日志里出现 `status=217/USER`
  - 先检查 `/etc/systemd/system/personal-web-backend.service` 里的 `User=` 和 `Group=`
  - 不要把它写成 `ecs-assist-user`
  - 改成真实存在的 Linux 用户或直接用 `root`

修改后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl restart personal-web-backend
sudo systemctl status personal-web-backend --no-pager
```

### 想单独运行 `SuperHaojun` 原生 WebUI

如果你除了网站集成模式，还想在服务器上单独跑 `SuperHaojun` 自己的 WebUI，最省事的方式就是让它复用主站后端的密钥文件。

例如：

```bash
cd /srv/personal-web/apps/superhaojun
ln -sfn /srv/personal-web/backend/.env .env
```

这样：

- `personal-web/backend` 继续使用自己的 `.env`
- `apps/superhaojun` 也能复用同一份密钥
- 后面如果你想拆成独立配置，再把这个软链接换成独立文件即可
- Vercel 主站不会内置 raw IP 跳转目标；如果以后要让 `/superhaojun` 跳到这个 standalone WebUI，再配置 `VITE_SUPERHAOJUN_WEBUI_URL` 即可

如果你还想让 standalone `SuperHaojun` 复用同一套模型配置，也可以额外考虑：

```bash
cd /srv/personal-web/apps/superhaojun
ln -sfn /srv/personal-web/backend/models.yaml models.yaml
```

但这个不是必须；最小可运行通常先共享 `.env` 就够了。

### 页面能打开但 API 失败

先确认 backend：

```bash
curl http://127.0.0.1:8000/api/health
```

如果你当前走公网 IP：

```bash
curl http://你的公网IP/api/health
```

如果你已经切到域名：

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

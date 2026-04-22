# personal-web

Unified production entrypoint for `kelvin11888.blog`.

## Structure

- `frontend/`: main React public site
- `backend/`: FastAPI API service
- `apps/book-reader`: legacy reader submodule
- `apps/daily-nuance`: nuance data/source submodule
- `apps/superhaojun`: SuperHaojun runtime submodule
- `apps/str-viewer`: lightweight static string viewer
- `dist/`: final static output served by Vercel or nginx

## Current Deployment Shape

The temporary production shape is intentionally simple:

- Vercel serves the static public domain, including the homepage.
- The homepage includes an `Open Aliyun Service` button pointing to `http://47.99.200.227`.
- Aliyun ECS runs the full `personal-web` service behind nginx and FastAPI.
- No domain binding to Aliyun is required yet.

## First-Time Setup

```bash
npm install
git submodule update --init --recursive
```

## Local Development

```bash
npm run dev
```

This starts one local entrypoint printed in the terminal. The root dev proxy owns the public paths and forwards to the frontend, backend, and sub-app dev servers as needed.

## Build Everything

```bash
npm run build
```

This assembles the main frontend plus static sub-app outputs into `dist/`.

## Update Submodules After Upstream Changes

```bash
git submodule update --remote --merge
```

## Vercel Deploy

Connect this repo to Vercel and set:

- Build Command: `npm run build`
- Output Directory: `dist`

The Vercel homepage button target is currently defined in:

```text
frontend/src/core/site/deployment.ts
```

## Update Aliyun Service

Use this when code has been pushed to GitHub and you want the ECS public IP service to show the latest site:

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

Then verify:

```bash
curl -s http://47.99.200.227 | grep -o 'assets/index-[^"]*\.js'
curl http://127.0.0.1:8000/api/health
sudo systemctl status personal-web-backend --no-pager
```

If the browser still shows an old page, hard refresh first. If it is still stale, inspect nginx:

```bash
sudo nginx -T | grep -n -A8 -B4 "root /srv/personal-web/dist"
```

Full server guidance lives in [阿里云部署指南](docs/integrations/deploying-personal-web-on-alicloud.md). Deploy `personal-web`; do not deploy `apps/superhaojun` as the main website.

# personal-web

Unified production entrypoint for `kelvin11888.blog`.

## Structure

- `portal/`: Astro homepage and future personal-site shell
- `apps/book-reader`: git submodule pointing to `kelvinLLL/Hello-`
- `apps/daily-nuance`: git submodule pointing to `kelvinLLL/nuance`
- `dist/`: final deployable output for Vercel

## First-time setup

```bash
git submodule update --init --recursive
```

## Build everything

```bash
npm run build
```

This assembles:

- `/`
- `/book-reader/`
- `/daily-nuance/`

## Build one section

```bash
npm run build:portal
npm run build:book-reader
npm run build:daily-nuance
```

## Unified local development

```bash
npm install
npm run dev
```

This starts one local entrypoint at:

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/book-reader/`
- `http://127.0.0.1:3000/daily-nuance/`

How it works:

- Astro runs the portal homepage on a local dev port.
- Vite runs `book-reader` on a separate local dev port with `VITE_BASE_PATH=/book-reader/`.
- Docusaurus runs `daily-nuance` on another local dev port with `BASE_URL=/daily-nuance/`.
- A small Node reverse proxy forwards the browser request to the right dev server by path prefix, so it feels like one site.

`uv` is still used for `daily-nuance`, because that project needs Python to refresh ranking data before the Docusaurus app starts.

## Update submodules after upstream changes

```bash
git submodule update --remote --merge
```

## Deploy

Connect this repo to Vercel and set:

- Build Command: `npm run build`
- Output Directory: `dist`

Bind the custom domain:

- `kelvin11888.blog`

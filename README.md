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

- one unified root URL printed in the terminal
- plus matching `/book-reader/` and `/daily-nuance/` subpaths under that same origin

How it works:

- Astro runs the portal homepage on a local dev port.
- Vite runs `book-reader` on a separate local dev port with `VITE_BASE_PATH=/book-reader/`.
- Docusaurus runs `daily-nuance` on another local dev port with `BASE_URL=/daily-nuance/`.
- A small Node reverse proxy forwards the browser request to the right dev server by path prefix, so it feels like one site.

If `3000`, `4321`, `4322`, or `4323` are already in use, the script now automatically picks the next available ports and prints the exact URLs you should open.

`uv` is still used for `daily-nuance`, because that project has a Python data pipeline behind the Docusaurus UI.

By default, `npm run dev` reuses the latest generated `daily-nuance` data if it already exists, so startup stays fast.

If you want a fresh data pull before local testing:

```bash
npm run refresh:daily-nuance
```

If you want startup itself to force a refresh:

```bash
DAILY_NUANCE_REFRESH=1 npm run dev
```

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

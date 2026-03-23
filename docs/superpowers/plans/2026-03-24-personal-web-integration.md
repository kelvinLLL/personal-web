# Personal Web Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `kelvin11888.blog` as a single deployed site with a bright geeky portal homepage at `/`, plus `book-reader` at `/book-reader/` and `daily-nuance` at `/daily-nuance/`.

**Architecture:** `personal-web` is the only production entrypoint and deployment target. It contains an Astro portal shell and two git submodules for `book-reader` and `daily-nuance`; the root build assembles all outputs into one `dist/` directory that Vercel deploys.

**Tech Stack:** Astro, Node.js scripts, Vite, Docusaurus, uv, git submodules, Vercel

---

### Task 1: Bootstrap the integration repository

**Files:**
- Create: `docs/superpowers/plans/2026-03-24-personal-web-integration.md`
- Create: `package.json`
- Create: `.gitignore`
- Create: `.gitmodules`

- [ ] **Step 1: Write the failing structure expectation**

Expected structure:
```text
personal-web/
  apps/book-reader
  apps/daily-nuance
  portal/
  scripts/
  dist/
```

- [ ] **Step 2: Verify the structure does not exist yet**

Run: `find . -maxdepth 2 -type d | sort`
Expected: missing `apps/`, `portal/`, `scripts/`, `dist/`

- [ ] **Step 3: Create the minimal root scaffolding**

Create root package metadata, ignore rules, and submodule metadata.

- [ ] **Step 4: Verify scaffolding exists**

Run: `find . -maxdepth 2 -type f | sort`
Expected: root config files appear

### Task 2: Add submodules for the two product repos

**Files:**
- Modify: `.gitmodules`
- Create: `apps/book-reader`
- Create: `apps/daily-nuance`

- [ ] **Step 1: Add the `book-reader` submodule**

Run:
```bash
git submodule add https://github.com/kelvinLLL/Hello-.git apps/book-reader
```

- [ ] **Step 2: Add the `daily-nuance` submodule**

Run:
```bash
git submodule add https://github.com/kelvinLLL/nuance.git apps/daily-nuance
```

- [ ] **Step 3: Verify both submodules were added**

Run: `git submodule status`
Expected: two entries under `apps/`

### Task 3: Make `book-reader` buildable under `/book-reader/`

**Files:**
- Modify: `apps/book-reader/vite.config.js`
- Modify: `apps/book-reader/vercel.json`

- [ ] **Step 1: Write the failing expectation**

`book-reader` should emit asset URLs relative to `/book-reader/` in production.

- [ ] **Step 2: Verify current config is root-path oriented**

Run: `sed -n '1,220p' apps/book-reader/vite.config.js`
Expected: no `base` handling

- [ ] **Step 3: Implement minimal path-aware Vite config**

Use an env-driven or mode-aware `base` and preserve local dev behavior.

- [ ] **Step 4: Verify with a production build**

Run: `npm install && npm run build`
Expected: `dist/index.html` references `/book-reader/` assets or relative assets

### Task 4: Make `daily-nuance` buildable under `/daily-nuance/`

**Files:**
- Modify: `apps/daily-nuance/site/docusaurus.config.js`
- Modify: `apps/daily-nuance/README.md`

- [ ] **Step 1: Write the failing expectation**

`daily-nuance` should build as a Docusaurus site rooted at `/daily-nuance/`.

- [ ] **Step 2: Verify current config targets `/`**

Run: `sed -n '1,220p' apps/daily-nuance/site/docusaurus.config.js`
Expected: `baseUrl: "/"`

- [ ] **Step 3: Implement minimal environment-aware Docusaurus config**

Production should use:
```text
url = https://kelvin11888.blog
baseUrl = /daily-nuance/
```

- [ ] **Step 4: Verify with live data + build**

Run:
```bash
uv sync
uv run novel-nuance --workspace . --date 2026-03-24
cd site && npm install && npm run build
```
Expected: site builds successfully under the subpath

### Task 5: Build the Astro portal homepage

**Files:**
- Create: `portal/*`
- Create: `portal/src/pages/index.astro`
- Create: `portal/src/layouts/*`
- Create: `portal/src/components/*`
- Create: `portal/public/*`

- [ ] **Step 1: Write the failing expectation**

The root site should render a bright geeky portal homepage with navigation and project cards.

- [ ] **Step 2: Verify no portal exists yet**

Run: `find portal -maxdepth 3 -type f`
Expected: no files

- [ ] **Step 3: Implement Astro portal**

Create a homepage with:
- unified brand header
- project cards for `Book Reader` and `Daily Nuance`
- future-facing expansion section

- [ ] **Step 4: Verify the portal builds**

Run: `npm run build:portal`
Expected: static HTML appears in `dist/`

### Task 6: Assemble all outputs into a single deployable dist

**Files:**
- Create: `scripts/build-book-reader.mjs`
- Create: `scripts/build-daily-nuance.mjs`
- Create: `scripts/build-portal.mjs`
- Create: `scripts/build-all.mjs`
- Modify: `package.json`
- Create: `vercel.json`

- [ ] **Step 1: Write the failing expectation**

`npm run build` should produce one `dist/` containing:
```text
dist/index.html
dist/book-reader/index.html
dist/daily-nuance/index.html
```

- [ ] **Step 2: Verify no orchestrated build exists**

Run: `npm run build`
Expected: command missing or fails

- [ ] **Step 3: Implement minimal orchestration scripts**

Each script should build exactly one unit and copy output into the shared `dist/`.

- [ ] **Step 4: Verify the complete build**

Run: `npm run build`
Expected: all three outputs exist and Vercel config points to `dist`

### Task 7: Final verification

**Files:**
- Verify: `apps/book-reader`
- Verify: `apps/daily-nuance`
- Verify: `portal`
- Verify: `dist`

- [ ] **Step 1: Run product-specific verification**

Run:
```bash
cd apps/book-reader && npm run build
cd apps/daily-nuance && uv run python -m unittest discover -s tests -p 'test_*.py' -v
cd apps/daily-nuance/site && npm run build
```

- [ ] **Step 2: Run root integration build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Sanity-check deployment structure**

Run:
```bash
find dist -maxdepth 2 -type f | sort | sed -n '1,120p'
```
Expected: root portal plus two mounted sub-sites

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

import httpProxy from 'http-proxy';

import {pathExists, run, spawnProcess} from './lib/fs-utils.mjs';
import {
  BOOK_READER_BASE,
  BOOK_READER_DEV_PORT,
  BOOK_READER_DIR,
  DAILY_NUANCE_BASE,
  DAILY_NUANCE_DEV_PORT,
  DAILY_NUANCE_DIR,
  LOCAL_DEV_ORIGIN,
  PORTAL_DEV_PORT,
  PORTAL_DIR,
  resolveProxyTarget,
} from './lib/site-config.mjs';

const children = [];
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
});

async function ensureInstall(cwd) {
  if (!(await pathExists(path.join(cwd, 'node_modules')))) {
    run('npm', ['ci'], {cwd});
  }
}

async function ensureDailyNuanceReady() {
  run('uv', ['sync'], {cwd: DAILY_NUANCE_DIR});
  run('uv', ['run', 'novel-nuance', '--workspace', '.', '--date', localDateString()], {
    cwd: DAILY_NUANCE_DIR,
  });
}

function localDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function register(child) {
  children.push(child);
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`Child exited with code ${code}`);
    }
  });
}

function killAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

async function writeDailyNuanceEnvFile() {
  const envPath = path.join(DAILY_NUANCE_DIR, '.env.local');
  const contents = [
    `SITE_URL=${LOCAL_DEV_ORIGIN}`,
    `BASE_URL=${DAILY_NUANCE_BASE}`,
    '',
  ].join('\n');
  await fs.writeFile(envPath, contents, 'utf8');
}

await ensureInstall(PORTAL_DIR);
await ensureInstall(BOOK_READER_DIR);
await ensureInstall(path.join(DAILY_NUANCE_DIR, 'site'));
await ensureDailyNuanceReady();
await writeDailyNuanceEnvFile();

register(
  spawnProcess('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORTAL_DEV_PORT)], {
    cwd: PORTAL_DIR,
    env: {
      BROWSER: 'none',
    },
  }),
);

register(
  spawnProcess('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(BOOK_READER_DEV_PORT)], {
    cwd: BOOK_READER_DIR,
    env: {
      BROWSER: 'none',
      VITE_BASE_PATH: BOOK_READER_BASE,
    },
  }),
);

register(
  spawnProcess('npm', ['run', 'start', '--', '--host', '127.0.0.1', '--port', String(DAILY_NUANCE_DEV_PORT), '--no-open'], {
    cwd: path.join(DAILY_NUANCE_DIR, 'site'),
    env: {
      BROWSER: 'none',
      SITE_URL: LOCAL_DEV_ORIGIN,
      BASE_URL: DAILY_NUANCE_BASE,
    },
  }),
);

const server = http.createServer((req, res) => {
  const target = resolveProxyTarget(req.url || '/');
  proxy.web(req, res, {target}, (error) => {
    res.writeHead(502, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end(`Upstream not ready: ${target}\n${error.message}`);
  });
});

server.on('upgrade', (req, socket, head) => {
  const target = resolveProxyTarget(req.url || '/');
  proxy.ws(req, socket, head, {target});
});

process.on('SIGINT', () => {
  killAll();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  killAll();
  server.close(() => process.exit(0));
});

server.listen(3000, '127.0.0.1', () => {
  console.log(`Unified dev server ready at ${LOCAL_DEV_ORIGIN}`);
  console.log(`Portal -> http://127.0.0.1:${PORTAL_DEV_PORT}/`);
  console.log(`Book Reader -> http://127.0.0.1:${BOOK_READER_DEV_PORT}${BOOK_READER_BASE}`);
  console.log(`Daily Nuance -> http://127.0.0.1:${DAILY_NUANCE_DEV_PORT}${DAILY_NUANCE_BASE}`);
});

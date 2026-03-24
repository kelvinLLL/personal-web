import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

import httpProxy from 'http-proxy';

import {pathExists, run, spawnProcess} from './lib/fs-utils.mjs';
import {
  buildDevRuntime,
  chooseAvailablePort,
  resolveProxyTargetForRuntime,
} from './lib/dev-ports.mjs';
import { shouldPrepareDailyNuanceData } from './lib/daily-nuance-dev.mjs';
import {
  BOOK_READER_BASE,
  BOOK_READER_DEV_PORT,
  BOOK_READER_DIR,
  DAILY_NUANCE_BASE,
  DAILY_NUANCE_DEV_PORT,
  DAILY_NUANCE_DIR,
  LOCAL_DEV_ROOT_PORT,
  PORTAL_DEV_PORT,
  PORTAL_DIR,
} from './lib/site-config.mjs';

const children = [];
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
});
let runtime;

async function ensureInstall(cwd) {
  if (!(await pathExists(path.join(cwd, 'node_modules')))) {
    run('npm', ['ci'], {cwd});
  }
}

async function ensureDailyNuanceReady() {
  const generatedHome = path.join(DAILY_NUANCE_DIR, 'generated', 'docs', 'home.mdx');
  const forceRefresh = process.env.DAILY_NUANCE_REFRESH === '1';
  const hasGeneratedHome = await pathExists(generatedHome);

  if (!shouldPrepareDailyNuanceData({ hasGeneratedHome, forceRefresh })) {
    console.log('Daily Nuance dev: reusing existing generated data.');
    return;
  }

  console.log('Daily Nuance dev: preparing generated data...');
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
    `SITE_URL=${runtime.rootOrigin}`,
    `BASE_URL=${DAILY_NUANCE_BASE}`,
    '',
  ].join('\n');
  await fs.writeFile(envPath, contents, 'utf8');
}

runtime = buildDevRuntime({
  rootPort: await chooseAvailablePort(LOCAL_DEV_ROOT_PORT),
  portalPort: await chooseAvailablePort(PORTAL_DEV_PORT),
  bookReaderPort: await chooseAvailablePort(BOOK_READER_DEV_PORT),
  dailyNuancePort: await chooseAvailablePort(DAILY_NUANCE_DEV_PORT),
});

await ensureInstall(PORTAL_DIR);
await ensureInstall(BOOK_READER_DIR);
await ensureInstall(path.join(DAILY_NUANCE_DIR, 'site'));
await ensureDailyNuanceReady();
await writeDailyNuanceEnvFile();

register(
  spawnProcess('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(runtime.portalPort)], {
    cwd: PORTAL_DIR,
    env: {
      BROWSER: 'none',
    },
  }),
);

register(
  spawnProcess('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(runtime.bookReaderPort)], {
    cwd: BOOK_READER_DIR,
    env: {
      BROWSER: 'none',
      VITE_BASE_PATH: BOOK_READER_BASE,
    },
  }),
);

register(
  spawnProcess('npm', ['run', 'start', '--', '--host', '127.0.0.1', '--port', String(runtime.dailyNuancePort), '--no-open'], {
    cwd: path.join(DAILY_NUANCE_DIR, 'site'),
    env: {
      BROWSER: 'none',
      SITE_URL: runtime.rootOrigin,
      BASE_URL: DAILY_NUANCE_BASE,
    },
  }),
);

const server = http.createServer((req, res) => {
  const target = resolveProxyTargetForRuntime(req.url || '/', runtime);
  proxy.web(req, res, {target}, (error) => {
    res.writeHead(502, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end(`Upstream not ready: ${target}\n${error.message}`);
  });
});

server.on('upgrade', (req, socket, head) => {
  const target = resolveProxyTargetForRuntime(req.url || '/', runtime);
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

server.listen(runtime.rootPort, '127.0.0.1', () => {
  console.log(`Unified dev server ready at ${runtime.rootOrigin}`);
  console.log('Open only the unified root URL above; internal child ports are printed for debugging only.');
  console.log(`Portal -> ${runtime.portalTarget}/`);
  console.log(`Book Reader -> ${runtime.bookReaderTarget}${BOOK_READER_BASE}`);
  console.log(`Daily Nuance -> ${runtime.dailyNuanceTarget}${DAILY_NUANCE_BASE}`);
});

import http from 'node:http';
import path from 'node:path';

import httpProxy from 'http-proxy';

import {pathExists, run, spawnProcess} from './lib/fs-utils.mjs';
import {
  buildDevRuntime,
  chooseAvailablePort,
  resolveProxyTargetForRuntime,
} from './lib/dev-ports.mjs';
import {
  BOOK_READER_BASE,
  BOOK_READER_DEV_PORT,
  BOOK_READER_DIR,
  LOCAL_DEV_ROOT_PORT,
  FRONTEND_DEV_PORT,
  FRONTEND_DIR,
  BACKEND_DEV_PORT,
  BACKEND_DIR,
  ROOT_DIR,
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

const reserved = new Set();

runtime = buildDevRuntime({
  rootPort: await chooseAvailablePort(LOCAL_DEV_ROOT_PORT, undefined, reserved),
  bookReaderPort: await chooseAvailablePort(BOOK_READER_DEV_PORT, undefined, reserved),
  frontendPort: await chooseAvailablePort(FRONTEND_DEV_PORT, undefined, reserved),
  backendPort: await chooseAvailablePort(BACKEND_DEV_PORT, undefined, reserved),
});

await ensureInstall(BOOK_READER_DIR);
await ensureInstall(FRONTEND_DIR);
run('node', ['scripts/prepare-daily-nuance-data.mjs'], {cwd: ROOT_DIR});

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
  spawnProcess('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(runtime.frontendPort)], {
    cwd: FRONTEND_DIR,
    env: {
      BROWSER: 'none',
      VITE_BACKEND_URL: runtime.backendTarget,
      VITE_BOOK_READER_URL: runtime.bookReaderTarget,
    },
  }),
);

register(
  spawnProcess('uv', ['run', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', String(runtime.backendPort), '--reload'], {
    cwd: BACKEND_DIR,
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
  console.log(`Frontend -> ${runtime.frontendTarget}/`);
  console.log(`Backend -> ${runtime.backendTarget}/api/`);
  console.log(`Book Reader -> ${runtime.bookReaderTarget}${BOOK_READER_BASE}`);
});

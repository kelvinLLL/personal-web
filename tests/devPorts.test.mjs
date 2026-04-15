import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chooseAvailablePort,
  buildDevRuntime,
  buildFrontendDevProxyConfig,
  resolveProxyTargetForRuntime,
} from '../scripts/lib/dev-ports.mjs';

test('chooseAvailablePort returns the preferred port when it is free', async () => {
  const port = await chooseAvailablePort(3000, async (candidate) => candidate === 3000);
  assert.equal(port, 3000);
});

test('chooseAvailablePort scans upward until it finds a free port', async () => {
  const occupied = new Set([3000, 3001, 3002]);
  const port = await chooseAvailablePort(3000, async (candidate) => !occupied.has(candidate));
  assert.equal(port, 3003);
});

test('chooseAvailablePort skips ports already reserved by siblings', async () => {
  const reserved = new Set();
  // All ports are "free" from the OS perspective
  const alwaysFree = async () => true;
  const p1 = await chooseAvailablePort(4000, alwaysFree, reserved);
  const p2 = await chooseAvailablePort(4000, alwaysFree, reserved);
  const p3 = await chooseAvailablePort(4000, alwaysFree, reserved);
  assert.equal(p1, 4000);
  assert.equal(p2, 4001);
  assert.equal(p3, 4002);
});

test('buildDevRuntime derives a unified root origin from resolved ports', () => {
  const runtime = buildDevRuntime({
    rootPort: 3010,
    bookReaderPort: 4312,
    frontendPort: 5173,
    backendPort: 8000,
  });

  assert.equal(runtime.rootOrigin, 'http://127.0.0.1:3010');
  assert.equal(runtime.bookReaderTarget, 'http://127.0.0.1:4312');
  assert.equal(runtime.frontendTarget, 'http://127.0.0.1:5173');
  assert.equal(runtime.backendTarget, 'http://127.0.0.1:8000');
});

test('resolveProxyTargetForRuntime routes by path prefix', () => {
  const runtime = buildDevRuntime({
    rootPort: 3010,
    bookReaderPort: 4312,
    frontendPort: 5173,
    backendPort: 8000,
  });

  assert.equal(resolveProxyTargetForRuntime('/', runtime), 'http://127.0.0.1:5173');
  assert.equal(resolveProxyTargetForRuntime('/book-reader-legacy/', runtime), 'http://127.0.0.1:4312');
  assert.equal(resolveProxyTargetForRuntime('/book-reader/', runtime), 'http://127.0.0.1:5173');
  assert.equal(resolveProxyTargetForRuntime('/daily-nuance/', runtime), 'http://127.0.0.1:5173');
  assert.equal(resolveProxyTargetForRuntime('/api/health', runtime), 'http://127.0.0.1:8000');
  assert.equal(resolveProxyTargetForRuntime('/api/models', runtime), 'http://127.0.0.1:8000');
});

test('buildFrontendDevProxyConfig includes backend and legacy reader routes for frontend dev', () => {
  const proxy = buildFrontendDevProxyConfig({
    VITE_BACKEND_URL: 'http://127.0.0.1:8800',
    VITE_BOOK_READER_URL: 'http://127.0.0.1:9900',
  });

  assert.equal(proxy['/api'].target, 'http://127.0.0.1:8800');
  assert.equal(proxy['/book-reader-legacy/'].target, 'http://127.0.0.1:9900');
  assert.equal(proxy['/book-reader-legacy/'].changeOrigin, true);
  assert.equal('/daily-nuance/' in proxy, false);
});

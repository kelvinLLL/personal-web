import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chooseAvailablePort,
  buildDevRuntime,
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

test('buildDevRuntime derives a unified root origin from resolved ports', () => {
  const runtime = buildDevRuntime({
    rootPort: 3010,
    portalPort: 4311,
    bookReaderPort: 4312,
    dailyNuancePort: 4313,
  });

  assert.equal(runtime.rootOrigin, 'http://127.0.0.1:3010');
  assert.equal(runtime.portalTarget, 'http://127.0.0.1:4311');
  assert.equal(runtime.bookReaderTarget, 'http://127.0.0.1:4312');
  assert.equal(runtime.dailyNuanceTarget, 'http://127.0.0.1:4313');
});

test('resolveProxyTargetForRuntime routes by path prefix', () => {
  const runtime = buildDevRuntime({
    rootPort: 3010,
    portalPort: 4311,
    bookReaderPort: 4312,
    dailyNuancePort: 4313,
  });

  assert.equal(resolveProxyTargetForRuntime('/', runtime), 'http://127.0.0.1:4311');
  assert.equal(resolveProxyTargetForRuntime('/book-reader/', runtime), 'http://127.0.0.1:4312');
  assert.equal(resolveProxyTargetForRuntime('/daily-nuance/', runtime), 'http://127.0.0.1:4313');
});

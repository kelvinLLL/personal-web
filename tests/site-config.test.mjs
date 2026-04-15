import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SITE_DOMAIN,
  BOOK_READER_BASE,
  LOCAL_DEV_ROOT_PORT,
  BOOK_READER_DEV_PORT,
  buildBookReaderEnv,
  buildFrontendEnv,
  buildOutputLayout,
} from '../scripts/lib/site-config.mjs';

test('site constants expose the expected production paths', () => {
  assert.equal(SITE_DOMAIN, 'https://kelvin11888.blog');
  assert.equal(BOOK_READER_BASE, '/book-reader-legacy/');
});

test('book-reader build env uses the subpath base', () => {
  const env = buildBookReaderEnv();
  assert.equal(env.VITE_BASE_PATH, '/book-reader-legacy/');
});

test('frontend production build env clears local-only backend origins', () => {
  const env = buildFrontendEnv();
  assert.equal(env.VITE_BACKEND_URL, '');
});

test('local dev origin uses the unified root port', () => {
  assert.equal(LOCAL_DEV_ROOT_PORT, 3000);
  assert.equal(BOOK_READER_DEV_PORT, 4322);
});

test('root output layout mounts frontend and the legacy reader under dist', () => {
  assert.deepEqual(buildOutputLayout(), {
    frontend: 'dist',
    bookReader: 'dist/book-reader-legacy',
  });
});

test('vercel.json rewrites preserve only legacy reader passthrough plus SPA fallback', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const { ROOT_DIR } = await import('../scripts/lib/site-config.mjs');

  const vercelConfig = JSON.parse(
    await fs.readFile(path.join(ROOT_DIR, 'vercel.json'), 'utf8'),
  );

  const rewrites = vercelConfig.rewrites;
  assert.ok(Array.isArray(rewrites), 'vercel.json must have rewrites');
  assert.ok(rewrites.length >= 2, 'should have legacy passthrough + SPA fallback rules');

  const bookReaderRule = rewrites.find((r) => r.source.includes('book-reader-legacy'));
  assert.ok(bookReaderRule, 'book-reader-legacy passthrough rule exists');
  assert.equal(bookReaderRule.destination, '/book-reader-legacy/:path*');
  assert.equal(
    rewrites.some((rule) => rule.source.includes('daily-nuance')),
    false,
    'daily-nuance passthrough should not exist',
  );

  const fallback = rewrites[rewrites.length - 1];
  assert.equal(fallback.destination, '/index.html', 'last rewrite must be SPA fallback');
});

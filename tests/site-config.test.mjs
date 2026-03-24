import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SITE_DOMAIN,
  BOOK_READER_BASE,
  DAILY_NUANCE_BASE,
  LOCAL_DEV_ROOT_PORT,
  PORTAL_DEV_PORT,
  BOOK_READER_DEV_PORT,
  DAILY_NUANCE_DEV_PORT,
  buildBookReaderEnv,
  buildDailyNuanceEnv,
  buildOutputLayout,
} from '../scripts/lib/site-config.mjs';

test('site constants expose the expected production paths', () => {
  assert.equal(SITE_DOMAIN, 'https://kelvin11888.blog');
  assert.equal(BOOK_READER_BASE, '/book-reader/');
  assert.equal(DAILY_NUANCE_BASE, '/daily-nuance/');
});

test('book-reader build env uses the subpath base', () => {
  const env = buildBookReaderEnv();
  assert.equal(env.VITE_BASE_PATH, '/book-reader/');
});

test('daily-nuance build env targets the custom domain and subpath', () => {
  const env = buildDailyNuanceEnv();
  assert.equal(env.SITE_URL, 'https://kelvin11888.blog');
  assert.equal(env.BASE_URL, '/daily-nuance/');
});

test('local dev origin uses the unified root port', () => {
  assert.equal(LOCAL_DEV_ROOT_PORT, 3000);
  assert.equal(PORTAL_DEV_PORT, 4321);
  assert.equal(BOOK_READER_DEV_PORT, 4322);
  assert.equal(DAILY_NUANCE_DEV_PORT, 4323);
});

test('root output layout mounts both child apps under dist', () => {
  assert.deepEqual(buildOutputLayout(), {
    portal: 'dist',
    bookReader: 'dist/book-reader',
    dailyNuance: 'dist/daily-nuance',
  });
});

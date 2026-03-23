import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const APPS_DIR = path.join(ROOT_DIR, 'apps');
export const PORTAL_DIR = path.join(ROOT_DIR, 'portal');
export const DIST_DIR = path.join(ROOT_DIR, 'dist');
export const BOOK_READER_DIR = path.join(APPS_DIR, 'book-reader');
export const DAILY_NUANCE_DIR = path.join(APPS_DIR, 'daily-nuance');

export const SITE_DOMAIN = 'https://kelvin11888.blog';
export const BOOK_READER_BASE = '/book-reader/';
export const DAILY_NUANCE_BASE = '/daily-nuance/';
export const LOCAL_DEV_ORIGIN = 'http://127.0.0.1:3000';
export const PORTAL_DEV_PORT = 4321;
export const BOOK_READER_DEV_PORT = 4322;
export const DAILY_NUANCE_DEV_PORT = 4323;

export function buildBookReaderEnv() {
  return {
    VITE_BASE_PATH: BOOK_READER_BASE,
  };
}

export function buildDailyNuanceEnv() {
  return {
    SITE_URL: SITE_DOMAIN,
    BASE_URL: DAILY_NUANCE_BASE,
  };
}

export function buildOutputLayout() {
  return {
    portal: 'dist',
    bookReader: 'dist/book-reader',
    dailyNuance: 'dist/daily-nuance',
  };
}

export function resolveProxyTarget(requestPath = '/') {
  if (requestPath.startsWith(BOOK_READER_BASE)) {
    return `http://127.0.0.1:${BOOK_READER_DEV_PORT}`;
  }
  if (requestPath.startsWith(DAILY_NUANCE_BASE)) {
    return `http://127.0.0.1:${DAILY_NUANCE_DEV_PORT}`;
  }
  return `http://127.0.0.1:${PORTAL_DEV_PORT}`;
}

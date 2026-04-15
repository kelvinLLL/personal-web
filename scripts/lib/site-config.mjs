import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const APPS_DIR = path.join(ROOT_DIR, 'apps');
export const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
export const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
export const DIST_DIR = path.join(ROOT_DIR, 'dist');
export const BOOK_READER_DIR = path.join(APPS_DIR, 'book-reader');
export const DAILY_NUANCE_DIR = path.join(APPS_DIR, 'daily-nuance');

export const SITE_DOMAIN = 'https://kelvin11888.blog';
export const BOOK_READER_BASE = '/book-reader-legacy/';
export const DAILY_NUANCE_BASE = '/daily-nuance/';
export const LOCAL_DEV_ROOT_PORT = 3000;
export const FRONTEND_DEV_PORT = 5173;
export const BACKEND_DEV_PORT = 8000;
export const BOOK_READER_DEV_PORT = 4322;

export function buildBookReaderEnv() {
  return {
    VITE_BASE_PATH: BOOK_READER_BASE,
  };
}

export function buildFrontendEnv() {
  return {
    VITE_BACKEND_URL: '',
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
    frontend: 'dist',
    bookReader: 'dist/book-reader-legacy',
  };
}

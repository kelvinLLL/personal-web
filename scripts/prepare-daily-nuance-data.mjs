import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {ensureDir, pathExists, run} from './lib/fs-utils.mjs';
import {DAILY_NUANCE_DIR, ROOT_DIR} from './lib/site-config.mjs';

export function shouldPrepareDailyNuanceData({hasGeneratedSnapshot, forceRefresh}) {
  return forceRefresh || !hasGeneratedSnapshot;
}

export function resolveDailyNuanceSnapshotPaths(rootDir = ROOT_DIR) {
  return {
    sourcePath: path.join(rootDir, 'apps', 'daily-nuance', 'generated', 'api', 'overview', 'latest.json'),
    targetPath: path.join(rootDir, 'frontend', 'public', 'data', 'daily-nuance', 'latest.json'),
  };
}

export function localDateString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function prepareDailyNuanceData({
  forceRefresh = process.env.DAILY_NUANCE_REFRESH === '1',
  rootDir = ROOT_DIR,
} = {}) {
  const {sourcePath, targetPath} = resolveDailyNuanceSnapshotPaths(rootDir);
  const hasGeneratedSnapshot = await pathExists(sourcePath);

  if (shouldPrepareDailyNuanceData({hasGeneratedSnapshot, forceRefresh})) {
    console.log('Preparing Daily Nuance snapshot via uv pipeline...');
    run('uv', ['sync', '--python', '3.12'], {cwd: DAILY_NUANCE_DIR});
    run('uv', ['run', 'novel-nuance', '--workspace', '.', '--date', localDateString()], {
      cwd: DAILY_NUANCE_DIR,
    });
  } else {
    console.log('Reusing existing Daily Nuance snapshot.');
  }

  if (!(await pathExists(sourcePath))) {
    throw new Error(`Daily Nuance snapshot missing after prepare: ${sourcePath}`);
  }

  await ensureDir(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
  console.log(`Daily Nuance snapshot copied to ${path.relative(process.cwd(), targetPath)}`);
}

async function main() {
  await prepareDailyNuanceData();
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  await main();
}

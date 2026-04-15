import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {ensureDir} from './lib/fs-utils.mjs';
import {ROOT_DIR} from './lib/site-config.mjs';

export function resolveIdeasSnapshotPaths(rootDir = ROOT_DIR) {
  return {
    sourcePath: path.join(rootDir, 'backend', 'data', 'ideas.json'),
    targetPath: path.join(rootDir, 'frontend', 'public', 'data', 'ideas', 'latest.json'),
  };
}

export async function prepareIdeasData({rootDir = ROOT_DIR} = {}) {
  const {sourcePath, targetPath} = resolveIdeasSnapshotPaths(rootDir);

  await ensureDir(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
  console.log(`Ideas snapshot copied to ${path.relative(process.cwd(), targetPath)}`);
}

async function main() {
  await prepareIdeasData();
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  await main();
}

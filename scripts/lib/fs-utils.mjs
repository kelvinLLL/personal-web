import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';

export async function ensureEmptyDir(dir) {
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, {recursive: true});
}

export async function copyDir(source, target) {
  await ensureDir(target);
  const entries = await fs.readdir(source, {withFileTypes: true});
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else if (entry.isSymbolicLink()) {
      const link = await fs.readlink(sourcePath);
      await fs.symlink(link, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

export function run(command, args, options = {}) {
  const {cwd, env, stdio = 'inherit'} = options;
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdio,
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

export function spawnProcess(command, args, options = {}) {
  const {cwd, env, stdio = 'inherit'} = options;
  return spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdio,
    shell: false,
  });
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

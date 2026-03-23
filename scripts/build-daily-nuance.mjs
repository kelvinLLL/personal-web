import path from 'node:path';

import {copyDir, ensureDir, ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {DAILY_NUANCE_DIR, DIST_DIR, buildDailyNuanceEnv} from './lib/site-config.mjs';

const outputDir = path.join(DIST_DIR, 'daily-nuance');
const siteDir = path.join(DAILY_NUANCE_DIR, 'site');
const now = new Date();
const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const buildDate = process.env.BUILD_DATE || localDate;

await ensureDir(DIST_DIR);
await ensureEmptyDir(outputDir);
run('uv', ['sync'], {cwd: DAILY_NUANCE_DIR});
run('uv', ['run', 'novel-nuance', '--workspace', '.', '--date', buildDate], {
  cwd: DAILY_NUANCE_DIR,
});
run('npm', ['ci'], {cwd: siteDir});
run('npm', ['run', 'build'], {
  cwd: siteDir,
  env: buildDailyNuanceEnv(),
});
await copyDir(path.join(siteDir, 'build'), outputDir);

console.log(`Daily Nuance built into ${path.relative(process.cwd(), outputDir)}`);

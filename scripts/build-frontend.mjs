import path from 'node:path';

import {copyDir, ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {DIST_DIR, FRONTEND_DIR, buildFrontendEnv} from './lib/site-config.mjs';

await ensureEmptyDir(DIST_DIR);
run('npm', ['ci'], {cwd: FRONTEND_DIR});
run('npm', ['run', 'build'], {
  cwd: FRONTEND_DIR,
  env: buildFrontendEnv(),
});
await copyDir(path.join(FRONTEND_DIR, 'dist'), DIST_DIR);

console.log(`Frontend built into ${path.relative(process.cwd(), DIST_DIR)}`);

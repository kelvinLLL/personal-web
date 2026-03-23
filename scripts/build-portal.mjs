import path from 'node:path';

import {ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {DIST_DIR, PORTAL_DIR} from './lib/site-config.mjs';

await ensureEmptyDir(DIST_DIR);
run('npm', ['ci'], {cwd: PORTAL_DIR});
run('npm', ['run', 'build'], {cwd: PORTAL_DIR});

console.log(`Portal built into ${path.relative(process.cwd(), DIST_DIR)}`);

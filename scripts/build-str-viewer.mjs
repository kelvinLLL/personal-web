import path from 'node:path';

import {copyDir, ensureDir, ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {DIST_DIR, STR_VIEWER_DIR, buildStrViewerEnv} from './lib/site-config.mjs';

const strViewerOutputDir = path.join(DIST_DIR, 'str-viewer');

await ensureDir(DIST_DIR);
await ensureEmptyDir(strViewerOutputDir);
run('npm', ['ci'], {cwd: STR_VIEWER_DIR});
run('npm', ['run', 'build'], {
  cwd: STR_VIEWER_DIR,
  env: buildStrViewerEnv(),
});
await copyDir(path.join(STR_VIEWER_DIR, 'dist'), strViewerOutputDir);

console.log(`String Viewer build written to ${path.relative(process.cwd(), strViewerOutputDir)}`);

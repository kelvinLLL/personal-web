import {run} from './lib/fs-utils.mjs';
import {DAILY_NUANCE_DIR} from './lib/site-config.mjs';

const now = new Date();
const buildDate = process.env.BUILD_DATE || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

run('uv', ['sync'], {cwd: DAILY_NUANCE_DIR});
run('uv', ['run', 'novel-nuance', '--workspace', '.', '--date', buildDate], {
  cwd: DAILY_NUANCE_DIR,
});

console.log(`Daily Nuance data refreshed for ${buildDate}`);


import {run} from './lib/fs-utils.mjs';
import {ROOT_DIR} from './lib/site-config.mjs';

// Prepare static Daily Nuance snapshot before bundling the unified frontend.
run('node', ['scripts/prepare-daily-nuance-data.mjs'], {cwd: ROOT_DIR});
run('node', ['scripts/prepare-ideas-data.mjs'], {cwd: ROOT_DIR});
run('node', ['scripts/build-frontend.mjs'], {cwd: ROOT_DIR});
run('node', ['scripts/build-book-reader.mjs'], {cwd: ROOT_DIR});

console.log('Unified frontend and legacy reader built successfully.');

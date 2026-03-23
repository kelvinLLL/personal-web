import {run} from './lib/fs-utils.mjs';
import {ROOT_DIR} from './lib/site-config.mjs';

run('node', ['scripts/build-portal.mjs'], {cwd: ROOT_DIR});
run('node', ['scripts/build-book-reader.mjs'], {cwd: ROOT_DIR});
run('node', ['scripts/build-daily-nuance.mjs'], {cwd: ROOT_DIR});

console.log('All site sections built successfully.');


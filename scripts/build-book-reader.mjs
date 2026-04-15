import path from 'node:path';

import {copyDir, ensureDir, ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {BOOK_READER_DIR, DIST_DIR, buildBookReaderEnv} from './lib/site-config.mjs';

const legacyOutputDir = path.join(DIST_DIR, 'book-reader-legacy');

await ensureDir(DIST_DIR);
await ensureEmptyDir(legacyOutputDir);
run('npm', ['ci'], {cwd: BOOK_READER_DIR});
run('npm', ['run', 'build'], {
  cwd: BOOK_READER_DIR,
  env: buildBookReaderEnv(),
});
await copyDir(path.join(BOOK_READER_DIR, 'dist'), legacyOutputDir);

console.log(`Book Reader legacy build written to ${path.relative(process.cwd(), legacyOutputDir)}`);

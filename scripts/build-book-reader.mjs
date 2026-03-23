import path from 'node:path';

import {copyDir, ensureDir, ensureEmptyDir, run} from './lib/fs-utils.mjs';
import {BOOK_READER_DIR, DIST_DIR, buildBookReaderEnv} from './lib/site-config.mjs';

const outputDir = path.join(DIST_DIR, 'book-reader');

await ensureDir(DIST_DIR);
await ensureEmptyDir(outputDir);
run('npm', ['ci'], {cwd: BOOK_READER_DIR});
run('npm', ['run', 'build'], {
  cwd: BOOK_READER_DIR,
  env: buildBookReaderEnv(),
});
await copyDir(path.join(BOOK_READER_DIR, 'dist'), outputDir);

console.log(`Book Reader built into ${path.relative(process.cwd(), outputDir)}`);

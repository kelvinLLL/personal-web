import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  prepareIdeasData,
  resolveIdeasSnapshotPaths,
} from '../scripts/prepare-ideas-data.mjs';

test('ideas prepare resolves source and target snapshot paths', async () => {
  const {ROOT_DIR} = await import('../scripts/lib/site-config.mjs');
  const paths = resolveIdeasSnapshotPaths(ROOT_DIR);

  assert.equal(
    paths.sourcePath.endsWith('backend/data/ideas.json'),
    true,
  );
  assert.equal(
    paths.targetPath.endsWith('frontend/public/data/ideas/latest.json'),
    true,
  );
});

test('ideas prepare reuses the committed frontend snapshot when backend working data is absent', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepare-ideas-'));
  const targetPath = path.join(rootDir, 'frontend', 'public', 'data', 'ideas', 'latest.json');
  const targetContents = '{"updated_at":"2026-04-15T00:00:00Z","ideas":[{"id":"idea-1"}]}';

  await fs.mkdir(path.dirname(targetPath), {recursive: true});
  await fs.writeFile(targetPath, targetContents, 'utf8');

  await prepareIdeasData({rootDir});

  assert.equal(await fs.readFile(targetPath, 'utf8'), targetContents);
});

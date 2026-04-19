import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  prepareDailyNuanceData,
  resolveDailyNuanceSnapshotPaths,
} from '../scripts/prepare-daily-nuance-data.mjs';

test('daily nuance prepare resolves source and target snapshot paths', async () => {
  const {ROOT_DIR} = await import('../scripts/lib/site-config.mjs');
  const paths = resolveDailyNuanceSnapshotPaths(ROOT_DIR);

  assert.equal(
    paths.sourcePath.endsWith('apps/daily-nuance/generated/api/overview/latest.json'),
    true,
  );
  assert.equal(
    paths.targetPath.endsWith('frontend/public/data/daily-nuance/latest.json'),
    true,
  );
});

test('daily nuance prepare reuses the committed frontend snapshot when the generated snapshot is absent', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepare-daily-nuance-'));
  const targetPath = path.join(rootDir, 'frontend', 'public', 'data', 'daily-nuance', 'latest.json');
  const targetContents = '{"generated_at":"2026-04-19T00:00:00Z","items":[{"id":"signal-1"}]}';

  await fs.mkdir(path.dirname(targetPath), {recursive: true});
  await fs.writeFile(targetPath, targetContents, 'utf8');

  await prepareDailyNuanceData({rootDir});

  assert.equal(await fs.readFile(targetPath, 'utf8'), targetContents);
});

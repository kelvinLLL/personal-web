import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveDailyNuanceSnapshotPaths,
  shouldPrepareDailyNuanceData,
} from '../scripts/prepare-daily-nuance-data.mjs';

test('daily-nuance prepare can skip refresh when generated snapshot already exists', () => {
  const shouldPrepare = shouldPrepareDailyNuanceData({
    hasGeneratedSnapshot: true,
    forceRefresh: false,
  });

  assert.equal(shouldPrepare, false);
});

test('daily-nuance prepare refreshes when forced or when generated snapshot is missing', () => {
  assert.equal(
    shouldPrepareDailyNuanceData({hasGeneratedSnapshot: false, forceRefresh: false}),
    true,
  );
  assert.equal(
    shouldPrepareDailyNuanceData({hasGeneratedSnapshot: true, forceRefresh: true}),
    true,
  );
});

test('daily-nuance prepare resolves source and target snapshot paths', async () => {
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

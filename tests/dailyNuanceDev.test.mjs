import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldPrepareDailyNuanceData } from '../scripts/lib/daily-nuance-dev.mjs';

test('daily-nuance dev can skip refresh when generated docs already exist', () => {
  const shouldPrepare = shouldPrepareDailyNuanceData({
    hasGeneratedHome: true,
    forceRefresh: false,
  });

  assert.equal(shouldPrepare, false);
});

test('daily-nuance dev refreshes when forced or when generated docs are missing', () => {
  assert.equal(
    shouldPrepareDailyNuanceData({ hasGeneratedHome: false, forceRefresh: false }),
    true,
  );
  assert.equal(
    shouldPrepareDailyNuanceData({ hasGeneratedHome: true, forceRefresh: true }),
    true,
  );
});

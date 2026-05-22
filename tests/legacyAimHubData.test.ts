import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGACY_CHALLENGE_GROUPS, LEGACY_CLASSIC_MODES, LEGACY_FPS_MODES } from '../src/features/config/legacyAimHubData.ts';

test('legacy aim hub data matches the original start page structure', () => {
  assert.equal(LEGACY_CLASSIC_MODES.length, 6);
  assert.equal(LEGACY_FPS_MODES.length, 5);
  assert.equal(LEGACY_CHALLENGE_GROUPS.length, 3);
  assert.deepEqual(LEGACY_CHALLENGE_GROUPS.map((group) => group.levels.length), [4, 4, 4]);
});


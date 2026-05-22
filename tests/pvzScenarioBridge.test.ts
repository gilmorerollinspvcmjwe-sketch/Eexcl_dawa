import test from 'node:test';
import assert from 'node:assert/strict';
import { createPvZBoardState } from '../src/features/pvz/pvzBoardState.ts';
import {
  cachePvZContext,
  emitPvZScenarioSelection,
  getCachedPvZContext,
  getLatestPvZScenarioSelection,
} from '../src/components/pvz/pvzScenarioBridge.ts';

test('caching PvZ context does not overwrite the latest explicit scenario selection', () => {
  const cachedState = createPvZBoardState({ scenarioId: '1-01' });
  cachePvZContext(cachedState);

  emitPvZScenarioSelection('lab-night-blackout');
  cachePvZContext(cachedState);

  assert.equal(getCachedPvZContext()?.scenarioId, '1-01');
  assert.equal(getLatestPvZScenarioSelection(), 'lab-night-blackout');
});

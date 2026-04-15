import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceGoldMinerToLevel,
  createGoldMinerBoardState,
  getGoldMinerItemById,
  launchGoldMinerHook,
  pauseGoldMiner,
  resumeGoldMiner,
  tickGoldMinerBoardState,
  useGoldMinerDynamite,
} from '../src/features/gold_miner/goldMinerBoardState.ts';
import { createEndlessGoldMinerLevel, getGoldMinerLevel } from '../src/features/gold_miner/goldMinerLevelCatalog.ts';

test('launchGoldMinerHook only starts from swinging state', () => {
  const initial = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 7 });
  const launched = launchGoldMinerHook(initial);

  assert.equal(initial.status, 'swinging');
  assert.equal(launched.status, 'extending');
});

test('pause and resume keep the active hook phase', () => {
  const initial = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 11 });
  const extending = {
    ...initial,
    status: 'retracting' as const,
    hook: {
      ...initial.hook,
      extendDistance: 140,
      grabbedItemId: initial.items[0]?.id ?? null,
    },
  };

  const paused = pauseGoldMiner(extending);
  const resumed = resumeGoldMiner(paused);

  assert.equal(paused.status, 'paused');
  assert.equal(resumed.status, 'retracting');
  assert.equal(resumed.hook.grabbedItemId, extending.hook.grabbedItemId);
});

test('using dynamite destroys the grabbed target and spends one bundle', () => {
  const initial = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 13 });
  const grabbedItemId = initial.items[0]?.id;
  assert.ok(grabbedItemId);

  const retracting = {
    ...initial,
    status: 'retracting' as const,
    dynamiteCount: 2,
    hook: {
      ...initial.hook,
      extendDistance: 120,
      grabbedItemId,
      retractSpeed: 100,
    },
  };

  const afterExplosion = useGoldMinerDynamite(retracting);

  assert.equal(afterExplosion.dynamiteCount, 1);
  assert.equal(afterExplosion.hook.grabbedItemId, null);
  assert.deepEqual(afterExplosion.destroyedItemIds, [grabbedItemId]);
  assert.equal(getGoldMinerItemById(afterExplosion, grabbedItemId)?.isCollected, true);
});

test('round ends in game over when time expires without meeting target', () => {
  const initial = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 17 });
  const expired = {
    ...initial,
    timeRemainingMs: 0,
    score: 100,
    targetScore: 900,
    hook: { ...initial.hook, extendDistance: 0, grabbedItemId: null },
  };

  const resolved = tickGoldMinerBoardState(expired, 16);

  assert.equal(resolved.status, 'game_over');
});

test('advanceGoldMinerToLevel carries banked score into the next level', () => {
  const initial = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 19, totalBank: 500 });
  const finished = { ...initial, score: 1600 };

  const next = advanceGoldMinerToLevel(finished, createEndlessGoldMinerLevel(2));

  assert.equal(next.mode, 'endless');
  assert.equal(next.levelId, 2);
  assert.equal(next.totalBank, 2100);
  assert.equal(next.score, 0);
});

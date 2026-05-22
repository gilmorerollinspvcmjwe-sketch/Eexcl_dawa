import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultStorage,
  recordRunResult,
  getHubSummary,
  getLevelRecord,
  getPracticeRecord,
  recordPracticeResult,
} from '../src/features/pacman/pacmanStorage.ts';

test('tutorial clear updates hub best clear time and level best time', () => {
  const storage = createDefaultStorage();
  const updated = recordRunResult(
    storage,
    'tutorial',
    1,
    {
      score: 4200,
      level: 1,
      ghostsEaten: 2,
      fruitsCollected: 1,
      clearTimeMs: 55000,
      pelletsCollected: 244,
      isNewBestScore: true,
      isNewHighestLevel: true,
    },
    55000,
    2,
  );

  const summary = getHubSummary(updated);
  const levelRecord = getLevelRecord(updated, 'tutorial', 1);

  assert.equal(summary.bestClearTime, '55秒');
  assert.equal(levelRecord?.bestClearTimeMs, 55000);
});

test('replaying an already cleared level does not inflate pack completion totals', () => {
  const storage = createDefaultStorage();
  const first = recordRunResult(
    storage,
    'arcade',
    1,
    {
      score: 6000,
      level: 1,
      ghostsEaten: 3,
      fruitsCollected: 1,
      clearTimeMs: 65000,
      pelletsCollected: 244,
      isNewBestScore: true,
      isNewHighestLevel: true,
    },
    65000,
    3,
  );
  const second = recordRunResult(
    first,
    'arcade',
    1,
    {
      score: 6200,
      level: 1,
      ghostsEaten: 4,
      fruitsCollected: 2,
      clearTimeMs: 60000,
      pelletsCollected: 244,
      isNewBestScore: true,
      isNewHighestLevel: false,
    },
    60000,
    2,
  );

  assert.equal(second.packProgress.arcade.totalCompleted, 1);
  assert.equal(second.packProgress.arcade.totalAttempts, 2);
});

test('practice results are stored separately from formal pack progress and keep the best clear', () => {
  const storage = createDefaultStorage();
  const first = recordPracticeResult(
    storage,
    'ghost_escape',
    {
      score: 18000,
      level: 8,
      ghostsEaten: 1,
      fruitsCollected: 0,
      clearTimeMs: 42000,
      pelletsCollected: 92,
      isNewBestScore: true,
      isNewHighestLevel: false,
    },
    true,
  );
  const second = recordPracticeResult(
    first,
    'ghost_escape',
    {
      score: 12000,
      level: 8,
      ghostsEaten: 0,
      fruitsCollected: 0,
      clearTimeMs: 51000,
      pelletsCollected: 70,
      isNewBestScore: false,
      isNewHighestLevel: false,
    },
    false,
  );

  const record = getPracticeRecord(second, 'ghost_escape');

  assert.equal(record?.attempts, 2);
  assert.equal(record?.completions, 1);
  assert.equal(record?.bestScore, 18000);
  assert.equal(record?.bestClearTimeMs, 42000);
  assert.equal(second.packProgress.tutorial.totalAttempts, 0);
});

test('mode-layer storage tracks fruit totals by type and one-life best reach', () => {
  const storage = createDefaultStorage();
  const afterFruitRush = recordRunResult(
    storage,
    'fruit_rush',
    1,
    {
      score: 9600,
      level: 1,
      ghostsEaten: 1,
      fruitsCollected: 2,
      clearTimeMs: 48000,
      pelletsCollected: 140,
      isNewBestScore: true,
      isNewHighestLevel: false,
    },
    48000,
    2,
  );
  const afterOneLife = recordRunResult(
    afterFruitRush,
    'one_life',
    2,
    {
      score: 18800,
      level: 2,
      ghostsEaten: 3,
      fruitsCollected: 1,
      clearTimeMs: 62000,
      pelletsCollected: 244,
      isNewBestScore: true,
      isNewHighestLevel: true,
    },
    62000,
    1,
  );

  const modeStorage = afterOneLife as typeof afterOneLife & {
    fruitsCollectedByType: Record<string, number>;
    modeCompletion: Record<string, { completedLevels: number; completedRuns: number }>;
    oneLifeRuns: { bestLevel: number; bestScore: number; totalAttempts: number };
  };

  assert.equal(modeStorage.fruitsCollectedByType.cherry, 2);
  assert.equal(modeStorage.modeCompletion.fruit_rush.completedRuns, 1);
  assert.equal(modeStorage.modeCompletion.one_life.completedLevels, 2);
  assert.equal(modeStorage.oneLifeRuns.bestLevel, 2);
  assert.equal(modeStorage.oneLifeRuns.bestScore, 18800);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  completeLevel,
  isLevelUnlocked,
  getLevelStatus,
  getPreviousLevelId,
  getChapterProgress,
  getPlantUnlockInfo,
  getZombieUnlockInfo,
} from '../src/features/pvz/pvzProgressStorage.ts';

const STORAGE_KEY = 'pvz-progress-v1';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

test.beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
});

test('initial progress has correct defaults', () => {
  const progress = loadProgress();
  assert.equal(progress.completedLevels.length, 0);
  assert.equal(progress.highestUnlockedLevel, '1-01');
  assert.equal(progress.totalCompleted, 0);
  assert.deepEqual(progress.unlockedPlants, ['sunflower', 'peashooter']);
  assert.deepEqual(progress.unlockedZombies, ['normal']);
});

test('completing level 1-01 unlocks 1-02', () => {
  const progress = loadProgress();
  const updated = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });

  assert.ok(updated.completedLevels.includes('1-01'));
  assert.equal(updated.highestUnlockedLevel, '1-02');
  assert.equal(updated.totalCompleted, 1);
  assert.ok(isLevelUnlocked(updated, '1-02'));
  assert.equal(getLevelStatus(updated, '1-01'), 'completed');
  assert.equal(getLevelStatus(updated, '1-02'), 'unlocked');
  assert.equal(getLevelStatus(updated, '1-03'), 'locked');
});

test('completing level 1-02 unlocks 1-03', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  const updated = completeLevel(progress, '1-02', { bestTime: 45000, usedCards: ['sunflower', 'peashooter', 'wallnut'] });

  assert.ok(updated.completedLevels.includes('1-02'));
  assert.equal(updated.highestUnlockedLevel, '1-03');
  assert.equal(updated.totalCompleted, 2);
  assert.ok(isLevelUnlocked(updated, '1-03'));
});

test('progress persists across load/save', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  saveProgress(progress);

  const reloaded = loadProgress();
  assert.ok(reloaded.completedLevels.includes('1-01'));
  assert.equal(reloaded.highestUnlockedLevel, '1-02');
  assert.equal(reloaded.totalCompleted, 1);
});

test('resetProgress clears all data', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  saveProgress(progress);

  resetProgress();
  const fresh = loadProgress();
  assert.equal(fresh.completedLevels.length, 0);
  assert.equal(fresh.highestUnlockedLevel, '1-01');
  assert.equal(fresh.totalCompleted, 0);
});

test('getPreviousLevelId returns correct previous level', () => {
  assert.equal(getPreviousLevelId('1-01'), null);
  assert.equal(getPreviousLevelId('1-02'), '1-01');
  assert.equal(getPreviousLevelId('1-10'), '1-09');
  assert.equal(getPreviousLevelId('2-01'), '1-10');
  assert.equal(getPreviousLevelId('10-10'), '10-09');
});

test('getChapterProgress returns correct counts', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  progress = completeLevel(progress, '1-02', { bestTime: 45000, usedCards: ['sunflower', 'peashooter'] });

  const chapter1 = getChapterProgress(progress, 1);
  assert.equal(chapter1.completed, 2);
  assert.equal(chapter1.total, 10);

  const chapter2 = getChapterProgress(progress, 2);
  assert.equal(chapter2.completed, 0);
  assert.equal(chapter2.total, 10);
});

test('getPlantUnlockInfo returns correct counts', () => {
  const progress = loadProgress();
  const info = getPlantUnlockInfo(progress);
  assert.ok(info.unlocked >= 2);
  assert.equal(info.total, 66);
});

test('getZombieUnlockInfo returns correct counts', () => {
  const progress = loadProgress();
  const info = getZombieUnlockInfo(progress);
  assert.ok(info.unlocked >= 1);
  assert.equal(info.total, 30);
});

test('level records store completion data', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter', 'wallnut'] });

  const record = progress.levelRecords['1-01'];
  assert.ok(record);
  assert.equal(record.levelId, '1-01');
  assert.equal(record.completed, true);
  assert.equal(record.bestTime, 30000);
  assert.deepEqual(record.usedCards, ['sunflower', 'peashooter', 'wallnut']);
  assert.ok(record.completedAt);
});

test('completing same level twice does not duplicate', () => {
  let progress = loadProgress();
  progress = completeLevel(progress, '1-01', { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  const updated = completeLevel(progress, '1-01', { bestTime: 25000, usedCards: ['sunflower', 'peashooter', 'wallnut'] });

  assert.equal(updated.completedLevels.length, 1);
  assert.equal(updated.totalCompleted, 1);
});

test('cross-chapter unlock works correctly', () => {
  let progress = loadProgress();
  for (let i = 1; i <= 10; i++) {
    const levelId = `1-${String(i).padStart(2, '0')}`;
    progress = completeLevel(progress, levelId, { bestTime: 30000, usedCards: ['sunflower', 'peashooter'] });
  }

  assert.equal(progress.highestUnlockedLevel, '2-01');
  assert.ok(isLevelUnlocked(progress, '2-01'));
  assert.equal(getLevelStatus(progress, '2-01'), 'unlocked');
  assert.equal(getLevelStatus(progress, '2-02'), 'locked');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import type { FantasyLaneBattleResult } from '../src/features/fantasy_lane/fantasyLaneTypes.ts';
import {
  getFantasyLaneChapterProgress,
  getFantasyLaneLevelStatus,
  getFantasyLaneProgressSummary,
  isFantasyLaneLevelUnlocked,
  loadFantasyLaneProgress,
  recordFantasyLaneLevelResult,
  recordFantasyLaneLevelStart,
  resetFantasyLaneProgress,
} from '../src/features/fantasy_lane/fantasyLaneProgressStorage.ts';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const WIN_RESULT: FantasyLaneBattleResult = {
  title: '战线推进成功',
  stars: 3,
  score: 9800,
  summary: '推进成功',
  tips: [],
};

test.beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  resetFantasyLaneProgress();
});

test('initial fantasy lane progress starts at chapter one with no completed levels', () => {
  const progress = loadFantasyLaneProgress();
  const summary = getFantasyLaneProgressSummary(progress);

  assert.deepEqual(progress.completedLevels, []);
  assert.equal(progress.highestUnlockedLevelId, '1-1');
  assert.equal(progress.highestChapterId, 'chapter-1');
  assert.equal(progress.lastPlayedLevelId, '1-1');
  assert.equal(summary.hasStarted, false);
  assert.equal(summary.completedLevels, 0);
  assert.equal(summary.totalLevels, 30);
});

test('recordFantasyLaneLevelStart tracks attempts and last played level', () => {
  const progress = recordFantasyLaneLevelStart('1-1');
  const summary = getFantasyLaneProgressSummary(progress);

  assert.equal(progress.levelRecords['1-1']?.attempts, 1);
  assert.equal(progress.levelRecords['1-1']?.completed, false);
  assert.equal(progress.lastPlayedLevelId, '1-1');
  assert.equal(summary.hasStarted, true);
});

test('recordFantasyLaneLevelResult stores completion, stars, and next unlock', () => {
  recordFantasyLaneLevelStart('1-1');
  const progress = recordFantasyLaneLevelResult('1-1', WIN_RESULT, 86);
  const summary = getFantasyLaneProgressSummary(progress);

  assert.ok(progress.completedLevels.includes('1-1'));
  assert.equal(progress.levelRecords['1-1']?.completed, true);
  assert.equal(progress.levelRecords['1-1']?.bestStars, 3);
  assert.equal(progress.levelRecords['1-1']?.bestScore, 9800);
  assert.equal(progress.levelRecords['1-1']?.bestBaseHpPercent, 86);
  assert.equal(progress.highestUnlockedLevelId, '1-2');
  assert.equal(getFantasyLaneLevelStatus(progress, '1-1'), 'completed');
  assert.equal(getFantasyLaneLevelStatus(progress, '1-2'), 'unlocked');
  assert.equal(summary.completedLevels, 1);
  assert.equal(summary.totalStars, 3);
  assert.equal(summary.bestScore, 9800);
  assert.match(summary.lastPlayedLevelName, /^1-1 /);
});

test('repeat clears do not overwrite the best fantasy lane record', () => {
  recordFantasyLaneLevelStart('1-1');
  recordFantasyLaneLevelResult('1-1', WIN_RESULT, 86);
  recordFantasyLaneLevelStart('1-1');
  const updated = recordFantasyLaneLevelResult(
    '1-1',
    { title: '战线推进成功', stars: 1, score: 2400, summary: '险胜', tips: [] },
    42,
  );

  assert.equal(updated.levelRecords['1-1']?.attempts, 2);
  assert.equal(updated.levelRecords['1-1']?.bestStars, 3);
  assert.equal(updated.levelRecords['1-1']?.bestScore, 9800);
  assert.equal(updated.levelRecords['1-1']?.bestBaseHpPercent, 86);
});

test('clearing chapter one unlocks the next chapter opener', () => {
  let progress = loadFantasyLaneProgress();

  for (let index = 1; index <= 6; index += 1) {
    const levelId = `1-${index}`;
    recordFantasyLaneLevelStart(levelId);
    progress = recordFantasyLaneLevelResult(levelId, WIN_RESULT, 80);
  }

  const chapterProgress = getFantasyLaneChapterProgress(progress, 'chapter-1');
  const summary = getFantasyLaneProgressSummary(progress);

  assert.equal(chapterProgress.completed, 6);
  assert.equal(chapterProgress.total, 6);
  assert.ok(isFantasyLaneLevelUnlocked(progress, '2-1'));
  assert.equal(getFantasyLaneLevelStatus(progress, '2-1'), 'unlocked');
  assert.equal(summary.highestChapterId, 'chapter-2');
});

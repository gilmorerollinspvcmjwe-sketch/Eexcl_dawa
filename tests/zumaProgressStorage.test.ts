import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clearZumaProgressCache,
  getZumaProgressSummary,
  recordZumaGameResult,
  resetZumaProgress,
} from '../src/features/zuma/zumaProgressStorage.ts';

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
  clearZumaProgressCache();
  resetZumaProgress();
});

test('无尽模式结算会写入最佳波段', () => {
  recordZumaGameResult({
    levelId: 'zuma-endless-001',
    mode: 'endless',
    won: false,
    score: 16800,
    chainLevel: 5,
    accuracy: 0.76,
    elapsedMs: 185000,
    waveReached: 7,
  } as unknown as Parameters<typeof recordZumaGameResult>[0]);

  const summary = getZumaProgressSummary() as unknown as {
    endlessBestWave?: number;
  };
  assert.equal(summary.endlessBestWave, 7);
});

test('主线通关会更新章节完成度摘要', () => {
  for (let levelNumber = 1; levelNumber <= 12; levelNumber++) {
    recordZumaGameResult({
      levelId: `zuma-adventure-${String(levelNumber).padStart(3, '0')}`,
      mode: 'adventure',
      won: true,
      score: 9200 + levelNumber * 10,
      chainLevel: 3,
      accuracy: 0.88,
      elapsedMs: 81000,
    });
  }
  recordZumaGameResult({
    levelId: 'zuma-adventure-013',
    mode: 'adventure',
    won: true,
    score: 9800,
    chainLevel: 4,
    accuracy: 0.86,
    elapsedMs: 88000,
  });

  const summary = getZumaProgressSummary() as unknown as {
    chapterCompletion?: Record<string, { cleared: number; total: number }>;
  };
  assert.equal(summary.chapterCompletion?.temple?.cleared, 12);
  assert.equal(summary.chapterCompletion?.advanced?.cleared, 1);
});

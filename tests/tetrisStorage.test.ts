import test from 'node:test';
import assert from 'node:assert/strict';
import { createTetrisBoardState } from '../src/features/tetris/tetrisBoardState.ts';
import {
  applyTetrisRunResult,
  createDefaultTetrisModuleRecord,
  normalizeTetrisModuleRecord,
  TETRIS_MODULE_STORAGE_VERSION,
} from '../src/features/tetris/tetrisStorage.ts';

test('createDefaultTetrisModuleRecord returns versioned empty stats', () => {
  const record = createDefaultTetrisModuleRecord();
  assert.equal(record.version, TETRIS_MODULE_STORAGE_VERSION);
  assert.equal(record.stats.totalRuns, 0);
  assert.equal(record.stats.bestScore, 0);
  assert.equal(record.stats.bestLines, 0);
  assert.equal(record.stats.maxLevelReached, 0);
  assert.equal(record.stats.sprintBestMs, null);
  assert.equal(record.stats.ultraBestScore, 0);
});

test('normalizeTetrisModuleRecord falls back safely on invalid input', () => {
  const record = normalizeTetrisModuleRecord({ foo: 'bar' });
  assert.equal(record.version, TETRIS_MODULE_STORAGE_VERSION);
  assert.equal(record.stats.totalRuns, 0);
  assert.equal(record.stats.bestScore, 0);
  assert.equal(record.stats.maxLevelReached, 0);
});

test('normalizeTetrisModuleRecord sanitizes maxLevelReached', () => {
  const record = normalizeTetrisModuleRecord({
    version: 999,
    stats: {
      totalRuns: 3.8,
      bestScore: 5000,
      bestLines: 26.1,
      maxLevelReached: -5,
      sprintBestMs: 92_345.9,
      ultraBestScore: 8800,
      lastPlayedAt: '2026-04-12T08:00:00.000Z',
    },
  });

  assert.equal(record.version, TETRIS_MODULE_STORAGE_VERSION);
  assert.equal(record.stats.totalRuns, 3);
  assert.equal(record.stats.bestLines, 26);
  assert.equal(record.stats.maxLevelReached, 0);
  assert.equal(record.stats.sprintBestMs, 92_345);
});

test('applyTetrisRunResult updates best score and lines', () => {
  const state = createTetrisBoardState('marathon');
  const ended = { ...state, status: 'dead' as const, score: 1200, linesCleared: 18, level: 4, elapsedMs: 95_000 };
  const updated = applyTetrisRunResult(createDefaultTetrisModuleRecord(), ended, '2026-04-12T00:00:00.000Z');

  assert.equal(updated.nextRecord.stats.totalRuns, 1);
  assert.equal(updated.nextRecord.stats.bestScore, 1200);
  assert.equal(updated.nextRecord.stats.bestLines, 18);
  assert.equal(updated.nextRecord.stats.maxLevelReached, 4);
  assert.equal(updated.isBestScore, true);
  assert.equal(updated.isBestLines, true);
  assert.equal(updated.isBestLevel, true);
});

test('max level record does not regress after lower-level runs', () => {
  const base = createDefaultTetrisModuleRecord();
  const firstRun = applyTetrisRunResult(base, {
    ...createTetrisBoardState('marathon'),
    status: 'dead' as const,
    score: 1800,
    linesCleared: 22,
    level: 6,
    elapsedMs: 100_000,
  });
  assert.equal(firstRun.nextRecord.stats.maxLevelReached, 6);
  assert.equal(firstRun.isBestLevel, true);

  const secondRun = applyTetrisRunResult(firstRun.nextRecord, {
    ...createTetrisBoardState('marathon'),
    status: 'dead' as const,
    score: 2600,
    linesCleared: 15,
    level: 3,
    elapsedMs: 88_000,
  });
  assert.equal(secondRun.nextRecord.stats.maxLevelReached, 6);
  assert.equal(secondRun.isBestLevel, false);
});

test('sprint best time updates only when finished and faster', () => {
  const base = createDefaultTetrisModuleRecord();
  const sprintState = {
    ...createTetrisBoardState('sprint'),
    status: 'finished' as const,
    elapsedMs: 88_000,
    score: 5000,
    linesCleared: 40,
  };
  const first = applyTetrisRunResult(base, sprintState);
  assert.equal(first.nextRecord.stats.sprintBestMs, 88_000);
  assert.equal(first.isBestSprint, true);

  const slower = applyTetrisRunResult(first.nextRecord, { ...sprintState, elapsedMs: 96_000, score: 5200 });
  assert.equal(slower.nextRecord.stats.sprintBestMs, 88_000);
  assert.equal(slower.isBestSprint, false);
});

test('ultra best score keeps the highest value', () => {
  const base = createDefaultTetrisModuleRecord();
  const ultraState = {
    ...createTetrisBoardState('ultra'),
    status: 'finished' as const,
    elapsedMs: 120_000,
    score: 8200,
    linesCleared: 26,
  };
  const first = applyTetrisRunResult(base, ultraState);
  assert.equal(first.nextRecord.stats.ultraBestScore, 8200);
  assert.equal(first.isBestUltra, true);

  const lower = applyTetrisRunResult(first.nextRecord, { ...ultraState, score: 7900 });
  assert.equal(lower.nextRecord.stats.ultraBestScore, 8200);
  assert.equal(lower.isBestUltra, false);
});

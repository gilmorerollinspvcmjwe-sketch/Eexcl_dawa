import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyGame2048Record,
  normalizeGame2048Record,
} from '../src/features/game2048/game2048Storage.ts';

test('createEmptyGame2048Record returns classic defaults', () => {
  const record = createEmptyGame2048Record();

  assert.equal(record.version, 1);
  assert.equal(record.stats.bestScore, 0);
  assert.equal(record.activeRun, null);
});

test('normalizeGame2048Record falls back safely for invalid input', () => {
  const record = normalizeGame2048Record({ broken: true });

  assert.deepEqual(record, createEmptyGame2048Record());
});

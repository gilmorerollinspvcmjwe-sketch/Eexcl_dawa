import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATCH3_RUNTIME_MODES,
  getModeChapters,
  getModeLevelById,
  getModeLevelsByChapter,
  convertModeLevelToConfig,
} from '../src/features/match3/match3ModeRuntime.ts';

test('runtime modes expose blitz and puzzle entries', () => {
  const modeIds = MATCH3_RUNTIME_MODES.map((mode) => mode.id);

  assert.deepEqual(modeIds, ['adventure', 'blitz', 'puzzle']);
});

test('blitz runtime chapter exposes timed entries', () => {
  const chapters = getModeChapters('blitz');
  const levels = getModeLevelsByChapter('blitz', chapters[0]?.id ?? '');

  assert.ok(chapters.length >= 1);
  assert.ok(levels.length >= 1);
  assert.ok(levels.every((level) => level.modeId === 'blitz'));
  assert.ok(levels.every((level) => (level.maxTimeMs ?? 0) > 0));
});

test('puzzle runtime config keeps template, weights and prebuilt specials', () => {
  const level = getModeLevelById('puzzle-combo-latch');

  assert.ok(level);

  const config = convertModeLevelToConfig(level!);

  assert.equal(config.modeId, 'puzzle');
  assert.equal(config.boardTemplateId, level?.boardTemplateId);
  assert.deepEqual(config.colorWeights, level?.colorWeights);
  assert.deepEqual(config.prebuiltSpecials, level?.prebuiltSpecials);
  assert.ok(config.goals.some((goal) => goal.type === 'triggerCombo'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLevelsByPack,
  getPackById,
  getPackCount,
} from '../src/features/match3/match3LevelCatalog.ts';

test('drop-collect pack exists with formal levels', () => {
  const pack = getPackById('drop-collect');

  assert.ok(pack);
  assert.ok((pack?.levels.length ?? 0) >= 4);
});

test('drop-collect pack levels carry drop goals and exit metadata', () => {
  const levels = getLevelsByPack('drop-collect');

  assert.ok(levels.every((level) => level.goals.some((goal) => goal.type === 'dropCollect')));
  assert.ok(levels.some((level) => (level.dropExits?.length ?? 0) > 0));
});

test('adventure pack skeleton expands to at least six packs with obstacle and combo themes', () => {
  assert.ok(getPackCount() >= 6);
  assert.ok(getPackById('obstacle-siege'));
  assert.ok(getPackById('combo-chain'));
});

test('new adventure packs carry board template, color weight and prebuilt special scripting fields', () => {
  const obstacleLevels = getLevelsByPack('obstacle-siege');
  const comboLevels = getLevelsByPack('combo-chain');

  assert.ok(obstacleLevels.some((level) => level.boardTemplateId));
  assert.ok(obstacleLevels.some((level) => level.colorWeights && Object.keys(level.colorWeights).length > 0));
  assert.ok(comboLevels.some((level) => (level.prebuiltSpecials?.length ?? 0) > 0));
  assert.ok(comboLevels.some((level) => level.goals.some((goal) => goal.type === 'triggerCombo')));
});

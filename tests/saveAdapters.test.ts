import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialSaveSlot, createWorkbookSaveData } from '../src/features/save/saveAdapters.ts';

test('createWorkbookSaveData stores the selected game and sheet context', () => {
  const data = createWorkbookSaveData({
    gameType: 'pvz',
    currentSheet: 'pvz',
    workspaceId: 'pvz',
    payload: { sun: 150, chapterId: 'day' },
  });

  assert.equal(data.gameType, 'pvz');
  assert.equal(data.currentSheet, 'pvz');
  assert.equal(data.workspaceId, 'pvz');
  assert.deepEqual(data.payload, { sun: 150, chapterId: 'day' });
});

test('createInitialSaveSlot creates the chosen game payload', () => {
  const slot = createInitialSaveSlot('测试存档', 'perler', 'perler');

  assert.equal(slot.name, '测试存档');
  assert.equal(slot.gameType, 'perler');
  assert.equal(slot.data.workspaceId, 'perler');
});

test('createInitialSaveSlot seeds fantasy lane with a playable default lineup', () => {
  const slot = createInitialSaveSlot('奇幻战线存档', 'fantasy_lane', 'fantasy_lane');

  assert.equal(slot.gameType, 'fantasy_lane');
  assert.equal(slot.data.currentSheet, 'fantasy_lane');
  assert.equal(slot.data.payload.levelId, '1-1');
  assert.equal(slot.data.payload.heroId, 'warlord');
  assert.equal(slot.data.payload.tacticalId, 'fireball');
  assert.deepEqual(slot.data.payload.loadoutUnitIds, [
    'goblin_shield',
    'archer',
    'flame_warlock',
    'orc_heavy',
    'crypt_crawler',
    'elf_shooter',
    'ice_witch',
    'griffin_knight',
  ]);
});

test('createInitialSaveSlot seeds gold miner with adventure run defaults', () => {
  const slot = createInitialSaveSlot('黄金矿工存档', 'gold_miner', 'gold_miner');

  assert.equal(slot.gameType, 'gold_miner');
  assert.equal(slot.data.currentSheet, 'gold_miner');
  assert.deepEqual(slot.data.payload, {
    mode: 'adventure',
    levelId: 1,
    phase: 'swinging',
  });
});

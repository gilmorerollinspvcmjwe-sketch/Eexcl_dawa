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

test('createInitialSaveSlot creates a chinese slot payload for the chosen game', () => {
  const slot = createInitialSaveSlot('测试存档', 'perler', 'perler');

  assert.equal(slot.name, '测试存档');
  assert.equal(slot.gameType, 'perler');
  assert.equal(slot.data.workspaceId, 'perler');
});


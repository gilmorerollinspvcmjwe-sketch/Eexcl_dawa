import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyWorkbookPersistence, exportWorkbookPersistenceJson, importWorkbookPersistenceJson } from '../src/features/save/workbookPersistence.ts';

test('workbook persistence export/import roundtrip keeps workspace and snapshots', () => {
  const base = createEmptyWorkbookPersistence();
  base.workspaceGameId = 'pvz';
  base.currentSheet = 'pvz';
  base.currentSaveSlotId = 'slot-1';
  base.gameSnapshots.pvz = { sun: 150, chapterId: 'day' };

  const exported = exportWorkbookPersistenceJson(base);
  const imported = importWorkbookPersistenceJson(exported);

  assert.equal(imported.workspaceGameId, 'pvz');
  assert.equal(imported.currentSheet, 'pvz');
  assert.equal(imported.currentSaveSlotId, 'slot-1');
  assert.deepEqual(imported.gameSnapshots.pvz, { sun: 150, chapterId: 'day' });
});


import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_REGISTRY } from '../src/features/sheets/sheetRegistry.ts';

test('sheet registry exposes snake and tetris on sheet10 and sheet11', () => {
  assert.equal(SHEET_REGISTRY.length, 11);
  assert.deepEqual(
    SHEET_REGISTRY.map((sheet) => sheet.id),
    ['hub', 'game', 'stats', 'settings', 'config', 'perler', 'pvz', 'pvz_collection', 'pvz_lab', 'snake', 'tetris'],
  );
  assert.equal(SHEET_REGISTRY[0]?.label, 'Sheet1');
  assert.equal(SHEET_REGISTRY[5]?.label, 'Sheet6');
  assert.equal(SHEET_REGISTRY[9]?.label, 'Sheet10');
  assert.equal(SHEET_REGISTRY[10]?.label, 'Sheet11');
});

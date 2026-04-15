import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_REGISTRY } from '../src/features/sheets/sheetRegistry.ts';

test('sheet registry exposes all game modules', () => {
  assert.equal(SHEET_REGISTRY.length, 17);
  assert.deepEqual(
    SHEET_REGISTRY.map((sheet) => sheet.id),
    ['hub', 'game', 'stats', 'settings', 'config', 'perler', 'pvz', 'pvz_collection', 'pvz_lab', 'snake', 'tetris', 'pacman', 'pacman_guide', 'zuma', 'zuma_collection', 'match3', 'match3_lab'],
  );
  assert.equal(SHEET_REGISTRY[0]?.label, 'Sheet1');
  assert.equal(SHEET_REGISTRY[5]?.label, 'Sheet6');
  assert.equal(SHEET_REGISTRY[9]?.label, 'Sheet10');
  assert.equal(SHEET_REGISTRY[10]?.label, 'Sheet11');
  assert.equal(SHEET_REGISTRY[11]?.label, 'Sheet12');
  assert.equal(SHEET_REGISTRY[12]?.label, 'Sheet13');
  assert.equal(SHEET_REGISTRY[13]?.label, 'Sheet14');
  assert.equal(SHEET_REGISTRY[14]?.label, 'Sheet15');
  assert.equal(SHEET_REGISTRY[15]?.label, 'Sheet16');
  assert.equal(SHEET_REGISTRY[16]?.label, 'Sheet17');
});
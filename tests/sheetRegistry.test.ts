import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_REGISTRY } from '../src/features/sheets/sheetRegistry.ts';

test('sheet registry exposes six sheets with perler on sheet6', () => {
  assert.equal(SHEET_REGISTRY.length, 6);
  assert.deepEqual(
    SHEET_REGISTRY.map((sheet) => sheet.id),
    ['hub', 'game', 'stats', 'settings', 'config', 'perler'],
  );
  assert.equal(SHEET_REGISTRY[0]?.label, 'Sheet1');
  assert.equal(SHEET_REGISTRY[5]?.label, 'Sheet6');
});


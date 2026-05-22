import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_REGISTRY } from '../src/features/sheets/sheetRegistry.ts';

test('pvz sheets are registered as sheet7 sheet8 and sheet9', () => {
  const ids = SHEET_REGISTRY.map((sheet) => sheet.id);
  assert.ok(ids.includes('pvz'));
  assert.ok(ids.includes('pvz_collection'));
  assert.ok(ids.includes('pvz_lab'));

  const sheet7 = SHEET_REGISTRY.find((sheet) => sheet.id === 'pvz');
  const sheet8 = SHEET_REGISTRY.find((sheet) => sheet.id === 'pvz_collection');
  const sheet9 = SHEET_REGISTRY.find((sheet) => sheet.id === 'pvz_lab');

  assert.equal(sheet7?.label, 'Sheet7');
  assert.equal(sheet8?.label, 'Sheet8');
  assert.equal(sheet9?.label, 'Sheet9');
});


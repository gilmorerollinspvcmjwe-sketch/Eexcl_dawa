import test from 'node:test';
import assert from 'node:assert/strict';
import { getCanvasCellSize, getDefaultCanvasZoom, IMPORT_SIZE_OPTIONS } from '../src/features/perler/perlerCanvasUtils.ts';

test('import size options now support up to 300', () => {
  assert.ok(IMPORT_SIZE_OPTIONS.includes(80));
  assert.ok(IMPORT_SIZE_OPTIONS.includes(160));
  assert.ok(IMPORT_SIZE_OPTIONS.includes(300));
  assert.equal(IMPORT_SIZE_OPTIONS[IMPORT_SIZE_OPTIONS.length - 1], 300);
});

test('canvas helpers keep very large templates readable', () => {
  assert.equal(getCanvasCellSize(32), 14);
  assert.equal(getCanvasCellSize(120), 7);
  assert.equal(getCanvasCellSize(300), 2);
  assert.equal(getDefaultCanvasZoom(32), 1);
  assert.equal(getDefaultCanvasZoom(300), 2);
});


import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPerlerRegions,
  getCanvasCellSize,
  getDefaultCanvasZoom,
  getPerlerViewVisibility,
  IMPORT_SIZE_OPTIONS,
} from '../src/features/perler/perlerCanvasUtils.ts';

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

test('large templates are partitioned into navigable regions', () => {
  const regions = buildPerlerRegions(120, 90);
  assert.ok(regions.length > 1);
  assert.equal(regions[0]?.label, 'A1');
  assert.ok(regions.every((region) => region.width > 0 && region.height > 0));
});

test('view visibility supports split, focus, and reference modes', () => {
  assert.deepEqual(getPerlerViewVisibility('split'), {
    showSidebar: true,
    showReference: true,
    showPlayer: true,
  });
  assert.deepEqual(getPerlerViewVisibility('focus'), {
    showSidebar: false,
    showReference: false,
    showPlayer: true,
  });
  assert.deepEqual(getPerlerViewVisibility('reference'), {
    showSidebar: false,
    showReference: true,
    showPlayer: false,
  });
});

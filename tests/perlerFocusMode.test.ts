import test from 'node:test';
import assert from 'node:assert/strict';
import { getPerlerFocusVisibility } from '../src/features/perler/perlerCanvasUtils.ts';

test('focus mode hides sidebars and reference board', () => {
  assert.deepEqual(getPerlerFocusVisibility(false), {
    showSidebar: true,
    showReference: true,
    playerOnly: false,
  });

  assert.deepEqual(getPerlerFocusVisibility(true), {
    showSidebar: false,
    showReference: false,
    playerOnly: true,
  });
});


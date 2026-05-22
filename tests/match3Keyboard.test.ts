import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultFocusTile,
  moveFocusTile,
  resolveConfirmAction,
} from '../src/features/match3/match3Keyboard.ts';

test('moveFocusTile only moves the cursor and stays inside the board', () => {
  let focus = getDefaultFocusTile(8, 8);
  assert.deepEqual(focus, { row: 4, col: 4 });

  focus = moveFocusTile(focus, 'ArrowLeft', 8, 8);
  assert.deepEqual(focus, { row: 4, col: 3 });

  focus = moveFocusTile({ row: 0, col: 0 }, 'ArrowUp', 8, 8);
  assert.deepEqual(focus, { row: 0, col: 0 });
});

test('resolveConfirmAction selects first and confirms swap only for adjacent focus', () => {
  const focus = { row: 3, col: 3 };
  const selected = resolveConfirmAction(null, focus);
  assert.deepEqual(selected.nextSelectedTile, focus);
  assert.equal(selected.shouldSwap, false);

  const confirm = resolveConfirmAction({ row: 3, col: 3 }, { row: 3, col: 4 });
  assert.equal(confirm.shouldSwap, true);
  assert.deepEqual(confirm.swapTarget, { row: 3, col: 4 });

  const reselect = resolveConfirmAction({ row: 3, col: 3 }, { row: 5, col: 5 });
  assert.equal(reselect.shouldSwap, false);
  assert.deepEqual(reselect.nextSelectedTile, { row: 5, col: 5 });
});

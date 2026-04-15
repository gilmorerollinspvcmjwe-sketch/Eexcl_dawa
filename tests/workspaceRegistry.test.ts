import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleSheetsForWorkspace, getWorkspaceByGame } from '../src/features/workbook/workspaceState.ts';

test('pvz workspace resolves from registry', () => {
  const workspace = getWorkspaceByGame('pvz');
  assert.equal(workspace.mainSheetId, 'pvz');
  assert.equal(workspace.configSheetId, 'pvz_lab');
});

test('perler workspace visibility is registry-driven', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('perler'), ['hub', 'perler', 'settings']);
});

test('aim workspace keeps sheet1 to sheet4 visible', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('aim'), ['hub', 'game', 'stats', 'settings']);
});

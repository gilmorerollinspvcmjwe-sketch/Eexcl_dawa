import test from 'node:test';
import assert from 'node:assert/strict';
import { getGameForSheet, getVisibleSheetsForWorkspace, getWorkspaceByGame } from '../src/features/workbook/workspaceState.ts';

test('pvz workspace resolves from registry', () => {
  const workspace = getWorkspaceByGame('pvz');
  assert.equal(workspace.mainSheetId, 'pvz');
  assert.equal(workspace.configSheetId, 'pvz_lab');
});

test('perler workspace visibility is registry-driven', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('perler'), ['perler']);
});

test('aim workspace keeps sheet1 to sheet4 visible', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('aim'), ['hub', 'game', 'stats', 'settings']);
});

test('pvz workspace only shows sheet7 to sheet9', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('pvz'), ['pvz', 'pvz_collection', 'pvz_lab']);
});

test('snake and tetris workspaces only keep their own main sheets', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('snake'), ['snake']);
  assert.deepEqual(getVisibleSheetsForWorkspace('tetris'), ['tetris']);
});

test('gold miner workspace keeps battle and guide sheets visible', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('gold_miner'), ['gold_miner', 'gold_miner_guide']);
});

test('2048 workspace keeps only the main sheet visible', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('game2048'), ['game2048']);
});

test('sheet ids resolve back to the owning game workspace', () => {
  assert.equal(getGameForSheet('pvz_lab'), 'pvz');
  assert.equal(getGameForSheet('perler'), 'perler');
  assert.equal(getGameForSheet('gold_miner_guide'), 'gold_miner');
  assert.equal(getGameForSheet('game2048'), 'game2048');
  assert.equal(getGameForSheet('hub'), null);
});

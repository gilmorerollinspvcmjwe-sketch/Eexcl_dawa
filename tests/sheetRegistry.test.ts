import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_REGISTRY } from '../src/features/sheets/sheetRegistry.ts';

test('sheet registry exposes all game modules', () => {
  assert.equal(SHEET_REGISTRY.length, 23);
  assert.deepEqual(
    SHEET_REGISTRY.map((sheet) => sheet.id),
    [
      'hub',
      'game',
      'stats',
      'settings',
      'config',
      'perler',
      'pvz',
      'pvz_collection',
      'pvz_lab',
      'snake',
      'tetris',
      'pacman',
      'pacman_guide',
      'zuma',
      'zuma_collection',
      'match3',
      'match3_lab',
      'fantasy_lane',
      'fantasy_lane_roster',
      'fantasy_lane_chapter',
      'gold_miner',
      'gold_miner_guide',
      'game2048',
    ],
  );
  assert.equal(SHEET_REGISTRY[20]?.label, 'Sheet21');
  assert.equal(SHEET_REGISTRY[21]?.label, 'Sheet22');
  assert.equal(SHEET_REGISTRY[22]?.label, 'Sheet23');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GOLD_MINER_STORAGE_KEY,
  clearGoldMinerActiveRun,
  createEmptyGoldMinerStorage,
  getGoldMinerProgressSummary,
  loadGoldMinerStorage,
  recordGoldMinerLevelResult,
  recordGoldMinerLevelStart,
  resetGoldMinerStorage,
  saveGoldMinerActiveRun,
} from '../src/features/gold_miner/goldMinerProgressStorage.ts';
import { createGoldMinerBoardState, createGoldMinerSnapshot } from '../src/features/gold_miner/goldMinerBoardState.ts';
import { getGoldMinerLevel } from '../src/features/gold_miner/goldMinerLevelCatalog.ts';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const localStorageMock = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

test.beforeEach(() => {
  localStorageMock.clear();
});

test('resetGoldMinerStorage restores the empty module payload', () => {
  localStorageMock.setItem(GOLD_MINER_STORAGE_KEY, JSON.stringify({ broken: true }));

  const storage = resetGoldMinerStorage();

  assert.deepEqual(storage, createEmptyGoldMinerStorage());
  assert.deepEqual(loadGoldMinerStorage(), createEmptyGoldMinerStorage());
});

test('saveGoldMinerActiveRun marks the module as started for hub resume', () => {
  const state = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 23 });
  saveGoldMinerActiveRun(createGoldMinerSnapshot(state));

  const storage = loadGoldMinerStorage();
  const summary = getGoldMinerProgressSummary(storage);

  assert.ok(storage.activeRun);
  assert.equal(summary.hasStarted, true);
  assert.equal(summary.lastPlayedLabel, 'L1');
});

test('recordGoldMinerLevelStart increments attempt counters', () => {
  const storage = recordGoldMinerLevelStart(3);

  assert.equal(storage.progression.lastPlayedLevelId, 3);
  assert.equal(storage.progression.levelRecords[3]?.attempts, 1);
});

test('recordGoldMinerLevelResult updates progression and aggregated stats', () => {
  const state = createGoldMinerBoardState({ level: getGoldMinerLevel(2), rngSeed: 29 });
  const finished = {
    ...state,
    score: 1800,
    targetScore: 1500,
    elapsedMs: 42000,
    destroyedItemIds: ['rock_small-1'],
  };

  const storage = recordGoldMinerLevelResult(finished);
  const summary = getGoldMinerProgressSummary(storage);

  assert.equal(storage.stats.totalRuns, 1);
  assert.equal(storage.stats.bestScore, 1800);
  assert.equal(storage.stats.totalGoldCollected, 1800);
  assert.equal(storage.stats.totalDynamiteUsed, 1);
  assert.ok(storage.progression.completedLevels.includes(2));
  assert.equal(storage.progression.highestUnlockedLevel, 3);
  assert.equal(storage.activeRun, null);
  assert.equal(summary.highestLevel, 3);
});

test('clearGoldMinerActiveRun removes only the in-progress run snapshot', () => {
  const state = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 31 });
  saveGoldMinerActiveRun(createGoldMinerSnapshot(state));

  clearGoldMinerActiveRun();

  assert.equal(loadGoldMinerStorage().activeRun, null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SNAKE_STORAGE_KEY,
  createDefaultSnakeStorage,
  readSnakeStorage,
  recordSnakeRun,
  withSnakeMapSizePreference,
  writeSnakeStorage,
} from '../src/features/snake/snakeStorage.ts';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length() {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

test('readSnakeStorage returns defaults when storage is empty', () => {
  const storage = new MemoryStorage();
  const data = readSnakeStorage(storage);

  assert.deepEqual(data, createDefaultSnakeStorage());
});

test('readSnakeStorage falls back to defaults when payload is invalid', () => {
  const storage = new MemoryStorage();
  storage.setItem(SNAKE_STORAGE_KEY, '{"bad":true}');

  const data = readSnakeStorage(storage);
  assert.deepEqual(data, createDefaultSnakeStorage());
});

test('readSnakeStorage upgrades legacy v1 payload to v2 with default preferences', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    SNAKE_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      stats: {
        totalRuns: 4,
        bestScore: 220,
        bestLength: 13,
      },
    }),
  );

  const data = readSnakeStorage(storage);
  assert.equal(data.version, 2);
  assert.deepEqual(data.stats, {
    totalRuns: 4,
    bestScore: 220,
    bestLength: 13,
  });
  assert.deepEqual(data.preferences, {
    mapSize: 'medium',
  });
});

test('recordSnakeRun updates totals and best records', () => {
  const initial = createDefaultSnakeStorage();
  const first = recordSnakeRun(initial, 120, 9);
  const second = recordSnakeRun(first.data, 80, 7);
  const third = recordSnakeRun(second.data, 180, 6);

  assert.equal(first.result.totalRuns, 1);
  assert.equal(first.result.bestScore, 120);
  assert.equal(first.result.bestLength, 9);
  assert.equal(first.result.isNewBestScore, true);
  assert.equal(first.result.isNewBestLength, true);

  assert.equal(second.result.totalRuns, 2);
  assert.equal(second.result.bestScore, 120);
  assert.equal(second.result.bestLength, 9);
  assert.equal(second.result.isNewBestScore, false);
  assert.equal(second.result.isNewBestLength, false);

  assert.equal(third.result.totalRuns, 3);
  assert.equal(third.result.bestScore, 180);
  assert.equal(third.result.bestLength, 9);
  assert.equal(third.result.isNewBestScore, true);
  assert.equal(third.result.isNewBestLength, false);
  assert.equal(third.data.preferences.mapSize, 'medium');
});

test('withSnakeMapSizePreference updates map size without mutating stats', () => {
  const initial = createDefaultSnakeStorage();
  const updated = withSnakeMapSizePreference(initial, 'large');

  assert.equal(updated.preferences.mapSize, 'large');
  assert.deepEqual(updated.stats, initial.stats);
});

test('writeSnakeStorage persists data that can be read back', () => {
  const storage = new MemoryStorage();
  const updated = withSnakeMapSizePreference(recordSnakeRun(createDefaultSnakeStorage(), 200, 14).data, 'small');
  writeSnakeStorage(storage, updated);

  const readBack = readSnakeStorage(storage);
  assert.deepEqual(readBack, updated);
});

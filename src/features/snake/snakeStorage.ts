import { isSnakeMapSizePreset } from './snakeMapSize.ts';
import type { SnakeMapSizePreset, SnakeModuleStorage, SnakeRunResult, SnakeRunStats } from './snakeTypes.ts';

export const SNAKE_STORAGE_KEY = 'excel-arcade-snake-v1';
const SNAKE_STORAGE_VERSION = 2 as const;

const DEFAULT_SNAKE_STATS: SnakeRunStats = {
  totalRuns: 0,
  bestScore: 0,
  bestLength: 0,
};

const DEFAULT_MAP_SIZE_PRESET: SnakeMapSizePreset = 'medium';

function isSnakeRunStats(value: unknown): value is SnakeRunStats {
  if (!value || typeof value !== 'object') return false;
  const stats = value as Partial<SnakeRunStats>;
  return (
    typeof stats.totalRuns === 'number' &&
    typeof stats.bestScore === 'number' &&
    typeof stats.bestLength === 'number'
  );
}

type LegacySnakeModuleStorageV1 = {
  version: 1;
  stats: SnakeRunStats;
};

function isLegacySnakeModuleStorageV1(value: unknown): value is LegacySnakeModuleStorageV1 {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<LegacySnakeModuleStorageV1>;
  return maybe.version === 1 && isSnakeRunStats(maybe.stats);
}

function isSnakeModuleStorageV2(value: unknown): value is SnakeModuleStorage {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<SnakeModuleStorage>;
  if (maybe.version !== SNAKE_STORAGE_VERSION) return false;
  if (!isSnakeRunStats(maybe.stats)) return false;
  const preferences = maybe.preferences as Partial<SnakeModuleStorage['preferences']> | undefined;
  return !!preferences && isSnakeMapSizePreset(preferences.mapSize);
}

export function createDefaultSnakeStorage(): SnakeModuleStorage {
  return {
    version: SNAKE_STORAGE_VERSION,
    stats: { ...DEFAULT_SNAKE_STATS },
    preferences: {
      mapSize: DEFAULT_MAP_SIZE_PRESET,
    },
  };
}

function normalizeSnakeStorage(value: unknown): SnakeModuleStorage {
  if (isSnakeModuleStorageV2(value)) {
    return {
      version: SNAKE_STORAGE_VERSION,
      stats: {
        totalRuns: Math.max(0, Math.floor(value.stats.totalRuns)),
        bestScore: Math.max(0, Math.floor(value.stats.bestScore)),
        bestLength: Math.max(0, Math.floor(value.stats.bestLength)),
      },
      preferences: {
        mapSize: value.preferences.mapSize,
      },
    };
  }

  if (isLegacySnakeModuleStorageV1(value)) {
    return {
      version: SNAKE_STORAGE_VERSION,
      stats: {
        totalRuns: Math.max(0, Math.floor(value.stats.totalRuns)),
        bestScore: Math.max(0, Math.floor(value.stats.bestScore)),
        bestLength: Math.max(0, Math.floor(value.stats.bestLength)),
      },
      preferences: {
        mapSize: DEFAULT_MAP_SIZE_PRESET,
      },
    };
  }

  return createDefaultSnakeStorage();
}

export function readSnakeStorage(storage: Storage | undefined): SnakeModuleStorage {
  if (!storage) return createDefaultSnakeStorage();
  try {
    const raw = storage.getItem(SNAKE_STORAGE_KEY);
    if (!raw) return createDefaultSnakeStorage();
    const parsed = JSON.parse(raw) as unknown;
    return normalizeSnakeStorage(parsed);
  } catch {
    return createDefaultSnakeStorage();
  }
}

export function writeSnakeStorage(storage: Storage | undefined, data: SnakeModuleStorage): void {
  if (!storage) return;
  try {
    storage.setItem(SNAKE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage write failures to avoid breaking gameplay.
  }
}

export function recordSnakeRun(storageData: SnakeModuleStorage, score: number, length: number): { data: SnakeModuleStorage; result: SnakeRunResult } {
  const nextStats: SnakeRunStats = {
    totalRuns: storageData.stats.totalRuns + 1,
    bestScore: Math.max(storageData.stats.bestScore, score),
    bestLength: Math.max(storageData.stats.bestLength, length),
  };
  const result: SnakeRunResult = {
    totalRuns: nextStats.totalRuns,
    bestScore: nextStats.bestScore,
    bestLength: nextStats.bestLength,
    score,
    length,
    isNewBestScore: score >= nextStats.bestScore && score > storageData.stats.bestScore,
    isNewBestLength: length >= nextStats.bestLength && length > storageData.stats.bestLength,
  };

  return {
    data: {
      version: SNAKE_STORAGE_VERSION,
      stats: nextStats,
      preferences: storageData.preferences,
    },
    result,
  };
}

export function withSnakeMapSizePreference(storageData: SnakeModuleStorage, mapSize: SnakeMapSizePreset): SnakeModuleStorage {
  return {
    ...storageData,
    version: SNAKE_STORAGE_VERSION,
    preferences: {
      ...storageData.preferences,
      mapSize,
    },
  };
}

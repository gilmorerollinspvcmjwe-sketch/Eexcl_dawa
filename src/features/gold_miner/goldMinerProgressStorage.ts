import type {
  GoldMinerBoardState,
  GoldMinerModuleStorage,
  GoldMinerPreferences,
  GoldMinerProgression,
  GoldMinerRunStats,
  GoldMinerSnapshot,
} from './goldMinerTypes.ts';
import { getGoldMinerMaxAdventureLevel } from './goldMinerLevelCatalog.ts';

export const GOLD_MINER_STORAGE_KEY = 'excel-gold-miner-module-v1';

export interface GoldMinerProgressSummary {
  hasStarted: boolean;
  highestLevel: number;
  bestScore: number;
  totalGoldCollected: number;
  lastPlayedLabel: string;
}

function createDefaultStats(): GoldMinerRunStats {
  return { totalRuns: 0, totalPlayTimeMs: 0, bestScore: 0, highestLevel: 1, totalGoldCollected: 0, totalDynamiteUsed: 0 };
}

function createDefaultProgression(): GoldMinerProgression {
  return { completedLevels: [], highestUnlockedLevel: 1, levelRecords: {}, unlockedModes: ['adventure', 'endless'], lastPlayedLevelId: 1 };
}

function createDefaultPreferences(): GoldMinerPreferences {
  return { showHints: true, soundEnabled: true };
}

export function createEmptyGoldMinerStorage(): GoldMinerModuleStorage {
  return { version: 1, stats: createDefaultStats(), progression: createDefaultProgression(), preferences: createDefaultPreferences(), activeRun: null };
}

function normalizeStorage(value: unknown): GoldMinerModuleStorage {
  if (!value || typeof value !== 'object') return createEmptyGoldMinerStorage();
  const raw = value as Partial<GoldMinerModuleStorage>;
  return {
    version: 1,
    stats: { ...createDefaultStats(), ...raw.stats },
    progression: {
      ...createDefaultProgression(),
      ...raw.progression,
      completedLevels: Array.isArray(raw.progression?.completedLevels) ? raw.progression.completedLevels : [],
      levelRecords: raw.progression?.levelRecords && typeof raw.progression.levelRecords === 'object' ? raw.progression.levelRecords : {},
      unlockedModes: Array.isArray(raw.progression?.unlockedModes) ? raw.progression.unlockedModes : ['adventure', 'endless'],
    },
    preferences: { ...createDefaultPreferences(), ...raw.preferences },
    activeRun: raw.activeRun ?? null,
  };
}

export function loadGoldMinerStorage(): GoldMinerModuleStorage {
  if (typeof localStorage === 'undefined') return createEmptyGoldMinerStorage();
  try {
    const raw = localStorage.getItem(GOLD_MINER_STORAGE_KEY);
    if (!raw) return createEmptyGoldMinerStorage();
    return normalizeStorage(JSON.parse(raw));
  } catch {
    return createEmptyGoldMinerStorage();
  }
}

export function saveGoldMinerStorage(storage: GoldMinerModuleStorage): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(GOLD_MINER_STORAGE_KEY, JSON.stringify(storage));
  } catch {
    // Ignore storage write failures.
  }
}

export function resetGoldMinerStorage(): GoldMinerModuleStorage {
  const storage = createEmptyGoldMinerStorage();
  saveGoldMinerStorage(storage);
  return storage;
}

export function clearGoldMinerActiveRun(): void {
  const storage = loadGoldMinerStorage();
  storage.activeRun = null;
  saveGoldMinerStorage(storage);
}

export function saveGoldMinerActiveRun(snapshot: GoldMinerSnapshot): void {
  const storage = loadGoldMinerStorage();
  storage.activeRun = {
    snapshot,
    startedAt: storage.activeRun?.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveGoldMinerStorage(storage);
}

export function recordGoldMinerLevelStart(levelId: number): GoldMinerModuleStorage {
  const storage = loadGoldMinerStorage();
  const current = storage.progression.levelRecords[levelId] ?? { levelId, attempts: 0, completed: false, bestScore: 0 };
  storage.progression.levelRecords[levelId] = { ...current, attempts: current.attempts + 1, lastPlayedAt: Date.now() };
  storage.progression.lastPlayedLevelId = levelId;
  saveGoldMinerStorage(storage);
  return storage;
}

export function recordGoldMinerLevelResult(state: GoldMinerBoardState): GoldMinerModuleStorage {
  const storage = loadGoldMinerStorage();
  const levelId = state.levelId;
  const record = storage.progression.levelRecords[levelId] ?? { levelId, attempts: 1, completed: false, bestScore: 0 };
  const passed = state.score >= state.targetScore;
  storage.progression.levelRecords[levelId] = {
    ...record,
    completed: record.completed || passed,
    bestScore: Math.max(record.bestScore, state.score),
    lastPlayedAt: Date.now(),
    firstCompletedAt: record.firstCompletedAt ?? (passed ? Date.now() : undefined),
  };
  if (passed && !storage.progression.completedLevels.includes(levelId)) storage.progression.completedLevels.push(levelId);
  storage.progression.highestUnlockedLevel = Math.min(getGoldMinerMaxAdventureLevel(), Math.max(storage.progression.highestUnlockedLevel, passed ? levelId + 1 : levelId));
  storage.progression.lastPlayedLevelId = levelId;
  storage.stats.totalRuns += 1;
  storage.stats.totalPlayTimeMs += state.elapsedMs;
  storage.stats.bestScore = Math.max(storage.stats.bestScore, state.score);
  storage.stats.highestLevel = Math.max(storage.stats.highestLevel, levelId);
  storage.stats.totalGoldCollected += state.score;
  storage.stats.totalDynamiteUsed += state.destroyedItemIds.length;
  storage.activeRun = null;
  saveGoldMinerStorage(storage);
  return storage;
}

export function getGoldMinerProgressSummary(storage = loadGoldMinerStorage()): GoldMinerProgressSummary {
  const highestLevel = Math.max(storage.stats.highestLevel, storage.progression.highestUnlockedLevel, storage.progression.lastPlayedLevelId);
  return {
    hasStarted: storage.stats.totalRuns > 0 || !!storage.activeRun,
    highestLevel,
    bestScore: storage.stats.bestScore,
    totalGoldCollected: storage.stats.totalGoldCollected,
    lastPlayedLabel: `L${storage.progression.lastPlayedLevelId}`,
  };
}

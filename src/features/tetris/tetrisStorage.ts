import type { TetrisBoardState } from './tetrisTypes.ts';

export const TETRIS_MODULE_STORAGE_KEY = 'excel-tetris-module-v1';
export const TETRIS_MODULE_STORAGE_VERSION = 1;

export interface TetrisModuleStats {
  totalRuns: number;
  bestScore: number;
  bestLines: number;
  maxLevelReached: number;
  sprintBestMs: number | null;
  ultraBestScore: number;
  lastPlayedAt: string | null;
}

export interface TetrisModuleRecord {
  version: typeof TETRIS_MODULE_STORAGE_VERSION;
  stats: TetrisModuleStats;
}

export interface TetrisRunRecordUpdate {
  nextRecord: TetrisModuleRecord;
  isBestScore: boolean;
  isBestLines: boolean;
  isBestLevel: boolean;
  isBestSprint: boolean;
  isBestUltra: boolean;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function createDefaultTetrisModuleRecord(): TetrisModuleRecord {
  return {
    version: TETRIS_MODULE_STORAGE_VERSION,
    stats: {
      totalRuns: 0,
      bestScore: 0,
      bestLines: 0,
      maxLevelReached: 0,
      sprintBestMs: null,
      ultraBestScore: 0,
      lastPlayedAt: null,
    },
  };
}

export function normalizeTetrisModuleRecord(raw: unknown): TetrisModuleRecord {
  const fallback = createDefaultTetrisModuleRecord();
  if (!raw || typeof raw !== 'object') return fallback;

  const candidate = raw as {
    version?: unknown;
    stats?: {
      totalRuns?: unknown;
      bestScore?: unknown;
      bestLines?: unknown;
      maxLevelReached?: unknown;
      sprintBestMs?: unknown;
      ultraBestScore?: unknown;
      lastPlayedAt?: unknown;
    };
  };

  const stats = candidate.stats ?? {};
  const sprintBestMs =
    typeof stats.sprintBestMs === 'number' && Number.isFinite(stats.sprintBestMs) ? stats.sprintBestMs : null;
  const lastPlayedAt = typeof stats.lastPlayedAt === 'string' ? stats.lastPlayedAt : null;

  return {
    version: TETRIS_MODULE_STORAGE_VERSION,
    stats: {
      totalRuns: Math.max(0, Math.floor(toSafeNumber(stats.totalRuns))),
      bestScore: Math.max(0, Math.floor(toSafeNumber(stats.bestScore))),
      bestLines: Math.max(0, Math.floor(toSafeNumber(stats.bestLines))),
      maxLevelReached: Math.max(0, Math.floor(toSafeNumber(stats.maxLevelReached))),
      sprintBestMs: sprintBestMs === null ? null : Math.max(0, Math.floor(sprintBestMs)),
      ultraBestScore: Math.max(0, Math.floor(toSafeNumber(stats.ultraBestScore))),
      lastPlayedAt,
    },
  };
}

export function readTetrisModuleRecord(): TetrisModuleRecord {
  if (typeof window === 'undefined') return createDefaultTetrisModuleRecord();

  try {
    const raw = window.localStorage.getItem(TETRIS_MODULE_STORAGE_KEY);
    if (!raw) return createDefaultTetrisModuleRecord();
    return normalizeTetrisModuleRecord(JSON.parse(raw));
  } catch {
    return createDefaultTetrisModuleRecord();
  }
}

export function saveTetrisModuleRecord(record: TetrisModuleRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TETRIS_MODULE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore persistence failures and keep gameplay unaffected.
  }
}

function isTerminalStatus(status: TetrisBoardState['status']): status is 'dead' | 'finished' {
  return status === 'dead' || status === 'finished';
}

export function applyTetrisRunResult(
  current: TetrisModuleRecord,
  state: Pick<TetrisBoardState, 'mode' | 'status' | 'score' | 'linesCleared' | 'elapsedMs' | 'level'>,
  nowIso: string = new Date().toISOString(),
): TetrisRunRecordUpdate {
  if (!isTerminalStatus(state.status)) {
    return {
      nextRecord: current,
      isBestScore: false,
      isBestLines: false,
      isBestLevel: false,
      isBestSprint: false,
      isBestUltra: false,
    };
  }

  const isBestScore = state.score > current.stats.bestScore;
  const isBestLines = state.linesCleared > current.stats.bestLines;
  const isBestLevel = state.level > current.stats.maxLevelReached;
  const isBestSprint =
    state.mode === 'sprint' &&
    state.status === 'finished' &&
    (current.stats.sprintBestMs === null || state.elapsedMs < current.stats.sprintBestMs);
  const isBestUltra = state.mode === 'ultra' && state.score > current.stats.ultraBestScore;

  const nextRecord: TetrisModuleRecord = {
    version: TETRIS_MODULE_STORAGE_VERSION,
    stats: {
      totalRuns: current.stats.totalRuns + 1,
      bestScore: isBestScore ? state.score : current.stats.bestScore,
      bestLines: isBestLines ? state.linesCleared : current.stats.bestLines,
      maxLevelReached: isBestLevel ? state.level : current.stats.maxLevelReached,
      sprintBestMs: isBestSprint ? state.elapsedMs : current.stats.sprintBestMs,
      ultraBestScore: isBestUltra ? state.score : current.stats.ultraBestScore,
      lastPlayedAt: nowIso,
    },
  };

  return {
    nextRecord,
    isBestScore,
    isBestLines,
    isBestLevel,
    isBestSprint,
    isBestUltra,
  };
}

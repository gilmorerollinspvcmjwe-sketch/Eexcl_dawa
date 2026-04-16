/* 2048 轻存档：负责基础统计和当前局快照。 */

export interface Game2048Stats {
  bestScore: number;
  bestTile: number;
  totalRuns: number;
  totalWins: number;
}

export interface Game2048Record {
  version: 1;
  stats: Game2048Stats;
  activeRun: Record<string, unknown> | null;
}

export const GAME2048_STORAGE_KEY = 'excel-arcade-2048-v1';

export function createEmptyGame2048Record(): Game2048Record {
  return {
    version: 1,
    stats: {
      bestScore: 0,
      bestTile: 0,
      totalRuns: 0,
      totalWins: 0,
    },
    activeRun: null,
  };
}

// 清洗外部读回的 2048 轻存档数据。
export function normalizeGame2048Record(value: unknown): Game2048Record {
  if (!value || typeof value !== 'object') return createEmptyGame2048Record();
  const record = value as Partial<Game2048Record>;
  if (record.version !== 1) return createEmptyGame2048Record();
  return {
    version: 1,
    stats: {
      bestScore: Math.max(0, Math.floor(record.stats?.bestScore ?? 0)),
      bestTile: Math.max(0, Math.floor(record.stats?.bestTile ?? 0)),
      totalRuns: Math.max(0, Math.floor(record.stats?.totalRuns ?? 0)),
      totalWins: Math.max(0, Math.floor(record.stats?.totalWins ?? 0)),
    },
    activeRun: record.activeRun ?? null,
  };
}

// 读取 2048 轻存档，失败时回退到默认值。
export function readGame2048Record(storage: Storage | undefined): Game2048Record {
  if (!storage) return createEmptyGame2048Record();
  try {
    const raw = storage.getItem(GAME2048_STORAGE_KEY);
    if (!raw) return createEmptyGame2048Record();
    return normalizeGame2048Record(JSON.parse(raw));
  } catch {
    return createEmptyGame2048Record();
  }
}

// 写入 2048 轻存档。
export function writeGame2048Record(storage: Storage | undefined, record: Game2048Record): void {
  if (!storage) return;
  try {
    storage.setItem(GAME2048_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // 忽略本地写入失败，避免阻断主流程。
  }
}

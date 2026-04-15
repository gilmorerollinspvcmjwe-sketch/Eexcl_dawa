/* 吃豆人存档系统。负责存档字段定义、读写与持久化、进度展示接口。 */

import type { FruitId, PacmanRunResult } from './pacmanTypes.ts';
import { FRUIT_IDS } from './pacmanTypes.ts';
import { getLevelMeta, isSingleLifePack } from './pacmanMapRegistry.ts';

/* 存档版本 */
const STORAGE_VERSION = 3;

/* 存档键名 */
export const STORAGE_KEY = 'pacman_module_storage';

/* 单关卡最佳记录 */
export interface PacmanLevelRecord {
  levelId: string;
  packId: string;
  levelNumber: number;
  bestScore: number;
  bestClearTimeMs: number | null;
  bestGhostsEaten: number;
  bestFruitsCollected: number;
  bestPelletsCollected: number;
  attempts: number;
  completed: boolean;
  firstCompletedAt: number | null;
  lastPlayedAt: number | null;
}

/* 关卡包进度 */
export interface PacmanPackProgress {
  packId: string;
  highestLevel: number;
  totalCompleted: number;
  totalAttempts: number;
  totalScore: number;
  totalGhostsEaten: number;
  totalFruitsCollected: number;
  totalPlayTimeMs: number;
  bestClearTimeByMap: Record<string, number>;
  levelRecords: Record<string, PacmanLevelRecord>;
}

/* 全局统计 */
export interface PacmanGlobalStats {
  bestScore: number;
  highestLevel: number;
  totalRuns: number;
  totalWins: number;
  totalLosses: number;
  totalScore: number;
  totalGhostsEaten: number;
  totalFruitsCollected: number;
  totalPelletsCollected: number;
  totalPlayTimeMs: number;
  oneLifeBestLevel: number;
  oneLifeBestScore: number;
  perfectRuns: number;
  longestSurvivalTimeMs: number;
}

/* 专项练习记录 */
export interface PacmanPracticeRecord {
  practiceId: string;
  attempts: number;
  completions: number;
  bestScore: number;
  bestClearTimeMs: number | null;
  lastPlayedAt: number | null;
  lastCompletedAt: number | null;
}

/* 模式包完成摘要 */
export interface PacmanModeCompletionRecord {
  packId: string;
  completedLevels: number;
  completedRuns: number;
  bestScore: number;
  bestClearTimeMs: number | null;
  lastCompletedAt: number | null;
}

/* 一命挑战专属记录 */
export interface PacmanOneLifeRuns {
  bestLevel: number;
  bestScore: number;
  totalAttempts: number;
  totalWins: number;
  lastReachedLevel: number;
}

/* 模块存档结构 */
export interface PacmanModuleStorage {
  version: number;
  globalStats: PacmanGlobalStats;
  packProgress: Record<string, PacmanPackProgress>;
  practiceRecords: Record<string, PacmanPracticeRecord>;
  fruitsCollectedByType: Record<FruitId, number>;
  modeCompletion: Record<string, PacmanModeCompletionRecord>;
  oneLifeRuns: PacmanOneLifeRuns;
  lastPlayedPackId: string;
  lastPlayedLevel: number;
  createdAt: number;
  updatedAt: number;
}

/* 创建默认存档 */
export function createDefaultStorage(): PacmanModuleStorage {
  return {
    version: STORAGE_VERSION,
    globalStats: {
      bestScore: 0,
      highestLevel: 0,
      totalRuns: 0,
      totalWins: 0,
      totalLosses: 0,
      totalScore: 0,
      totalGhostsEaten: 0,
      totalFruitsCollected: 0,
      totalPelletsCollected: 0,
      totalPlayTimeMs: 0,
      oneLifeBestLevel: 0,
      oneLifeBestScore: 0,
      perfectRuns: 0,
      longestSurvivalTimeMs: 0,
    },
    packProgress: {
      arcade: createDefaultPackProgress('arcade'),
      tutorial: createDefaultPackProgress('tutorial'),
      fruit_rush: createDefaultPackProgress('fruit_rush'),
      one_life: createDefaultPackProgress('one_life'),
    },
    practiceRecords: {},
    fruitsCollectedByType: createDefaultFruitTotals(),
    modeCompletion: {
      arcade: createDefaultModeCompletion('arcade'),
      tutorial: createDefaultModeCompletion('tutorial'),
      fruit_rush: createDefaultModeCompletion('fruit_rush'),
      one_life: createDefaultModeCompletion('one_life'),
    },
    oneLifeRuns: createDefaultOneLifeRuns(),
    lastPlayedPackId: 'arcade',
    lastPlayedLevel: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* 创建默认关卡包进度 */
function createDefaultPackProgress(packId: string): PacmanPackProgress {
  return {
    packId,
    highestLevel: 0,
    totalCompleted: 0,
    totalAttempts: 0,
    totalScore: 0,
    totalGhostsEaten: 0,
    totalFruitsCollected: 0,
    totalPlayTimeMs: 0,
    bestClearTimeByMap: {},
    levelRecords: {},
  };
}

/* 创建默认关卡记录 */
function createDefaultLevelRecord(levelId: string, packId: string, levelNumber: number): PacmanLevelRecord {
  return {
    levelId,
    packId,
    levelNumber,
    bestScore: 0,
    bestClearTimeMs: null,
    bestGhostsEaten: 0,
    bestFruitsCollected: 0,
    bestPelletsCollected: 0,
    attempts: 0,
    completed: false,
    firstCompletedAt: null,
    lastPlayedAt: null,
  };
}

/* 创建默认专项练习记录 */
function createDefaultPracticeRecord(practiceId: string): PacmanPracticeRecord {
  return {
    practiceId,
    attempts: 0,
    completions: 0,
    bestScore: 0,
    bestClearTimeMs: null,
    lastPlayedAt: null,
    lastCompletedAt: null,
  };
}

/* 创建默认水果分型统计。 */
function createDefaultFruitTotals(): Record<FruitId, number> {
  return FRUIT_IDS.reduce<Record<FruitId, number>>((totals, fruitId) => {
    totals[fruitId] = 0;
    return totals;
  }, {} as Record<FruitId, number>);
}

/* 创建默认模式完成摘要。 */
function createDefaultModeCompletion(packId: string): PacmanModeCompletionRecord {
  return {
    packId,
    completedLevels: 0,
    completedRuns: 0,
    bestScore: 0,
    bestClearTimeMs: null,
    lastCompletedAt: null,
  };
}

/* 创建默认一命模式记录。 */
function createDefaultOneLifeRuns(): PacmanOneLifeRuns {
  return {
    bestLevel: 0,
    bestScore: 0,
    totalAttempts: 0,
    totalWins: 0,
    lastReachedLevel: 0,
  };
}

/* 统一补齐新版存档缺失字段，兼容旧快照。 */
function normalizeStorage(storage: PacmanModuleStorage): PacmanModuleStorage {
  const defaults = createDefaultStorage();
  const nextPackProgress: Record<string, PacmanPackProgress> = {
    ...defaults.packProgress,
    ...(storage.packProgress || {}),
  };
  const nextModeCompletion: Record<string, PacmanModeCompletionRecord> = {
    ...defaults.modeCompletion,
    ...(storage.modeCompletion || {}),
  };

  return {
    ...defaults,
    ...storage,
    globalStats: {
      ...defaults.globalStats,
      ...(storage.globalStats || {}),
    },
    packProgress: nextPackProgress,
    practiceRecords: {
      ...(storage.practiceRecords || {}),
    },
    fruitsCollectedByType: {
      ...defaults.fruitsCollectedByType,
      ...(storage.fruitsCollectedByType || {}),
    },
    modeCompletion: nextModeCompletion,
    oneLifeRuns: {
      ...defaults.oneLifeRuns,
      ...(storage.oneLifeRuns || {}),
    },
  };
}

/* 读取存档 */
export function loadStorage(): PacmanModuleStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultStorage();

    const parsed = JSON.parse(raw) as PacmanModuleStorage;

    if (parsed.version !== STORAGE_VERSION) {
      return migrateStorage(parsed);
    }

    return normalizeStorage(parsed);
  } catch {
    return createDefaultStorage();
  }
}

/* 保存存档 */
export function saveStorage(storage: PacmanModuleStorage): void {
  storage.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.warn('吃豆人存档保存失败:', e);
  }
}

/* 存档迁移（版本升级） */
function migrateStorage(oldStorage: unknown): PacmanModuleStorage {
  const defaultStorage = createDefaultStorage();

  if (typeof oldStorage === 'object' && oldStorage !== null) {
    const old = oldStorage as Record<string, unknown>;

    if (old.globalStats && typeof old.globalStats === 'object') {
      const oldStats = old.globalStats as Record<string, unknown>;
      defaultStorage.globalStats = {
        bestScore: Number(oldStats.bestScore) || 0,
        highestLevel: Number(oldStats.highestLevel) || 0,
        totalRuns: Number(oldStats.totalRuns) || 0,
        totalWins: Number(oldStats.totalWins) || 0,
        totalLosses: Number(oldStats.totalLosses) || 0,
        totalScore: Number(oldStats.totalScore) || 0,
        totalGhostsEaten: Number(oldStats.totalGhostsEaten) || 0,
        totalFruitsCollected: Number(oldStats.totalFruitsCollected) || 0,
        totalPelletsCollected: Number(oldStats.totalPelletsCollected) || 0,
        totalPlayTimeMs: Number(oldStats.totalPlayTimeMs) || 0,
        oneLifeBestLevel: Number(oldStats.oneLifeBestLevel) || 0,
        oneLifeBestScore: Number(oldStats.oneLifeBestScore) || 0,
        perfectRuns: Number(oldStats.perfectRuns) || 0,
        longestSurvivalTimeMs: Number(oldStats.longestSurvivalTimeMs) || 0,
      };
    }

    if (old.lastPlayedPackId && typeof old.lastPlayedPackId === 'string') {
      defaultStorage.lastPlayedPackId = old.lastPlayedPackId;
    }
    if (old.lastPlayedLevel && typeof old.lastPlayedLevel === 'number') {
      defaultStorage.lastPlayedLevel = old.lastPlayedLevel;
    }

    if (old.packProgress && typeof old.packProgress === 'object') {
      defaultStorage.packProgress = {
        ...defaultStorage.packProgress,
        ...(old.packProgress as Record<string, PacmanPackProgress>),
      };
    }

    if (old.practiceRecords && typeof old.practiceRecords === 'object') {
      defaultStorage.practiceRecords = old.practiceRecords as Record<string, PacmanPracticeRecord>;
    }

    if (old.fruitsCollectedByType && typeof old.fruitsCollectedByType === 'object') {
      defaultStorage.fruitsCollectedByType = {
        ...defaultStorage.fruitsCollectedByType,
        ...(old.fruitsCollectedByType as Record<FruitId, number>),
      };
    }

    if (old.modeCompletion && typeof old.modeCompletion === 'object') {
      defaultStorage.modeCompletion = {
        ...defaultStorage.modeCompletion,
        ...(old.modeCompletion as Record<string, PacmanModeCompletionRecord>),
      };
    }

    if (old.oneLifeRuns && typeof old.oneLifeRuns === 'object') {
      defaultStorage.oneLifeRuns = {
        ...defaultStorage.oneLifeRuns,
        ...(old.oneLifeRuns as PacmanOneLifeRuns),
      };
    }
  }

  return normalizeStorage(defaultStorage);
}

/* 清除存档 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('吃豆人存档清除失败:', e);
  }
}

/* 记录游戏结果 */
export function recordRunResult(
  storage: PacmanModuleStorage,
  packId: string,
  levelNumber: number,
  result: PacmanRunResult,
  clearTimeMs: number,
  livesRemaining: number
): PacmanModuleStorage {
  const newStorage = normalizeStorage({
    ...storage,
    globalStats: { ...storage.globalStats },
    packProgress: { ...storage.packProgress },
    practiceRecords: { ...storage.practiceRecords },
    fruitsCollectedByType: { ...storage.fruitsCollectedByType },
    modeCompletion: { ...storage.modeCompletion },
    oneLifeRuns: { ...storage.oneLifeRuns },
  });
  const levelId = `${packId}_${levelNumber}`;
  const levelMeta = getLevelMeta(packId, levelNumber);

  if (!newStorage.packProgress[packId]) {
    newStorage.packProgress[packId] = createDefaultPackProgress(packId);
  }

  const packProgress = { ...newStorage.packProgress[packId] };
  const levelRecord = packProgress.levelRecords[levelId] ||
    createDefaultLevelRecord(levelId, packId, levelNumber);

  const newLevelRecord = { ...levelRecord };
  newLevelRecord.attempts += 1;
  newLevelRecord.lastPlayedAt = Date.now();
  const wasCompleted = newLevelRecord.completed;

  if (result.isNewBestScore || result.score > newLevelRecord.bestScore) {
    newLevelRecord.bestScore = result.score;
  }

  if (result.ghostsEaten > newLevelRecord.bestGhostsEaten) {
    newLevelRecord.bestGhostsEaten = result.ghostsEaten;
  }

  if (result.fruitsCollected > newLevelRecord.bestFruitsCollected) {
    newLevelRecord.bestFruitsCollected = result.fruitsCollected;
  }

  if (result.pelletsCollected > newLevelRecord.bestPelletsCollected) {
    newLevelRecord.bestPelletsCollected = result.pelletsCollected;
  }

  const isWin = livesRemaining > 0 || result.pelletsCollected >= 244;
  if (isWin) {
    newLevelRecord.completed = true;
    if (!newLevelRecord.firstCompletedAt) {
      newLevelRecord.firstCompletedAt = Date.now();
    }

    if (clearTimeMs > 0) {
      if (newLevelRecord.bestClearTimeMs === null || clearTimeMs < newLevelRecord.bestClearTimeMs) {
        newLevelRecord.bestClearTimeMs = clearTimeMs;
      }
      const currentBestByMap = packProgress.bestClearTimeByMap[levelId];
      if (!currentBestByMap || clearTimeMs < currentBestByMap) {
        packProgress.bestClearTimeByMap = {
          ...packProgress.bestClearTimeByMap,
          [levelId]: clearTimeMs,
        };
      }
    }
  }

  packProgress.levelRecords[levelId] = newLevelRecord;
  packProgress.totalAttempts += 1;
  packProgress.totalScore += result.score;
  packProgress.totalGhostsEaten += result.ghostsEaten;
  packProgress.totalFruitsCollected += result.fruitsCollected;
  packProgress.totalPlayTimeMs += clearTimeMs;

  if (isWin && !wasCompleted) {
    packProgress.totalCompleted += 1;
    if (levelNumber > packProgress.highestLevel) {
      packProgress.highestLevel = levelNumber;
    }
  }

  newStorage.packProgress[packId] = packProgress;

  if (result.fruitsCollected > 0 && levelMeta?.fruitId) {
    newStorage.fruitsCollectedByType = {
      ...newStorage.fruitsCollectedByType,
      [levelMeta.fruitId]: (newStorage.fruitsCollectedByType[levelMeta.fruitId] || 0) + result.fruitsCollected,
    };
  }

  const modeCompletion = {
    ...(newStorage.modeCompletion[packId] || createDefaultModeCompletion(packId)),
  };
  if (isWin) {
    modeCompletion.completedRuns += 1;
    modeCompletion.completedLevels = Math.max(modeCompletion.completedLevels, levelNumber);
    modeCompletion.lastCompletedAt = Date.now();
    if (result.score > modeCompletion.bestScore) {
      modeCompletion.bestScore = result.score;
    }
    if (clearTimeMs > 0 && (modeCompletion.bestClearTimeMs === null || clearTimeMs < modeCompletion.bestClearTimeMs)) {
      modeCompletion.bestClearTimeMs = clearTimeMs;
    }
  }
  newStorage.modeCompletion = {
    ...newStorage.modeCompletion,
    [packId]: modeCompletion,
  };

  if (isSingleLifePack(packId)) {
    const nextOneLifeRuns: PacmanOneLifeRuns = {
      ...newStorage.oneLifeRuns,
      totalAttempts: newStorage.oneLifeRuns.totalAttempts + 1,
      lastReachedLevel: Math.max(newStorage.oneLifeRuns.lastReachedLevel, levelNumber),
    };

    if (isWin) {
      nextOneLifeRuns.totalWins += 1;
      nextOneLifeRuns.bestLevel = Math.max(nextOneLifeRuns.bestLevel, levelNumber);
      if (result.score > nextOneLifeRuns.bestScore) {
        nextOneLifeRuns.bestScore = result.score;
      }
    }

    newStorage.oneLifeRuns = nextOneLifeRuns;
  }

  const globalStats = { ...newStorage.globalStats };
  globalStats.totalRuns += 1;
  globalStats.totalScore += result.score;
  globalStats.totalGhostsEaten += result.ghostsEaten;
  globalStats.totalFruitsCollected += result.fruitsCollected;
  globalStats.totalPelletsCollected += result.pelletsCollected;
  globalStats.totalPlayTimeMs += clearTimeMs;

  if (isWin) {
    globalStats.totalWins += 1;
    if (levelNumber > globalStats.highestLevel) {
      globalStats.highestLevel = levelNumber;
    }
  } else {
    globalStats.totalLosses += 1;
  }

  if (result.score > globalStats.bestScore) {
    globalStats.bestScore = result.score;
  }

  if (livesRemaining === 3 && isWin) {
    globalStats.perfectRuns += 1;
  }

  if (clearTimeMs > globalStats.longestSurvivalTimeMs) {
    globalStats.longestSurvivalTimeMs = clearTimeMs;
  }

  if (isSingleLifePack(packId) && isWin) {
    if (levelNumber > globalStats.oneLifeBestLevel) {
      globalStats.oneLifeBestLevel = levelNumber;
    }
    if (result.score > globalStats.oneLifeBestScore) {
      globalStats.oneLifeBestScore = result.score;
    }
  }

  newStorage.globalStats = globalStats;
  newStorage.lastPlayedPackId = packId;
  newStorage.lastPlayedLevel = levelNumber;

  return newStorage;
}

/* 记录专项练习结果，不污染正式关卡进度。 */
export function recordPracticeResult(
  storage: PacmanModuleStorage,
  practiceId: string,
  result: PacmanRunResult,
  completed: boolean,
): PacmanModuleStorage {
  const newStorage = normalizeStorage({ ...storage });
  const existing = newStorage.practiceRecords[practiceId] || createDefaultPracticeRecord(practiceId);
  const nextRecord: PacmanPracticeRecord = {
    ...existing,
    attempts: existing.attempts + 1,
    lastPlayedAt: Date.now(),
  };

  if (result.score > nextRecord.bestScore) {
    nextRecord.bestScore = result.score;
  }

  if (completed) {
    nextRecord.completions += 1;
    nextRecord.lastCompletedAt = Date.now();
    if (result.clearTimeMs > 0 && (nextRecord.bestClearTimeMs === null || result.clearTimeMs < nextRecord.bestClearTimeMs)) {
      nextRecord.bestClearTimeMs = result.clearTimeMs;
    }
  }

  newStorage.practiceRecords = {
    ...newStorage.practiceRecords,
    [practiceId]: nextRecord,
  };

  return newStorage;
}

/* 获取关卡记录 */
export function getLevelRecord(
  storage: PacmanModuleStorage,
  packId: string,
  levelNumber: number
): PacmanLevelRecord | null {
  const packProgress = storage.packProgress[packId];
  if (!packProgress) return null;

  const levelId = `${packId}_${levelNumber}`;
  return packProgress.levelRecords[levelId] || null;
}

/* 获取专项练习记录。 */
export function getPracticeRecord(storage: PacmanModuleStorage, practiceId: string): PacmanPracticeRecord | null {
  return storage.practiceRecords?.[practiceId] || null;
}

/* 获取关卡包进度 */
export function getPackProgress(storage: PacmanModuleStorage, packId: string): PacmanPackProgress | null {
  return storage.packProgress[packId] || null;
}

/* 获取全局统计 */
export function getGlobalStats(storage: PacmanModuleStorage): PacmanGlobalStats {
  return storage.globalStats;
}

/* 检查关卡是否已通关 */
export function isLevelCompleted(storage: PacmanModuleStorage, packId: string, levelNumber: number): boolean {
  const record = getLevelRecord(storage, packId, levelNumber);
  return record?.completed || false;
}

/* 获取关卡包最高通关关卡 */
export function getHighestCompletedLevel(storage: PacmanModuleStorage, packId: string): number {
  const packProgress = storage.packProgress[packId];
  return packProgress?.highestLevel || 0;
}

/* 获取关卡最佳分数 */
export function getLevelBestScore(storage: PacmanModuleStorage, packId: string, levelNumber: number): number {
  const record = getLevelRecord(storage, packId, levelNumber);
  return record?.bestScore || 0;
}

/* 获取关卡最佳用时 */
export function getLevelBestTime(storage: PacmanModuleStorage, packId: string, levelNumber: number): number | null {
  const record = getLevelRecord(storage, packId, levelNumber);
  return record?.bestClearTimeMs || null;
}

/* 进度展示接口 */
export interface PacmanProgressDisplay {
  bestScore: number;
  highestLevel: number;
  totalRuns: number;
  winRate: string;
  averageScore: number;
  totalGhostsEaten: number;
  totalFruitsCollected: number;
  perfectRunRate: string;
  longestSurvivalTime: string;
  arcadeProgress: {
    highestLevel: number;
    totalCompleted: number;
    totalLevels: number;
    completionRate: string;
  };
  tutorialProgress: {
    highestLevel: number;
    totalCompleted: number;
    totalLevels: number;
    completionRate: string;
  };
}

/* 获取进度展示数据 */
export function getProgressDisplay(storage: PacmanModuleStorage): PacmanProgressDisplay {
  const stats = storage.globalStats;
  const arcade = storage.packProgress.arcade || createDefaultPackProgress('arcade');
  const tutorial = storage.packProgress.tutorial || createDefaultPackProgress('tutorial');

  const winRate = stats.totalRuns > 0
    ? `${((stats.totalWins / stats.totalRuns) * 100).toFixed(1)}%`
    : '0%';

  const averageScore = stats.totalRuns > 0
    ? Math.round(stats.totalScore / stats.totalRuns)
    : 0;

  const perfectRunRate = stats.totalWins > 0
    ? `${((stats.perfectRuns / stats.totalWins) * 100).toFixed(1)}%`
    : '0%';

  const longestSurvivalTime = formatTimeMs(stats.longestSurvivalTimeMs);

  const arcadeCompletionRate = arcade.totalAttempts > 0
    ? `${((arcade.totalCompleted / 21) * 100).toFixed(1)}%`
    : '0%';

  const tutorialCompletionRate = tutorial.totalAttempts > 0
    ? `${((tutorial.totalCompleted / 10) * 100).toFixed(1)}%`
    : '0%';

  return {
    bestScore: stats.bestScore,
    highestLevel: stats.highestLevel,
    totalRuns: stats.totalRuns,
    winRate,
    averageScore,
    totalGhostsEaten: stats.totalGhostsEaten,
    totalFruitsCollected: stats.totalFruitsCollected,
    perfectRunRate,
    longestSurvivalTime,
    arcadeProgress: {
      highestLevel: arcade.highestLevel,
      totalCompleted: arcade.totalCompleted,
      totalLevels: 21,
      completionRate: arcadeCompletionRate,
    },
    tutorialProgress: {
      highestLevel: tutorial.highestLevel,
      totalCompleted: tutorial.totalCompleted,
      totalLevels: 10,
      completionRate: tutorialCompletionRate,
    },
  };
}

/* 格式化时间（毫秒转可读格式） */
function formatTimeMs(ms: number): string {
  if (ms <= 0) return '无记录';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
}

/* 关卡进度状态 */
export interface LevelProgressStatus {
  levelNumber: number;
  status: 'completed' | 'available' | 'locked';
  bestScore: number;
  bestTime: string;
  attempts: number;
}

/* 获取关卡包关卡状态列表 */
export function getPackLevelStatuses(
  storage: PacmanModuleStorage,
  packId: string,
  totalLevels: number
): LevelProgressStatus[] {
  const packProgress = storage.packProgress[packId] || createDefaultPackProgress(packId);
  const highestCompleted = packProgress.highestLevel;

  const statuses: LevelProgressStatus[] = [];

  for (let i = 1; i <= totalLevels; i++) {
    const levelId = `${packId}_${i}`;
    const record = packProgress.levelRecords[levelId];

    let status: 'completed' | 'available' | 'locked';
    if (record?.completed) {
      status = 'completed';
    } else if (i <= highestCompleted + 1) {
      status = 'available';
    } else {
      status = 'locked';
    }

    statuses.push({
      levelNumber: i,
      status,
      bestScore: record?.bestScore || 0,
      bestTime: record?.bestClearTimeMs ? formatTimeMs(record.bestClearTimeMs) : '无记录',
      attempts: record?.attempts || 0,
    });
  }

  return statuses;
}

/* 获取存档摘要（用于Hub展示） */
export interface PacmanHubSummary {
  bestScore: number;
  highestLevel: number;
  bestClearTime: string;
  perfectRuns: number;
  totalRuns: number;
}

export function getHubSummary(storage: PacmanModuleStorage): PacmanHubSummary {
  const stats = storage.globalStats;
  const times = Object.values(storage.packProgress)
    .flatMap((packProgress) => Object.values(packProgress.levelRecords))
    .map((record) => record.bestClearTimeMs)
    .filter((time): time is number => typeof time === 'number' && time > 0);

  const bestClearTime = times.length > 0 ? formatTimeMs(Math.min(...times)) : '无记录';

  return {
    bestScore: stats.bestScore,
    highestLevel: stats.highestLevel,
    bestClearTime,
    perfectRuns: stats.perfectRuns,
    totalRuns: stats.totalRuns,
  };
}

/* 设置上次游玩关卡 */
export function setLastPlayedLevel(
  storage: PacmanModuleStorage,
  packId: string,
  levelNumber: number
): PacmanModuleStorage {
  return {
    ...storage,
    lastPlayedPackId: packId,
    lastPlayedLevel: levelNumber,
  };
}

/* 获取上次游玩关卡 */
export function getLastPlayedLevel(storage: PacmanModuleStorage): { packId: string; levelNumber: number } {
  return {
    packId: storage.lastPlayedPackId,
    levelNumber: storage.lastPlayedLevel,
  };
}

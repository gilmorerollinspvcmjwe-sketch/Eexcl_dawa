/* 三消存档系统。管理通关进度、星级记录、最佳分数等数据的持久化存储。 */

import type { Match3Result } from './match3Types';
import { getAllLevels, getLevelById, getPackById, getLevelsByPack, getPackProgress, MATCH3_LEVEL_PACKS } from './match3LevelCatalog.ts';

const STORAGE_KEY = 'match3-progress';

export interface Match3LevelRecord {
  levelId: string;
  bestScore: number;
  bestStars: number;
  attempts: number;
  firstCompletedAt?: number;
  lastPlayedAt?: number;
  bestCombo: number;
  bestMovesUsed: number;
}

export interface Match3ProgressData {
  completedLevelIds: string[];
  levelStars: Record<string, number>;
  bestScoreByLevel: Record<string, number>;
  levelRecords: Record<string, Match3LevelRecord>;
  totalStars: number;
  totalCompleted: number;
  totalAttempts: number;
  lastPlayedLevelId?: string;
  lastPlayedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Match3ProgressSummary {
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  maxStars: number;
  completionPercent: number;
  starPercent: number;
  bestScore: number;
  totalAttempts: number;
  lastPlayedLevel?: string;
  lastPlayedAt?: number;
}

export interface Match3PackProgressSummary {
  packId: string;
  packName: string;
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  maxStars: number;
  completionPercent: number;
  starPercent: number;
  isCompleted: boolean;
  isStarted: boolean;
}

function createDefaultProgress(): Match3ProgressData {
  return {
    completedLevelIds: [],
    levelStars: {},
    bestScoreByLevel: {},
    levelRecords: {},
    totalStars: 0,
    totalCompleted: 0,
    totalAttempts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadProgressFromStorage(): Match3ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Match3ProgressData;
      return validateAndRepairProgress(parsed);
    }
  } catch (error) {
    console.warn('读取三消存档失败，将创建新存档:', error);
  }
  return createDefaultProgress();
}

function validateAndRepairProgress(data: Match3ProgressData): Match3ProgressData {
  const repaired: Match3ProgressData = {
    completedLevelIds: Array.isArray(data.completedLevelIds) ? data.completedLevelIds : [],
    levelStars: data.levelStars && typeof data.levelStars === 'object' ? data.levelStars : {},
    bestScoreByLevel: data.bestScoreByLevel && typeof data.bestScoreByLevel === 'object' ? data.bestScoreByLevel : {},
    levelRecords: data.levelRecords && typeof data.levelRecords === 'object' ? data.levelRecords : {},
    totalStars: typeof data.totalStars === 'number' ? data.totalStars : 0,
    totalCompleted: typeof data.totalCompleted === 'number' ? data.totalCompleted : 0,
    totalAttempts: typeof data.totalAttempts === 'number' ? data.totalAttempts : 0,
    lastPlayedLevelId: data.lastPlayedLevelId,
    lastPlayedAt: data.lastPlayedAt,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
  };

  const validLevelIds = getAllLevels().map((l) => l.id);
  repaired.completedLevelIds = repaired.completedLevelIds.filter((id) => validLevelIds.includes(id));

  for (const levelId of Object.keys(repaired.levelStars)) {
    if (!validLevelIds.includes(levelId)) {
      delete repaired.levelStars[levelId];
    }
  }

  for (const levelId of Object.keys(repaired.bestScoreByLevel)) {
    if (!validLevelIds.includes(levelId)) {
      delete repaired.bestScoreByLevel[levelId];
    }
  }

  for (const levelId of Object.keys(repaired.levelRecords)) {
    if (!validLevelIds.includes(levelId)) {
      delete repaired.levelRecords[levelId];
    }
  }

  repaired.totalStars = Object.values(repaired.levelStars).reduce((sum, stars) => sum + stars, 0);
  repaired.totalCompleted = repaired.completedLevelIds.length;

  return repaired;
}

function saveProgressToStorage(data: Match3ProgressData): void {
  try {
    data.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('保存三消存档失败:', error);
  }
}

let cachedProgress: Match3ProgressData | null = null;

export function getProgress(): Match3ProgressData {
  if (!cachedProgress) {
    cachedProgress = loadProgressFromStorage();
  }
  return cachedProgress;
}

export function saveProgress(data: Match3ProgressData): void {
  cachedProgress = data;
  saveProgressToStorage(data);
}

export function resetProgress(): Match3ProgressData {
  const newProgress = createDefaultProgress();
  cachedProgress = newProgress;
  saveProgressToStorage(newProgress);
  return newProgress;
}

export function recordLevelPlay(levelId: string): void {
  const progress = getProgress();
  progress.lastPlayedLevelId = levelId;
  progress.lastPlayedAt = Date.now();
  progress.totalAttempts++;

  const existingRecord = progress.levelRecords[levelId];
  if (existingRecord) {
    existingRecord.lastPlayedAt = Date.now();
    existingRecord.attempts++;
  } else {
    progress.levelRecords[levelId] = {
      levelId,
      bestScore: 0,
      bestStars: 0,
      attempts: 1,
      lastPlayedAt: Date.now(),
      bestCombo: 0,
      bestMovesUsed: 0,
    };
  }

  saveProgress(progress);
}

export function recordLevelResult(levelId: string, result: Match3Result): void {
  const progress = getProgress();

  if (!progress.levelRecords[levelId]) {
    progress.levelRecords[levelId] = {
      levelId,
      bestScore: 0,
      bestStars: 0,
      attempts: 0,
      bestCombo: 0,
      bestMovesUsed: 0,
    };
  }

  const record = progress.levelRecords[levelId];
  record.attempts++;
  record.lastPlayedAt = Date.now();

  if (result.score > record.bestScore) {
    record.bestScore = result.score;
    progress.bestScoreByLevel[levelId] = result.score;
  }

  if (result.stars > record.bestStars) {
    record.bestStars = result.stars;
    progress.levelStars[levelId] = result.stars;
  }

  if (result.maxCombo > record.bestCombo) {
    record.bestCombo = result.maxCombo;
  }

  if (result.movesUsed > 0 && (record.bestMovesUsed === 0 || result.movesUsed < record.bestMovesUsed)) {
    record.bestMovesUsed = result.movesUsed;
  }

  if (result.won && !progress.completedLevelIds.includes(levelId)) {
    progress.completedLevelIds.push(levelId);
    record.firstCompletedAt = Date.now();
    progress.totalCompleted++;
  }

  progress.totalStars = Object.values(progress.levelStars).reduce((sum, stars) => sum + stars, 0);
  progress.lastPlayedLevelId = levelId;
  progress.lastPlayedAt = Date.now();

  saveProgress(progress);
}

export function isLevelCompleted(levelId: string): boolean {
  const progress = getProgress();
  return progress.completedLevelIds.includes(levelId);
}

export function getLevelStars(levelId: string): number {
  const progress = getProgress();
  return progress.levelStars[levelId] ?? 0;
}

export function getLevelBestScore(levelId: string): number {
  const progress = getProgress();
  return progress.bestScoreByLevel[levelId] ?? 0;
}

export function getLevelRecord(levelId: string): Match3LevelRecord | undefined {
  const progress = getProgress();
  return progress.levelRecords[levelId];
}

export function isLevelUnlocked(levelId: string): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;

  if (level.orderInPack === 1) return true;

  const packLevels = getLevelsByPack(level.packId);
  const prevLevelIndex = level.orderInPack - 2;
  if (prevLevelIndex >= 0 && prevLevelIndex < packLevels.length) {
    const prevLevelId = packLevels[prevLevelIndex].id;
    return isLevelCompleted(prevLevelId);
  }

  return false;
}

export function isPackUnlocked(packId: string): boolean {
  const pack = getPackById(packId);
  if (!pack) return false;

  if ((pack as { orderInPack?: number }).orderInPack === 1 || !pack.unlockCondition) return true;

  const progress = getProgress();

  if (pack.unlockCondition.type === 'completePack') {
    const requiredPackId = pack.unlockCondition.packId;
    if (!requiredPackId) return true;
    const requiredPackProgress = getPackProgress(requiredPackId, progress.completedLevelIds);
    return requiredPackProgress.percent === 100;
  }

  if (pack.unlockCondition.type === 'completeLevels') {
    const requiredCount = pack.unlockCondition.levelCount ?? 0;
    return progress.totalCompleted >= requiredCount;
  }

  if (pack.unlockCondition.type === 'totalStars') {
    const requiredStars = pack.unlockCondition.starCount ?? 0;
    return progress.totalStars >= requiredStars;
  }

  return true;
}

export function getProgressSummary(): Match3ProgressSummary {
  const progress = getProgress();
  const allLevels = getAllLevels();
  const totalLevels = allLevels.length;
  const maxStars = totalLevels * 3;

  const bestScore = Object.values(progress.bestScoreByLevel).reduce(
    (max, score) => Math.max(max, score),
    0
  );

  const lastPlayedLevel = progress.lastPlayedLevelId
    ? getLevelById(progress.lastPlayedLevelId)?.name
    : undefined;

  return {
    totalLevels,
    completedLevels: progress.totalCompleted,
    totalStars: progress.totalStars,
    maxStars,
    completionPercent: Math.round((progress.totalCompleted / totalLevels) * 100),
    starPercent: Math.round((progress.totalStars / maxStars) * 100),
    bestScore,
    totalAttempts: progress.totalAttempts,
    lastPlayedLevel,
    lastPlayedAt: progress.lastPlayedAt,
  };
}

export function getPackProgressSummary(packId: string): Match3PackProgressSummary {
  const pack = getPackById(packId);
  if (!pack) {
    return {
      packId,
      packName: '未知',
      totalLevels: 0,
      completedLevels: 0,
      totalStars: 0,
      maxStars: 0,
      completionPercent: 0,
      starPercent: 0,
      isCompleted: false,
      isStarted: false,
    };
  }

  const progress = getProgress();
  const packProgressData = getPackProgress(packId, progress.completedLevelIds);
  const totalStars = pack.levels.reduce((sum, level) => {
    return sum + (progress.levelStars[level.id] ?? 0);
  }, 0);
  const maxStars = pack.levels.length * 3;

  return {
    packId,
    packName: pack.name,
    totalLevels: pack.levels.length,
    completedLevels: packProgressData.completed,
    totalStars,
    maxStars,
    completionPercent: packProgressData.percent,
    starPercent: Math.round((totalStars / maxStars) * 100),
    isCompleted: packProgressData.percent === 100,
    isStarted: packProgressData.completed > 0,
  };
}

export function getAllPackProgressSummaries(): Match3PackProgressSummary[] {
  return MATCH3_LEVEL_PACKS.map((pack) => getPackProgressSummary(pack.id));
}

export function getUnlockedLevels(): string[] {
  return getAllLevels()
    .filter((level) => isLevelUnlocked(level.id))
    .map((level) => level.id);
}

export function getCompletedLevels(): string[] {
  const progress = getProgress();
  return [...progress.completedLevelIds];
}

export function getLevelsByStarCount(minStars: number): string[] {
  const progress = getProgress();
  return Object.entries(progress.levelStars)
    .filter(([, stars]) => stars >= minStars)
    .map(([levelId]) => levelId);
}

export function getPerfectLevels(): string[] {
  return getLevelsByStarCount(3);
}

export function getRecentPlayedLevels(limit: number = 10): Match3LevelRecord[] {
  const progress = getProgress();
  const records = Object.values(progress.levelRecords);

  return records
    .filter((r) => r.lastPlayedAt)
    .sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0))
    .slice(0, limit);
}

export function getRecommendedNextLevel(): string | undefined {
  const allLevels = getAllLevels();
  const progress = getProgress();

  for (const level of allLevels) {
    if (!progress.completedLevelIds.includes(level.id) && isLevelUnlocked(level.id)) {
      return level.id;
    }
  }

  return undefined;
}

export function exportProgress(): string {
  const progress = getProgress();
  return JSON.stringify(progress, null, 2);
}

export function importProgress(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData) as Match3ProgressData;
    const validated = validateAndRepairProgress(parsed);
    cachedProgress = validated;
    saveProgressToStorage(validated);
    return true;
  } catch (error) {
    console.warn('导入三消存档失败:', error);
    return false;
  }
}

export function getProgressStats(): {
  averageStars: number;
  averageScore: number;
  averageAttempts: number;
  perfectRate: number;
  completionRate: number;
} {
  const progress = getProgress();
  const allLevels = getAllLevels();

  const completedRecords = Object.values(progress.levelRecords).filter((r) =>
    progress.completedLevelIds.includes(r.levelId)
  );

  const averageStars =
    completedRecords.length > 0
      ? completedRecords.reduce((sum, r) => sum + r.bestStars, 0) / completedRecords.length
      : 0;

  const averageScore =
    completedRecords.length > 0
      ? completedRecords.reduce((sum, r) => sum + r.bestScore, 0) / completedRecords.length
      : 0;

  const averageAttempts =
    Object.keys(progress.levelRecords).length > 0
      ? Object.values(progress.levelRecords).reduce((sum, r) => sum + r.attempts, 0) /
        Object.keys(progress.levelRecords).length
      : 0;

  const perfectCount = Object.values(progress.levelStars).filter((stars) => stars === 3).length;
  const perfectRate = progress.totalCompleted > 0 ? perfectCount / progress.totalCompleted : 0;

  const completionRate = allLevels.length > 0 ? progress.totalCompleted / allLevels.length : 0;

  return {
    averageStars: Math.round(averageStars * 10) / 10,
    averageScore: Math.round(averageScore),
    averageAttempts: Math.round(averageAttempts * 10) / 10,
    perfectRate: Math.round(perfectRate * 100),
    completionRate: Math.round(completionRate * 100),
  };
}
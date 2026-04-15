/* 祖玛模块存档系统。管理通关进度、章节完成度、无尽波段和练习记录的持久化与读取。 */

import type { ZumaEndReason, ZumaLevelMode } from './zumaTypes.ts';

const ZUMA_PROGRESS_STORAGE_KEY = 'zuma-progress-v2';

const ZUMA_CHAPTER_TOTALS = {
  temple: 12,
  advanced: 16,
  pressure: 17,
} as const;

type ZumaChapterId = keyof typeof ZUMA_CHAPTER_TOTALS;

export interface ZumaLevelRecord {
  levelId: string;
  mode: ZumaLevelMode;
  cleared: boolean;
  bestScore: number;
  bestChainLevel: number;
  bestAccuracy: number;
  bestTimeMs: number;
  totalAttempts: number;
  totalWins: number;
  lastPlayedAt: number;
}

export interface ZumaTimedRecord {
  durationMinutes: number;
  trackId: string;
  bestScore: number;
  bestChainLevel: number;
  bestAccuracy: number;
  totalAttempts: number;
  lastPlayedAt: number;
}

export interface ZumaPracticeRecord {
  practiceTag: string;
  totalSessions: number;
  bestScore: number;
  lastPlayedAt: number;
}

export interface ZumaChapterCompletionRecord {
  cleared: number;
  total: number;
}

export interface ZumaFailReasonRecord {
  levelId: string;
  mode: ZumaLevelMode;
  reason: ZumaEndReason;
  waveReached: number;
  recordedAt: number;
}

export interface ZumaProgressData {
  version: string;
  lastUpdatedAt: number;
  clearedLevels: string[];
  levelRecords: Record<string, ZumaLevelRecord>;
  timedRecords: Record<string, ZumaTimedRecord>;
  practiceRecords: Record<string, ZumaPracticeRecord>;
  totalPlayTimeMs: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  globalBestScore: number;
  globalBestChainLevel: number;
  endlessBestWave: number;
  chapterCompletion: Record<ZumaChapterId, ZumaChapterCompletionRecord>;
  recentFailReasons: ZumaFailReasonRecord[];
  preferredMode: ZumaLevelMode | null;
}

function createEmptyProgressData(): ZumaProgressData {
  return {
    version: '2.0',
    lastUpdatedAt: Date.now(),
    clearedLevels: [],
    levelRecords: {},
    timedRecords: {},
    practiceRecords: {},
    totalPlayTimeMs: 0,
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    globalBestScore: 0,
    globalBestChainLevel: 0,
    endlessBestWave: 0,
    chapterCompletion: {
      temple: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.temple },
      advanced: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.advanced },
      pressure: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.pressure },
    },
    recentFailReasons: [],
    preferredMode: null,
  };
}

function resolveChapterId(levelId: string): ZumaChapterId | null {
  const match = levelId.match(/^zuma-adventure-(\d{3})$/);
  if (!match) {
    return null;
  }

  const levelNumber = Number(match[1]);
  if (levelNumber >= 1 && levelNumber <= 12) {
    return 'temple';
  }
  if (levelNumber >= 13 && levelNumber <= 28) {
    return 'advanced';
  }
  if (levelNumber >= 29 && levelNumber <= 45) {
    return 'pressure';
  }
  return null;
}

function createChapterCompletionSnapshot(clearedLevels: string[]): Record<ZumaChapterId, ZumaChapterCompletionRecord> {
  const snapshot: Record<ZumaChapterId, ZumaChapterCompletionRecord> = {
    temple: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.temple },
    advanced: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.advanced },
    pressure: { cleared: 0, total: ZUMA_CHAPTER_TOTALS.pressure },
  };

  for (const levelId of clearedLevels) {
    const chapterId = resolveChapterId(levelId);
    if (chapterId) {
      snapshot[chapterId].cleared += 1;
    }
  }

  return snapshot;
}

function loadRawProgressData(): string | null {
  try {
    return localStorage.getItem(ZUMA_PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveRawProgressData(data: string): boolean {
  try {
    localStorage.setItem(ZUMA_PROGRESS_STORAGE_KEY, data);
    return true;
  } catch {
    return false;
  }
}

function parseProgressData(raw: string | null): ZumaProgressData {
  if (!raw) {
    return createEmptyProgressData();
  }
  
  try {
    const parsed = JSON.parse(raw) as ZumaProgressData;
    
    if (!parsed.version || !parsed.clearedLevels) {
      return createEmptyProgressData();
    }
    
    return {
      version: parsed.version || '2.0',
      lastUpdatedAt: parsed.lastUpdatedAt || Date.now(),
      clearedLevels: parsed.clearedLevels || [],
      levelRecords: parsed.levelRecords || {},
      timedRecords: parsed.timedRecords || {},
      practiceRecords: parsed.practiceRecords || {},
      totalPlayTimeMs: parsed.totalPlayTimeMs || 0,
      totalGamesPlayed: parsed.totalGamesPlayed || 0,
      totalGamesWon: parsed.totalGamesWon || 0,
      globalBestScore: parsed.globalBestScore || 0,
      globalBestChainLevel: parsed.globalBestChainLevel || 0,
      endlessBestWave: parsed.endlessBestWave || 0,
      chapterCompletion: parsed.chapterCompletion || createChapterCompletionSnapshot(parsed.clearedLevels || []),
      recentFailReasons: parsed.recentFailReasons || [],
      preferredMode: parsed.preferredMode || null,
    };
  } catch {
    return createEmptyProgressData();
  }
}

let cachedProgressData: ZumaProgressData | null = null;

export function loadZumaProgress(): ZumaProgressData {
  if (cachedProgressData) {
    return cachedProgressData;
  }
  
  const raw = loadRawProgressData();
  cachedProgressData = parseProgressData(raw);
  return cachedProgressData;
}

export function saveZumaProgress(data: ZumaProgressData): boolean {
  const updatedData = {
    ...data,
    lastUpdatedAt: Date.now(),
    chapterCompletion: createChapterCompletionSnapshot(data.clearedLevels),
  };
  
  const raw = JSON.stringify(updatedData);
  const success = saveRawProgressData(raw);
  
  if (success) {
    cachedProgressData = updatedData;
  }
  
  return success;
}

export function resetZumaProgress(): boolean {
  const emptyData = createEmptyProgressData();
  return saveZumaProgress(emptyData);
}

export function clearZumaProgressCache(): void {
  cachedProgressData = null;
}

export interface ZumaGameResult {
  levelId: string;
  mode: ZumaLevelMode;
  won: boolean;
  score: number;
  chainLevel: number;
  accuracy: number;
  elapsedMs: number;
  endReason?: ZumaEndReason | null;
  waveReached?: number;
}

export function recordZumaGameResult(result: ZumaGameResult): boolean {
  const progress = loadZumaProgress();
  
  progress.totalGamesPlayed++;
  progress.totalPlayTimeMs += result.elapsedMs;
  
  if (result.won) {
    progress.totalGamesWon++;
    
    if (!progress.clearedLevels.includes(result.levelId)) {
      progress.clearedLevels.push(result.levelId);
    }
  }
  
  if (result.score > progress.globalBestScore) {
    progress.globalBestScore = result.score;
  }
  
  if (result.chainLevel > progress.globalBestChainLevel) {
    progress.globalBestChainLevel = result.chainLevel;
  }

  if (result.mode === 'endless') {
    progress.endlessBestWave = Math.max(progress.endlessBestWave, result.waveReached || 0);
  }

  if (!result.won && result.endReason) {
    progress.recentFailReasons = [
      {
        levelId: result.levelId,
        mode: result.mode,
        reason: result.endReason,
        waveReached: result.waveReached || 0,
        recordedAt: Date.now(),
      },
      ...progress.recentFailReasons,
    ].slice(0, 5);
  }
  
  if (result.mode === 'adventure' || result.mode === 'challenge' || result.mode === 'endless') {
    const existingRecord = progress.levelRecords[result.levelId];
    
    const newRecord: ZumaLevelRecord = {
      levelId: result.levelId,
      mode: result.mode,
      cleared: result.won || (existingRecord?.cleared || false),
      bestScore: Math.max(result.score, existingRecord?.bestScore || 0),
      bestChainLevel: Math.max(result.chainLevel, existingRecord?.bestChainLevel || 0),
      bestAccuracy: Math.max(result.accuracy, existingRecord?.bestAccuracy || 0),
      bestTimeMs: result.won ? Math.min(result.elapsedMs, existingRecord?.bestTimeMs || Infinity) : (existingRecord?.bestTimeMs || 0),
      totalAttempts: (existingRecord?.totalAttempts || 0) + 1,
      totalWins: (existingRecord?.totalWins || 0) + (result.won ? 1 : 0),
      lastPlayedAt: Date.now(),
    };
    
    progress.levelRecords[result.levelId] = newRecord;
  }
  
  if (result.mode === 'timed') {
    const timedKey = result.levelId;
    const existingTimedRecord = progress.timedRecords[timedKey];
    
    const durationMinutes = result.levelId.includes('3min') ? 3 :
      result.levelId.includes('5min') ? 5 :
      result.levelId.includes('10min') ? 10 : 0;
    
    const trackId = result.levelId.split('-').slice(0, 3).join('-') || '';
    
    const newTimedRecord: ZumaTimedRecord = {
      durationMinutes,
      trackId,
      bestScore: Math.max(result.score, existingTimedRecord?.bestScore || 0),
      bestChainLevel: Math.max(result.chainLevel, existingTimedRecord?.bestChainLevel || 0),
      bestAccuracy: Math.max(result.accuracy, existingTimedRecord?.bestAccuracy || 0),
      totalAttempts: (existingTimedRecord?.totalAttempts || 0) + 1,
      lastPlayedAt: Date.now(),
    };
    
    progress.timedRecords[timedKey] = newTimedRecord;
  }

  progress.chapterCompletion = createChapterCompletionSnapshot(progress.clearedLevels);
  
  updatePreferredMode(progress, result.mode);
  
  return saveZumaProgress(progress);
}

function updatePreferredMode(progress: ZumaProgressData, mode: ZumaLevelMode): void {
  void mode;
  const modeCounts: Record<ZumaLevelMode, number> = {
    adventure: 0,
    timed: 0,
    challenge: 0,
    endless: 0,
    practice: 0,
  };
  
  for (const record of Object.values(progress.levelRecords)) {
    modeCounts[record.mode || 'adventure'] += record.totalAttempts;
  }
  
  for (const record of Object.values(progress.timedRecords)) {
    modeCounts.timed += record.totalAttempts;
  }

  for (const record of Object.values(progress.practiceRecords)) {
    modeCounts.practice += record.totalSessions;
  }
  
  let maxCount = 0;
  let preferredMode: ZumaLevelMode | null = null;
  
  for (const [modeKey, count] of Object.entries(modeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      preferredMode = modeKey as ZumaLevelMode;
    }
  }
  
  progress.preferredMode = preferredMode;
}

export function recordPracticeSession(practiceTag: string, score: number): boolean {
  const progress = loadZumaProgress();
  
  const existingRecord = progress.practiceRecords[practiceTag];
  
  const newRecord: ZumaPracticeRecord = {
    practiceTag,
    totalSessions: (existingRecord?.totalSessions || 0) + 1,
    bestScore: Math.max(score, existingRecord?.bestScore || 0),
    lastPlayedAt: Date.now(),
  };
  
  progress.practiceRecords[practiceTag] = newRecord;
  
  return saveZumaProgress(progress);
}

export function getClearedLevelIds(): string[] {
  const progress = loadZumaProgress();
  return progress.clearedLevels;
}

export function isLevelCleared(levelId: string): boolean {
  const progress = loadZumaProgress();
  return progress.clearedLevels.includes(levelId);
}

export function getLevelRecord(levelId: string): ZumaLevelRecord | undefined {
  const progress = loadZumaProgress();
  return progress.levelRecords[levelId];
}

export function getBestScoreByLevel(levelId: string): number {
  const record = getLevelRecord(levelId);
  return record?.bestScore || 0;
}

export function getBestChainByLevel(levelId: string): number {
  const record = getLevelRecord(levelId);
  return record?.bestChainLevel || 0;
}

export function getBestAccuracyByLevel(levelId: string): number {
  const record = getLevelRecord(levelId);
  return record?.bestAccuracy || 0;
}

export function getBestTimeByLevel(levelId: string): number {
  const record = getLevelRecord(levelId);
  return record?.bestTimeMs || 0;
}

export function getTimedRecord(levelId: string): ZumaTimedRecord | undefined {
  const progress = loadZumaProgress();
  return progress.timedRecords[levelId];
}

export function getBestTimedScore(durationMinutes: number): number {
  void durationMinutes;
  const progress = loadZumaProgress();
  
  let bestScore = 0;
  for (const record of Object.values(progress.timedRecords)) {
    if (record.bestScore > bestScore) {
      bestScore = record.bestScore;
    }
  }
  
  return bestScore;
}

export function getPracticeRecord(practiceTag: string): ZumaPracticeRecord | undefined {
  const progress = loadZumaProgress();
  return progress.practiceRecords[practiceTag];
}

export function getGlobalBestScore(): number {
  const progress = loadZumaProgress();
  return progress.globalBestScore;
}

export function getGlobalBestChainLevel(): number {
  const progress = loadZumaProgress();
  return progress.globalBestChainLevel;
}

export function getTotalGamesPlayed(): number {
  const progress = loadZumaProgress();
  return progress.totalGamesPlayed;
}

export function getTotalGamesWon(): number {
  const progress = loadZumaProgress();
  return progress.totalGamesWon;
}

export function getTotalPlayTimeMs(): number {
  const progress = loadZumaProgress();
  return progress.totalPlayTimeMs;
}

export function getWinRate(): number {
  const total = getTotalGamesPlayed();
  if (total === 0) return 0;
  return getTotalGamesWon() / total;
}

export function getPreferredMode(): ZumaLevelMode | null {
  const progress = loadZumaProgress();
  return progress.preferredMode;
}

export interface ZumaProgressSummary {
  totalCleared: number;
  totalPlayed: number;
  totalWon: number;
  winRate: number;
  globalBestScore: number;
  globalBestChain: number;
  totalPlayTimeMinutes: number;
  preferredMode: string;
  templeProgress: string;
  chainProgress: string;
  pressureProgress: string;
  timedBestScore: number;
  endlessBestWave: number;
  chapterCompletion: Record<ZumaChapterId, ZumaChapterCompletionRecord>;
}

export function getZumaProgressSummary(): ZumaProgressSummary {
  const progress = loadZumaProgress();
  
  const chapterCompletion = createChapterCompletionSnapshot(progress.clearedLevels);
  const templeProgress = `${chapterCompletion.temple.cleared}/${chapterCompletion.temple.total}`;
  const chainProgress = `${chapterCompletion.advanced.cleared}/${chapterCompletion.advanced.total}`;
  const pressureProgress = `${chapterCompletion.pressure.cleared}/${chapterCompletion.pressure.total}`;
  
  let timedBestScore = 0;
  for (const record of Object.values(progress.timedRecords)) {
    if (record.bestScore > timedBestScore) {
      timedBestScore = record.bestScore;
    }
  }
  
  const totalPlayTimeMinutes = Math.floor(progress.totalPlayTimeMs / 60000);
  
  const winRate = progress.totalGamesPlayed > 0 
    ? progress.totalGamesWon / progress.totalGamesPlayed 
    : 0;
  
  return {
    totalCleared: progress.clearedLevels.length,
    totalPlayed: progress.totalGamesPlayed,
    totalWon: progress.totalGamesWon,
    winRate,
    globalBestScore: progress.globalBestScore,
    globalBestChain: progress.globalBestChainLevel,
    totalPlayTimeMinutes,
    preferredMode: progress.preferredMode || '未确定',
    templeProgress,
    chainProgress,
    pressureProgress,
    timedBestScore,
    endlessBestWave: progress.endlessBestWave,
    chapterCompletion,
  };
}

export function getZumaProgressText(): string {
  const summary = getZumaProgressSummary();
  
  return `祖玛进度: 通关 ${summary.totalCleared} 关 | 最佳分数 ${summary.globalBestScore} | 最佳连锁 ${summary.globalBestChain} 层 | 神庙 ${summary.templeProgress} | 进阶 ${summary.chainProgress} | 高压 ${summary.pressureProgress} | 无尽 ${summary.endlessBestWave} 波`;
}

export function getZumaFormulaBarProgressText(): string {
  const summary = getZumaProgressSummary();
  
  if (summary.totalPlayed === 0) {
    return '祖玛: 尚未开始游戏';
  }
  
  return `祖玛: ${summary.totalCleared}关通关 | 最佳${summary.globalBestScore}分 | 连锁${summary.globalBestChain}层 | 胜率${Math.round(summary.winRate * 100)}%`;
}

export function exportZumaProgress(): string {
  const progress = loadZumaProgress();
  return JSON.stringify(progress, null, 2);
}

export function importZumaProgress(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData) as ZumaProgressData;
    
    if (!parsed.version || !parsed.clearedLevels) {
      return false;
    }
    
    return saveZumaProgress(parsed);
  } catch {
    return false;
  }
}

export function getLevelStatsForDisplay(levelId: string): {
  cleared: boolean;
  bestScore: number;
  bestChain: number;
  attempts: number;
  wins: number;
} {
  const progress = loadZumaProgress();
  const record = progress.levelRecords[levelId];
  
  return {
    cleared: progress.clearedLevels.includes(levelId),
    bestScore: record?.bestScore || 0,
    bestChain: record?.bestChainLevel || 0,
    attempts: record?.totalAttempts || 0,
    wins: record?.totalWins || 0,
  };
}

export function getTimedStatsForDisplay(durationMinutes: number): {
  bestScore: number;
  bestChain: number;
  totalAttempts: number;
} {
  const progress = loadZumaProgress();
  
  let bestScore = 0;
  let bestChain = 0;
  let totalAttempts = 0;
  
  for (const [key, record] of Object.entries(progress.timedRecords)) {
    if (key.includes(`${durationMinutes}min`)) {
      bestScore = Math.max(bestScore, record.bestScore);
      bestChain = Math.max(bestChain, record.bestChainLevel);
      totalAttempts += record.totalAttempts;
    }
  }
  
  return {
    bestScore,
    bestChain,
    totalAttempts,
  };
}

export function getPracticeStatsForDisplay(): Record<string, {
  sessions: number;
  bestScore: number;
}> {
  const progress = loadZumaProgress();
  
  const result: Record<string, { sessions: number; bestScore: number }> = {};
  
  for (const [tag, record] of Object.entries(progress.practiceRecords)) {
    result[tag] = {
      sessions: record.totalSessions,
      bestScore: record.bestScore,
    };
  }
  
  return result;
}

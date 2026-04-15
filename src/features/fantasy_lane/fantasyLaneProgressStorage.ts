import { FANTASY_LANE_CHAPTERS, FANTASY_LANE_LEVELS, getFantasyLaneLevelById, getFantasyLaneLevelsByChapter } from './fantasyLaneLevelCatalog.ts';
import type { FantasyLaneBattleResult } from './fantasyLaneTypes.ts';

const STORAGE_KEY = 'fantasy-lane-progress-v1';

export interface FantasyLaneLevelRecord {
  levelId: string;
  attempts: number;
  completed: boolean;
  bestStars: number;
  bestScore: number;
  bestBaseHpPercent: number;
  completedAt?: number;
  lastPlayedAt?: number;
}

export interface FantasyLaneProgressData {
  completedLevels: string[];
  levelRecords: Record<string, FantasyLaneLevelRecord>;
  totalCompleted: number;
  totalStars: number;
  bestScore: number;
  highestUnlockedLevelId: string;
  highestChapterId: string;
  lastPlayedLevelId: string;
  updatedAt: number;
}

export interface FantasyLaneProgressSummary {
  totalLevels: number;
  completedLevels: number;
  totalStars: number;
  maxStars: number;
  bestScore: number;
  hasStarted: boolean;
  highestUnlockedLevelId: string;
  highestChapterId: string;
  currentChapterLabel: string;
  completionPercent: number;
  starPercent: number;
  lastPlayedLevelId: string;
  lastPlayedLevelName: string;
}

function createInitialProgress(): FantasyLaneProgressData {
  return {
    completedLevels: [],
    levelRecords: {},
    totalCompleted: 0,
    totalStars: 0,
    bestScore: 0,
    highestUnlockedLevelId: '1-1',
    highestChapterId: 'chapter-1',
    lastPlayedLevelId: '1-1',
    updatedAt: Date.now(),
  };
}

function canUseStorage() {
  return typeof localStorage !== 'undefined';
}

function getNextLevelId(levelId: string): string | null {
  const current = FANTASY_LANE_LEVELS.findIndex((level) => level.id === levelId);
  if (current < 0 || current >= FANTASY_LANE_LEVELS.length - 1) return null;
  return FANTASY_LANE_LEVELS[current + 1]?.id ?? null;
}

function normalize(data: Partial<FantasyLaneProgressData> | null | undefined): FantasyLaneProgressData {
  const base = createInitialProgress();
  const levelRecords = data?.levelRecords && typeof data.levelRecords === 'object' ? data.levelRecords : {};
  const validIds = new Set(FANTASY_LANE_LEVELS.map((level) => level.id));
  const completedLevels = Array.isArray(data?.completedLevels) ? data!.completedLevels.filter((levelId) => validIds.has(levelId)) : [];

  const cleanedRecords = Object.fromEntries(
    Object.entries(levelRecords).filter(([levelId]) => validIds.has(levelId)),
  ) as Record<string, FantasyLaneLevelRecord>;

  const totalStars = Object.values(cleanedRecords).reduce((sum, record) => sum + Math.max(0, Math.min(3, record.bestStars || 0)), 0);
  const bestScore = Object.values(cleanedRecords).reduce((max, record) => Math.max(max, record.bestScore || 0), 0);
  const highestUnlockedLevelId =
    data?.highestUnlockedLevelId && validIds.has(data.highestUnlockedLevelId)
      ? data.highestUnlockedLevelId
      : completedLevels.length > 0
        ? getNextLevelId(completedLevels[completedLevels.length - 1]) ?? completedLevels[completedLevels.length - 1]
        : base.highestUnlockedLevelId;
  const highestChapterId = getFantasyLaneLevelById(highestUnlockedLevelId).chapterId;
  const lastPlayedLevelId = data?.lastPlayedLevelId && validIds.has(data.lastPlayedLevelId) ? data.lastPlayedLevelId : highestUnlockedLevelId;

  return {
    ...base,
    ...data,
    completedLevels,
    levelRecords: cleanedRecords,
    totalCompleted: completedLevels.length,
    totalStars,
    bestScore,
    highestUnlockedLevelId,
    highestChapterId,
    lastPlayedLevelId,
    updatedAt: typeof data?.updatedAt === 'number' ? data.updatedAt : Date.now(),
  };
}

export function loadFantasyLaneProgress(): FantasyLaneProgressData {
  if (!canUseStorage()) return createInitialProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return normalize(JSON.parse(raw) as FantasyLaneProgressData);
  } catch {
    return createInitialProgress();
  }
}

export function saveFantasyLaneProgress(progress: FantasyLaneProgressData) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, updatedAt: Date.now() }));
}

export function resetFantasyLaneProgress() {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function recordFantasyLaneLevelStart(levelId: string) {
  const progress = loadFantasyLaneProgress();
  const currentRecord = progress.levelRecords[levelId];
  progress.levelRecords[levelId] = {
    levelId,
    attempts: (currentRecord?.attempts ?? 0) + 1,
    completed: currentRecord?.completed ?? false,
    bestStars: currentRecord?.bestStars ?? 0,
    bestScore: currentRecord?.bestScore ?? 0,
    bestBaseHpPercent: currentRecord?.bestBaseHpPercent ?? 0,
    completedAt: currentRecord?.completedAt,
    lastPlayedAt: Date.now(),
  };
  progress.lastPlayedLevelId = levelId;
  saveFantasyLaneProgress(progress);
  return progress;
}

export function recordFantasyLaneLevelResult(levelId: string, result: FantasyLaneBattleResult, playerBaseHpPercent: number) {
  const progress = loadFantasyLaneProgress();
  const currentRecord = progress.levelRecords[levelId] ?? {
    levelId,
    attempts: 0,
    completed: false,
    bestStars: 0,
    bestScore: 0,
    bestBaseHpPercent: 0,
  };

  const completed = result.title.includes('成功');
  const record: FantasyLaneLevelRecord = {
    ...currentRecord,
    completed: currentRecord.completed || completed,
    bestStars: Math.max(currentRecord.bestStars, result.stars),
    bestScore: Math.max(currentRecord.bestScore, result.score),
    bestBaseHpPercent: Math.max(currentRecord.bestBaseHpPercent, Math.round(playerBaseHpPercent)),
    completedAt: completed ? currentRecord.completedAt ?? Date.now() : currentRecord.completedAt,
    lastPlayedAt: Date.now(),
  };

  progress.levelRecords[levelId] = record;
  progress.lastPlayedLevelId = levelId;

  if (completed && !progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
    progress.completedLevels.sort((left, right) => {
      const leftParts = left.split('-').map(Number);
      const rightParts = right.split('-').map(Number);
      return leftParts[0] === rightParts[0] ? leftParts[1] - rightParts[1] : leftParts[0] - rightParts[0];
    });
  }

  progress.totalCompleted = progress.completedLevels.length;
  progress.totalStars = Object.values(progress.levelRecords).reduce((sum, item) => sum + item.bestStars, 0);
  progress.bestScore = Object.values(progress.levelRecords).reduce((max, item) => Math.max(max, item.bestScore), 0);

  const nextLevelId = completed ? getNextLevelId(levelId) : null;
  progress.highestUnlockedLevelId = nextLevelId ?? progress.highestUnlockedLevelId;
  progress.highestChapterId = getFantasyLaneLevelById(progress.highestUnlockedLevelId).chapterId;

  saveFantasyLaneProgress(progress);
  return progress;
}

export function isFantasyLaneLevelUnlocked(progress: FantasyLaneProgressData, levelId: string) {
  if (levelId === '1-1') return true;
  const level = getFantasyLaneLevelById(levelId);
  if (level.indexInChapter === 1) {
    const previousChapterOrder = Number.parseInt(level.chapterId.replace('chapter-', ''), 10) - 1;
    if (previousChapterOrder <= 0) return true;
    const previousChapterBossId = `${previousChapterOrder}-6`;
    return progress.completedLevels.includes(previousChapterBossId);
  }
  const previousLevelId = `${level.id.split('-')[0]}-${level.indexInChapter - 1}`;
  return progress.completedLevels.includes(previousLevelId);
}

export function getFantasyLaneLevelStatus(progress: FantasyLaneProgressData, levelId: string): 'completed' | 'unlocked' | 'locked' {
  if (progress.completedLevels.includes(levelId)) return 'completed';
  if (isFantasyLaneLevelUnlocked(progress, levelId)) return 'unlocked';
  return 'locked';
}

export function getFantasyLaneChapterProgress(progress: FantasyLaneProgressData, chapterId: string) {
  const levels = getFantasyLaneLevelsByChapter(chapterId);
  const completed = levels.filter((level) => progress.completedLevels.includes(level.id)).length;
  const stars = levels.reduce((sum, level) => sum + (progress.levelRecords[level.id]?.bestStars ?? 0), 0);
  return {
    total: levels.length,
    completed,
    stars,
    maxStars: levels.length * 3,
  };
}

export function getFantasyLaneProgressSummary(progress: FantasyLaneProgressData = loadFantasyLaneProgress()): FantasyLaneProgressSummary {
  const totalLevels = FANTASY_LANE_LEVELS.length;
  const maxStars = totalLevels * 3;
  const highestChapter = FANTASY_LANE_CHAPTERS.find((chapter) => chapter.id === progress.highestChapterId) ?? FANTASY_LANE_CHAPTERS[0];
  const lastPlayedLevel = getFantasyLaneLevelById(progress.lastPlayedLevelId);

  return {
    totalLevels,
    completedLevels: progress.totalCompleted,
    totalStars: progress.totalStars,
    maxStars,
    bestScore: progress.bestScore,
    hasStarted: Object.keys(progress.levelRecords).length > 0,
    highestUnlockedLevelId: progress.highestUnlockedLevelId,
    highestChapterId: progress.highestChapterId,
    currentChapterLabel: highestChapter.name,
    completionPercent: Math.round((progress.totalCompleted / totalLevels) * 100),
    starPercent: Math.round((progress.totalStars / maxStars) * 100),
    lastPlayedLevelId: progress.lastPlayedLevelId,
    lastPlayedLevelName: `${lastPlayedLevel.id} ${lastPlayedLevel.name}`,
  };
}

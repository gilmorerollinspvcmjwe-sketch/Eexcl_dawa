/* PvZ 进度存储层。管理玩家通关进度、解锁状态、关卡记录的持久化。 */
import type { PvZPlantId, PvZZombieId } from './pvzTypes.ts';
import { PVZ_ADVENTURE_LEVELS, PVZ_ADVENTURE_LEVEL_MAP } from './pvzAdventureLevels.ts';
import { PVZ_PLANTS } from './pvzPlantRegistry.ts';
import { PVZ_ZOMBIES } from './pvzZombieRegistry.ts';

const STORAGE_KEY = 'pvz-progress-v1';

export interface PvZLevelRecord {
  levelId: string;
  completed: boolean;
  bestTime?: number;
  usedCards: string[];
  completedAt?: number;
}

export interface PvZProgressData {
  completedLevels: string[];
  highestUnlockedLevel: string;
  levelRecords: Record<string, PvZLevelRecord>;
  unlockedPlants: string[];
  unlockedZombies: string[];
  totalCompleted: number;
  lastPlayedLevel: string;
}

function createInitialProgress(): PvZProgressData {
  return {
    completedLevels: [],
    highestUnlockedLevel: '1-01',
    levelRecords: {},
    unlockedPlants: ['sunflower', 'peashooter'],
    unlockedZombies: ['normal'],
    totalCompleted: 0,
    lastPlayedLevel: '1-01',
  };
}

export function loadProgress(): PvZProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const data = JSON.parse(raw) as Partial<PvZProgressData>;
    return {
      ...createInitialProgress(),
      ...data,
      levelRecords: data.levelRecords ?? {},
    };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(data: PvZProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 不可用时静默失败
  }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function getNextLevelId(currentLevelId: string): string | null {
  const level = PVZ_ADVENTURE_LEVEL_MAP[currentLevelId];
  if (!level) return null;
  const nextNumber = level.levelNumber + 1;
  if (nextNumber > 100) return null;
  const chapterIndex = Math.ceil(nextNumber / 10);
  const levelInChapter = ((nextNumber - 1) % 10) + 1;
  return `${chapterIndex}-${String(levelInChapter).padStart(2, '0')}`;
}

function computeUnlockedPlants(completedLevels: string[]): PvZPlantId[] {
  const unlocked = new Set<PvZPlantId>(['sunflower', 'peashooter']);
  for (const levelId of completedLevels) {
    const level = PVZ_ADVENTURE_LEVEL_MAP[levelId];
    if (level?.unlockPlants) {
      for (const plantId of level.unlockPlants) {
        unlocked.add(plantId);
      }
    }
  }
  return Array.from(unlocked);
}

function computeUnlockedZombies(completedLevels: string[]): PvZZombieId[] {
  const unlocked = new Set<PvZZombieId>(['normal']);
  for (const levelId of completedLevels) {
    const level = PVZ_ADVENTURE_LEVEL_MAP[levelId];
    if (level?.unlockZombies) {
      for (const zombieId of level.unlockZombies) {
        unlocked.add(zombieId);
      }
    }
  }
  return Array.from(unlocked);
}

export function completeLevel(
  progress: PvZProgressData,
  levelId: string,
  record: Omit<PvZLevelRecord, 'levelId' | 'completed' | 'completedAt'>,
): PvZProgressData {
  const nextLevelId = getNextLevelId(levelId);
  const newCompletedLevels = progress.completedLevels.includes(levelId)
    ? progress.completedLevels
    : [...progress.completedLevels, levelId];

  const newHighestUnlocked = nextLevelId ?? progress.highestUnlockedLevel;
  const newUnlockedPlants = computeUnlockedPlants(newCompletedLevels);
  const newUnlockedZombies = computeUnlockedZombies(newCompletedLevels);

  const newLevelRecords = {
    ...progress.levelRecords,
    [levelId]: {
      levelId,
      completed: true,
      bestTime: record.bestTime,
      usedCards: record.usedCards,
      completedAt: Date.now(),
    },
  };

  return {
    completedLevels: newCompletedLevels,
    highestUnlockedLevel: newHighestUnlocked,
    levelRecords: newLevelRecords,
    unlockedPlants: newUnlockedPlants,
    unlockedZombies: newUnlockedZombies,
    totalCompleted: newCompletedLevels.length,
    lastPlayedLevel: levelId,
  };
}

export function isLevelUnlocked(progress: PvZProgressData, levelId: string): boolean {
  if (levelId === '1-01') return true;
  const level = PVZ_ADVENTURE_LEVEL_MAP[levelId];
  if (!level) return false;
  const prevLevelId = level.levelNumber === 1
    ? null
    : (() => {
        const prevNumber = level.levelNumber - 1;
        const chapterIndex = Math.ceil(prevNumber / 10);
        const levelInChapter = ((prevNumber - 1) % 10) + 1;
        return `${chapterIndex}-${String(levelInChapter).padStart(2, '0')}`;
      })();
  if (!prevLevelId) return true;
  return progress.completedLevels.includes(prevLevelId);
}

export function getLevelStatus(
  progress: PvZProgressData,
  levelId: string,
): 'completed' | 'unlocked' | 'locked' {
  if (progress.completedLevels.includes(levelId)) return 'completed';
  if (isLevelUnlocked(progress, levelId)) return 'unlocked';
  return 'locked';
}

export function getPreviousLevelId(levelId: string): string | null {
  const level = PVZ_ADVENTURE_LEVEL_MAP[levelId];
  if (!level || level.levelNumber <= 1) return null;
  const prevNumber = level.levelNumber - 1;
  const chapterIndex = Math.ceil(prevNumber / 10);
  const levelInChapter = ((prevNumber - 1) % 10) + 1;
  return `${chapterIndex}-${String(levelInChapter).padStart(2, '0')}`;
}

export function getNextLevelIdFromProgress(progress: PvZProgressData): string | null {
  return getNextLevelId(progress.highestUnlockedLevel);
}

export function getChapterProgress(progress: PvZProgressData, chapterIndex: number): { completed: number; total: number } {
  const chapterLevels = PVZ_ADVENTURE_LEVELS.filter((l) => l.chapterIndex === chapterIndex);
  const completed = chapterLevels.filter((l) => progress.completedLevels.includes(l.id)).length;
  return { completed, total: chapterLevels.length };
}

export function getPlantUnlockInfo(progress: PvZProgressData): { unlocked: number; total: number } {
  return { unlocked: progress.unlockedPlants.length, total: PVZ_PLANTS.length };
}

export function getZombieUnlockInfo(progress: PvZProgressData): { unlocked: number; total: number } {
  return { unlocked: progress.unlockedZombies.length, total: PVZ_ZOMBIES.length };
}

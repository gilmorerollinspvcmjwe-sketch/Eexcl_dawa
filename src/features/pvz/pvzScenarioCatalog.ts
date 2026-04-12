/* 统一管理 PvZ 的主线、试验和生存场景，供 Sheet7/Sheet9 与战斗初始化共用。 */
import { PVZ_ADVENTURE_LEVELS, getPvZAdventureLevelsByChapterIndex } from './pvzAdventureLevels.ts';
import { getPvZChapterById } from './pvzChapters.ts';
import type {
  PvZChapterId,
  PvZLevelDefinition,
  PvZMode,
  PvZPlantId,
  PvZScenarioFamily,
  PvZScenarioId,
  PvZSpawnEvent,
} from './pvzTypes.ts';

export interface PvZScenarioDefinition {
  id: PvZScenarioId;
  mode: PvZMode;
  family: PvZScenarioFamily;
  chapterId: PvZChapterId;
  chapterIndex?: number;
  levelNumber?: number;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  baseSun?: number;
  waveDurationMs?: number;
  segmentDurationMs?: number;
  defaultCards?: PvZPlantId[];
  spawnQueue?: PvZSpawnEvent[];
  segments?: number;
  sunDrainPerSecond?: number;
  intensity?: PvZLevelDefinition['intensity'];
  availablePlants?: PvZPlantId[];
  recommendedCards?: PvZPlantId[];
  unlockPlants?: PvZPlantId[];
  unlockZombies?: PvZLevelDefinition['unlockZombies'];
  enemyRoster?: PvZLevelDefinition['enemyRoster'];
  isExam?: boolean;
}

function cloneQueue(queue: PvZSpawnEvent[]): PvZSpawnEvent[] {
  return queue.map((event) => ({ ...event }));
}

const ADVENTURE_SCENARIOS: PvZScenarioDefinition[] = PVZ_ADVENTURE_LEVELS.map((level) => ({
  id: level.id,
  mode: 'adventure',
  family: 'mainline',
  chapterId: level.chapterId,
  chapterIndex: level.chapterIndex,
  levelNumber: level.levelNumber,
  title: level.title,
  summary: level.summary,
  objective: level.objective,
  rules: level.rules,
  baseSun: level.baseSun,
  waveDurationMs: level.waveDurationMs,
  segmentDurationMs: level.waveDurationMs,
  defaultCards: level.defaultCards,
  spawnQueue: cloneQueue(level.spawnQueue),
  intensity: level.intensity,
  availablePlants: level.availablePlants,
  recommendedCards: level.recommendedCards,
  unlockPlants: level.unlockPlants,
  unlockZombies: level.unlockZombies,
  enemyRoster: level.enemyRoster,
  isExam: level.isExam,
}));

const LAB_SCENARIOS: PvZScenarioDefinition[] = [
  {
    id: 'lab-night-blackout',
    mode: 'lab',
    family: 'challenge',
    chapterId: 'night',
    title: '洞察试验：夜幕直视',
    summary: '低阳光 + 护盾变速的夜间压缩关。',
    objective: '在 38 秒内顶住夜间护盾与变速混压。',
    rules: ['初始阳光偏低', '优先低费与减速', '火力比防线更早上线'],
    baseSun: 75,
    waveDurationMs: 38_000,
    segmentDurationMs: 38_000,
    sunDrainPerSecond: 0.25,
    defaultCards: ['sunShroom', 'puffShroom', 'snowPea', 'wallnut', 'cherryBomb', 'chomper'],
    spawnQueue: [
      { id: 'lab-night-blackout-1', zombieId: 'normal', row: 1, spawnAtMs: 1800 },
      { id: 'lab-night-blackout-2', zombieId: 'newspaper', row: 3, spawnAtMs: 4300 },
      { id: 'lab-night-blackout-3', zombieId: 'conehead', row: 2, spawnAtMs: 7000 },
      { id: 'lab-night-blackout-4', zombieId: 'screenDoor', row: 0, spawnAtMs: 11200 },
      { id: 'lab-night-blackout-5', zombieId: 'buckethead', row: 4, spawnAtMs: 16800 },
      { id: 'lab-night-blackout-6', zombieId: 'football', row: 2, spawnAtMs: 25200 },
    ],
  },
  {
    id: 'lab-pool-crossfire',
    mode: 'lab',
    family: 'challenge',
    chapterId: 'pool',
    title: '洞察试验：泳池交叉火力',
    summary: '水路与边路同时着火的多线压制关。',
    objective: '在 40 秒内守住中路水线与侧路快攻。',
    rules: ['两侧泳道必须同步布置', '中路优先三线与冰控', '保留至少一张救场卡'],
    baseSun: 150,
    waveDurationMs: 40_000,
    segmentDurationMs: 40_000,
    sunDrainPerSecond: 0.12,
    defaultCards: ['sunflower', 'lilyPad', 'threepeater', 'snowPea', 'wallnut', 'cherryBomb'],
    spawnQueue: [
      { id: 'lab-pool-crossfire-1', zombieId: 'normal', row: 0, spawnAtMs: 1600 },
      { id: 'lab-pool-crossfire-2', zombieId: 'snorkel', row: 2, spawnAtMs: 4400 },
      { id: 'lab-pool-crossfire-3', zombieId: 'buckethead', row: 4, spawnAtMs: 8200 },
      { id: 'lab-pool-crossfire-4', zombieId: 'dolphinRider', row: 1, spawnAtMs: 12600 },
      { id: 'lab-pool-crossfire-5', zombieId: 'football', row: 3, spawnAtMs: 19800 },
      { id: 'lab-pool-crossfire-6', zombieId: 'flag', row: 2, spawnAtMs: 28800 },
    ],
  },
];

const SURVIVAL_SCENARIOS: PvZScenarioDefinition[] = [
  {
    id: 'survival-day-endurance',
    mode: 'survival',
    family: 'survival',
    chapterId: 'day',
    title: '长线生存：昼间耐力',
    summary: '三段式白天耐力赛，逐段提高重甲密度。',
    objective: '坚持完整 3 段耐久，并在段间快速重整卡组思路。',
    rules: ['每段结束后保留场面', '第 3 段出现更多重甲与快攻', '经济位必须能撑全程'],
    baseSun: 175,
    waveDurationMs: 120_000,
    segmentDurationMs: 40_000,
    segments: 3,
    sunDrainPerSecond: 0.1,
    defaultCards: ['twinSunflower', 'repeater', 'snowPea', 'wallnut', 'cherryBomb', 'gatlingPea'],
    spawnQueue: [
      { id: 'survival-day-endurance-1', zombieId: 'normal', row: 0, spawnAtMs: 1500 },
      { id: 'survival-day-endurance-2', zombieId: 'conehead', row: 2, spawnAtMs: 4300 },
      { id: 'survival-day-endurance-3', zombieId: 'buckethead', row: 4, spawnAtMs: 8600 },
      { id: 'survival-day-endurance-4', zombieId: 'flag', row: 1, spawnAtMs: 12800 },
      { id: 'survival-day-endurance-5', zombieId: 'football', row: 3, spawnAtMs: 19600 },
      { id: 'survival-day-endurance-6', zombieId: 'gargantuar', row: 2, spawnAtMs: 31800 },
    ],
  },
  {
    id: 'survival-roof-ironfall',
    mode: 'survival',
    family: 'survival',
    chapterId: 'roof',
    title: '长线生存：屋顶铁流',
    summary: '屋顶与终局铁流结合的后期耐力关。',
    objective: '连续守住 3 段屋顶铁流，并顶住终局重甲。 ',
    rules: ['抛投线必须一直在线', '厚墙和脱甲缺一不可', '最后一段会混入巨人'],
    baseSun: 220,
    waveDurationMs: 135_000,
    segmentDurationMs: 45_000,
    segments: 3,
    sunDrainPerSecond: 0.08,
    defaultCards: ['twinSunflower', 'flowerPot', 'winterMelon', 'tallnut', 'magnetShroom', 'cobCannon'],
    spawnQueue: [
      { id: 'survival-roof-ironfall-1', zombieId: 'buckethead', row: 0, spawnAtMs: 2200 },
      { id: 'survival-roof-ironfall-2', zombieId: 'screenDoor', row: 2, spawnAtMs: 5600 },
      { id: 'survival-roof-ironfall-3', zombieId: 'football', row: 4, spawnAtMs: 9800 },
      { id: 'survival-roof-ironfall-4', zombieId: 'basketball', row: 1, spawnAtMs: 14600 },
      { id: 'survival-roof-ironfall-5', zombieId: 'gargantuar', row: 3, spawnAtMs: 22800 },
      { id: 'survival-roof-ironfall-6', zombieId: 'finalGargantuar', row: 2, spawnAtMs: 35600 },
    ],
  },
];

export const PVZ_SCENARIOS: PvZScenarioDefinition[] = [...ADVENTURE_SCENARIOS, ...LAB_SCENARIOS, ...SURVIVAL_SCENARIOS];

export function getPvZScenarioById(scenarioId: PvZScenarioId): PvZScenarioDefinition {
  return PVZ_SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? PVZ_SCENARIOS[0];
}

export function getPvZScenariosByMode(mode: PvZMode): PvZScenarioDefinition[] {
  return PVZ_SCENARIOS.filter((scenario) => scenario.mode === mode);
}

export function getPvZAdventureScenariosByChapterIndex(chapterIndex: number): PvZScenarioDefinition[] {
  return getPvZAdventureLevelsByChapterIndex(chapterIndex).map((level) => getPvZScenarioById(level.id));
}

export function getDefaultPvZScenarioIdForChapter(chapterId: PvZChapterId): PvZScenarioId {
  const chapterScenario = ADVENTURE_SCENARIOS.find((scenario) => scenario.chapterId === chapterId);
  return chapterScenario?.id ?? ADVENTURE_SCENARIOS[0]?.id ?? '1-01';
}

export function getPvZAdventureChapterTitle(chapterIndex: number): string {
  const firstLevel = ADVENTURE_SCENARIOS.find((scenario) => scenario.chapterIndex === chapterIndex);
  const chapter = firstLevel ? getPvZChapterById(firstLevel.chapterId) : getPvZChapterById('day');
  return `第 ${chapterIndex} 章 · ${chapter.title}`;
}

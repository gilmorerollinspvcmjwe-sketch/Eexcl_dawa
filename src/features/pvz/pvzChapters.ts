import type { PvZChapterId, PvZPlantId, PvZSpawnEvent } from './pvzTypes.ts';

export interface PvZChapterDefinition {
  id: PvZChapterId;
  title: string;
  summary: string;
  plants: string[];
  zombies: string[];
  baseSun: number;
  waveDurationMs: number;
  defaultCards: PvZPlantId[];
  spawnQueue: PvZSpawnEvent[];
}

const DAY_QUEUE: PvZSpawnEvent[] = [
  { id: 'day-wave-1', zombieId: 'normal', row: 0, spawnAtMs: 2000 },
  { id: 'day-wave-2', zombieId: 'normal', row: 2, spawnAtMs: 5000 },
  { id: 'day-wave-3', zombieId: 'conehead', row: 4, spawnAtMs: 9000 },
  { id: 'day-wave-4', zombieId: 'flag', row: 1, spawnAtMs: 14000 },
  { id: 'day-wave-5', zombieId: 'newspaper', row: 3, spawnAtMs: 17000 },
  { id: 'day-wave-6', zombieId: 'buckethead', row: 2, spawnAtMs: 22000 },
  { id: 'day-wave-7', zombieId: 'pole', row: 0, spawnAtMs: 26000 },
  { id: 'day-wave-8', zombieId: 'flag', row: 4, spawnAtMs: 30000 },
  { id: 'day-wave-9', zombieId: 'screenDoor', row: 1, spawnAtMs: 34000 },
  { id: 'day-wave-10', zombieId: 'football', row: 2, spawnAtMs: 38000 },
];

const NIGHT_QUEUE: PvZSpawnEvent[] = [
  { id: 'night-wave-1', zombieId: 'normal', row: 1, spawnAtMs: 2500 },
  { id: 'night-wave-2', zombieId: 'newspaper', row: 3, spawnAtMs: 6500 },
  { id: 'night-wave-3', zombieId: 'conehead', row: 2, spawnAtMs: 11000 },
  { id: 'night-wave-4', zombieId: 'flag', row: 0, spawnAtMs: 15000 },
  { id: 'night-wave-5', zombieId: 'newspaper', row: 4, spawnAtMs: 19000 },
  { id: 'night-wave-6', zombieId: 'screenDoor', row: 2, spawnAtMs: 24000 },
  { id: 'night-wave-7', zombieId: 'buckethead', row: 1, spawnAtMs: 29000 },
  { id: 'night-wave-8', zombieId: 'flag', row: 3, spawnAtMs: 34000 },
  { id: 'night-wave-9', zombieId: 'football', row: 2, spawnAtMs: 40000 },
];

const POOL_QUEUE: PvZSpawnEvent[] = [
  { id: 'pool-wave-1', zombieId: 'normal', row: 1, spawnAtMs: 2500 },
  { id: 'pool-wave-2', zombieId: 'normal', row: 3, spawnAtMs: 5000 },
  { id: 'pool-wave-3', zombieId: 'conehead', row: 2, spawnAtMs: 8500 },
  { id: 'pool-wave-4', zombieId: 'pole', row: 0, spawnAtMs: 12000 },
  { id: 'pool-wave-5', zombieId: 'pole', row: 4, spawnAtMs: 16000 },
  { id: 'pool-wave-6', zombieId: 'buckethead', row: 2, spawnAtMs: 22000 },
  { id: 'pool-wave-7', zombieId: 'screenDoor', row: 1, spawnAtMs: 28000 },
  { id: 'pool-wave-8', zombieId: 'flag', row: 3, spawnAtMs: 33000 },
  { id: 'pool-wave-9', zombieId: 'football', row: 2, spawnAtMs: 39000 },
];

const FOG_QUEUE: PvZSpawnEvent[] = [
  { id: 'fog-wave-1', zombieId: 'normal', row: 0, spawnAtMs: 2800 },
  { id: 'fog-wave-2', zombieId: 'newspaper', row: 2, spawnAtMs: 6400 },
  { id: 'fog-wave-3', zombieId: 'conehead', row: 4, spawnAtMs: 9800 },
  { id: 'fog-wave-4', zombieId: 'screenDoor', row: 1, spawnAtMs: 14500 },
  { id: 'fog-wave-5', zombieId: 'pole', row: 3, spawnAtMs: 19000 },
  { id: 'fog-wave-6', zombieId: 'buckethead', row: 2, spawnAtMs: 25000 },
  { id: 'fog-wave-7', zombieId: 'football', row: 0, spawnAtMs: 31000 },
  { id: 'fog-wave-8', zombieId: 'flag', row: 4, spawnAtMs: 36000 },
  { id: 'fog-wave-9', zombieId: 'football', row: 2, spawnAtMs: 43000 },
];

const ROOF_QUEUE: PvZSpawnEvent[] = [
  { id: 'roof-wave-1', zombieId: 'conehead', row: 1, spawnAtMs: 3000 },
  { id: 'roof-wave-2', zombieId: 'conehead', row: 3, spawnAtMs: 6200 },
  { id: 'roof-wave-3', zombieId: 'newspaper', row: 2, spawnAtMs: 9800 },
  { id: 'roof-wave-4', zombieId: 'buckethead', row: 0, spawnAtMs: 15000 },
  { id: 'roof-wave-5', zombieId: 'buckethead', row: 4, spawnAtMs: 19800 },
  { id: 'roof-wave-6', zombieId: 'screenDoor', row: 2, spawnAtMs: 25200 },
  { id: 'roof-wave-7', zombieId: 'football', row: 1, spawnAtMs: 31800 },
  { id: 'roof-wave-8', zombieId: 'football', row: 3, spawnAtMs: 37200 },
  { id: 'roof-wave-9', zombieId: 'flag', row: 2, spawnAtMs: 43000 },
  { id: 'roof-wave-10', zombieId: 'football', row: 2, spawnAtMs: 47000 },
];

export const PVZ_CHAPTERS: PvZChapterDefinition[] = [
  {
    id: 'day',
    title: '第一章 白天草地',
    summary: '资源稳定，适合标准布防与基础推进',
    plants: ['向日葵', '豌豆射手', '坚果墙'],
    zombies: ['普通僵尸', '路障僵尸'],
    baseSun: 150,
    waveDurationMs: 42000,
    defaultCards: ['sunflower', 'peashooter', 'wallnut', 'potatoMine', 'snowPea', 'repeater'],
    spawnQueue: DAY_QUEUE,
  },
  {
    id: 'night',
    title: '第二章 夜晚草地',
    summary: '开局阳光偏紧，报纸与盾系僵尸更早出现',
    plants: ['向日葵', '寒冰射手', '双发射手'],
    zombies: ['报纸僵尸', '铁栅门僵尸'],
    baseSun: 100,
    waveDurationMs: 44000,
    defaultCards: ['sunflower', 'snowPea', 'peashooter', 'wallnut', 'potatoMine', 'chomper'],
    spawnQueue: NIGHT_QUEUE,
  },
  {
    id: 'pool',
    title: '第三章 泳池',
    summary: '中路压力更高，建议准备多线火力',
    plants: ['三线射手', '卷心菜投手', '坚果墙'],
    zombies: ['撑杆僵尸', '铁桶僵尸'],
    baseSun: 175,
    waveDurationMs: 42000,
    defaultCards: ['sunflower', 'threepeater', 'repeater', 'wallnut', 'cabbagePult', 'potatoMine'],
    spawnQueue: POOL_QUEUE,
  },
  {
    id: 'fog',
    title: '第四章 迷雾',
    summary: '节奏不稳，前后排压力切换更频繁',
    plants: ['寒冰射手', '大嘴花', '火炬树桩'],
    zombies: ['铁栅门僵尸', '橄榄球僵尸'],
    baseSun: 125,
    waveDurationMs: 46000,
    defaultCards: ['sunflower', 'snowPea', 'torchwood', 'chomper', 'wallnut', 'kernelPult'],
    spawnQueue: FOG_QUEUE,
  },
  {
    id: 'roof',
    title: '第五章 屋顶',
    summary: '高压波次，重甲僵尸密度明显提升',
    plants: ['卷心菜投手', '玉米投手', '双发射手'],
    zombies: ['铁桶僵尸', '橄榄球僵尸'],
    baseSun: 200,
    waveDurationMs: 50000,
    defaultCards: ['sunflower', 'cabbagePult', 'kernelPult', 'repeater', 'wallnut', 'cherryBomb'],
    spawnQueue: ROOF_QUEUE,
  },
];

export const DEFAULT_PVZ_CHAPTER_ID: PvZChapterId = 'day';

export function getPvZChapterById(chapterId: PvZChapterId): PvZChapterDefinition {
  return PVZ_CHAPTERS.find((chapter) => chapter.id === chapterId) ?? PVZ_CHAPTERS[0];
}

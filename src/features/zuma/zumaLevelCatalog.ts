/* 祖玛关卡目录系统。包含轨道定义、关卡脚本、关卡包分类与关卡查询接口。 */

import type {
  ZumaBallColor,
  ZumaEndlessConfig,
  ZumaLevelDefinition,
  ZumaLevelMode,
  ZumaObjectiveDefinition,
  ZumaPowerupType,
  ZumaSpawnEvent,
  ZumaTrackDefinition,
  ZumaTrackPoint,
  ZumaWinCondition,
  ZumaLossCondition,
} from './zumaTypes.ts';

const TRACK_CATALOG: Record<string, ZumaTrackDefinition> = {};

function registerTrack(track: ZumaTrackDefinition): void {
  TRACK_CATALOG[track.trackId] = track;
}

function createTrackPointsFromPath(pathType: string): ZumaTrackPoint[] {
  switch (pathType) {
    case 'simple-curve':
      return [
        { x: 80, y: 50 },
        { x: 150, y: 120 },
        { x: 250, y: 80 },
        { x: 350, y: 180 },
        { x: 450, y: 120 },
        { x: 550, y: 220 },
        { x: 650, y: 160 },
        { x: 750, y: 280 },
        { x: 850, y: 200 },
      ];
    case 'double-loop':
      return [
        { x: 80, y: 100 },
        { x: 200, y: 50 },
        { x: 300, y: 150 },
        { x: 200, y: 250 },
        { x: 100, y: 200 },
        { x: 200, y: 100 },
        { x: 400, y: 50 },
        { x: 500, y: 150 },
        { x: 400, y: 250 },
        { x: 300, y: 200 },
        { x: 400, y: 100 },
        { x: 600, y: 50 },
        { x: 700, y: 150 },
        { x: 800, y: 100 },
      ];
    case 'spiral':
      return [
        { x: 400, y: 300 },
        { x: 350, y: 280 },
        { x: 300, y: 250 },
        { x: 280, y: 200 },
        { x: 300, y: 150 },
        { x: 350, y: 120 },
        { x: 400, y: 100 },
        { x: 450, y: 120 },
        { x: 500, y: 150 },
        { x: 520, y: 200 },
        { x: 500, y: 250 },
        { x: 450, y: 280 },
        { x: 400, y: 260 },
        { x: 380, y: 220 },
        { x: 400, y: 180 },
        { x: 420, y: 220 },
        { x: 400, y: 240 },
      ];
    case 'zigzag':
      return [
        { x: 80, y: 50 },
        { x: 200, y: 200 },
        { x: 80, y: 350 },
        { x: 200, y: 500 },
        { x: 80, y: 650 },
        { x: 200, y: 800 },
        { x: 350, y: 650 },
        { x: 500, y: 800 },
        { x: 650, y: 650 },
        { x: 800, y: 800 },
      ];
    case 'wave':
      return [
        { x: 80, y: 150 },
        { x: 150, y: 50 },
        { x: 250, y: 150 },
        { x: 350, y: 50 },
        { x: 450, y: 150 },
        { x: 550, y: 50 },
        { x: 650, y: 150 },
        { x: 750, y: 50 },
        { x: 850, y: 150 },
      ];
    case 'circle':
      return [
        { x: 400, y: 100 },
        { x: 500, y: 120 },
        { x: 580, y: 180 },
        { x: 600, y: 280 },
        { x: 580, y: 380 },
        { x: 500, y: 450 },
        { x: 400, y: 480 },
        { x: 300, y: 450 },
        { x: 220, y: 380 },
        { x: 200, y: 280 },
        { x: 220, y: 180 },
        { x: 300, y: 120 },
        { x: 400, y: 100 },
      ];
    case 'figure-eight':
      return [
        { x: 200, y: 150 },
        { x: 300, y: 50 },
        { x: 400, y: 150 },
        { x: 300, y: 250 },
        { x: 200, y: 150 },
        { x: 100, y: 250 },
        { x: 200, y: 350 },
        { x: 300, y: 250 },
        { x: 400, y: 350 },
        { x: 500, y: 250 },
        { x: 400, y: 150 },
        { x: 500, y: 50 },
        { x: 600, y: 150 },
        { x: 700, y: 250 },
        { x: 600, y: 350 },
        { x: 500, y: 250 },
      ];
    case 'long-straight':
      return [
        { x: 50, y: 200 },
        { x: 150, y: 200 },
        { x: 250, y: 200 },
        { x: 350, y: 200 },
        { x: 450, y: 200 },
        { x: 550, y: 200 },
        { x: 650, y: 200 },
        { x: 750, y: 200 },
        { x: 850, y: 200 },
      ];
    default:
      return [
        { x: 100, y: 50 },
        { x: 200, y: 100 },
        { x: 300, y: 50 },
        { x: 400, y: 150 },
        { x: 500, y: 100 },
        { x: 600, y: 200 },
        { x: 700, y: 150 },
        { x: 800, y: 250 },
      ];
  }
}

function calculateTrackLengthFromPoints(points: ZumaTrackPoint[]): number {
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  return totalLength;
}

function fitTrackPointsToBoard(points: ZumaTrackPoint[], width: number = 900, height: number = 400, padding: number = 36): ZumaTrackPoint[] {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = Math.max(1, maxX - minX);
  const rangeY = Math.max(1, maxY - minY);
  const scale = Math.min((width - padding * 2) / rangeX, (height - padding * 2) / rangeY);

  return points.map((point) => ({
    x: padding + (point.x - minX) * scale,
    y: padding + (point.y - minY) * scale,
  }));
}

function createTrackDefinition(
  trackId: string,
  name: string,
  pathType: string,
  finishLineRatio: number = 0.85,
): ZumaTrackDefinition {
  const points = fitTrackPointsToBoard(createTrackPointsFromPath(pathType));
  const totalLength = calculateTrackLengthFromPoints(points);
  return {
    trackId,
    name,
    points,
    totalLength,
    finishLineDistance: totalLength * finishLineRatio,
    hasBranches: false,
  };
}

registerTrack(createTrackDefinition('track-simple-01', '简单曲线', 'simple-curve'));
registerTrack(createTrackDefinition('track-double-loop-01', '双环轨道', 'double-loop'));
registerTrack(createTrackDefinition('track-spiral-01', '螺旋轨道', 'spiral'));
registerTrack(createTrackDefinition('track-zigzag-01', '锯齿轨道', 'zigzag'));
registerTrack(createTrackDefinition('track-wave-01', '波浪轨道', 'wave'));
registerTrack(createTrackDefinition('track-circle-01', '圆形轨道', 'circle'));
registerTrack(createTrackDefinition('track-figure-eight-01', '八字轨道', 'figure-eight'));
registerTrack(createTrackDefinition('track-long-straight-01', '长直轨道', 'long-straight'));

const TRACK_IDS_FOR_TIMED_MODE = [
  'track-simple-01',
  'track-double-loop-01',
  'track-wave-01',
  'track-zigzag-01',
  'track-circle-01',
  'track-spiral-01',
];

export function getTrackDefinition(trackId: string): ZumaTrackDefinition | undefined {
  return TRACK_CATALOG[trackId];
}

export function getAllTrackIds(): string[] {
  return Object.keys(TRACK_CATALOG);
}

export function getTimedModeTrackIds(): string[] {
  return TRACK_IDS_FOR_TIMED_MODE;
}

const LEVEL_CATALOG: Record<string, ZumaLevelDefinition> = {};

function registerLevel(level: ZumaLevelDefinition): void {
  LEVEL_CATALOG[level.levelId] = level;
}

function createSpawnScript(
  colorPool: ZumaBallColor[],
  totalBalls: number,
  batchIntervalMs: number,
  batchSize: number,
  powerupChance: number = 0,
): ZumaSpawnEvent[] {
  const events: ZumaSpawnEvent[] = [];
  const batches = Math.ceil(totalBalls / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const color = colorPool[i % colorPool.length];
    const count = Math.min(batchSize, totalBalls - i * batchSize);
    events.push({
      eventId: `spawn-${i}`,
      color,
      count,
      spawnAtMs: i * batchIntervalMs,
      powerupChance,
    });
  }
  
  return events;
}

interface ZumaSpawnStageDefinition {
  totalBalls: number;
  batchIntervalMs: number;
  batchSize: number;
  powerupChance?: number;
  colorPool?: ZumaBallColor[];
  gapAfterMs?: number;
}

function createWaveSpawnScript(
  defaultColorPool: ZumaBallColor[],
  stages: ZumaSpawnStageDefinition[],
): ZumaSpawnEvent[] {
  const events: ZumaSpawnEvent[] = [];
  let timelineMs = 0;

  stages.forEach((stage, stageIndex) => {
    const colorPool = stage.colorPool ?? defaultColorPool;
    const batches = Math.ceil(stage.totalBalls / stage.batchSize);

    for (let i = 0; i < batches; i++) {
      events.push({
        eventId: `stage-${stageIndex + 1}-spawn-${i + 1}`,
        color: colorPool[(stageIndex + i) % colorPool.length],
        count: Math.min(stage.batchSize, stage.totalBalls - i * stage.batchSize),
        spawnAtMs: timelineMs + i * stage.batchIntervalMs,
        powerupChance: stage.powerupChance,
      });
    }

    timelineMs += batches * stage.batchIntervalMs + (stage.gapAfterMs ?? 1000);
  });

  return events;
}

function buildMultiObjective(
  objectives: ZumaObjectiveDefinition[],
): ZumaWinCondition {
  return {
    type: 'multiObjective',
    targetValue: 0,
    objectives,
  };
}

function createAdventureLevel(
  levelNumber: number,
  title: string,
  summary: string,
  objective: string,
  rules: string[],
  trackId: string,
  colorPool: ZumaBallColor[],
  baseSpeed: number,
  difficultyMultiplier: number,
  initialBalls: number,
  spawnBalls: number,
  powerupPool: ZumaPowerupType[],
  powerupChance: number,
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5',
  recommendedPracticeTags: string[],
): ZumaLevelDefinition {
  const winCondition: ZumaWinCondition = {
    type: 'clearAll',
    targetValue: 0,
  };
  
  const lossCondition: ZumaLossCondition = {
    type: 'reachFinish',
    finishLineDistance: getTrackDefinition(trackId)?.finishLineDistance || 0,
  };
  
  const spawnScript = createSpawnScript(colorPool, spawnBalls, 8000, 5, powerupChance);
  
  return {
    levelId: `zuma-adventure-${levelNumber.toString().padStart(3, '0')}`,
    levelNumber,
    mode: 'adventure',
    title,
    summary,
    objective,
    rules,
    trackId,
    colorPool,
    baseSpeed,
    difficultyMultiplier,
    initialBallCount: initialBalls,
    spawnScript,
    powerupPool,
    powerupSpawnChance: powerupChance,
    winCondition,
    lossCondition,
    recommendedPracticeTags,
    intensity,
  };
}

function createChallengeLevel(options: {
  levelId: string;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  trackId: string;
  colorPool: ZumaBallColor[];
  baseSpeed: number;
  difficultyMultiplier: number;
  spawnScript: ZumaSpawnEvent[];
  shotLimit?: number;
  chainLimit?: number;
  powerupPool: ZumaPowerupType[];
  powerupSpawnChance: number;
  winObjectives: ZumaObjectiveDefinition[];
  recommendedPracticeTags: string[];
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}): ZumaLevelDefinition {
  const track = getTrackDefinition(options.trackId);
  return {
    levelId: options.levelId,
    levelNumber: 0,
    mode: 'challenge',
    title: options.title,
    summary: options.summary,
    objective: options.objective,
    rules: options.rules,
    trackId: options.trackId,
    colorPool: options.colorPool,
    baseSpeed: options.baseSpeed,
    difficultyMultiplier: options.difficultyMultiplier,
    spawnScript: options.spawnScript,
    powerupPool: options.powerupPool,
    powerupSpawnChance: options.powerupSpawnChance,
    winCondition: buildMultiObjective(options.winObjectives),
    lossCondition: {
      type: 'reachFinish',
      finishLineDistance: track?.finishLineDistance ?? 0,
    },
    shotLimit: options.shotLimit,
    chainLimit: options.chainLimit,
    recommendedPracticeTags: options.recommendedPracticeTags,
    intensity: options.intensity,
  };
}

function createEndlessLevel(options: {
  levelId: string;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  trackId: string;
  colorPool: ZumaBallColor[];
  baseSpeed: number;
  difficultyMultiplier: number;
  spawnScript: ZumaSpawnEvent[];
  powerupPool: ZumaPowerupType[];
  powerupSpawnChance: number;
  endlessConfig: ZumaEndlessConfig;
  recommendedPracticeTags: string[];
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}): ZumaLevelDefinition {
  const track = getTrackDefinition(options.trackId);
  return {
    levelId: options.levelId,
    levelNumber: 0,
    mode: 'endless',
    title: options.title,
    summary: options.summary,
    objective: options.objective,
    rules: options.rules,
    trackId: options.trackId,
    colorPool: options.colorPool,
    baseSpeed: options.baseSpeed,
    difficultyMultiplier: options.difficultyMultiplier,
    spawnScript: options.spawnScript,
    powerupPool: options.powerupPool,
    powerupSpawnChance: options.powerupSpawnChance,
    winCondition: {
      type: 'clearAll',
      targetValue: 0,
    },
    lossCondition: {
      type: 'reachFinish',
      finishLineDistance: track?.finishLineDistance ?? 0,
    },
    endlessConfig: options.endlessConfig,
    recommendedPracticeTags: options.recommendedPracticeTags,
    intensity: options.intensity,
  };
}

const TEMPLE_ADVENTURE_LEVELS: ZumaLevelDefinition[] = [
  createAdventureLevel(
    1,
    '神庙入门',
    '熟悉祖玛基本操作，学习瞄准与发射',
    '清除所有彩球，不让球链触及终点',
    ['鼠标瞄准，左键发射', '同色三球及以上可消除', '消除后球链会回缩'],
    'track-simple-01',
    ['red', 'blue'],
    24,
    1.0,
    20,
    40,
    [],
    0,
    'S1',
    ['basic-aim'],
  ),
  createAdventureLevel(
    2,
    '双色练习',
    '掌握双色球链的消除节奏',
    '清除所有彩球',
    ['球链会持续推进', '注意球链推进速度', '优先消除靠近前端的球'],
    'track-simple-01',
    ['red', 'blue'],
    30,
    1.1,
    25,
    40,
    [],
    0,
    'S1',
    ['basic-aim'],
  ),
  createAdventureLevel(
    3,
    '三色初试',
    '引入第三种颜色，增加消除难度',
    '清除所有彩球',
    ['三色球链需要更精准的瞄准', '观察球链颜色分布', '寻找最佳插入点'],
    'track-wave-01',
    ['red', 'blue', 'green'],
    30,
    1.2,
    30,
    50,
    [],
    0,
    'S1',
    ['basic-aim', 'color-matching'],
  ),
  createAdventureLevel(
    4,
    '波浪轨道',
    '在波浪形轨道上练习瞄准',
    '清除所有彩球',
    ['波浪轨道需要预判球链位置', '注意曲线上的瞄准角度', '利用轨道形状优势'],
    'track-wave-01',
    ['red', 'blue', 'green'],
    35,
    1.3,
    35,
    60,
    ['slow'],
    0.02,
    'S2',
    ['curve-aim'],
  ),
  createAdventureLevel(
    5,
    '道具球入门',
    '学习使用减速道具球',
    '清除所有彩球',
    ['减速球可让全链减速', '道具球随机出现', '合理使用道具球'],
    'track-simple-01',
    ['red', 'blue', 'green'],
    35,
    1.4,
    40,
    70,
    ['slow'],
    0.05,
    'S2',
    ['powerup-basic'],
  ),
  createAdventureLevel(
    6,
    '锯齿挑战',
    '在锯齿轨道上应对快速推进',
    '清除所有彩球',
    ['锯齿轨道推进更快', '需要快速反应', '注意危险等级变化'],
    'track-zigzag-01',
    ['red', 'blue', 'green'],
    40,
    1.5,
    45,
    80,
    ['slow', 'rewind'],
    0.05,
    'S2',
    ['curve-aim', 'danger-awareness'],
  ),
  createAdventureLevel(
    7,
    '四色考验',
    '引入第四种颜色，大幅增加难度',
    '清除所有彩球',
    ['四色球链消除机会减少', '需要更精准的颜色匹配', '避免插入错误颜色'],
    'track-double-loop-01',
    ['red', 'blue', 'green', 'yellow'],
    40,
    1.6,
    50,
    90,
    ['slow', 'rewind'],
    0.05,
    'S3',
    ['color-matching'],
  ),
  createAdventureLevel(
    8,
    '双环轨道',
    '在复杂双环轨道上作战',
    '清除所有彩球',
    ['双环轨道路径复杂', '注意轨道交叉点', '利用轨道形状创造消除机会'],
    'track-double-loop-01',
    ['red', 'blue', 'green', 'yellow'],
    45,
    1.7,
    55,
    100,
    ['slow', 'rewind', 'burst'],
    0.08,
    'S3',
    ['curve-aim', 'powerup-basic'],
  ),
  createAdventureLevel(
    9,
    '爆裂球实战',
    '学习使用爆裂道具球',
    '清除所有彩球',
    ['爆裂球可清除半径范围内所有球', '适合密集球链', '注意爆裂范围'],
    'track-circle-01',
    ['red', 'blue', 'green', 'yellow'],
    45,
    1.8,
    60,
    110,
    ['slow', 'rewind', 'burst'],
    0.1,
    'S3',
    ['powerup-advanced'],
  ),
  createAdventureLevel(
    10,
    '圆形轨道',
    '在圆形轨道上应对持续推进',
    '清除所有彩球',
    ['圆形轨道无起点终点概念', '球链会绕圈推进', '注意推进节奏'],
    'track-circle-01',
    ['red', 'blue', 'green', 'yellow'],
    50,
    1.9,
    65,
    120,
    ['slow', 'rewind', 'burst', 'lightning'],
    0.1,
    'S4',
    ['curve-aim', 'danger-awareness'],
  ),
  createAdventureLevel(
    11,
    '闪电球实战',
    '学习使用闪电道具球',
    '清除所有彩球',
    ['闪电球可清除一段连续球', '适合长球链', '注意闪电方向'],
    'track-spiral-01',
    ['red', 'blue', 'green', 'yellow', 'purple'],
    50,
    2.0,
    70,
    130,
    ['slow', 'rewind', 'burst', 'lightning'],
    0.12,
    'S4',
    ['powerup-advanced'],
  ),
  createAdventureLevel(
    12,
    '神庙征途终章',
    '综合考验所有技能',
    '清除所有彩球',
    ['五色球链最高难度', '螺旋轨道复杂路径', '合理使用所有道具球'],
    'track-spiral-01',
    ['red', 'blue', 'green', 'yellow', 'purple'],
    55,
    2.2,
    80,
    150,
    ['slow', 'rewind', 'burst', 'lightning', 'wild'],
    0.15,
    'S5',
    ['curve-aim', 'color-matching', 'powerup-advanced', 'danger-awareness'],
  ),
];

const CHAIN_REWIND_LEVELS: ZumaLevelDefinition[] = [
  createAdventureLevel(
    13,
    '连锁入门',
    '学习连锁消除的基本原理',
    '利用连锁消除清除所有彩球',
    ['消除后球链回缩', '回缩接合可能触发新消除', '连锁消除得分更高'],
    'track-simple-01',
    ['red', 'blue', 'green'],
    35,
    1.3,
    40,
    60,
    [],
    0,
    'S2',
    ['chain-basic'],
  ),
  createAdventureLevel(
    14,
    '回缩节奏',
    '掌握回缩时机与节奏',
    '利用连锁消除清除所有彩球',
    ['观察球链间隙', '制造回缩机会', '预判接合后的颜色'],
    'track-wave-01',
    ['red', 'blue', 'green'],
    40,
    1.4,
    45,
    70,
    ['rewind'],
    0.03,
    'S2',
    ['chain-basic', 'rewind-timing'],
  ),
  createAdventureLevel(
    15,
    '连锁二连',
    '实现连续两次连锁消除',
    '清除所有彩球，触发至少2次连锁',
    ['连锁消除需要颜色匹配', '注意接合点颜色', '制造连锁机会'],
    'track-double-loop-01',
    ['red', 'blue', 'green', 'yellow'],
    45,
    1.5,
    50,
    80,
    ['rewind'],
    0.05,
    'S3',
    ['chain-advanced'],
  ),
  createAdventureLevel(
    16,
    '连锁三连',
    '实现连续三次连锁消除',
    '清除所有彩球，触发至少3次连锁',
    ['三连连锁需要精准布局', '利用道具球辅助', '观察全局颜色分布'],
    'track-zigzag-01',
    ['red', 'blue', 'green', 'yellow'],
    50,
    1.6,
    55,
    90,
    ['rewind', 'slow'],
    0.08,
    'S3',
    ['chain-advanced', 'rewind-timing'],
  ),
  createAdventureLevel(
    17,
    '道具球连锁',
    '利用道具球触发连锁',
    '清除所有彩球',
    ['道具球可制造间隙', '间隙回缩触发连锁', '合理使用道具球'],
    'track-circle-01',
    ['red', 'blue', 'green', 'yellow'],
    50,
    1.7,
    60,
    100,
    ['burst', 'rewind'],
    0.1,
    'S4',
    ['chain-advanced', 'powerup-chain'],
  ),
  createAdventureLevel(
    18,
    '万能球连锁',
    '学习万能球在连锁中的作用',
    '清除所有彩球',
    ['万能球可匹配任意颜色', '万能球可触发连锁', '合理使用万能球'],
    'track-spiral-01',
    ['red', 'blue', 'green', 'yellow', 'purple'],
    55,
    1.8,
    65,
    110,
    ['wild', 'rewind'],
    0.12,
    'S4',
    ['chain-advanced', 'powerup-chain'],
  ),
  createAdventureLevel(
    19,
    '连锁四连',
    '实现连续四次连锁消除',
    '清除所有彩球，触发至少4次连锁',
    ['四连连锁需要全局规划', '利用所有道具球', '精准控制消除时机'],
    'track-figure-eight-01',
    ['red', 'blue', 'green', 'yellow', 'purple'],
    60,
    1.9,
    70,
    120,
    ['wild', 'rewind', 'burst'],
    0.15,
    'S5',
    ['chain-master'],
  ),
  createAdventureLevel(
    20,
    '连锁回缩终章',
    '连锁消除终极考验',
    '清除所有彩球，触发至少5次连锁',
    ['五连连锁最高难度', '八字轨道复杂路径', '综合运用所有技能'],
    'track-figure-eight-01',
    ['red', 'blue', 'green', 'yellow', 'purple'],
    65,
    2.0,
    80,
    140,
    ['wild', 'rewind', 'burst', 'slow'],
    0.18,
    'S5',
    ['chain-master', 'powerup-chain'],
  ),
];

TEMPLE_ADVENTURE_LEVELS[10] = {
  ...TEMPLE_ADVENTURE_LEVELS[10],
  objective: '清除所有彩球，且总发射不超过24次',
  rules: [
    ...TEMPLE_ADVENTURE_LEVELS[10].rules,
    '本关限定发射24次，超出后会直接失败',
  ],
  shotLimit: 24,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'maxShots', targetValue: 24 },
    ],
  },
};

CHAIN_REWIND_LEVELS[2] = {
  ...CHAIN_REWIND_LEVELS[2],
  objective: '清除所有彩球，且至少触发2次连锁',
  chainLimit: 2,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 2 },
    ],
  },
};

CHAIN_REWIND_LEVELS[3] = {
  ...CHAIN_REWIND_LEVELS[3],
  objective: '清除所有彩球，且至少触发3次连锁',
  chainLimit: 3,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 3 },
    ],
  },
};

CHAIN_REWIND_LEVELS[4] = {
  ...CHAIN_REWIND_LEVELS[4],
  objective: '清除所有彩球，且至少触发3次连锁',
  chainLimit: 3,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 3 },
    ],
  },
};

CHAIN_REWIND_LEVELS[5] = {
  ...CHAIN_REWIND_LEVELS[5],
  objective: '清除所有彩球，且至少触发4次连锁',
  chainLimit: 4,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 4 },
    ],
  },
};

CHAIN_REWIND_LEVELS[6] = {
  ...CHAIN_REWIND_LEVELS[6],
  objective: '清除所有彩球，且至少触发4次连锁',
  chainLimit: 4,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 4 },
    ],
  },
};

CHAIN_REWIND_LEVELS[7] = {
  ...CHAIN_REWIND_LEVELS[7],
  objective: '清除所有彩球，至少触发5次连锁，且总发射不超过36次',
  rules: [
    ...CHAIN_REWIND_LEVELS[7].rules,
    '本关额外限定发射36次，既要做出连锁也要节约出手',
  ],
  shotLimit: 36,
  chainLimit: 5,
  winCondition: {
    type: 'multiObjective',
    targetValue: 0,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 5 },
      { type: 'maxShots', targetValue: 36 },
    ],
  },
};

interface AdvancedStageLevelConfig {
  levelNumber: number;
  title: string;
  summary: string;
  objective: string;
  rules: string[];
  trackId: string;
  colorPool: ZumaBallColor[];
  baseSpeed: number;
  difficultyMultiplier: number;
  spawnScript: ZumaSpawnEvent[];
  powerupPool: ZumaPowerupType[];
  powerupSpawnChance: number;
  shotLimit?: number | null;
  chainLimit?: number | null;
  objectives: ZumaObjectiveDefinition[];
  recommendedPracticeTags: string[];
  intensity: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}

const ADVANCED_STAGE_LEVELS: ZumaLevelDefinition[] = ([
  {
    levelNumber: 21,
    title: '四射拐廊',
    summary: '四球色弯道开始要求持续换球与控节奏',
    objective: '清除所有彩球，且总发射不超过30次',
    rules: ['前段给观察窗口，中段开始连续压迫，后段留一段抢救空隙', '建议频繁切换当前球与下一球'],
    trackId: 'track-wave-01',
    colorPool: ['red', 'blue', 'green', 'yellow'],
    baseSpeed: 48,
    difficultyMultiplier: 1.85,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow'], [
      { totalBalls: 16, batchIntervalMs: 7200, batchSize: 4, powerupChance: 0.04, gapAfterMs: 1800 },
      { totalBalls: 20, batchIntervalMs: 5200, batchSize: 5, powerupChance: 0.08, gapAfterMs: 1200 },
      { totalBalls: 18, batchIntervalMs: 3400, batchSize: 6, powerupChance: 0.12 },
    ]),
    powerupPool: ['slow', 'rewind'],
    powerupSpawnChance: 0.08,
    shotLimit: 30,
    chainLimit: null,
    objectives: [{ type: 'clearAll', targetValue: 0 }, { type: 'maxShots', targetValue: 30 }],
    recommendedPracticeTags: ['curve-aim', 'color-matching'],
    intensity: 'S3',
  },
  {
    levelNumber: 22,
    title: '折返压线',
    summary: '前后段两次拉压，练前端抢救与倒退时机',
    objective: '清除所有彩球，且至少触发2次连锁',
    rules: ['前段慢，中段突然提速，尾段再次逼近终点', '倒退球优先留给尾段抢救'],
    trackId: 'track-zigzag-01',
    colorPool: ['red', 'blue', 'green', 'yellow'],
    baseSpeed: 50,
    difficultyMultiplier: 1.9,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow'], [
      { totalBalls: 14, batchIntervalMs: 7600, batchSize: 4, powerupChance: 0.05, gapAfterMs: 2000 },
      { totalBalls: 24, batchIntervalMs: 4300, batchSize: 6, powerupChance: 0.08, gapAfterMs: 900 },
      { totalBalls: 14, batchIntervalMs: 3000, batchSize: 4, powerupChance: 0.1 },
    ]),
    powerupPool: ['slow', 'rewind', 'burst'],
    powerupSpawnChance: 0.1,
    shotLimit: null,
    chainLimit: 2,
    objectives: [{ type: 'clearAll', targetValue: 0 }, { type: 'minChainCount', targetValue: 2 }],
    recommendedPracticeTags: ['danger-awareness', 'rewind-timing'],
    intensity: 'S3',
  },
  {
    levelNumber: 23,
    title: '双环断点',
    summary: '第一次要求主动制造缺口并让回缩补刀',
    objective: '清除所有彩球，且至少使用2次道具球',
    rules: ['中段出现双环堆积，必须靠道具切口', '后段留出回缩补刀窗口'],
    trackId: 'track-double-loop-01',
    colorPool: ['red', 'blue', 'green', 'yellow'],
    baseSpeed: 51,
    difficultyMultiplier: 1.95,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow'], [
      { totalBalls: 18, batchIntervalMs: 6500, batchSize: 4, powerupChance: 0.08, gapAfterMs: 1400 },
      { totalBalls: 24, batchIntervalMs: 4700, batchSize: 6, powerupChance: 0.12, gapAfterMs: 1000 },
      { totalBalls: 12, batchIntervalMs: 2900, batchSize: 3, powerupChance: 0.16 },
    ]),
    powerupPool: ['burst', 'rewind', 'wild'],
    powerupSpawnChance: 0.12,
    shotLimit: null,
    chainLimit: null,
    objectives: [{ type: 'clearAll', targetValue: 0 }, { type: 'minPowerupUses', targetValue: 2 }],
    recommendedPracticeTags: ['powerup-basic', 'powerup-chain'],
    intensity: 'S3',
  },
  {
    levelNumber: 24,
    title: '连锁火力试炼',
    summary: '前中后段脚本明显分层，开始要求复合目标',
    objective: '清除所有彩球，至少触发3次连锁，且分数达到1800',
    rules: ['前段铺盘，中段高压波段推进，后段只给一次抢救机会', '需要同时兼顾连锁目标与得分阈值'],
    trackId: 'track-figure-eight-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 53,
    difficultyMultiplier: 2.0,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 16, batchIntervalMs: 7800, batchSize: 4, powerupChance: 0.06, gapAfterMs: 1800 },
      { totalBalls: 22, batchIntervalMs: 5200, batchSize: 5, powerupChance: 0.1, gapAfterMs: 1200 },
      { totalBalls: 18, batchIntervalMs: 2800, batchSize: 6, powerupChance: 0.15 },
    ]),
    powerupPool: ['slow', 'rewind', 'burst', 'wild'],
    powerupSpawnChance: 0.12,
    shotLimit: null,
    chainLimit: 3,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 3 },
      { type: 'scoreThreshold', targetValue: 1800 },
    ],
    recommendedPracticeTags: ['chain-advanced', 'curve-aim'],
    intensity: 'S4',
  },
  {
    levelNumber: 25,
    title: '螺旋断面',
    summary: '螺旋轨道要求在遮挡里判断下一球',
    objective: '清除所有彩球，且总发射不超过34次',
    rules: ['前段观察螺旋缩口，中段压迫，尾段拼精度', '换球判断会直接影响限弹目标'],
    trackId: 'track-spiral-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 54,
    difficultyMultiplier: 2.05,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 18, batchIntervalMs: 7000, batchSize: 4, powerupChance: 0.06, gapAfterMs: 1500 },
      { totalBalls: 18, batchIntervalMs: 4100, batchSize: 5, powerupChance: 0.1, gapAfterMs: 900 },
      { totalBalls: 16, batchIntervalMs: 2600, batchSize: 4, powerupChance: 0.14 },
    ]),
    powerupPool: ['slow', 'rewind', 'wild'],
    powerupSpawnChance: 0.1,
    shotLimit: 34,
    chainLimit: null,
    objectives: [{ type: 'clearAll', targetValue: 0 }, { type: 'maxShots', targetValue: 34 }],
    recommendedPracticeTags: ['curve-aim', 'basic-aim'],
    intensity: 'S4',
  },
  {
    levelNumber: 26,
    title: '长线压迫',
    summary: '长直线关卡要求高速连续命中和及时减速',
    objective: '清除所有彩球，且至少使用2次道具球并达到2200分',
    rules: ['中段直线高压，后段必须留减速球抢救', '连续命中越稳，越能吃到分数阈值'],
    trackId: 'track-long-straight-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 55,
    difficultyMultiplier: 2.1,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 20, batchIntervalMs: 6000, batchSize: 5, powerupChance: 0.06, gapAfterMs: 1200 },
      { totalBalls: 24, batchIntervalMs: 3600, batchSize: 6, powerupChance: 0.11, gapAfterMs: 1000 },
      { totalBalls: 18, batchIntervalMs: 2400, batchSize: 6, powerupChance: 0.16 },
    ]),
    powerupPool: ['slow', 'burst', 'lightning'],
    powerupSpawnChance: 0.12,
    shotLimit: null,
    chainLimit: null,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minPowerupUses', targetValue: 2 },
      { type: 'scoreThreshold', targetValue: 2200 },
    ],
    recommendedPracticeTags: ['danger-awareness', 'powerup-basic'],
    intensity: 'S4',
  },
  {
    levelNumber: 27,
    title: '五色交叉',
    summary: '五色交叉轨道开始拉高连锁和换球难度',
    objective: '清除所有彩球，且至少触发4次连锁',
    rules: ['前段平稳，中段交叉压迫，后段需要连续补连锁', '建议用万能球做关键桥接'],
    trackId: 'track-double-loop-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 56,
    difficultyMultiplier: 2.15,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 16, batchIntervalMs: 6800, batchSize: 4, powerupChance: 0.07, gapAfterMs: 1400 },
      { totalBalls: 22, batchIntervalMs: 4200, batchSize: 5, powerupChance: 0.12, gapAfterMs: 900 },
      { totalBalls: 22, batchIntervalMs: 2500, batchSize: 6, powerupChance: 0.18 },
    ]),
    powerupPool: ['wild', 'rewind', 'burst'],
    powerupSpawnChance: 0.14,
    shotLimit: null,
    chainLimit: 4,
    objectives: [{ type: 'clearAll', targetValue: 0 }, { type: 'minChainCount', targetValue: 4 }],
    recommendedPracticeTags: ['chain-master', 'powerup-chain'],
    intensity: 'S4',
  },
  {
    levelNumber: 28,
    title: '进阶段考试',
    summary: '进阶段收官，第一次把限弹、连锁、道具一起压上来',
    objective: '清除所有彩球，至少触发4次连锁，使用2次道具球，且总发射不超过38次',
    rules: ['前段给你布盘，中段双波压力，后段终点抢救', '这是 13~28 进阶段的综合考试关'],
    trackId: 'track-figure-eight-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 57,
    difficultyMultiplier: 2.2,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 18, batchIntervalMs: 7000, batchSize: 4, powerupChance: 0.08, gapAfterMs: 1600 },
      { totalBalls: 24, batchIntervalMs: 3900, batchSize: 6, powerupChance: 0.12, gapAfterMs: 900 },
      { totalBalls: 20, batchIntervalMs: 2200, batchSize: 5, powerupChance: 0.18 },
    ]),
    powerupPool: ['slow', 'rewind', 'burst', 'lightning', 'wild'],
    powerupSpawnChance: 0.16,
    shotLimit: 38,
    chainLimit: 4,
    objectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 4 },
      { type: 'minPowerupUses', targetValue: 2 },
      { type: 'maxShots', targetValue: 38 },
    ],
    recommendedPracticeTags: ['chain-master', 'danger-awareness', 'powerup-chain'],
    intensity: 'S4',
  },
] satisfies AdvancedStageLevelConfig[]).map((config) => ({
  ...createAdventureLevel(
    config.levelNumber,
    config.title,
    config.summary,
    config.objective,
    config.rules,
    config.trackId,
    config.colorPool,
    config.baseSpeed,
    config.difficultyMultiplier,
    0,
    0,
    config.powerupPool,
    config.powerupSpawnChance,
    config.intensity,
    config.recommendedPracticeTags,
  ),
  spawnScript: config.spawnScript,
  shotLimit: config.shotLimit ?? undefined,
  chainLimit: config.chainLimit ?? undefined,
  winCondition: buildMultiObjective(config.objectives),
}));

CHAIN_REWIND_LEVELS.push(...ADVANCED_STAGE_LEVELS);

const PRESSURE_TRACK_ROTATION = [
  'track-zigzag-01',
  'track-double-loop-01',
  'track-circle-01',
  'track-figure-eight-01',
  'track-spiral-01',
  'track-wave-01',
  'track-long-straight-01',
] as const;

const PRESSURE_LEVELS: ZumaLevelDefinition[] = Array.from({ length: 17 }, (_, index) => {
  const levelNumber = 29 + index;
  const trackId = PRESSURE_TRACK_ROTATION[index % PRESSURE_TRACK_ROTATION.length];
  const colorPool: ZumaBallColor[] = index < 5
    ? ['red', 'blue', 'green', 'yellow', 'purple']
    : ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const minChainTarget = 3 + Math.floor(index / 5);
  const scoreTarget = 2100 + index * 120;
  const shotLimit = index % 3 === 0 ? 34 + index : undefined;
  const objectives: ZumaObjectiveDefinition[] = [
    { type: 'clearAll', targetValue: 0 },
    { type: 'minChainCount', targetValue: minChainTarget },
    { type: 'scoreThreshold', targetValue: scoreTarget },
  ];
  if (shotLimit !== undefined) {
    objectives.push({ type: 'maxShots', targetValue: shotLimit });
  }
  if (index % 2 === 1) {
    objectives.push({ type: 'minPowerupUses', targetValue: 2 });
  }

  const spawnScript = createWaveSpawnScript(colorPool, [
    { totalBalls: 18 + index, batchIntervalMs: Math.max(5600 - index * 80, 3600), batchSize: 4 + (index % 2), powerupChance: 0.08, gapAfterMs: 1200 },
    { totalBalls: 22 + index, batchIntervalMs: Math.max(3800 - index * 70, 2200), batchSize: 5 + (index % 3), powerupChance: 0.12, gapAfterMs: 700 },
    { totalBalls: 16 + index, batchIntervalMs: Math.max(2200 - index * 40, 1200), batchSize: 5 + ((index + 1) % 3), powerupChance: 0.18 },
  ]);

  return {
    ...createAdventureLevel(
      levelNumber,
      `高压回廊 ${levelNumber}`,
      `第 ${levelNumber} 关高压骨架：前中后段都在推节奏`,
      `清除所有彩球，并完成高压段复合目标`,
      [
        '前段先铺盘，中段会出现连续高压波段，后段只给一次终点抢救窗',
        '高压段强调波段式推进，不再只是平移参数',
      ],
      trackId,
      colorPool,
      58 + index,
      2.25 + index * 0.03,
      0,
      0,
      ['slow', 'rewind', 'burst', 'lightning', 'wild'],
      0.16,
      index < 8 ? 'S4' : 'S5',
      ['danger-awareness', 'chain-master', 'powerup-chain'],
    ),
    summary: `高压段骨架关，要求处理多次危险窗口与脚本波段`,
    objective: shotLimit !== undefined
      ? `清除所有彩球，至少触发 ${minChainTarget} 次连锁、达到 ${scoreTarget} 分，且总发射不超过 ${shotLimit} 次`
      : `清除所有彩球，至少触发 ${minChainTarget} 次连锁并达到 ${scoreTarget} 分`,
    rules: [
      `前段观察，中段双波段提速，后段抢救；当前关卡重点轨道：${getTrackDefinition(trackId)?.name ?? trackId}`,
      '这是 29~45 高压段骨架，重点验证压力波段和复合目标',
    ],
    spawnScript,
    shotLimit,
    chainLimit: minChainTarget,
    winCondition: buildMultiObjective(objectives),
  };
});

const CHALLENGE_LEVELS: ZumaLevelDefinition[] = [
  createChallengeLevel({
    levelId: 'zuma-challenge-001',
    title: '限弹连锁挑战',
    summary: '真实 challenge 模式：要求节约出手并做出稳定连锁',
    objective: '清除所有彩球，至少触发4次连锁，且总发射不超过26次',
    rules: ['挑战模式没有教学缓冲，开局很快进入压迫段', '建议把万能球留给关键桥接位'],
    trackId: 'track-figure-eight-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple'],
    baseSpeed: 60,
    difficultyMultiplier: 2.4,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple'], [
      { totalBalls: 16, batchIntervalMs: 5200, batchSize: 4, powerupChance: 0.08, gapAfterMs: 900 },
      { totalBalls: 20, batchIntervalMs: 3200, batchSize: 5, powerupChance: 0.12, gapAfterMs: 600 },
      { totalBalls: 18, batchIntervalMs: 1800, batchSize: 6, powerupChance: 0.16 },
    ]),
    shotLimit: 26,
    chainLimit: 4,
    powerupPool: ['rewind', 'wild', 'burst'],
    powerupSpawnChance: 0.15,
    winObjectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minChainCount', targetValue: 4 },
      { type: 'maxShots', targetValue: 26 },
    ],
    recommendedPracticeTags: ['chain-master', 'danger-awareness'],
    intensity: 'S5',
  }),
  createChallengeLevel({
    levelId: 'zuma-challenge-002',
    title: '道具收束挑战',
    summary: '道具与高压并行，要求用对时机才过关',
    objective: '清除所有彩球，至少使用3次道具球，并达到2600分',
    rules: ['前段铺盘，中段高压，后段必须靠道具做收束', '不要把减速与倒退浪费在安全段'],
    trackId: 'track-spiral-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    baseSpeed: 62,
    difficultyMultiplier: 2.5,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow', 'purple', 'orange'], [
      { totalBalls: 18, batchIntervalMs: 5000, batchSize: 4, powerupChance: 0.1, gapAfterMs: 800 },
      { totalBalls: 22, batchIntervalMs: 3000, batchSize: 5, powerupChance: 0.15, gapAfterMs: 500 },
      { totalBalls: 20, batchIntervalMs: 1700, batchSize: 5, powerupChance: 0.2 },
    ]),
    powerupPool: ['slow', 'rewind', 'burst', 'lightning', 'wild'],
    powerupSpawnChance: 0.18,
    winObjectives: [
      { type: 'clearAll', targetValue: 0 },
      { type: 'minPowerupUses', targetValue: 3 },
      { type: 'scoreThreshold', targetValue: 2600 },
    ],
    recommendedPracticeTags: ['powerup-chain', 'powerup-advanced'],
    intensity: 'S5',
  }),
];

const ENDLESS_LEVELS: ZumaLevelDefinition[] = [
  createEndlessLevel({
    levelId: 'zuma-endless-001',
    title: '神庙无尽走廊',
    summary: '无尽模式骨架：清空一波后立刻进入下一波，持续加压',
    objective: '尽可能推进波段，记录最高波次',
    rules: ['每清空一波就会立刻装填下一波', '波段越高，球色越多、速度越快、批次越密', '无尽模式重点是波段推进与长线生存'],
    trackId: 'track-circle-01',
    colorPool: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    baseSpeed: 52,
    difficultyMultiplier: 2.1,
    spawnScript: createWaveSpawnScript(['red', 'blue', 'green', 'yellow'], [
      { totalBalls: 16, batchIntervalMs: 5200, batchSize: 4, powerupChance: 0.08, gapAfterMs: 900 },
      { totalBalls: 18, batchIntervalMs: 3200, batchSize: 5, powerupChance: 0.1 },
    ]),
    powerupPool: ['slow', 'rewind', 'burst', 'lightning', 'wild'],
    powerupSpawnChance: 0.14,
    endlessConfig: {
      startWave: 1,
      baseBatchIntervalMs: 4400,
      waveSpeedStep: 0.08,
      waveBallStep: 3,
      maxColorCount: 6,
    },
    recommendedPracticeTags: ['danger-awareness', 'timed-survival'],
    intensity: 'S4',
  }),
];

function createTimedLevel(
  durationMinutes: number,
  trackId: string,
  colorPool: ZumaBallColor[],
  baseSpeed: number,
  difficultyMultiplier: number,
): ZumaLevelDefinition {
  const timeLimitMs = durationMinutes * 60 * 1000;
  const track = getTrackDefinition(trackId);
  
  const winCondition: ZumaWinCondition = {
    type: 'timeLimit',
    targetValue: timeLimitMs,
  };
  
  const lossCondition: ZumaLossCondition = {
    type: 'reachFinish',
    finishLineDistance: track?.finishLineDistance || 0,
  };
  
  const spawnScript = createSpawnScript(colorPool, 200, 5000, 10, 0.08);
  
  return {
    levelId: `zuma-timed-${durationMinutes}min-${trackId}`,
    levelNumber: 0,
    mode: 'timed',
    title: `${durationMinutes}分钟冲分`,
    summary: `在${durationMinutes}分钟内尽可能获得高分`,
    objective: `限时${durationMinutes}分钟，球链触及终点则失败`,
    rules: ['限时模式', '球链持续生成', '尽可能获得高分'],
    trackId,
    colorPool,
    baseSpeed,
    difficultyMultiplier,
    spawnScript,
    powerupPool: ['slow', 'rewind', 'burst', 'lightning', 'wild'],
    powerupSpawnChance: 0.1,
    winCondition,
    lossCondition,
    timeLimitMs,
    recommendedPracticeTags: ['timed-survival'],
    intensity: durationMinutes <= 3 ? 'S2' : durationMinutes <= 5 ? 'S3' : 'S4',
  };
}

const TIMED_LEVELS_3MIN: ZumaLevelDefinition[] = TRACK_IDS_FOR_TIMED_MODE.map((trackId) =>
  createTimedLevel(3, trackId, ['red', 'blue', 'green'], 40, 1.5)
);

const TIMED_LEVELS_5MIN: ZumaLevelDefinition[] = TRACK_IDS_FOR_TIMED_MODE.map((trackId) =>
  createTimedLevel(5, trackId, ['red', 'blue', 'green', 'yellow'], 45, 1.8)
);

const TIMED_LEVELS_10MIN: ZumaLevelDefinition[] = TRACK_IDS_FOR_TIMED_MODE.map((trackId) =>
  createTimedLevel(10, trackId, ['red', 'blue', 'green', 'yellow', 'purple'], 50, 2.0)
);

for (const level of TEMPLE_ADVENTURE_LEVELS) {
  registerLevel(level);
}

for (const level of CHAIN_REWIND_LEVELS) {
  registerLevel(level);
}

for (const level of PRESSURE_LEVELS) {
  registerLevel(level);
}

for (const level of CHALLENGE_LEVELS) {
  registerLevel(level);
}

for (const level of ENDLESS_LEVELS) {
  registerLevel(level);
}

for (const level of TIMED_LEVELS_3MIN) {
  registerLevel(level);
}

for (const level of TIMED_LEVELS_5MIN) {
  registerLevel(level);
}

for (const level of TIMED_LEVELS_10MIN) {
  registerLevel(level);
}

export function getLevelDefinition(levelId: string): ZumaLevelDefinition | undefined {
  return LEVEL_CATALOG[levelId];
}

export function getAllLevelIds(): string[] {
  return Object.keys(LEVEL_CATALOG);
}

export function getLevelsByMode(mode: ZumaLevelMode): ZumaLevelDefinition[] {
  return Object.values(LEVEL_CATALOG).filter((level) => level.mode === mode);
}

export function getAdventureLevels(): ZumaLevelDefinition[] {
  return TEMPLE_ADVENTURE_LEVELS;
}

export function getChainRewindLevels(): ZumaLevelDefinition[] {
  return CHAIN_REWIND_LEVELS;
}

export function getPressureLevels(): ZumaLevelDefinition[] {
  return PRESSURE_LEVELS;
}

export function getChallengeLevels(): ZumaLevelDefinition[] {
  return CHALLENGE_LEVELS;
}

export function getEndlessLevels(): ZumaLevelDefinition[] {
  return ENDLESS_LEVELS;
}

export function getTimedLevelsByDuration(durationMinutes: number): ZumaLevelDefinition[] {
  switch (durationMinutes) {
    case 3:
      return TIMED_LEVELS_3MIN;
    case 5:
      return TIMED_LEVELS_5MIN;
    case 10:
      return TIMED_LEVELS_10MIN;
    default:
      return [];
  }
}

export function getTimedLevelDurations(): number[] {
  return [3, 5, 10];
}

export function getLevelPackSummary(packType: 'temple' | 'chain' | 'pressure' | 'challenge' | 'endless' | 'timed'): {
  name: string;
  levelCount: number;
  description: string;
} {
  switch (packType) {
    case 'temple':
      return {
        name: '神庙征途包',
        levelCount: TEMPLE_ADVENTURE_LEVELS.length,
        description: '12关入门关卡，从基础操作到综合考验',
      };
    case 'chain':
      return {
        name: '连锁回缩包',
        levelCount: CHAIN_REWIND_LEVELS.length,
        description: '16关进阶段内容，从连锁入门扩展到限弹与道具复合目标',
      };
    case 'pressure':
      return {
        name: '高压回廊包',
        levelCount: PRESSURE_LEVELS.length,
        description: '17关高压段骨架，强调多次危险窗口与波段脚本',
      };
    case 'challenge':
      return {
        name: '挑战试炼',
        levelCount: CHALLENGE_LEVELS.length,
        description: '真实 challenge 模式，偏限弹、连锁与高压收束',
      };
    case 'endless':
      return {
        name: '无尽走廊',
        levelCount: ENDLESS_LEVELS.length,
        description: '可反复推进波段的无尽生存骨架',
      };
    case 'timed':
      return {
        name: '计时冲分包',
        levelCount: TIMED_LEVELS_3MIN.length + TIMED_LEVELS_5MIN.length + TIMED_LEVELS_10MIN.length,
        description: '3档时长（3/5/10分钟）×6张轮换地图',
      };
  }
}

export function getNextLevelId(currentLevelId: string): string | undefined {
  const currentLevel = getLevelDefinition(currentLevelId);
  if (!currentLevel) return undefined;
  
  if (currentLevel.mode === 'adventure') {
    const adventureLevels = [...TEMPLE_ADVENTURE_LEVELS, ...CHAIN_REWIND_LEVELS, ...PRESSURE_LEVELS];
    const currentIndex = adventureLevels.findIndex((l) => l.levelId === currentLevelId);
    if (currentIndex >= 0 && currentIndex < adventureLevels.length - 1) {
      return adventureLevels[currentIndex + 1].levelId;
    }
  }
  
  return undefined;
}

export function getLevelIntensity(levelId: string): 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | undefined {
  const level = getLevelDefinition(levelId);
  return level?.intensity;
}

export function isLevelCleared(levelId: string, clearedLevelIds: string[]): boolean {
  return clearedLevelIds.includes(levelId);
}

export function isLevelUnlocked(levelId: string, clearedLevelIds: string[]): boolean {
  const level = getLevelDefinition(levelId);
  if (!level) return false;
  
  if (level.mode === 'timed' || level.mode === 'challenge' || level.mode === 'endless') return true;
  
  if (level.levelNumber <= 1) return true;
  
  const prevLevelId = `zuma-adventure-${(level.levelNumber - 1).toString().padStart(3, '0')}`;
  return clearedLevelIds.includes(prevLevelId);
}

export function getUnlockedLevelIds(clearedLevelIds: string[]): string[] {
  return getAllLevelIds().filter((levelId) => isLevelUnlocked(levelId, clearedLevelIds));
}

export function getLevelProgressSummary(clearedLevelIds: string[]): {
  templeCleared: number;
  templeTotal: number;
  chainCleared: number;
  chainTotal: number;
  pressureCleared: number;
  pressureTotal: number;
  timedPlayed: number;
  timedTotal: number;
} {
  const templeIds = TEMPLE_ADVENTURE_LEVELS.map((l) => l.levelId);
  const chainIds = CHAIN_REWIND_LEVELS.map((l) => l.levelId);
  const pressureIds = PRESSURE_LEVELS.map((l) => l.levelId);
  const timedIds = [...TIMED_LEVELS_3MIN, ...TIMED_LEVELS_5MIN, ...TIMED_LEVELS_10MIN].map((l) => l.levelId);
  
  return {
    templeCleared: templeIds.filter((id) => clearedLevelIds.includes(id)).length,
    templeTotal: templeIds.length,
    chainCleared: chainIds.filter((id) => clearedLevelIds.includes(id)).length,
    chainTotal: chainIds.length,
    pressureCleared: pressureIds.filter((id) => clearedLevelIds.includes(id)).length,
    pressureTotal: pressureIds.length,
    timedPlayed: timedIds.filter((id) => clearedLevelIds.includes(id)).length,
    timedTotal: timedIds.length,
  };
}

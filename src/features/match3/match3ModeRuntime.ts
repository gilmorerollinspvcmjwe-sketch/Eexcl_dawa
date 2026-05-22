/* 三消模式运行时目录。提供 Blitz / Puzzle 的入口、章节和脚本转换，不影响 Adventure 主线目录。 */

import type {
  Match3BoardTemplateId,
  Match3Color,
  Match3ColorWeights,
  Match3ComboObjectiveId,
  Match3DropExit,
  Match3Goal,
  Match3LevelConfig,
  Match3ModeId,
  Match3ObstacleType,
  Match3Portal,
  Match3PrebuiltSpecial,
} from './match3Types.ts';

export interface Match3RuntimeModeDefinition {
  id: Extract<Match3ModeId, 'adventure' | 'blitz' | 'puzzle'>;
  name: string;
  description: string;
  ownerSheet: 'Sheet16' | 'Sheet17';
}

export interface Match3ModeChapter {
  id: string;
  modeId: Exclude<Match3ModeId, 'practice'>;
  name: string;
  description: string;
}

export interface Match3ModeLevel {
  id: string;
  modeId: Exclude<Match3ModeId, 'practice'>;
  chapterId: string;
  chapterName: string;
  orderInPack: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  rows: number;
  cols: number;
  palette: Match3Color[];
  goals: Match3Goal[];
  maxMoves?: number;
  maxTimeMs?: number;
  boardTemplateId?: Match3BoardTemplateId;
  colorWeights?: Match3ColorWeights;
  initialObstacles?: {
    type: Match3ObstacleType;
    positions: { row: number; col: number }[];
  }[];
  portals?: Match3Portal[];
  dropExits?: Match3DropExit[];
  prebuiltSpecials?: Match3PrebuiltSpecial[];
  tutorialHint?: string;
}

const BASIC_PALETTE: Match3Color[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

function createScoreGoal(target: number): Match3Goal {
  return { type: 'score', target, current: 0 };
}

function createClearObstacleGoal(obstacle: Match3ObstacleType, target: number): Match3Goal {
  return { type: 'clearObstacle', target, current: 0, obstacleTarget: obstacle };
}

function createTriggerComboGoal(comboTarget: Match3ComboObjectiveId, target: number): Match3Goal {
  return { type: 'triggerCombo', target, current: 0, comboTarget };
}

export const MATCH3_RUNTIME_MODES: Match3RuntimeModeDefinition[] = [
  { id: 'adventure', name: 'Adventure', description: '主线逐关推进，按包和章节解锁。', ownerSheet: 'Sheet16' },
  { id: 'blitz', name: 'Blitz', description: '限时冲分，时间结束再按达标与否结算。', ownerSheet: 'Sheet16' },
  { id: 'puzzle', name: 'Puzzle', description: '固定盘解题，靠预置特殊块和复合目标完成谜题。', ownerSheet: 'Sheet16' },
];

const BLITZ_CHAPTERS: Match3ModeChapter[] = [
  {
    id: 'blitz-core',
    modeId: 'blitz',
    name: '限时冲分',
    description: '先放出 60/90/120 秒三档基础入口，后续可以继续扩地图数量。',
  },
];

const PUZZLE_CHAPTERS: Match3ModeChapter[] = [
  {
    id: 'puzzle-combos',
    modeId: 'puzzle',
    name: '组合谜题',
    description: '以固定盘和预置特殊块为主，强调组合与拆路。',
  },
];

const BLITZ_LEVELS: Match3ModeLevel[] = [
  {
    id: 'blitz-60-starter',
    modeId: 'blitz',
    chapterId: 'blitz-core',
    chapterName: '限时冲分',
    orderInPack: 1,
    name: 'Blitz 60 秒',
    description: '60 秒入门冲分，鼓励快速找四连和连锁。',
    difficulty: 'medium',
    rows: 8,
    cols: 8,
    palette: BASIC_PALETTE,
    boardTemplateId: 'blitz-open',
    colorWeights: { red: 3, orange: 2, yellow: 2 },
    goals: [createScoreGoal(6000)],
    maxTimeMs: 60000,
    tutorialHint: 'Blitz 会在时间归零时统一结算，先追求稳定连锁。',
  },
  {
    id: 'blitz-90-balance',
    modeId: 'blitz',
    chapterId: 'blitz-core',
    chapterName: '限时冲分',
    orderInPack: 2,
    name: 'Blitz 90 秒',
    description: '90 秒平衡分和稳定性，适合作为常驻冲分入口。',
    difficulty: 'hard',
    rows: 8,
    cols: 8,
    palette: BASIC_PALETTE,
    boardTemplateId: 'blitz-open',
    colorWeights: { blue: 3, purple: 3, green: 2 },
    goals: [createScoreGoal(9000)],
    maxTimeMs: 90000,
  },
  {
    id: 'blitz-120-endure',
    modeId: 'blitz',
    chapterId: 'blitz-core',
    chapterName: '限时冲分',
    orderInPack: 3,
    name: 'Blitz 120 秒',
    description: '120 秒耐力冲分，强调长连锁和高峰值。',
    difficulty: 'expert',
    rows: 9,
    cols: 9,
    palette: BASIC_PALETTE,
    boardTemplateId: 'blitz-open',
    colorWeights: { blue: 4, purple: 3, red: 2 },
    goals: [createScoreGoal(14000)],
    maxTimeMs: 120000,
  },
];

const PUZZLE_LEVELS: Match3ModeLevel[] = [
  {
    id: 'puzzle-combo-latch',
    modeId: 'puzzle',
    chapterId: 'puzzle-combos',
    chapterName: '组合谜题',
    orderInPack: 1,
    name: '双段点火',
    description: '先用条纹+包装打开棋盘，再用彩球点燃第二段目标。',
    difficulty: 'hard',
    rows: 8,
    cols: 8,
    palette: BASIC_PALETTE,
    boardTemplateId: 'combo-latch',
    colorWeights: { red: 4, blue: 2, orange: 2 },
    goals: [createTriggerComboGoal('striped-wrapped', 1), createTriggerComboGoal('colorBomb-special', 1)],
    maxMoves: 8,
    prebuiltSpecials: [
      { row: 4, col: 3, color: 'red', special: 'striped-h' },
      { row: 4, col: 4, color: 'red', special: 'wrapped' },
      { row: 2, col: 5, color: 'orange', special: 'colorBomb' },
      { row: 2, col: 6, color: 'orange', special: 'striped-v' },
    ],
    tutorialHint: 'Puzzle 会按步数和组合目标判定，预置特殊块就是解题线索。',
  },
  {
    id: 'puzzle-obstacle-gate',
    modeId: 'puzzle',
    chapterId: 'puzzle-combos',
    chapterName: '组合谜题',
    orderInPack: 2,
    name: '开门顺序',
    description: '固定步数下先拆石块再引爆组合，用来验证障碍与组合目标共存。',
    difficulty: 'expert',
    rows: 8,
    cols: 8,
    palette: BASIC_PALETTE,
    boardTemplateId: 'obstacle-fortress',
    goals: [createClearObstacleGoal('stone', 2), createTriggerComboGoal('wrapped-wrapped', 1)],
    maxMoves: 7,
    initialObstacles: [{ type: 'stone', positions: [{ row: 3, col: 2 }, { row: 3, col: 5 }] }],
    prebuiltSpecials: [
      { row: 5, col: 3, color: 'blue', special: 'wrapped' },
      { row: 5, col: 4, color: 'blue', special: 'wrapped' },
    ],
  },
];

export function getModeChapters(modeId: Match3ModeId): Match3ModeChapter[] {
  if (modeId === 'blitz') return BLITZ_CHAPTERS;
  if (modeId === 'puzzle') return PUZZLE_CHAPTERS;
  return [];
}

export function getModeLevelsByChapter(modeId: Match3ModeId, chapterId: string): Match3ModeLevel[] {
  if (modeId === 'blitz') {
    return BLITZ_LEVELS.filter((level) => level.chapterId === chapterId);
  }
  if (modeId === 'puzzle') {
    return PUZZLE_LEVELS.filter((level) => level.chapterId === chapterId);
  }
  return [];
}

export function getModeLevelById(id: string): Match3ModeLevel | undefined {
  return [...BLITZ_LEVELS, ...PUZZLE_LEVELS].find((level) => level.id === id);
}

export function convertModeLevelToConfig(level: Match3ModeLevel): Match3LevelConfig {
  return {
    id: level.id,
    name: level.name,
    modeId: level.modeId,
    chapterId: level.chapterId,
    chapterName: level.chapterName,
    boardTemplateId: level.boardTemplateId,
    rows: level.rows,
    cols: level.cols,
    palette: level.palette,
    colorWeights: level.colorWeights,
    goals: level.goals.map((goal) => ({ ...goal, current: 0 })),
    maxMoves: level.maxMoves,
    maxTimeMs: level.maxTimeMs,
    initialObstacles: level.initialObstacles,
    portals: level.portals,
    dropExits: level.dropExits,
    prebuiltSpecials: level.prebuiltSpecials,
  };
}

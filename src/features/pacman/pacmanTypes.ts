/* 吃豆人模块的核心类型定义。供迷宫系统、豆子系统、四鬼AI、关卡数据与 Sheet12/13 共用。 */

export type PacmanDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export type PacmanStatus = 'idle' | 'playing' | 'paused' | 'dead' | 'won' | 'lost';

export type PacmanMode = 'classic' | 'practice';

export type PacmanPracticeId = 'turning_basics' | 'energizer_chain' | 'ghost_escape' | 'timing_read';

/* 地图单元类型 */
export type PacmanCellType =
  | 'wall'
  | 'path'
  | 'pellet'
  | 'energizer'
  | 'ghostHouse'
  | 'ghostDoor'
  | 'tunnel'
  | 'fruitSpawn'
  | 'pacmanSpawn'
  | 'empty';

/* 鬼魂状态 */
export type GhostState =
  | 'house'
  | 'leavingHouse'
  | 'scatter'
  | 'chase'
  | 'frightened'
  | 'eaten'
  | 'respawn';

/* 全局模式 */
export type GlobalMode = 'scatter' | 'chase' | 'frightened';

/* 四鬼类型 */
export const GHOST_IDS = ['blinky', 'pinky', 'inky', 'clyde'] as const;
export type GhostId = (typeof GHOST_IDS)[number];

/* 鬼魂颜色映射 */
export const GHOST_COLORS: Record<GhostId, string> = {
  blinky: '#ff0000',
  pinky: '#ffb8ff',
  inky: '#00ffff',
  clyde: '#ffb852',
};

/* 鬼魂名称映射 */
export const GHOST_NAMES: Record<GhostId, string> = {
  blinky: '红鬼',
  pinky: '粉鬼',
  inky: '青鬼',
  clyde: '橙鬼',
};

/* 水果序列 */
export const FRUIT_IDS = [
  'cherry',
  'strawberry',
  'orange',
  'apple',
  'melon',
  'galaxian',
  'bell',
  'key',
] as const;
export type FruitId = (typeof FRUIT_IDS)[number];

/* 水果名称映射 */
export const FRUIT_NAMES: Record<FruitId, string> = {
  cherry: '樱桃',
  strawberry: '草莓',
  orange: '橙子',
  apple: '苹果',
  melon: '甜瓜',
  galaxian: '银河舰',
  bell: '铃铛',
  key: '钥匙',
};

/* 水果分数映射（原版分数） */
export const FRUIT_SCORES: Record<FruitId, number> = {
  cherry: 100,
  strawberry: 300,
  orange: 500,
  apple: 700,
  melon: 1000,
  galaxian: 2000,
  bell: 3000,
  key: 5000,
};

/* 迷宫单元格 */
export interface PacmanCell {
  row: number;
  col: number;
  type: PacmanCellType;
}

/* 迷宫定义 */
export interface PacmanMazeDefinition {
  id: string;
  name: string;
  rows: number;
  cols: number;
  grid: PacmanCellType[][];
  pacmanSpawn: { row: number; col: number };
  ghostHouseCenter: { row: number; col: number };
  ghostSpawns: Record<GhostId, { row: number; col: number }>;
  tunnelLeft: { row: number; col: number };
  tunnelRight: { row: number; col: number };
  energizerPositions: { row: number; col: number }[];
  fruitSpawnPosition: { row: number; col: number };
  totalPellets: number;
}

/* Pac-Man 实例状态 */
export interface PacmanInstance {
  row: number;
  col: number;
  direction: PacmanDirection;
  nextDirection: PacmanDirection;
  pixelX: number;
  pixelY: number;
  speed: number;
  isMoving: boolean;
}

/* 鬼魂实例状态 */
export interface GhostInstance {
  ghostId: GhostId;
  row: number;
  col: number;
  direction: PacmanDirection;
  pixelX: number;
  pixelY: number;
  state: GhostState;
  speed: number;
  pelletsRequiredToLeave: number;
  timeRequiredToLeaveMs: number;
  frightenedTimerMs: number;
  eatenScoreMultiplier: number;
  targetRow: number;
  targetCol: number;
  isInTunnel: boolean;
}

/* 水果实例状态 */
export interface FruitInstance {
  fruitId: FruitId;
  row: number;
  col: number;
  isActive: boolean;
  spawnTimeMs: number;
  lifetimeMs: number;
  remainingMs: number;
}

/* 全局模式时序状态 */
export interface GlobalModeState {
  currentMode: GlobalMode;
  modeIndex: number;
  modeTimerMs: number;
  frightenedTimerMs: number;
  frightenedBlinkPhase: boolean;
  scatterChaseSchedule: ScatterChasePhase[];
  frightenedDurationMs: number;
  frightenedBlinkStartMs: number;
}

/* Scatter/Chase 周期阶段 */
export interface ScatterChasePhase {
  mode: 'scatter' | 'chase';
  durationMs: number;
}

/* 关卡调优参数 */
export interface LevelTuningParams {
  level: number;
  pacmanSpeed: number;
  ghostSpeed: number;
  ghostTunnelSpeedMultiplier: number;
  frightenedGhostSpeed: number;
  frightenedDurationMs: number;
  frightenedBlinkStartMs: number;
  scatterChaseSchedule: ScatterChasePhase[];
  fruitSpawnThreshold1: number;
  fruitSpawnThreshold2: number;
  fruitLifetimeMs: number;
  fruitIndex: number;
  elroy1Threshold: number;
  elroy1SpeedBonus: number;
  elroy2Threshold: number;
  elroy2SpeedBonus: number;
}

/* 教学/练习关的完成条件 */
export interface PacmanCompletionRule {
  pelletsCollected?: number;
  ghostsEaten?: number;
  surviveMs?: number;
  tunnelUses?: number;
  fruitsCollected?: number;
}

/* 吃豆人游戏状态 */
export interface PacmanBoardState {
  packId: string;
  mazeId: string;
  rows: number;
  cols: number;
  cellSize: number;
  status: PacmanStatus;
  mode: PacmanMode;
  level: number;
  score: number;
  lives: number;
  pelletsRemaining: number;
  energizersRemaining: number;
  ghostsEatenInFrightened: number;
  totalGhostsEaten: number;
  fruitsCollected: number;
  fruitSpawnsTriggered: number;
  elapsedMs: number;
  pacman: PacmanInstance;
  ghosts: GhostInstance[];
  fruit: FruitInstance | null;
  globalMode: GlobalModeState;
  pelletsCollectedTotal: number;
  levelTuning: LevelTuningParams;
  isPaused: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  deathAnimationMs: number;
  respawnAnimationMs: number;
  lastInputDirection: PacmanDirection;
  tickAccumulatorMs: number;
  eatenPelletPositions: Set<string>;
  eatenEnergizerPositions: Set<string>;
  tunnelUses: number;
  extraLifeAwarded: boolean;
}

/* 创建游戏状态选项 */
export interface CreatePacmanBoardOptions {
  packId?: string;
  mazeId?: string;
  level?: number;
  mode?: PacmanMode;
}

/* 游戏存档（旧版兼容，新版在 pacmanStorage.ts） */
export interface PacmanRunStats {
  bestScore: number;
  highestLevel: number;
  totalGhostsEaten: number;
  totalFruitsCollected: number;
  totalRuns: number;
  bestClearTimeMs: number | null;
  oneLifeBestLevel: number;
}

/* 游戏结算结果 */
export interface PacmanRunResult {
  score: number;
  level: number;
  ghostsEaten: number;
  fruitsCollected: number;
  clearTimeMs: number;
  pelletsCollected: number;
  isNewBestScore: boolean;
  isNewHighestLevel: boolean;
}

/* 方向向量映射 */
export const DIRECTION_VECTORS: Record<PacmanDirection, { rowDelta: number; colDelta: number }> = {
  up: { rowDelta: -1, colDelta: 0 },
  down: { rowDelta: 1, colDelta: 0 },
  left: { rowDelta: 0, colDelta: -1 },
  right: { rowDelta: 0, colDelta: 1 },
  none: { rowDelta: 0, colDelta: 0 },
};

/* 反方向映射 */
export const OPPOSITE_DIRECTION: Record<PacmanDirection, PacmanDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
  none: 'none',
};

/* 基础分数 */
export const PELLET_SCORE = 10;
export const ENERGIZER_SCORE = 50;

/* 吃鬼分数递增（第一次200，每次翻倍，上限1600） */
export const GHOST_EAT_SCORES = [200, 400, 800, 1600];

/* 默认生命数 */
export const DEFAULT_LIVES = 3;

/* 逻辑帧率 */
export const LOGIC_TICK_MS = 1000 / 60;

/* 鬼屋放行参数 */
export const GHOST_RELEASE_CONFIG: Record<GhostId, { pelletsRequired: number; timeMs: number }> = {
  blinky: { pelletsRequired: 0, timeMs: 0 },
  pinky: { pelletsRequired: 0, timeMs: 0 },
  inky: { pelletsRequired: 10, timeMs: 4000 },
  clyde: { pelletsRequired: 30, timeMs: 10000 },
};

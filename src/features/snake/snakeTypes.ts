export type Direction = 'up' | 'down' | 'left' | 'right';

export type SnakeStatus = 'idle' | 'playing' | 'paused' | 'dead' | 'finished';
export type SnakeMode = 'classic' | 'timed' | 'challenge';
export type SnakeDifficulty = 'easy' | 'normal' | 'hard';

export type SnakeDeathReason = 'wall' | 'self' | 'obstacle' | 'timeout';

export type SnakeCell = {
  row: number;
  col: number;
};

export type SnakeSegment = SnakeCell & {
  segmentType: 'head' | 'body' | 'tail';
  token?: string;
};

export type SnakeState = {
  segments: SnakeSegment[];
  direction: Direction;
  nextDirection: Direction;
  growBy: number;
};

export type FoodKind =
  | 'letter'
  | 'digit'
  | 'coin'
  | 'coffee'
  | 'gold'
  | 'error_na'
  | 'error_div'
  | 'meeting'
  | 'wild';

export type FoodCell = SnakeCell & {
  kind: FoodKind;
  value: number;
  label: string;
  growth: number;
  boostMs: number;
  token?: string;
  isTarget?: boolean;
};

export type ObstacleKind = 'frozen' | 'merged' | 'filtered';

export type ObstacleCell = SnakeCell & {
  kind: ObstacleKind;
};

export type SnakeEventTone = 'success' | 'warning' | 'info';

export type SnakeBoardState = {
  rows: number;
  cols: number;
  status: SnakeStatus;
  mode: SnakeMode;
  difficulty: SnakeDifficulty;
  score: number;
  length: number;
  elapsedMs: number;
  remainingMs: number | null;
  snake: SnakeState;
  foods: FoodCell[];
  obstacles: ObstacleCell[];
  speedBoostMs: number;
  deathReason?: SnakeDeathReason;
  streak: number;
  lastFoodKind?: FoodKind;
  tickAccumulatorMs: number;
  chainTokens: string[];
  targetPlan: string[];
  targetIndex: number;
  targetProgress: number;
  completedTargets: string[];
  pressureLevel: number;
  lastEventText?: string;
  lastEventTone?: SnakeEventTone;
  eventMs: number;
  segmentCount: number;
  segmentIndex: number;
  segmentBoundaries: number[];
  activeSegments: string[];
  targetSegmentConfig?: Record<string, string[]>;
  dynamicPressureTimerMs: number;
};

export type CreateSnakeBoardOptions = {
  rows?: number;
  cols?: number;
  mode?: SnakeMode;
  difficulty?: SnakeDifficulty;
  durationMs?: number;
  targetPlan?: string[];
  targetSegmentConfig?: Record<string, string[]>;
  random?: () => number;
};

export type SnakeRunStats = {
  totalRuns: number;
  bestScore: number;
  bestLength: number;
};

export type SnakeMapSizePreset = 'small' | 'medium' | 'large';

export type SnakePreferences = {
  mapSize: SnakeMapSizePreset;
};

export type SnakeModuleStorage = {
  version: 2;
  stats: SnakeRunStats;
  preferences: SnakePreferences;
};

export type SnakeRunResult = SnakeRunStats & {
  score: number;
  length: number;
  isNewBestScore: boolean;
  isNewBestLength: boolean;
};

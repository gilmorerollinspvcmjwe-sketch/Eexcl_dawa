// 游戏类型定义

export type TargetType = 'head' | 'body' | 'feet';

export type GameMode = 'timed' | 'endless' | 'zen' | 'headshot';

export type TimedDuration = 30 | 60 | 120;

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type CrosshairStyle = 'dot' | 'cross' | 'circle' | 't-shape' | 'valorant' | 'cs2' | 'cf';

export type GamePreset = 'valorant' | 'cs2' | 'cf' | 'custom';

export interface Target {
  id: string;
  type: TargetType;
  row: number;
  col: number;
  createdAt: number;
  expiresAt?: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  mode: GameMode;
  timedDuration: TimedDuration;
  timeRemaining: number;
  score: number;
  combo: number;
  maxCombo: number;
  misses: number;
  totalClicks: number;
  hits: number;
  headHits: number;
  headAppearances: number;
  headshotLineRow: number;
}

export interface GameSettings {
  sensitivity: number;
  sensitivityX: number;
  sensitivityY: number;
  customCursor: boolean;
  crosshairStyle: CrosshairStyle;
  crosshairColor: string;
  crosshairSize: number; // 8-24 px
  spawnRate: number; // 1-10
  targetDuration: number; // 1-10
  targetSize: number; // 16-32 px
  soundEnabled: boolean;
  difficulty: Difficulty;
  headshotLineEnabled: boolean;
  headshotLineRow: number; // 默认第 10 行
  gamePreset: GamePreset;
}

export interface GameStats {
  totalGames: number;
  totalScore: number;
  maxCombo: number;
  avgScore: number;
  accuracy: number;
  headAccuracy: number;
  gamesHistory: GameHistoryEntry[];
  modeStats: {
    timed: ModeStat;
    endless: ModeStat;
    zen: ModeStat;
    headshot: ModeStat;
  };
}

export interface GameHistoryEntry {
  date: string;
  mode: GameMode;
  score: number;
  accuracy: number;
  headAccuracy: number;
  maxCombo: number;
  duration: number;
}

export interface ModeStat {
  gamesPlayed: number;
  avgScore: number;
  bestScore: number;
  avgAccuracy: number;
  totalHits: number;
  totalClicks: number;
}

export interface CellPosition {
  row: number;
  col: number;
  address: string;
}

export interface HitEffect {
  id: string;
  row: number;
  col: number;
  score: number;
  isCombo: boolean;
  isHeadshot: boolean;
  createdAt: number;
}

// 游戏预设灵敏度配置
export const GAME_PRESETS: Record<GamePreset, { name: string; sensitivityX: number; sensitivityY: number; dpi: number; multiplier: number }> = {
  valorant: { name: '瓦罗兰特', sensitivityX: 0.5, sensitivityY: 0.5, dpi: 800, multiplier: 1.0 },
  cs2: { name: 'CS2', sensitivityX: 1.2, sensitivityY: 1.2, dpi: 800, multiplier: 0.85 },
  cf: { name: 'CF', sensitivityX: 1.5, sensitivityY: 1.5, dpi: 800, multiplier: 0.7 },
  custom: { name: '自定义', sensitivityX: 1.0, sensitivityY: 1.0, dpi: 800, multiplier: 1.0 },
};

// 目标分数配置
export const TARGET_SCORES: Record<TargetType, number> = {
  head: 100,
  body: 50,
  feet: 25,
};

// 目标生成概率
export const TARGET_PROBS: Record<TargetType, number> = {
  head: 0.25,
  body: 0.45,
  feet: 0.30,
};

// 难度配置
export const DIFFICULTY_SETTINGS: Record<Difficulty, { spawnInterval: [number, number]; maxTargets: number }> = {
  easy: { spawnInterval: [2.0, 3.0], maxTargets: 1 },
  normal: { spawnInterval: [1.2, 2.0], maxTargets: 2 },
  hard: { spawnInterval: [0.7, 1.2], maxTargets: 3 },
  expert: { spawnInterval: [0.4, 0.8], maxTargets: 4 },
};

// 连击倍率
export const COMBO_MULTIPLIERS = [
  { threshold: 0, multiplier: 1.0 },
  { threshold: 5, multiplier: 1.2 },
  { threshold: 10, multiplier: 1.5 },
  { threshold: 20, multiplier: 2.0 },
  { threshold: 30, multiplier: 2.5 },
  { threshold: 50, multiplier: 3.0 },
];

// 游戏核心类型定义

export type GameMode = 'timed' | 'endless' | 'zen' | 'headshot' | 'peek_shot' | 'moving_target' | 'part_training';

export type TimedDuration = 30 | 60 | 120;

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

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
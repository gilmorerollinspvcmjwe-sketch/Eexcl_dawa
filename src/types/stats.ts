// 统计相关类型定义

import type { GameMode } from './game';
import type { PartWeights } from './enemy';

export interface ModeStat {
  gamesPlayed: number;
  avgScore: number;
  bestScore: number;
  avgAccuracy: number;
  totalHits: number;
  totalClicks: number;
}

// P1-1: 反应时间统计接口
export interface ReactionTimeStats {
  avg: number;      // 平均反应时间 (ms)
  best: number;     // 最佳反应时间 (ms)
  worst: number;    // 最差反应时间 (ms)
  history: number[]; // 最近 10 次反应时间
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
  // P1-1: 反应时间统计
  reactionTime?: ReactionTimeStats;
  // P1-2: CPS（点击速度）统计
  cps?: number;     // 平均每秒点击数
  cpsHistory?: number[]; // 最近 10 次 CPS 记录
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

// 关卡难度 (1-12)
export type LevelDifficulty = number;

// 关卡目标类型
export type LevelObjectiveType = 'minScore' | 'accuracy' | 'combo' | 'headshotCount' | 'timeLimit';

// 关卡配置
export interface LevelConfig {
  level: number;
  difficulty: LevelDifficulty;
  objectives: {
    type: LevelObjectiveType;
    target: number;
    description?: string;
  }[];
  rewards?: {
    score: number;
    accuracy: number;
  };
  timeLimit?: number;
  enemyConfig?: {
    maxEnemies: number;
    spawnInterval: [number, number];
    partWeights: PartWeights;
  };
}
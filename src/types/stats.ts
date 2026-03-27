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
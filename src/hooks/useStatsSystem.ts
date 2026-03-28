// 统计和历史记录管理 Hook

import { useState, useEffect, useCallback } from 'react';
import type { GameStats, GameHistoryEntry, ModeStat, ReactionTimeStats } from '../types';

// 默认模式统计
const DEFAULT_MODE_STAT: ModeStat = {
  gamesPlayed: 0,
  avgScore: 0,
  bestScore: 0,
  avgAccuracy: 0,
  totalHits: 0,
  totalClicks: 0,
};

// P1-1: 默认反应时间统计
const DEFAULT_REACTION_TIME_STATS: ReactionTimeStats = {
  avg: 0,
  best: Infinity,
  worst: 0,
  history: [],
};

// 默认游戏统计
const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  totalScore: 0,
  maxCombo: 0,
  avgScore: 0,
  accuracy: 0,
  headAccuracy: 0,
  gamesHistory: [],
  modeStats: {
    timed: { ...DEFAULT_MODE_STAT },
    endless: { ...DEFAULT_MODE_STAT },
    zen: { ...DEFAULT_MODE_STAT },
    headshot: { ...DEFAULT_MODE_STAT },
  },
  // P1-1 & P1-2: 新增字段
  reactionTime: { ...DEFAULT_REACTION_TIME_STATS },
  cps: 0,
  cpsHistory: [],
};

interface UseStatsSystemReturn {
  stats: GameStats;
  recordGameEnd: (entry: {
    mode: string;
    score: number;
    hits: number;
    totalClicks: number;
    headHits: number;
    headAppearances: number;
    maxCombo: number;
    duration: number;
    // P1-1: 反应时间参数
    avgReactionTime?: number;
    reactionTimeHistory?: number[];
  }) => void;
  resetStats: () => void;
}

export function useStatsSystem(): UseStatsSystemReturn {
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('excel-aim-stats-v2');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  // 保存统计数据
  useEffect(() => {
    localStorage.setItem('excel-aim-stats-v2', JSON.stringify(stats));
  }, [stats]);

  // 记录游戏结束
  const recordGameEnd = useCallback((entry: {
    mode: string;
    score: number;
    hits: number;
    totalClicks: number;
    headHits: number;
    headAppearances: number;
    maxCombo: number;
    duration: number;
    // P1-1: 反应时间参数
    avgReactionTime?: number;
    reactionTimeHistory?: number[];
  }) => {
    const accuracy = entry.totalClicks > 0 ? (entry.hits / entry.totalClicks) * 100 : 0;
    const headAccuracy = entry.headAppearances > 0 ? (entry.headHits / entry.headAppearances) * 100 : 0;

    // P1-2: 计算 CPS (每秒点击数)
    const cps = entry.duration > 0 ? entry.totalClicks / entry.duration : 0;

    const historyEntry: GameHistoryEntry = {
      date: new Date().toLocaleString('zh-CN'),
      mode: entry.mode as GameHistoryEntry['mode'],
      score: entry.score,
      accuracy,
      headAccuracy,
      maxCombo: entry.maxCombo,
      duration: entry.duration,
    };

    setStats(s => {
      const newTotalGames = s.totalGames + 1;
      const newTotalScore = s.totalScore + entry.score;
      
      // 从历史数据重新计算平均值
      const newHistory = [...s.gamesHistory, historyEntry].slice(-50);
      const recalculatedAvgScore = newHistory.reduce((sum, g) => sum + g.score, 0) / newHistory.length;
      
      // 累加所有模式的总命中和总点击来计算准确率
      let totalHits = s.modeStats.timed.totalHits + s.modeStats.endless.totalHits + 
                      s.modeStats.zen.totalHits + s.modeStats.headshot.totalHits + entry.hits;
      let totalClicks = s.modeStats.timed.totalClicks + s.modeStats.endless.totalClicks + 
                        s.modeStats.zen.totalClicks + s.modeStats.headshot.totalClicks + entry.totalClicks;
      const recalculatedAccuracy = totalClicks > 0 ? (totalHits / totalClicks) * 100 : 0;

      // 更新模式统计
      const modeKey = entry.mode as keyof typeof s.modeStats;
      const modeStat = s.modeStats[modeKey];
      const newModeGames = modeStat.gamesPlayed + 1;
      const newModeTotalScore = modeStat.avgScore * modeStat.gamesPlayed + entry.score;
      const newModeTotalAccuracy = modeStat.avgAccuracy * modeStat.gamesPlayed + accuracy;
      const newModeHits = modeStat.totalHits + entry.hits;
      const newModeClicks = modeStat.totalClicks + entry.totalClicks;

      // P1-1: 更新反应时间统计
      let newReactionTime = s.reactionTime || DEFAULT_REACTION_TIME_STATS;
      if (entry.avgReactionTime && entry.reactionTimeHistory) {
        const allHistory = [...(s.reactionTime?.history || []), ...entry.reactionTimeHistory].slice(-10);
        const avg = allHistory.length > 0 ? allHistory.reduce((a, b) => a + b, 0) / allHistory.length : 0;
        const best = allHistory.length > 0 ? Math.min(...allHistory) : Infinity;
        const worst = allHistory.length > 0 ? Math.max(...allHistory) : 0;
        newReactionTime = {
          avg,
          best: Math.min(s.reactionTime?.best || Infinity, best),
          worst: Math.max(s.reactionTime?.worst || 0, worst),
          history: allHistory,
        };
      }

      // P1-2: 更新 CPS 统计
      const newCpsHistory = [...(s.cpsHistory || []), cps].slice(-10);
      const avgCps = newCpsHistory.length > 0 ? newCpsHistory.reduce((a, b) => a + b, 0) / newCpsHistory.length : 0;

      return {
        totalGames: newTotalGames,
        totalScore: newTotalScore,
        maxCombo: Math.max(s.maxCombo, entry.maxCombo),
        avgScore: recalculatedAvgScore,
        accuracy: recalculatedAccuracy,
        headAccuracy: historyEntry.headAccuracy,
        gamesHistory: newHistory,
        modeStats: {
          ...s.modeStats,
          [modeKey]: {
            gamesPlayed: newModeGames,
            avgScore: newModeTotalScore / newModeGames,
            bestScore: Math.max(modeStat.bestScore, entry.score),
            avgAccuracy: newModeTotalAccuracy / newModeGames,
            totalHits: newModeHits,
            totalClicks: newModeClicks,
          },
        },
        // P1-1 & P1-2: 新增统计
        reactionTime: newReactionTime,
        cps: avgCps,
        cpsHistory: newCpsHistory,
      };
    });
  }, []);

  // 重置统计
  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, []);

  return {
    stats,
    recordGameEnd,
    resetStats,
  };
}
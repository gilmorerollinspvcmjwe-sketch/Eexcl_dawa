// 统计和历史记录管理 Hook

import { useState, useEffect, useCallback } from 'react';
import type { GameStats, GameHistoryEntry, ModeStat } from '../types';

// 默认模式统计
const DEFAULT_MODE_STAT: ModeStat = {
  gamesPlayed: 0,
  avgScore: 0,
  bestScore: 0,
  avgAccuracy: 0,
  totalHits: 0,
  totalClicks: 0,
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
  }) => {
    const accuracy = entry.totalClicks > 0 ? (entry.hits / entry.totalClicks) * 100 : 0;
    const headAccuracy = entry.headAppearances > 0 ? (entry.headHits / entry.headAppearances) * 100 : 0;

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
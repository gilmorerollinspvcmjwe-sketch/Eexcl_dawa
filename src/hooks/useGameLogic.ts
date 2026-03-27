import { useState, useCallback, useEffect, useRef } from 'react';
import type { Target, GameState, GameStats, GameMode, TimedDuration, TargetType, GameHistoryEntry, ModeStat, HitEffect } from '../types';
import { TARGET_SCORES, TARGET_PROBS, DIFFICULTY_SETTINGS, COMBO_MULTIPLIERS } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { COLS, ROWS, DEFAULT_TARGET_DURATION_MS, TARGET_DURATION_FACTOR, TARGET_DURATION_LEVELS, INITIAL_SPAWN_DELAY_MS, CLEANUP_INTERVAL_MS, HIT_EFFECT_DURATION_MS, CORNER_HIDE_DELAY_MS } from '../constants';

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

function getComboMultiplier(combo: number): number {
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

function getRandomTargetType(): TargetType {
  const rand = Math.random();
  if (rand < TARGET_PROBS.head) return 'head';
  if (rand < TARGET_PROBS.head + TARGET_PROBS.body) return 'body';
  return 'feet';
}

function getRandomPosition(): { row: number; col: number } {
  return {
    row: Math.floor(Math.random() * ROWS) + 1,
    col: Math.floor(Math.random() * COLS) + 2,
  };
}

export function useGameLogic() {
  const { settings } = useSettings();
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    mode: 'timed',
    timedDuration: 60,
    timeRemaining: 60,
    score: 0,
    combo: 0,
    maxCombo: 0,
    misses: 0,
    totalClicks: 0,
    hits: 0,
    headHits: 0,
    headAppearances: 0,
    headshotLineRow: settings.headshotLineRow || 10,
  });

  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentSheet, setCurrentSheet] = useState<'game' | 'stats' | 'settings'>('game');
  const [isHidden, setIsHidden] = useState(false);
  const [hoverCorner, setHoverCorner] = useState(false);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);

  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cornerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTimeRef = useRef<number>(0);

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('excel-aim-stats-v2');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  // 保存统计数据
  useEffect(() => {
    localStorage.setItem('excel-aim-stats-v2', JSON.stringify(stats));
  }, [stats]);

  // 计算目标持续时间（基于设置）
  const getTargetDuration = useCallback(() => {
    // 频率越高，持续时间越短
    return DEFAULT_TARGET_DURATION_MS + (TARGET_DURATION_LEVELS - settings.targetDuration) * TARGET_DURATION_FACTOR;
  }, [settings.targetDuration]);

  // 生成目标
  const spawnTarget = useCallback(() => {
    if (!gameState.isPlaying) return;

    setTargets(prev => {
      const diffSettings = DIFFICULTY_SETTINGS[settings.difficulty];
      if (prev.length >= diffSettings.maxTargets) return prev;

      let pos: { row: number; col: number };
      let type: TargetType;

      // 爆头线模式：所有目标都在爆头线上
      if (gameState.mode === 'headshot') {
        pos = {
          row: gameState.headshotLineRow,
          col: Math.floor(Math.random() * COLS) + 2,
        };
        type = 'head';
      } else {
        pos = getRandomPosition();
        type = getRandomTargetType();
      }

      const now = Date.now();
      const duration = getTargetDuration();

      const newTarget: Target = {
        id: `${now}-${Math.random()}`,
        type,
        row: pos.row,
        col: pos.col,
        createdAt: now,
        expiresAt: now + duration,
      };

      // 更新头部出现次数
      if (type === 'head') {
        setGameState(gs => ({ ...gs, headAppearances: gs.headAppearances + 1 }));
      }

      return [...prev, newTarget];
    });
  }, [gameState.isPlaying, gameState.mode, gameState.headshotLineRow, settings.difficulty, getTargetDuration]);

  // 清理过期目标和特效
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      
      // 清理过期目标
      setTargets(prev => {
        const expired = prev.filter(t => t.expiresAt && t.expiresAt < now);
        if (expired.length > 0 && gameState.isPlaying && gameState.mode !== 'zen') {
          setGameState(gs => ({
            ...gs,
            combo: 0,
            misses: gs.misses + expired.length,
          }));
        }
        return prev.filter(t => !t.expiresAt || t.expiresAt >= now);
      });

      // 清理命中特效
      setHitEffects(prev => prev.filter(e => now - e.createdAt < HIT_EFFECT_DURATION_MS));
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(cleanup);
  }, [gameState.isPlaying, gameState.mode]);

  // 游戏计时器
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      return;
    }

    if (gameState.mode === 'timed') {
      gameTimerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            endGame();
            return { ...prev, timeRemaining: 0, isPlaying: false };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.mode]);

  // 生成计时器 - 修复隐藏状态泄露随机数问题
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || isHidden) {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      return;
    }

    const diffSettings = DIFFICULTY_SETTINGS[settings.difficulty];
    const [minInterval, maxInterval] = diffSettings.spawnInterval;
    
    // 根据生成频率调整间隔
    const frequencyFactor = 11 - settings.spawnRate; // spawnRate 1-10 -> factor 10-1
    const adjustedMin = minInterval * (frequencyFactor / 5);
    const adjustedMax = maxInterval * (frequencyFactor / 5);

    const scheduleNextSpawn = () => {
      const interval = (adjustedMin + Math.random() * (adjustedMax - adjustedMin)) * 1000;
      
      spawnTimerRef.current = setTimeout(() => {
        if (gameState.isPlaying && !gameState.isPaused && !isHidden) {
          spawnTarget();
          scheduleNextSpawn();
        }
      }, interval);
    };

    // 首次生成延迟
    const initialSpawnTimer = setTimeout(() => {
      if (!isHidden) {
        spawnTarget();
        scheduleNextSpawn();
      }
    }, INITIAL_SPAWN_DELAY_MS);

    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      clearTimeout(initialSpawnTimer);
    };
  }, [gameState.isPlaying, gameState.isPaused, isHidden, settings.difficulty, settings.spawnRate, spawnTarget]);

  // 开始游戏
  const startGame = useCallback((mode: GameMode, duration?: TimedDuration) => {
    gameStartTimeRef.current = Date.now();
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      mode,
      timedDuration: duration || 60,
      timeRemaining: duration || 60,
      score: 0,
      combo: 0,
      maxCombo: 0,
      misses: 0,
      totalClicks: 0,
      hits: 0,
      headHits: 0,
      headAppearances: 0,
      headshotLineRow: settings.headshotLineRow,
    });
    setTargets([]);
    setHitEffects([]);
    setCurrentSheet('game');
  }, [settings.headshotLineRow]);

  // 结束游戏 - 修复统计数据累积计算错误
  const endGame = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    
    setGameState(prev => {
      // 计算本场统计
      const accuracy = prev.totalClicks > 0 ? (prev.hits / prev.totalClicks) * 100 : 0;
      const headAccuracy = prev.headAppearances > 0 ? (prev.headHits / prev.headAppearances) * 100 : 0;

      // 创建历史记录
      const historyEntry: GameHistoryEntry = {
        date: new Date().toLocaleString('zh-CN'),
        mode: prev.mode,
        score: prev.score,
        accuracy,
        headAccuracy,
        maxCombo: prev.maxCombo,
        duration: gameDuration,
      };

      // 更新总统计 - 从历史数据重新计算平均值，避免累积误差
      setStats(s => {
        const newTotalGames = s.totalGames + 1;
        const newTotalScore = s.totalScore + prev.score;
        
        // 从历史数据重新计算平均值
        const newHistory = [...s.gamesHistory, historyEntry].slice(-50);
        const recalculatedAvgScore = newHistory.reduce((sum, g) => sum + g.score, 0) / newHistory.length;
        
        // 累加所有模式的总命中和总点击来计算准确率
        let totalHits = s.modeStats.timed.totalHits + s.modeStats.endless.totalHits + s.modeStats.zen.totalHits + s.modeStats.headshot.totalHits + prev.hits;
        let totalClicks = s.modeStats.timed.totalClicks + s.modeStats.endless.totalClicks + s.modeStats.zen.totalClicks + s.modeStats.headshot.totalClicks + prev.totalClicks;
        const recalculatedAccuracy = totalClicks > 0 ? (totalHits / totalClicks) * 100 : 0;

        // 更新模式统计
        const modeKey = prev.mode as keyof typeof s.modeStats;
        const modeStat = s.modeStats[modeKey];
        const newModeGames = modeStat.gamesPlayed + 1;
        const newModeTotalScore = modeStat.avgScore * modeStat.gamesPlayed + prev.score;
        const newModeTotalAccuracy = modeStat.avgAccuracy * modeStat.gamesPlayed + accuracy;
        const newModeHits = modeStat.totalHits + prev.hits;
        const newModeClicks = modeStat.totalClicks + prev.totalClicks;

        return {
          totalGames: newTotalGames,
          totalScore: newTotalScore,
          maxCombo: Math.max(s.maxCombo, prev.maxCombo),
          avgScore: recalculatedAvgScore,
          accuracy: recalculatedAccuracy,
          headAccuracy: historyEntry.headAccuracy,
          gamesHistory: newHistory,
          modeStats: {
            ...s.modeStats,
            [modeKey]: {
              gamesPlayed: newModeGames,
              avgScore: newModeTotalScore / newModeGames,
              bestScore: Math.max(modeStat.bestScore, prev.score),
              avgAccuracy: newModeTotalAccuracy / newModeGames,
              totalHits: newModeHits,
              totalClicks: newModeClicks,
            },
          },
        };
      });

      return { ...prev, isPlaying: false };
    });
    setTargets([]);
  }, []);

  // 处理点击
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    
    if (!gameState.isPlaying || gameState.isPaused) return;

    setGameState(prev => ({ ...prev, totalClicks: prev.totalClicks + 1 }));

    // 检查是否点击到目标
    const hitTarget = targets.find(t => t.row === row && t.col === col);

    if (hitTarget) {
      // 爆头线模式：只有头部命中计分
      if (gameState.mode === 'headshot' && hitTarget.type !== 'head') {
        // 爆头线模式下身体/脚部不算分
        setTargets(prev => prev.filter(t => t.id !== hitTarget.id));
        return;
      }

      // 命中
      const baseScore = TARGET_SCORES[hitTarget.type];
      const newCombo = gameState.combo + 1;
      const multiplier = getComboMultiplier(newCombo);
      const earnedScore = Math.floor(baseScore * multiplier);

      // 添加命中特效 - 修复命中特效定义了但未渲染问题
      const effect: HitEffect = {
        id: `${Date.now()}-${Math.random()}`,
        row,
        col,
        score: earnedScore,
        isCombo: newCombo >= 5,
        isHeadshot: hitTarget.type === 'head',
        createdAt: Date.now(),
      };
      setHitEffects(prev => [...prev, effect]);

      setGameState(prev => ({
        ...prev,
        score: prev.score + earnedScore,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        hits: prev.hits + 1,
        headHits: hitTarget.type === 'head' ? prev.headHits + 1 : prev.headHits,
      }));

      // 移除目标
      setTargets(prev => prev.filter(t => t.id !== hitTarget.id));
    } else {
      // Miss
      if (gameState.mode === 'endless') {
        setGameState(prev => {
          const newMisses = prev.misses + 1;
          if (newMisses >= 3) {
            endGame();
          }
          return {
            ...prev,
            misses: newMisses,
            combo: 0,
          };
        });
      } else {
        setGameState(prev => ({ ...prev, combo: 0 }));
      }
    }
  }, [gameState, targets, endGame]);

  // 处理单元格悬停
  const handleCellHover = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  // 切换工作表
  const switchSheet = useCallback((sheet: 'game' | 'stats' | 'settings') => {
    setCurrentSheet(sheet);
  }, []);

  // 紧急隐藏
  const toggleHidden = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  // 暂停/继续游戏 - 新增暂停功能
  const togglePause = useCallback(() => {
    if (gameState.isPlaying) {
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, [gameState.isPlaying]);

  // 检测左上角悬停
  const handleCornerEnter = useCallback(() => {
    setHoverCorner(true);
    cornerTimerRef.current = setTimeout(() => {
      setIsHidden(true);
      setHoverCorner(false);
    }, CORNER_HIDE_DELAY_MS);
  }, []);

  const handleCornerLeave = useCallback(() => {
    setHoverCorner(false);
    if (cornerTimerRef.current) {
      clearTimeout(cornerTimerRef.current);
    }
  }, []);

  // Esc 键隐藏 / F5 恢复 / P 键暂停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleHidden();
      }
      if (e.key === 'F5' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsHidden(false);
      }
      if (e.key === 'p' || e.key === 'P') {
        if (!isHidden && gameState.isPlaying) {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHidden, togglePause, isHidden, gameState.isPlaying]);

  // 清理
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);
    };
  }, []);

  return {
    gameState,
    targets,
    selectedCell,
    currentSheet,
    isHidden,
    hoverCorner,
    stats,
    hitEffects,
    startGame,
    endGame,
    handleCellClick,
    handleCellHover,
    switchSheet,
    toggleHidden,
    togglePause,
    handleCornerEnter,
    handleCornerLeave,
    COLS,
    ROWS,
  };
}

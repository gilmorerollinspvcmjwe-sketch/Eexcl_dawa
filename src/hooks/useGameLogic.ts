// 主游戏逻辑协调层 - 整合各子系统

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameMode, TimedDuration, HitEffect } from '../types';
import { TARGET_SCORES, DIFFICULTY_SETTINGS, COMBO_MULTIPLIERS } from '../types';
import { useGameState } from './useGameState';
import { useTargetSystem } from './useTargetSystem';
import { useStatsSystem } from './useStatsSystem';
import { useSettings } from '../contexts/SettingsContext';
import { 
  COLS, 
  ROWS, 
  INITIAL_SPAWN_DELAY_MS, 
  CLEANUP_INTERVAL_MS, 
  HIT_EFFECT_DURATION_MS, 
  CORNER_HIDE_DELAY_MS 
} from '../constants';

// 连击倍率计算
function getComboMultiplier(combo: number): number {
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

import type { FPSTrainingMode } from '../components/TrainingModeSelector';

export function useGameLogic() {
  const { settings } = useSettings();
  
  // UI 状态 - 必须在 useTargetSystem 之前声明
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentSheet, setCurrentSheet] = useState<'hub' | 'game' | 'stats' | 'settings'>('hub');
  const [isHidden, setIsHidden] = useState(false);
  const [hoverCorner, setHoverCorner] = useState(false);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  
  // FPS 训练模式状态
  const [currentMode, setCurrentMode] = useState<FPSTrainingMode | null>(null);
  const [modeConfig, setModeConfig] = useState<any>({});

  // 计时器引用
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cornerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 游戏状态管理
  const {
    gameState,
    setGameState,
    resetGameState,
    resetCombo,
    incrementClicks,
    incrementHeadAppearances,
  } = useGameState(settings.headshotLineRow);

  // 目标系统
  const {
    targets,
    setTargets,
    spawnTarget,
    removeTarget,
    clearTargets,
  } = useTargetSystem({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    isHidden: isHidden,
    mode: gameState.mode,
    difficulty: settings.difficulty,
    targetDuration: settings.targetDuration,
    headshotLineRow: gameState.headshotLineRow,
    onHeadAppear: incrementHeadAppearances,
  });

  // 统计系统
  const { stats, recordGameEnd } = useStatsSystem();

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
  }, [gameState.isPlaying, gameState.mode, setTargets, setGameState]);

  // 游戏计时器（限时模式）
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

  // 生成计时器
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
    
    const frequencyFactor = 11 - settings.spawnRate;
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
  const startGame = useCallback((mode: GameMode, duration?: TimedDuration, level?: number) => {
    gameStartTimeRef.current = Date.now();
    resetGameState(mode, duration, settings.headshotLineRow);
    clearTargets();
    setHitEffects([]);
    setCurrentSheet('game');
    
    if (level) {
      console.log(`Starting level ${level} in ${mode} mode`);
    }
  }, [resetGameState, clearTargets, settings.headshotLineRow]);
  
  // 开始 FPS 训练模式
  const startGameWithMode = useCallback((mode: FPSTrainingMode, config?: any) => {
    gameStartTimeRef.current = Date.now();
    setCurrentMode(mode);
    if (config) {
      setModeConfig(config);
    }
    // 根据 FPS 模式设置游戏参数
    resetGameState('timed', config?.duration || 60, settings.headshotLineRow);
    clearTargets();
    setHitEffects([]);
    setCurrentSheet('game');
  }, [resetGameState, clearTargets, settings.headshotLineRow]);

  // 结束游戏
  const endGame = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    
    setGameState(prev => {
      recordGameEnd({
        mode: prev.mode,
        score: prev.score,
        hits: prev.hits,
        totalClicks: prev.totalClicks,
        headHits: prev.headHits,
        headAppearances: prev.headAppearances,
        maxCombo: prev.maxCombo,
        duration: gameDuration,
      });

      return { ...prev, isPlaying: false };
    });
    clearTargets();
  }, [recordGameEnd, clearTargets, setGameState]);

  // 处理点击
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    
    if (!gameState.isPlaying || gameState.isPaused) return;

    incrementClicks();

    const hitTarget = targets.find(t => t.row === row && t.col === col);

    if (hitTarget) {
      // 爆头线模式：只有头部命中计分
      if (gameState.mode === 'headshot' && hitTarget.type !== 'head') {
        removeTarget(hitTarget.id);
        return;
      }

      // 命中
      const baseScore = TARGET_SCORES[hitTarget.type];
      const newCombo = gameState.combo + 1;
      const multiplier = getComboMultiplier(newCombo);
      const earnedScore = Math.floor(baseScore * multiplier);

      // 添加命中特效
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

      removeTarget(hitTarget.id);
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
        resetCombo();
      }
    }
  }, [gameState, targets, incrementClicks, removeTarget, endGame, resetCombo, setGameState]);

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

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    if (gameState.isPlaying) {
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, [gameState.isPlaying, setGameState]);

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

  // 键盘快捷键
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
    startGameWithMode,
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
    // FPS 训练模式
    currentMode,
    setCurrentMode,
    modeConfig,
    setModeConfig,
    multiGridEnemies: [],
  };
}
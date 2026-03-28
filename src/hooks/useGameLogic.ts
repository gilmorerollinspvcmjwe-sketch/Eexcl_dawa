// 主游戏逻辑协调层 - 整合各子系统

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameMode, TimedDuration, HitEffect, LevelConfig, MultiGridEnemy, EnemyPart } from '../types';
import { DIFFICULTY_SETTINGS, COMBO_MULTIPLIERS } from '../types';
import { useGameState } from './useGameState';
import { useMultiGridEnemy } from './useMultiGridEnemy';
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
import { generateLevel, checkLevelCompletion } from '../levelGenerator';
import type { FPSTrainingMode } from '../components/TrainingModeSelector';

// 连击倍率计算
function getComboMultiplier(combo: number): number {
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

export function useGameLogic() {
  const { settings } = useSettings();
  
  // UI 状态
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentSheet, setCurrentSheet] = useState<'hub' | 'game' | 'stats' | 'settings'>('hub');
  const [isHidden, setIsHidden] = useState(false);
  const [hoverCorner, setHoverCorner] = useState(false);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  
  // FPS 训练模式状态
  const [currentMode, setCurrentMode] = useState<FPSTrainingMode | null>(null);
  const [modeConfig, setModeConfig] = useState<any>({});
  
  // 关卡系统状态
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [levelStatus, setLevelStatus] = useState<'playing' | 'completed' | 'failed' | null>(null);

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
  } = useGameState(settings.headshotLineRow);

  // 多格敌人系统
  const {
    enemies: multiGridEnemies,
    spawnEnemy,
    hitPart,
    removeEnemy,
    clearEnemies,
    updateEnemies,
    getEnemyAtPosition,
  } = useMultiGridEnemy({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    mode: gameState.mode,
    difficulty: settings.difficulty,
    moveSpeed: settings.enemyMoveSpeed,
    movePattern: settings.enemyMovePattern,
  });

  // 统计系统
  const { stats, recordGameEnd } = useStatsSystem();

  // 清理过期敌人和特效
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      
      // 清理命中特效
      setHitEffects(prev => prev.filter(e => now - e.createdAt < HIT_EFFECT_DURATION_MS));
      
      // 更新多格敌人
      if (gameState.isPlaying && !gameState.isPaused) {
        updateEnemies(0.1);
      }
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(cleanup);
  }, [gameState.isPlaying, gameState.isPaused, updateEnemies]);

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

  // 敌人生成计时器
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
          spawnEnemy({});
          scheduleNextSpawn();
        }
      }, interval);
    };

    const initialSpawnTimer = setTimeout(() => {
      if (!isHidden) {
        spawnEnemy({});
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
  }, [gameState.isPlaying, gameState.isPaused, isHidden, settings.difficulty, settings.spawnRate, spawnEnemy]);

  // 开始游戏
  const startGame = useCallback((mode: GameMode, duration?: TimedDuration, level?: number) => {
    gameStartTimeRef.current = Date.now();
    resetGameState(mode, duration, settings.headshotLineRow);
    clearEnemies();
    setHitEffects([]);
    setCurrentSheet('game');
    
    // 关卡模式
    if (level) {
      const config = generateLevel(level as any);
      setCurrentLevel(level);
      setLevelConfig(config);
      setLevelStatus('playing');
      console.log(`Starting level ${level}:`, config.objectives);
    } else {
      setCurrentLevel(null);
      setLevelConfig(null);
      setLevelStatus(null);
    }
  }, [resetGameState, clearEnemies, settings.headshotLineRow]);
  
  // 开始 FPS 训练模式
  const startGameWithMode = useCallback((mode: FPSTrainingMode, config?: any) => {
    gameStartTimeRef.current = Date.now();
    setCurrentMode(mode);
    if (config) {
      setModeConfig(config);
    }
    
    const duration = config?.duration || 60;
    resetGameState('timed', duration as TimedDuration, settings.headshotLineRow);
    clearEnemies();
    setHitEffects([]);
    setCurrentSheet('game');
    
    // 清除关卡状态
    setCurrentLevel(null);
    setLevelConfig(null);
    setLevelStatus(null);
    
    // 应用 FPS 模式特定配置
    if (mode === 'motion_track' && config) {
      console.log(`Motion Track: speed=${config.speed}, pattern=${config.pattern}`);
    } else if (mode === 'peek_shot' && config) {
      console.log(`Peek Shot: duration=${config.duration}, interval=${config.interval}`);
    } else if (mode === 'switch_track' && config) {
      console.log(`Switch Track: targetCount=${config.targetCount}, showPriority=${config.showPriority}`);
    } else if (mode === 'precision' && config) {
      console.log(`Precision: targetScale=${config.targetScale}, targetCount=${config.targetCount}`);
    }
  }, [resetGameState, clearEnemies, settings.headshotLineRow]);

  // 结束游戏
  const endGame = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    
    // 检查关卡完成状态
    if (levelConfig && currentLevel) {
      const result = checkLevelCompletion(levelConfig, {
        score: gameState.score,
        hits: gameState.hits,
        totalClicks: gameState.totalClicks,
        maxCombo: gameState.maxCombo,
        headHits: gameState.headHits,
        timeRemaining: gameState.timeRemaining,
      });
      setLevelStatus(result.completed ? 'completed' : (result.failed ? 'failed' : 'failed'));
      console.log(`Level ${currentLevel} ${result.completed ? 'completed!' : 'failed'}`, result.message);
    }
    
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
    clearEnemies();
  }, [recordGameEnd, clearEnemies, setGameState, levelConfig, currentLevel, gameState]);

  // 处理点击
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    
    if (!gameState.isPlaying || gameState.isPaused) return;

    incrementClicks();

    // 直接在 multiGridEnemies 中查找
    let enemyHit: { enemy: MultiGridEnemy; part: EnemyPart } | null = null;
    
    for (const enemy of multiGridEnemies) {
      if (!enemy.isAlive) continue;
      
      for (const part of enemy.parts) {
        if (part.state === 'destroyed') continue;
        
        const partRow = Math.round(enemy.anchorRow + part.relativeRow);
        const partCol = Math.round(enemy.anchorCol + part.relativeCol);
        
        if (partRow === row && partCol === col) {
          enemyHit = { enemy, part };
          break;
        }
      }
      if (enemyHit) break;
    }
    
    if (enemyHit) {
      const { enemy, part } = enemyHit;
      const result = hitPart(enemy.id, part.type, gameState.combo);
      
      if (result) {
        // 添加命中特效
        const effect: HitEffect = {
          id: `${Date.now()}-${Math.random()}`,
          row,
          col,
          score: result.score,
          isCombo: result.combo >= 5,
          isHeadshot: result.partType === 'head',
          createdAt: Date.now(),
        };
        setHitEffects(prev => [...prev, effect]);

        setGameState(prev => ({
          ...prev,
          score: prev.score + result.score,
          combo: result.combo,
          maxCombo: Math.max(prev.maxCombo, result.combo),
          hits: prev.hits + 1,
          headHits: result.partType === 'head' ? prev.headHits + 1 : prev.headHits,
        }));

        // 敌人死亡时移除
        if (result.isEnemyDead) {
          removeEnemy(enemy.id);
        }
      }
      return;
    }

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
  }, [gameState, multiGridEnemies, incrementClicks, endGame, resetCombo, setGameState, hitPart, removeEnemy]);

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
    targets: [], // 保留接口兼容，但返回空数组
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
    // 多格敌人
    multiGridEnemies,
    spawnEnemy,
    // 关卡系统
    currentLevel,
    levelConfig,
    levelStatus,
  };
}

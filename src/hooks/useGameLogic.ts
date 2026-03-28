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

function getComboMultiplier(combo: number): number {
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

export function useGameLogic() {
  const { settings, updateSetting } = useSettings();
  
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentSheet, setCurrentSheet] = useState<'hub' | 'game' | 'stats' | 'settings'>('hub');
  const [isHidden, setIsHidden] = useState(false);
  const [hoverCorner, setHoverCorner] = useState(false);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  
  const [currentMode, setCurrentMode] = useState<FPSTrainingMode | null>(null);
  const [modeConfig, setModeConfig] = useState<any>({});
  
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [levelStatus, setLevelStatus] = useState<'playing' | 'completed' | 'failed' | null>(null);

  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cornerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingDifficultyRef = useRef<string | null>(null);

  const {
    gameState,
    setGameState,
    resetGameState,
    resetCombo,
    incrementClicks,
  } = useGameState(settings.headshotLineRow);

  const {
    enemies: multiGridEnemies,
    spawnEnemy,
    hitPart,
    removeEnemy,
    clearEnemies,
    updateEnemies,
    setFPSConfig,
  } = useMultiGridEnemy({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    mode: gameState.mode,
    difficulty: settings.difficulty,
    moveSpeed: settings.enemyMoveSpeed,
    movePattern: settings.enemyMovePattern,
  });

  const { stats, recordGameEnd } = useStatsSystem();

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      
      setHitEffects(prev => prev.filter(e => now - e.createdAt < HIT_EFFECT_DURATION_MS));
      
      if (gameState.isPlaying && !gameState.isPaused) {
        updateEnemies(0.1);
      }
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(cleanup);
  }, [gameState.isPlaying, gameState.isPaused, updateEnemies]);

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

  const startGame = useCallback((mode: GameMode, duration?: TimedDuration, level?: number, difficulty?: string) => {
    gameStartTimeRef.current = Date.now();
    
    if (difficulty && difficulty !== settings.difficulty) {
      updateSetting('difficulty', difficulty as any);
    }
    
    resetGameState(mode, duration, settings.headshotLineRow);
    clearEnemies();
    setHitEffects([]);
    setCurrentSheet('game');
    
    if (level) {
      const config = generateLevel(level as any);
      setCurrentLevel(level);
      setLevelConfig(config);
      setLevelStatus('playing');
    } else {
      setCurrentLevel(null);
      setLevelConfig(null);
      setLevelStatus(null);
    }
  }, [resetGameState, clearEnemies, settings.headshotLineRow, settings.difficulty, updateSetting]);
  
  const startGameWithMode = useCallback((mode: FPSTrainingMode, config?: any) => {
    gameStartTimeRef.current = Date.now();
    setCurrentMode(mode);
    if (config) {
      setModeConfig(config);
      setFPSConfig(config);
    }
    
    const duration = config?.duration || 60;
    resetGameState('timed', duration as TimedDuration, settings.headshotLineRow);
    clearEnemies();
    setHitEffects([]);
    setCurrentSheet('game');
    
    setCurrentLevel(null);
    setLevelConfig(null);
    setLevelStatus(null);
  }, [resetGameState, clearEnemies, settings.headshotLineRow, setFPSConfig]);

  const endGame = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    
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

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    
    if (!gameState.isPlaying || gameState.isPaused) return;

    incrementClicks();

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

        if (result.isEnemyDead) {
          setTimeout(() => removeEnemy(enemy.id), 500);
        }
      }
      return;
    }

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

  const handleCellHover = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const switchSheet = useCallback((sheet: 'game' | 'stats' | 'settings') => {
    setCurrentSheet(sheet);
  }, []);

  const toggleHidden = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  const togglePause = useCallback(() => {
    if (gameState.isPlaying) {
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, [gameState.isPlaying, setGameState]);

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

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (cornerTimerRef.current) clearTimeout(cornerTimerRef.current);
    };
  }, []);

  return {
    gameState,
    targets: [],
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
    currentMode,
    setCurrentMode,
    modeConfig,
    setModeConfig,
    multiGridEnemies,
    spawnEnemy,
    currentLevel,
    levelConfig,
    levelStatus,
  };
}

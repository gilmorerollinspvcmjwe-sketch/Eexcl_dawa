// FPS 训练模式逻辑 Hook

import { useState, useCallback, useRef } from 'react';
import type { 
  MultiGridEnemy, 
  Priority,
  MovePattern,
  PeekDirection
} from '../types/enemy';
import { COLS, ROWS } from '../constants';

// ============================================================
// 类型定义
// ============================================================

export type FPSTrainingMode = 
  | 'motion_track'   // 移动射击
  | 'peek_shot'      // 拐角射击
  | 'switch_track'   // 多目标切换
  | 'reaction'       // 反应测试
  | 'precision';     // 精准射击

export interface MotionTrackConfig {
  speed: 'slow' | 'normal' | 'fast' | 'extreme';
  pattern: MovePattern;
  duration: number; // 秒
}

export interface PeekShotConfig {
  duration: 'long' | 'normal' | 'short' | 'blink';
  interval: number; // ms
  targetCount: number;
}

export interface SwitchTrackConfig {
  targetCount: number;
  showPriority: boolean;
  wrongOrderPenalty: 'reset' | 'none';
}

export interface ReactionConfig {
  rounds: number;
  warningTime: number; // ms
}

export interface PrecisionConfig {
  targetScale: number; // 0.25-1.0
  targetCount: number;
}

export interface FPSTrainingScore {
  hits: number;
  misses: number;
  accuracy: number;
  avgReactionTime: number;
  bestReactionTime: number;
  trackingSmoothness?: number;
  correctOrderHits?: number;
  wrongOrderHits?: number;
}

interface UseFPSTrainingProps {
  mode: FPSTrainingMode;
  isPlaying: boolean;
  isPaused: boolean;
  enemies: MultiGridEnemy[];
  onSpawnEnemy: (options?: SpawnOptions) => void;
}

interface UseFPSTrainingReturn {
  // 配置
  config: MotionTrackConfig | PeekShotConfig | SwitchTrackConfig | ReactionConfig | PrecisionConfig | null;
  setConfig: (config: any) => void;
  
  // 状态
  currentPhase: 'waiting' | 'showing' | 'result';
  expectedPriority: Priority | null;
  reactionStartTime: number | null;
  
  // 统计
  score: FPSTrainingScore;
  recordHit: (reactionTime: number, isCorrectOrder?: boolean) => void;
  recordMiss: () => void;
  
  // 控制
  startTraining: () => void;
  endTraining: () => void;
  updateTraining: (deltaTime: number) => void;
}

interface SpawnOptions {
  anchorRow?: number;
  anchorCol?: number;
  priority?: Priority;
  movePattern?: MovePattern;
  peekDirection?: PeekDirection;
}

// ============================================================
// Hook 实现
// ============================================================

export function useFPSTraining(props: UseFPSTrainingProps): UseFPSTrainingReturn {
  const { mode, isPlaying, isPaused, enemies, onSpawnEnemy } = props;

  // 配置状态
  const [config, setConfig] = useState<any>(getDefaultConfig(mode));
  
  // 阶段状态
  const [currentPhase, setCurrentPhase] = useState<'waiting' | 'showing' | 'result'>('waiting');
  const [expectedPriority, setExpectedPriority] = useState<Priority | null>(null);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  
  // 统计
  const [score, setScore] = useState<FPSTrainingScore>({
    hits: 0,
    misses: 0,
    accuracy: 100,
    avgReactionTime: 0,
    bestReactionTime: Infinity,
  });

  // 内部状态
  const reactionTimesRef = useRef<number[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);

  // 记录命中
  const recordHit = useCallback((reactionTime: number, isCorrectOrder: boolean = true) => {
    reactionTimesRef.current.push(reactionTime);
    
    setScore(prev => {
      const newHits = prev.hits + 1;
      const totalShots = newHits + prev.misses;
      const times = reactionTimesRef.current;
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      return {
        ...prev,
        hits: newHits,
        accuracy: (newHits / totalShots) * 100,
        avgReactionTime: avgTime,
        bestReactionTime: Math.min(prev.bestReactionTime, reactionTime),
        correctOrderHits: isCorrectOrder ? (prev.correctOrderHits ?? 0) + 1 : prev.correctOrderHits,
        wrongOrderHits: !isCorrectOrder ? (prev.wrongOrderHits ?? 0) + 1 : prev.wrongOrderHits,
      };
    });
  }, []);

  // 记录 Miss
  const recordMiss = useCallback(() => {
    setScore(prev => {
      const newMisses = prev.misses + 1;
      const totalShots = prev.hits + newMisses;
      
      return {
        ...prev,
        misses: newMisses,
        accuracy: (prev.hits / totalShots) * 100,
      };
    });
  }, []);

  // 开始训练
  const startTraining = useCallback(() => {
    setScore({
      hits: 0,
      misses: 0,
      accuracy: 100,
      avgReactionTime: 0,
      bestReactionTime: Infinity,
    });
    reactionTimesRef.current = [];
    setCurrentPhase('showing');
    lastSpawnTimeRef.current = Date.now();
  }, []);

  // 结束训练
  const endTraining = useCallback(() => {
    setCurrentPhase('result');
  }, []);

  // 更新训练
  const updateTraining = useCallback((deltaTime: number) => {
    if (!isPlaying || isPaused) return;

    const now = Date.now();

    switch (mode) {
      case 'motion_track':
        updateMotionTrack(deltaTime, now);
        break;
      case 'peek_shot':
        updatePeekShot(deltaTime, now);
        break;
      case 'switch_track':
        updateSwitchTrack(deltaTime, now);
        break;
      case 'reaction':
        updateReaction(deltaTime, now);
        break;
      case 'precision':
        updatePrecision(deltaTime, now);
        break;
    }
  }, [mode, isPlaying, isPaused, config, enemies]);

  // Motion Track 模式更新
  const updateMotionTrack = (_deltaTime: number, now: number) => {
    const motionConfig = config as MotionTrackConfig;
    const spawnInterval = 3000; // 每 3 秒生成一个敌人

    if (enemies.length < 2 && now - lastSpawnTimeRef.current > spawnInterval) {
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const row = 10 + Math.floor(Math.random() * (ROWS - 20));
      
      onSpawnEnemy({
        anchorRow: row,
        anchorCol: direction === 'left' ? COLS - 5 : 5,
        movePattern: motionConfig.pattern,
      });
      lastSpawnTimeRef.current = now;
    }
  };

  // Peek Shot 模式更新
  const updatePeekShot = (_deltaTime: number, now: number) => {
    const peekConfig = config as PeekShotConfig;
    
    if (enemies.length < peekConfig.targetCount && now - lastSpawnTimeRef.current > peekConfig.interval) {
      const direction: PeekDirection = Math.random() > 0.5 ? 'left' : 'right';
      const row = 10 + Math.floor(Math.random() * (ROWS - 20));
      
      onSpawnEnemy({
        anchorRow: row,
        anchorCol: direction === 'left' ? 5 : COLS - 5,
        peekDirection: direction,
      });
      lastSpawnTimeRef.current = now;
    }
  };

  // Switch Track 模式更新
  const updateSwitchTrack = (_deltaTime: number, now: number) => {
    const switchConfig = config as SwitchTrackConfig;
    
    if (enemies.length < switchConfig.targetCount && now - lastSpawnTimeRef.current > 2000) {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
      const usedPriorities = enemies.map(e => e.priority).filter(Boolean);
      const availablePriorities = priorities.filter(p => !usedPriorities.includes(p));
      
      if (availablePriorities.length > 0) {
        const priority = availablePriorities[Math.floor(Math.random() * availablePriorities.length)];
        const row = 8 + Math.floor(Math.random() * (ROWS - 16));
        const col = 8 + Math.floor(Math.random() * (COLS - 16));
        
        onSpawnEnemy({
          anchorRow: row,
          anchorCol: col,
          priority,
        });
        
        // 设置第一个优先级为预期目标
        if (expectedPriority === null) {
          setExpectedPriority(getHighestPriority(enemies.map(e => e.priority).filter(Boolean) as Priority[]));
        }
      }
      lastSpawnTimeRef.current = now;
    }
  };

  // Reaction 模式更新
  const updateReaction = (_deltaTime: number, now: number) => {
    // 反应测试有独立的流程
    if (enemies.length === 0 && currentPhase === 'showing' && now - lastSpawnTimeRef.current > 2000) {
      const row = Math.floor(ROWS / 2);
      const col = Math.floor(COLS / 2);
      
      onSpawnEnemy({
        anchorRow: row,
        anchorCol: col,
      });
      setReactionStartTime(now);
      lastSpawnTimeRef.current = now;
    }
  };

  // Precision 模式更新
  const updatePrecision = (_deltaTime: number, now: number) => {
    const precisionConfig = config as PrecisionConfig;
    
    if (enemies.length < precisionConfig.targetCount && now - lastSpawnTimeRef.current > 2500) {
      const row = 10 + Math.floor(Math.random() * (ROWS - 20));
      const col = 8 + Math.floor(Math.random() * (COLS - 16));
      
      onSpawnEnemy({
        anchorRow: row,
        anchorCol: col,
      });
      lastSpawnTimeRef.current = now;
    }
  };

  // 计算最高优先级
  function getHighestPriority(priorities: Priority[]): Priority {
    const order: Priority[] = ['critical', 'high', 'medium', 'low'];
    for (const p of order) {
      if (priorities.includes(p)) return p;
    }
    return 'low';
  }

  return {
    config,
    setConfig,
    currentPhase,
    expectedPriority,
    reactionStartTime,
    score,
    recordHit,
    recordMiss,
    startTraining,
    endTraining,
    updateTraining,
  };
}

// 获取默认配置
function getDefaultConfig(mode: FPSTrainingMode): any {
  switch (mode) {
    case 'motion_track':
      return {
        speed: 'normal' as const,
        pattern: 'linear' as MovePattern,
        duration: 60,
      };
    case 'peek_shot':
      return {
        duration: 'normal' as const,
        interval: 3000,
        targetCount: 1,
      };
    case 'switch_track':
      return {
        targetCount: 3,
        showPriority: true,
        wrongOrderPenalty: 'reset' as const,
      };
    case 'reaction':
      return {
        rounds: 5,
        warningTime: 1500,
      };
    case 'precision':
      return {
        targetScale: 0.5,
        targetCount: 3,
      };
    default:
      return null;
  }
}

export default useFPSTraining;
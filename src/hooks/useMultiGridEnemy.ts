// 多格敌人管理 Hook

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  MultiGridEnemy, 
  EnemyPart, 
  PartType, 
  PartHitResult,
  MovePattern,
  Priority,
  PartState
} from '../types/enemy';
import { 
  PART_MAX_HP, 
  PART_SCORES, 
  HUMANOID_PART_POSITIONS,
  PRIORITY_CONFIG
} from '../types/enemy';
import { COLS, ROWS } from '../constants';

interface UseMultiGridEnemyProps {
  isPlaying: boolean;
  isPaused: boolean;
  mode: string;
  difficulty: string;
  moveSpeed?: number;
  movePattern?: MovePattern;
}

interface UseMultiGridEnemyReturn {
  enemies: MultiGridEnemy[];
  spawnEnemy: (options?: SpawnOptions) => void;
  hitPart: (enemyId: string, partType: PartType, combo: number) => PartHitResult | null;
  removeEnemy: (id: string) => void;
  clearEnemies: () => void;
  updateEnemies: (deltaTime: number) => void;
  getEnemyAtPosition: (row: number, col: number) => { enemy: MultiGridEnemy; part: EnemyPart } | null;
}

interface SpawnOptions {
  anchorRow?: number;
  anchorCol?: number;
  priority?: Priority;
  movePattern?: MovePattern;
  peekDirection?: 'left' | 'right';
  moveSpeed?: number;
  peekDuration?: number;
  targetScale?: number;
}

interface FPSModeConfig {
  speed?: 'slow' | 'normal' | 'fast' | 'extreme';
  pattern?: MovePattern;
  duration?: number;
  interval?: number;
  targetCount?: number;
  showPriority?: boolean;
  targetScale?: number;
}

let enemyIdCounter = 0;
function generateId(): string {
  return `enemy-${Date.now()}-${++enemyIdCounter}`;
}

function createPart(partType: PartType, relativeRow: number, relativeCol: number): EnemyPart {
  return {
    type: partType,
    maxHp: PART_MAX_HP[partType],
    currentHp: PART_MAX_HP[partType],
    state: 'normal',
    relativeRow,
    relativeCol,
  };
}

function createHumanoidEnemy(options: SpawnOptions): MultiGridEnemy {
  const parts: EnemyPart[] = HUMANOID_PART_POSITIONS.map(({ part, relativeRow, relativeCol }) => 
    createPart(part, relativeRow, relativeCol)
  );

  return {
    id: generateId(),
    anchorRow: options.anchorRow ?? Math.floor(ROWS / 2),
    anchorCol: options.anchorCol ?? Math.floor(COLS / 2),
    parts,
    isAlive: true,
    state: 'idle',
    createdAt: Date.now(),
    totalDamageDealt: 0,
    partsDestroyed: 0,
    priority: options.priority,
    spawnTime: Date.now(),
    timeLimit: options.priority ? PRIORITY_CONFIG[options.priority].timeLimit : undefined,
    movePattern: options.movePattern ?? 'static',
    moveSpeed: options.moveSpeed ?? 1.0,
    peekDirection: options.peekDirection,
    peekDuration: options.peekDuration,
  };
}

const SPEED_MAP = {
  slow: 0.5,
  normal: 1.0,
  fast: 1.5,
  extreme: 2.5,
};

export function useMultiGridEnemy(props: UseMultiGridEnemyProps): UseMultiGridEnemyReturn {
  const { isPlaying, isPaused, mode, moveSpeed = 1.0, movePattern = 'linear' } = props;
  
  const [enemies, setEnemies] = useState<MultiGridEnemy[]>([]);
  const fpsConfigRef = useRef<FPSModeConfig>({});

  const setFPSConfig = useCallback((config: FPSModeConfig) => {
    fpsConfigRef.current = config;
  }, []);

  const spawnEnemy = useCallback((options?: SpawnOptions) => {
    if (!isPlaying || isPaused) return;

    const config = fpsConfigRef.current;
    const finalOptions: SpawnOptions = { ...options };

    if (config.speed) {
      finalOptions.moveSpeed = SPEED_MAP[config.speed] ?? 1.0;
    }
    if (config.pattern) {
      finalOptions.movePattern = config.pattern;
    }
    if (config.targetScale) {
      finalOptions.targetScale = config.targetScale;
    }

    const enemy = createHumanoidEnemy({
      ...finalOptions,
      anchorRow: finalOptions.anchorRow ?? (8 + Math.floor(Math.random() * (ROWS - 16))),
      anchorCol: finalOptions.anchorCol ?? (8 + Math.floor(Math.random() * (COLS - 16))),
    });

    if (mode === 'moving_target' || mode === 'motion_track') {
      enemy.movePattern = finalOptions.movePattern ?? movePattern;
      enemy.moveSpeed = finalOptions.moveSpeed ?? moveSpeed;
      enemy.moveProgress = 0;
      enemy.moveDirection = Math.random() > 0.5 ? 'left' : 'right';
    }

    if (mode === 'peek_shot') {
      enemy.peekState = 'hidden';
      enemy.peekProgress = 0;
      enemy.peekTimer = 0;
      enemy.peekDuration = config.duration ?? 1200;
      enemy.peekDirection = options?.peekDirection ?? (Math.random() > 0.5 ? 'left' : 'right');
    }

    setEnemies(prev => [...prev, enemy]);
  }, [isPlaying, isPaused, mode, movePattern, moveSpeed]);

  const hitPart = useCallback((enemyId: string, partType: PartType, combo: number): PartHitResult | null => {
    let result: PartHitResult | null = null;

    setEnemies(prev => prev.map(enemy => {
      if (enemy.id !== enemyId || !enemy.isAlive) return enemy;

      const partIndex = enemy.parts.findIndex(p => p.type === partType && p.state !== 'destroyed');
      if (partIndex === -1) return enemy;

      const part = enemy.parts[partIndex];
      const newHp = part.currentHp - 1;
      
      let newState: PartState = 'normal';
      if (newHp <= 0) {
        newState = 'destroyed';
      } else if (newHp === 1) {
        newState = 'critical';
      } else {
        newState = 'damaged';
      }

      const updatedParts = [...enemy.parts];
      updatedParts[partIndex] = {
        ...part,
        currentHp: Math.max(0, newHp),
        state: newState,
      };

      const baseScore = PART_SCORES[partType];
      const comboMultiplier = getComboMultiplier(combo + 1);
      const score = Math.floor(baseScore * comboMultiplier);

      const isDestroyed = newState === 'destroyed';
      const headDestroyed = partType === 'head' && isDestroyed;
      const allDestroyed = updatedParts.every(p => p.state === 'destroyed');
      const isEnemyDead = headDestroyed || allDestroyed;

      result = {
        partType,
        damage: 1,
        isDestroyed,
        isEnemyDead,
        score,
        combo: combo + 1,
      };

      return {
        ...enemy,
        parts: updatedParts,
        isAlive: !isEnemyDead,
        state: isEnemyDead ? 'dying' : enemy.state,
        diedAt: isEnemyDead ? Date.now() : undefined,
        totalDamageDealt: enemy.totalDamageDealt + 1,
        partsDestroyed: enemy.partsDestroyed + (isDestroyed ? 1 : 0),
      };
    }));

    return result;
  }, []);

  const removeEnemy = useCallback((id: string) => {
    setEnemies(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearEnemies = useCallback(() => {
    setEnemies([]);
  }, []);

  const updateEnemies = useCallback((deltaTime: number) => {
    if (!isPlaying || isPaused) return;

    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive) return enemy;

      let updated = { ...enemy };

      if (enemy.movePattern && enemy.movePattern !== 'static' && enemy.moveSpeed) {
        updated = updateMovingEnemy(updated, deltaTime);
      }

      if (enemy.peekState !== undefined) {
        updated = updatePeekingEnemy(updated, deltaTime);
      }

      return updated;
    }));
  }, [isPlaying, isPaused]);

  const getEnemyAtPosition = useCallback((row: number, col: number) => {
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      for (const part of enemy.parts) {
        if (part.state === 'destroyed') continue;
        
        const partRow = Math.round(enemy.anchorRow + part.relativeRow);
        const partCol = Math.round(enemy.anchorCol + part.relativeCol);
        
        if (partRow === row && partCol === col) {
          return { enemy, part };
        }
      }
    }
    return null;
  }, [enemies]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setEnemies(prev => prev.filter(e => {
        if (!e.isAlive && e.diedAt) {
          return now - e.diedAt < 500;
        }
        if (!e.isAlive) return false;
        if (e.expiresAt && now > e.expiresAt) return false;
        if (e.timeLimit && now - (e.spawnTime ?? 0) > e.timeLimit) return false;
        return true;
      }));
    }, 100);

    return () => clearInterval(cleanup);
  }, []);

  return {
    enemies,
    spawnEnemy,
    hitPart,
    removeEnemy,
    clearEnemies,
    updateEnemies,
    getEnemyAtPosition,
    setFPSConfig,
  } as UseMultiGridEnemyReturn & { setFPSConfig: (config: FPSModeConfig) => void };
}

function getComboMultiplier(combo: number): number {
  const COMBO_MULTIPLIERS = [
    { threshold: 0, multiplier: 1.0 },
    { threshold: 3, multiplier: 1.1 },
    { threshold: 8, multiplier: 1.25 },
    { threshold: 15, multiplier: 1.5 },
    { threshold: 25, multiplier: 2.0 },
    { threshold: 40, multiplier: 2.5 },
    { threshold: 60, multiplier: 3.0 },
    { threshold: 100, multiplier: 4.0 },
  ];
  
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

function updateMovingEnemy(enemy: MultiGridEnemy, deltaTime: number): MultiGridEnemy {
  if (!enemy.moveSpeed || !enemy.moveDirection) return enemy;

  const progress = (enemy.moveProgress ?? 0) + deltaTime * enemy.moveSpeed;
  
  let newCol = enemy.anchorCol;
  let direction = enemy.moveDirection;

  switch (enemy.movePattern) {
    case 'linear':
      if (direction === 'left') {
        newCol = enemy.anchorCol - deltaTime * enemy.moveSpeed;
        if (newCol <= 4) {
          direction = 'right';
          newCol = 4;
        }
      } else {
        newCol = enemy.anchorCol + deltaTime * enemy.moveSpeed;
        if (newCol >= COLS - 2) {
          direction = 'left';
          newCol = COLS - 2;
        }
      }
      break;

    case 'sine':
      const sineOffset = Math.sin(progress * 2) * 2;
      newCol = enemy.anchorCol + (direction === 'left' ? -deltaTime : deltaTime) * enemy.moveSpeed;
      return {
        ...enemy,
        anchorCol: Math.max(4, Math.min(COLS - 2, newCol)),
        anchorRow: Math.max(5, Math.min(ROWS - 5, enemy.anchorRow + sineOffset * deltaTime)),
        moveProgress: progress,
        moveDirection: direction,
      };

    case 'bounce':
      const bounceY = Math.abs(Math.sin(progress * 3)) * 3;
      newCol = enemy.anchorCol + (direction === 'left' ? -deltaTime : deltaTime) * enemy.moveSpeed;
      return {
        ...enemy,
        anchorCol: Math.max(4, Math.min(COLS - 2, newCol)),
        anchorRow: enemy.anchorRow + bounceY * deltaTime,
        moveProgress: progress,
        moveDirection: direction,
      };

    default:
      return enemy;
  }

  return {
    ...enemy,
    anchorCol: Math.max(4, Math.min(COLS - 2, newCol)),
    moveProgress: progress,
    moveDirection: direction,
  };
}

function updatePeekingEnemy(enemy: MultiGridEnemy, deltaTime: number): MultiGridEnemy {
  const PEEK_ANIM_DURATION = 200;

  let newState = { ...enemy };
  const timer = (enemy.peekTimer ?? 0) + deltaTime * 1000;

  switch (enemy.peekState) {
    case 'hidden':
      if (timer >= 2000) {
        return {
          ...newState,
          peekState: 'peeking',
          peekTimer: 0,
          peekProgress: 0,
        };
      }
      return { ...newState, peekTimer: timer };

    case 'peeking':
      const peekProgress = Math.min(1, timer / PEEK_ANIM_DURATION);
      if (peekProgress >= 1) {
        return {
          ...newState,
          peekState: 'visible',
          peekTimer: 0,
          peekProgress: 1,
        };
      }
      return { ...newState, peekTimer: timer, peekProgress };

    case 'visible':
      if (timer >= (enemy.peekDuration ?? 1200)) {
        return {
          ...newState,
          peekState: 'returning',
          peekTimer: 0,
        };
      }
      return { ...newState, peekTimer: timer };

    case 'returning':
      const returnProgress = Math.max(0, 1 - timer / PEEK_ANIM_DURATION);
      if (returnProgress <= 0) {
        return {
          ...newState,
          peekState: 'hidden',
          peekTimer: 0,
          peekProgress: 0,
          peekDirection: Math.random() > 0.5 ? 'left' : 'right',
        };
      }
      return { ...newState, peekTimer: timer, peekProgress: returnProgress };

    default:
      return newState;
  }
}

export default useMultiGridEnemy;

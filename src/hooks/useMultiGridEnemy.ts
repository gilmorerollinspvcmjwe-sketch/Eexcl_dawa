// 多格敌人管理 Hook

import { useState, useCallback, useEffect } from 'react';
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
}

// 生成唯一 ID
function generateId(): string {
  return `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 创建敌人部位
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

// 创建完整人形敌人
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
    peekDirection: options.peekDirection,
  };
}

export function useMultiGridEnemy(props: UseMultiGridEnemyProps): UseMultiGridEnemyReturn {
  const { isPlaying, isPaused, mode, moveSpeed = 1.0, movePattern = 'linear' } = props;
  
  const [enemies, setEnemies] = useState<MultiGridEnemy[]>([]);

  // 生成敌人
  const spawnEnemy = useCallback((options?: SpawnOptions) => {
    if (!isPlaying || isPaused) return;

    const enemy = createHumanoidEnemy({
      ...options,
      anchorRow: options?.anchorRow ?? (5 + Math.floor(Math.random() * (ROWS - 10))),
      anchorCol: options?.anchorCol ?? (5 + Math.floor(Math.random() * (COLS - 10))),
    });

    // 根据模式设置
    if (mode === 'moving_target') {
      enemy.movePattern = movePattern;
      enemy.moveSpeed = moveSpeed;
      enemy.moveProgress = 0;
      enemy.moveDirection = Math.random() > 0.5 ? 'left' : 'right';
    }

    if (mode === 'peek_shot') {
      enemy.peekState = 'hidden';
      enemy.peekProgress = 0;
      enemy.peekTimer = 0;
      enemy.peekDuration = 1200;
      enemy.peekDirection = options?.peekDirection ?? (Math.random() > 0.5 ? 'left' : 'right');
    }

    setEnemies(prev => [...prev, enemy]);
  }, [isPlaying, isPaused, mode, movePattern, moveSpeed]);

  // 击中部位
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

      // 计算得分
      const baseScore = PART_SCORES[partType];
      const comboMultiplier = getComboMultiplier(combo + 1);
      const score = Math.floor(baseScore * comboMultiplier);

      // 检查敌人是否死亡
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
        state: isEnemyDead ? 'dead' : enemy.state,
        totalDamageDealt: enemy.totalDamageDealt + 1,
        partsDestroyed: enemy.partsDestroyed + (isDestroyed ? 1 : 0),
      };
    }));

    return result;
  }, []);

  // 移除敌人
  const removeEnemy = useCallback((id: string) => {
    setEnemies(prev => prev.filter(e => e.id !== id));
  }, []);

  // 清空所有敌人
  const clearEnemies = useCallback(() => {
    setEnemies([]);
  }, []);

  // 更新敌人状态（移动、探头等）
  const updateEnemies = useCallback((deltaTime: number) => {
    if (!isPlaying || isPaused) return;

    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive) return enemy;

      let updated = { ...enemy };

      // 移动目标更新
      if (enemy.movePattern && enemy.movePattern !== 'static' && enemy.moveSpeed) {
        updated = updateMovingEnemy(updated, deltaTime);
      }

      // 探头状态更新
      if (enemy.peekState !== undefined) {
        updated = updatePeekingEnemy(updated, deltaTime);
      }

      return updated;
    }));
  }, [isPlaying, isPaused]);

  // 获取指定位置的敌人和部位
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

  // 自动清理死亡敌人和过期敌人
  useEffect(() => {
    const cleanup = setInterval(() => {
      setEnemies(prev => prev.filter(e => {
        if (!e.isAlive) return false;
        if (e.expiresAt && Date.now() > e.expiresAt) return false;
        if (e.timeLimit && Date.now() - (e.spawnTime ?? 0) > e.timeLimit) return false;
        return true;
      }));
    }, 200);

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
  };
}

// P1-3: 连击倍率计算 - 使用平滑曲线版本
function getComboMultiplier(combo: number): number {
  const COMBO_MULTIPLIERS = [
    { threshold: 0, multiplier: 1.0 },
    { threshold: 3, multiplier: 1.1 },   // 降低入门门槛
    { threshold: 8, multiplier: 1.25 },  // 更平滑过渡
    { threshold: 15, multiplier: 1.5 },
    { threshold: 25, multiplier: 2.0 },
    { threshold: 40, multiplier: 2.5 },
    { threshold: 60, multiplier: 3.0 },
    { threshold: 100, multiplier: 4.0 }, // 新增高阶奖励
  ];
  
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_MULTIPLIERS[i].threshold) {
      return COMBO_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0;
}

// 更新移动敌人
function updateMovingEnemy(enemy: MultiGridEnemy, deltaTime: number): MultiGridEnemy {
  if (!enemy.moveSpeed || !enemy.moveDirection) return enemy;

  const progress = (enemy.moveProgress ?? 0) + deltaTime * enemy.moveSpeed;
  
  let newCol = enemy.anchorCol;
  let direction = enemy.moveDirection;

  // 根据移动模式更新位置
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
      // 正弦波移动：水平移动 + 上下波动
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
      // 弹跳移动
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

// 更新探头敌人
function updatePeekingEnemy(enemy: MultiGridEnemy, deltaTime: number): MultiGridEnemy {
  const PEEK_ANIM_DURATION = 200; // ms

  let newState = { ...enemy };
  const timer = (enemy.peekTimer ?? 0) + deltaTime * 1000;

  switch (enemy.peekState) {
    case 'hidden':
      if (timer >= 2000) { // 等待 2 秒后探头
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
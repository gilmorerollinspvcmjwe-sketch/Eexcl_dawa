// 目标生成和管理 Hook

import { useState, useCallback } from 'react';
import type { Target, TargetType, Difficulty } from '../types';
import { TARGET_PROBS, DIFFICULTY_SETTINGS } from '../types';
import { COLS, ROWS, DEFAULT_TARGET_DURATION_MS, TARGET_DURATION_FACTOR, TARGET_DURATION_LEVELS } from '../constants';

interface UseTargetSystemProps {
  isPlaying: boolean;
  isPaused: boolean;
  isHidden: boolean;
  mode: string;
  difficulty: Difficulty;
  targetDuration: number;
  headshotLineRow?: number;
  onHeadAppear?: () => void;
}

interface UseTargetSystemReturn {
  targets: Target[];
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
  spawnTarget: () => void;
  removeTarget: (id: string) => void;
  getTargetDuration: () => number;
  clearTargets: () => void;
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

export function useTargetSystem(props: UseTargetSystemProps): UseTargetSystemReturn {
  const {
    isPlaying,
    isPaused,
    isHidden,
    mode,
    difficulty,
    targetDuration,
    headshotLineRow = 10,
    onHeadAppear,
  } = props;

  const [targets, setTargets] = useState<Target[]>([]);

  // 计算目标持续时间
  const getTargetDuration = useCallback(() => {
    return DEFAULT_TARGET_DURATION_MS + (TARGET_DURATION_LEVELS - targetDuration) * TARGET_DURATION_FACTOR;
  }, [targetDuration]);

  // 生成目标
  const spawnTarget = useCallback(() => {
    if (!isPlaying || isPaused || isHidden) return;

    setTargets(prev => {
      const diffSettings = DIFFICULTY_SETTINGS[difficulty];
      if (prev.length >= diffSettings.maxTargets) return prev;

      let pos: { row: number; col: number };
      let type: TargetType;

      // 爆头线模式：所有目标都在爆头线上
      if (mode === 'headshot') {
        pos = {
          row: headshotLineRow,
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
      if (type === 'head' && onHeadAppear) {
        onHeadAppear();
      }

      return [...prev, newTarget];
    });
  }, [isPlaying, isPaused, isHidden, mode, difficulty, headshotLineRow, getTargetDuration, onHeadAppear]);

  // 移除目标
  const removeTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  // 清空所有目标
  const clearTargets = useCallback(() => {
    setTargets([]);
  }, []);

  return {
    targets,
    setTargets,
    spawnTarget,
    removeTarget,
    getTargetDuration,
    clearTargets,
  };
}
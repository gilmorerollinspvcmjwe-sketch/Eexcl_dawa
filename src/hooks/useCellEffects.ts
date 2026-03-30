// 单元格动态效果 Hook - 优化版本
// 使用 CSS 动画代替频繁的 JavaScript 计算

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { CellSettings } from '../types/settings';

interface UseCellEffectsReturn {
  timeOffset: number;
  isAnimating: boolean;
  animationClass: string;
}

/**
 * 管理单元格动态效果的 Hook
 * 优化：使用 CSS 动画代替频繁的 JavaScript 计算
 */
export function useCellEffects(cellSettings?: CellSettings): UseCellEffectsReturn {
  const [timeOffset, setTimeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 根据速度获取动画间隔（毫秒）
  const getInterval = useCallback((): number => {
    switch (cellSettings?.animationSpeed) {
      case 'slow':
        return 2000;
      case 'fast':
        return 500;
      case 'normal':
      default:
        return 1000;
    }
  }, [cellSettings?.animationSpeed]);

  // 获取 CSS 动画类名
  const animationClass = useMemo(() => {
    if (!cellSettings?.enableAnimation) return '';
    
    const speed = cellSettings.animationSpeed || 'normal';
    const classes = ['cell-animated'];
    
    if (cellSettings.colorShift) {
      classes.push('cell-color-shift');
    }
    
    // 根据速度添加不同的动画类
    classes.push(`cell-animate-${speed}`);
    
    return classes.join(' ');
  }, [cellSettings?.enableAnimation, cellSettings?.animationSpeed, cellSettings?.colorShift]);

  useEffect(() => {
    if (cellSettings?.enableAnimation) {
      setIsAnimating(true);
      // 注意：不再频繁更新 timeOffset，而是使用 CSS 动画实现效果
      // timeOffset 只在需要时更新（如彩虹模式的流动效果）
      const interval = getInterval();
      intervalRef.current = setInterval(() => {
        setTimeOffset(prev => (prev + 1) % 360);
      }, interval);
    } else {
      setIsAnimating(false);
      setTimeOffset(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cellSettings?.enableAnimation, getInterval]);

  return {
    timeOffset,
    isAnimating,
    animationClass,
  };
}

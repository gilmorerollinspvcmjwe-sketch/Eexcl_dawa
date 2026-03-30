// 优化的单元格颜色缓存 Hook

import { useMemo, useRef, useEffect } from 'react';
import type { CellSettings, CellColorMode } from '../types/settings';

interface ColorCache {
  [key: string]: string;
}

// Note: _generateCacheKey function removed as it was unused
// If needed in the future, it can be re-added here

/**
 * 默认颜色 - Excel 经典风格
 */
function getDefaultColor(row: number, col: number): string {
  const isEvenRow = row % 2 === 0;
  const isEvenCol = col % 2 === 0;
  
  if (isEvenRow && isEvenCol) {
    return '#ffffff';
  } else if (!isEvenRow && !isEvenCol) {
    return '#f8f9fa';
  } else {
    return '#fafbfc';
  }
}

/**
 * 随机颜色模式
 */
function getRandomColor(intensity: number, timeOffset: number = 0): string {
  const seed = Math.floor(Date.now() / 1000) + timeOffset;
  const hue = (seed * 137.5) % 360;
  const saturation = 20 + (intensity * 0.6);
  const lightness = 90 + (intensity * 0.08);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 密度颜色模式
 */
function getDensityColor(row: number, col: number, intensity: number): string {
  const noise = Math.sin(row * 0.3) * Math.cos(col * 0.3) * Math.sin((row + col) * 0.2);
  const hue = Math.floor(((noise + 1) / 2) * 360);
  const saturation = 15 + Math.abs(noise) * (intensity * 0.5);
  const lightness = 92 - Math.abs(noise) * (intensity * 0.15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 棋盘格模式
 */
function getCheckerboardColor(row: number, col: number, intensity: number): string {
  const isEven = (row + col) % 2 === 0;
  const baseLightness = isEven ? 96 : 88;
  const lightnessVariation = (intensity / 100) * 8;
  const lightness = isEven 
    ? baseLightness + lightnessVariation 
    : baseLightness - lightnessVariation;
  return `hsl(0, 0%, ${lightness}%)`;
}

/**
 * 热图模式
 */
function getHeatmapColor(
  row: number, 
  col: number, 
  intensity: number, 
  maxRow: number, 
  maxCol: number
): string {
  const centerRow = maxRow / 2;
  const centerCol = maxCol / 2;
  const distance = Math.sqrt(
    Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
  );
  const maxDistance = Math.sqrt(Math.pow(centerRow, 2) + Math.pow(centerCol, 2));
  const normalized = 1 - (distance / maxDistance);
  
  const hue = normalized * 120;
  const saturation = (intensity / 100) * 60;
  const lightness = 85 + normalized * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 彩虹渐变模式
 */
function getRainbowColor(
  col: number, 
  intensity: number, 
  maxCol: number,
  timeOffset: number = 0
): string {
  const hueOffset = timeOffset * 10;
  const hue = ((col / maxCol) * 360 + hueOffset) % 360;
  const saturation = 20 + (intensity * 0.5);
  const lightness = 92;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 获取单个单元格颜色
 */
function getCellColor(
  row: number,
  col: number,
  mode: CellColorMode,
  intensity: number,
  maxRow: number,
  maxCol: number,
  timeOffset: number = 0
): string {
  switch (mode) {
    case 'random':
      return getRandomColor(intensity, timeOffset);
    case 'density':
      return getDensityColor(row, col, intensity);
    case 'checkerboard':
      return getCheckerboardColor(row, col, intensity);
    case 'heatmap':
      return getHeatmapColor(row, col, intensity, maxRow, maxCol);
    case 'rainbow':
      return getRainbowColor(col, intensity, maxCol, timeOffset);
    case 'default':
    default:
      return getDefaultColor(row, col);
  }
}

/**
 * 优化的单元格颜色 Hook
 * 使用 Map 缓存颜色计算结果，避免重复计算
 * 优化策略：
 * 1. 只在颜色模式变化时重新计算
 * 2. 对于随机和彩虹模式，忽略 timeOffset（使用 CSS 动画代替）
 * 3. 对于静态模式（密度、棋盘、热图），只计算一次
 */
export function useCellColors(
  ROWS: number,
  COLS: number,
  cellSettings?: CellSettings,
  _timeOffset: number = 0  // 忽略 timeOffset，使用 CSS 动画代替
): Map<string, string> {
  const cacheRef = useRef<ColorCache>({});
  const staticCacheRef = useRef<ColorCache>({});
  const prevSettingsRef = useRef<string>('');
  
  const colorMode = cellSettings?.colorMode || 'default';
  const intensity = cellSettings?.colorIntensity || 50;
  
  // 判断是否为静态颜色模式（不随时间变化）
  const isStaticMode = colorMode === 'density' || colorMode === 'checkerboard' || colorMode === 'heatmap';
  
  // 生成缓存键 - 不包含 timeOffset，避免频繁重新计算
  const settingsKey = `${colorMode}-${intensity}`;
  
  // 当设置变化时，清空缓存
  useEffect(() => {
    if (prevSettingsRef.current !== settingsKey) {
      cacheRef.current = {};
      staticCacheRef.current = {};
      prevSettingsRef.current = settingsKey;
    }
  }, [settingsKey]);
  
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    
    // 只在非默认模式下预计算颜色
    if (colorMode === 'default') {
      return map;
    }
    
    // 对于静态模式，使用静态缓存
    if (isStaticMode && Object.keys(staticCacheRef.current).length > 0) {
      // 检查静态缓存是否匹配当前设置
      if (staticCacheRef.current['_cacheKey'] === settingsKey) {
        // 使用静态缓存
        for (let row = 1; row <= ROWS; row++) {
          for (let col = 1; col <= COLS; col++) {
            const key = `${row}-${col}`;
            const color = staticCacheRef.current[key];
            if (color) {
              map.set(key, color);
            }
          }
        }
        return map;
      }
    }
    
    // 批量计算颜色
    for (let row = 1; row <= ROWS; row++) {
      for (let col = 1; col <= COLS; col++) {
        const key = `${row}-${col}`;
        
        // 检查动态缓存
        if (cacheRef.current[key]) {
          map.set(key, cacheRef.current[key]);
        } else {
          const color = getCellColor(
            row,
            col,
            colorMode,
            intensity,
            ROWS,
            COLS,
            0  // 不使用 timeOffset，使用 CSS 动画代替
          );
          cacheRef.current[key] = color;
          map.set(key, color);
          
          // 对于静态模式，也保存到静态缓存
          if (isStaticMode) {
            staticCacheRef.current[key] = color;
          }
        }
      }
    }
    
    // 保存静态缓存键
    if (isStaticMode) {
      staticCacheRef.current['_cacheKey'] = settingsKey;
    }
    
    return map;
  }, [ROWS, COLS, colorMode, intensity, isStaticMode, settingsKey]);
  
  return colorMap;
}

/**
 * 获取默认颜色的快速版本（无需计算）
 */
export function getDefaultCellColor(row: number, col: number): string {
  return getDefaultColor(row, col);
}

// 单元格颜色算法工具

import type { CellColorMode } from '../types/settings';

/**
 * 根据颜色模式和位置计算单元格背景色
 */
export function getCellColor(
  row: number,
  col: number,
  mode: CellColorMode,
  intensity: number,
  maxRow: number = 50,
  maxCol: number = 30,
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
 * 默认颜色 - Excel 经典风格
 */
function getDefaultColor(row: number, col: number): string {
  // 交替的浅灰色，模拟 Excel 效果
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
  // 使用伪随机，基于时间偏移实现动态效果
  const seed = Math.floor(Date.now() / 1000) + timeOffset;
  const hue = (seed * 137.5) % 360;
  const saturation = 20 + (intensity * 0.6); // 20% - 80%
  const lightness = 90 + (intensity * 0.08); // 90% - 98%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 密度颜色模式 - 基于位置的伪随机，形成区域密度效果
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
 * 热图模式 - 中心亮边缘暗
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
  
  // 从红色(0)到绿色(120)的渐变
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
  // 添加时间偏移实现流动效果
  const hueOffset = timeOffset * 10;
  const hue = ((col / maxCol) * 360 + hueOffset) % 360;
  const saturation = 20 + (intensity * 0.5);
  const lightness = 92;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 生成 CSS 自定义属性字符串，用于动态更新单元格大小
 */
export function generateCellCSSVariables(
  cellWidth: number,
  cellHeight: number
): Record<string, string> {
  return {
    '--excel-cell-width': `${cellWidth}px`,
    '--excel-cell-height': `${cellHeight}px`,
  };
}

/**
 * 获取动画持续时间（毫秒）
 */
export function getAnimationDuration(speed: 'slow' | 'normal' | 'fast'): number {
  switch (speed) {
    case 'slow':
      return 2000;
    case 'fast':
      return 500;
    case 'normal':
    default:
      return 1000;
  }
}

/**
 * 预生成颜色缓存键
 */
export function generateColorCacheKey(
  row: number,
  col: number,
  mode: CellColorMode,
  intensity: number,
  timeOffset: number = 0
): string {
  return `${row}-${col}-${mode}-${intensity}-${timeOffset}`;
}

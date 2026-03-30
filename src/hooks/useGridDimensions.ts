import { useState, useEffect, type RefObject } from 'react';
import { COLS, ROWS, CELL_WIDTH, CELL_HEIGHT, SAFE_ZONE_ROWS, SAFE_ZONE_COLS, BOTTOM_SAFE_ROWS } from '../constants';

interface GridDimensions {
  // 实际可用行列数
  availableCols: number;
  availableRows: number;
  // 安全区域内的可用行列数
  safeZoneCols: number;
  safeZoneRows: number;
  // 单元格尺寸
  cellWidth: number;
  cellHeight: number;
  // 容器尺寸
  containerWidth: number;
  containerHeight: number;
}

/**
 * 监听网格容器尺寸变化，计算实际可用的刷新区域
 */
export function useGridDimensions(containerRef: RefObject<HTMLElement | null>): GridDimensions {
  const [dimensions, setDimensions] = useState<GridDimensions>({
    availableCols: COLS,
    availableRows: ROWS,
    safeZoneCols: COLS - SAFE_ZONE_COLS * 2,
    safeZoneRows: ROWS - SAFE_ZONE_ROWS - BOTTOM_SAFE_ROWS,
    cellWidth: CELL_WIDTH,
    cellHeight: CELL_HEIGHT,
    containerWidth: 0,
    containerHeight: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // 减去行头宽度和列头高度
      const availableWidth = width - 24; // 24px 行头宽度
      const availableHeight = height - 20; // 20px 列头高度

      // 计算实际可用行列数
      const availableCols = Math.min(COLS, Math.floor(availableWidth / CELL_WIDTH));
      const availableRows = Math.min(ROWS, Math.floor(availableHeight / CELL_HEIGHT));

      // 计算安全区域内的可用行列数
      const safeZoneCols = Math.max(1, availableCols - SAFE_ZONE_COLS * 2);
      const safeZoneRows = Math.max(1, availableRows - SAFE_ZONE_ROWS - BOTTOM_SAFE_ROWS);

      setDimensions({
        availableCols,
        availableRows,
        safeZoneCols,
        safeZoneRows,
        cellWidth: CELL_WIDTH,
        cellHeight: CELL_HEIGHT,
        containerWidth: width,
        containerHeight: height,
      });
    };

    // 初始计算
    calculateDimensions();

    // 使用 ResizeObserver 监听尺寸变化
    const observer = new ResizeObserver(() => {
      calculateDimensions();
    });

    observer.observe(containerRef.current);

    // 同时监听窗口 resize
    window.addEventListener('resize', calculateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [containerRef]);

  return dimensions;
}

/**
 * 根据容器尺寸计算敌人应该生成的安全位置
 */
export function calculateSafeSpawnPosition(
  dimensions: GridDimensions,
  mode: string,
  headshotLineRow?: number,
  existingOptions?: { anchorRow?: number; anchorCol?: number }
): { anchorRow: number; anchorCol: number } {
  const { safeZoneCols, safeZoneRows } = dimensions;
  
  // 安全区域的起始位置
  const startRow = SAFE_ZONE_ROWS;
  const startCol = SAFE_ZONE_COLS;
  
  let anchorRow: number;
  let anchorCol: number;

  if (mode === 'headshot' && headshotLineRow !== undefined) {
    // 爆头模式：使用指定的爆头线，但限制在安全区域内
    anchorRow = Math.max(startRow, Math.min(startRow + safeZoneRows - 1, headshotLineRow));
    anchorCol = existingOptions?.anchorCol ?? (startCol + Math.floor(Math.random() * safeZoneCols));
  } else {
    // 普通模式：在安全区域内随机生成
    anchorRow = existingOptions?.anchorRow ?? (startRow + Math.floor(Math.random() * safeZoneRows));
    anchorCol = existingOptions?.anchorCol ?? (startCol + Math.floor(Math.random() * safeZoneCols));
  }

  // 确保不超出边界
  anchorRow = Math.max(startRow, Math.min(startRow + safeZoneRows - 3, anchorRow));
  anchorCol = Math.max(startCol, Math.min(startCol + safeZoneCols - 3, anchorCol));

  return { anchorRow, anchorCol };
}

export default useGridDimensions;

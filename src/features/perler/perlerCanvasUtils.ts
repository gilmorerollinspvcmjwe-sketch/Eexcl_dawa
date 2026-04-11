export const IMPORT_SIZE_OPTIONS = [16, 24, 32, 48, 64, 80, 96, 120, 160, 200, 240, 300] as const;

export type PerlerViewMode = 'split' | 'focus' | 'reference';

export interface PerlerRegion {
  id: string;
  label: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  width: number;
  height: number;
}

export function getPerlerFocusVisibility(focusMode: boolean) {
  if (focusMode) {
    return {
      showSidebar: false,
      showReference: false,
      playerOnly: true,
    };
  }

  return {
    showSidebar: true,
    showReference: true,
    playerOnly: false,
  };
}

export function getPerlerViewVisibility(viewMode: PerlerViewMode) {
  if (viewMode === 'focus') {
    return {
      showSidebar: false,
      showReference: false,
      showPlayer: true,
    };
  }

  if (viewMode === 'reference') {
    return {
      showSidebar: false,
      showReference: true,
      showPlayer: false,
    };
  }

  return {
    showSidebar: true,
    showReference: true,
    showPlayer: true,
  };
}

// 根据模板宽度选择基础像素格大小，尺寸越大格子越小。
export function getCanvasCellSize(width: number): number {
  if (width <= 32) return 14;
  if (width <= 64) return 10;
  if (width <= 120) return 7;
  if (width <= 180) return 5;
  if (width <= 240) return 3;
  return 2;
}

// 大图默认放大显示，保证 300 图纸也能看清单格。
export function getDefaultCanvasZoom(width: number): number {
  if (width <= 80) return 1;
  if (width <= 160) return 1.5;
  return 2;
}

export function buildPerlerRegions(width: number, height: number, regionSize = 40): PerlerRegion[] {
  const regions: PerlerRegion[] = [];
  let regionIndex = 0;

  for (let startRow = 0; startRow < height; startRow += regionSize) {
    for (let startCol = 0; startCol < width; startCol += regionSize) {
      const rowIndex = Math.floor(startRow / regionSize);
      const colIndex = Math.floor(startCol / regionSize);
      const endRow = Math.min(height - 1, startRow + regionSize - 1);
      const endCol = Math.min(width - 1, startCol + regionSize - 1);
      regions.push({
        id: `region-${regionIndex++}`,
        label: `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`,
        startRow,
        endRow,
        startCol,
        endCol,
        width: endCol - startCol + 1,
        height: endRow - startRow + 1,
      });
    }
  }

  return regions;
}

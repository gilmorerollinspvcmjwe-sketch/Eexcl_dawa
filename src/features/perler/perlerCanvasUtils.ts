export const IMPORT_SIZE_OPTIONS = [16, 24, 32, 48, 64, 80, 96, 120, 160, 200, 240, 300] as const;

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

/* 三消键盘语义辅助。为 Sheet16 提供焦点移动与确认交换的纯函数。 */

import { isAdjacent } from './match3Types.ts';

export interface Match3FocusTile {
  row: number;
  col: number;
}

export type Match3ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export interface Match3ConfirmAction {
  nextSelectedTile: Match3FocusTile;
  shouldSwap: boolean;
  swapTarget: Match3FocusTile | null;
}

// 返回棋盘默认焦点，避免键盘首次进入时没有落点。
export function getDefaultFocusTile(rows: number, cols: number): Match3FocusTile {
  return {
    row: Math.floor(rows / 2),
    col: Math.floor(cols / 2),
  };
}

// 按方向键移动焦点，并保证不越出棋盘。
export function moveFocusTile(
  current: Match3FocusTile,
  key: Match3ArrowKey,
  rows: number,
  cols: number
): Match3FocusTile {
  switch (key) {
    case 'ArrowUp':
      return { row: Math.max(0, current.row - 1), col: current.col };
    case 'ArrowDown':
      return { row: Math.min(rows - 1, current.row + 1), col: current.col };
    case 'ArrowLeft':
      return { row: current.row, col: Math.max(0, current.col - 1) };
    case 'ArrowRight':
      return { row: current.row, col: Math.min(cols - 1, current.col + 1) };
    default:
      return current;
  }
}

// Enter / Space 首次用于选中，二次用于在相邻焦点上确认交换。
export function resolveConfirmAction(
  selectedTile: Match3FocusTile | null,
  focusedTile: Match3FocusTile
): Match3ConfirmAction {
  if (!selectedTile) {
    return {
      nextSelectedTile: focusedTile,
      shouldSwap: false,
      swapTarget: null,
    };
  }

  if (selectedTile.row === focusedTile.row && selectedTile.col === focusedTile.col) {
    return {
      nextSelectedTile: selectedTile,
      shouldSwap: false,
      swapTarget: null,
    };
  }

  if (isAdjacent(selectedTile.row, selectedTile.col, focusedTile.row, focusedTile.col)) {
    return {
      nextSelectedTile: selectedTile,
      shouldSwap: true,
      swapTarget: focusedTile,
    };
  }

  return {
    nextSelectedTile: focusedTile,
    shouldSwap: false,
    swapTarget: null,
  };
}

import { translatePieceCells } from './tetrisPieceRegistry.ts';
import type { MatrixCell, PieceCell, TetrisBoardState, TetrominoKind } from './tetrisTypes.ts';

export interface TetrisRenderCell {
  kind: TetrominoKind | null;
  active: boolean;
  ghost: boolean;
}

export type TetrisDangerTier = 'safe' | 'caution' | 'danger' | 'critical';

export function getVisibleMatrix(state: TetrisBoardState): MatrixCell[][] {
  return state.matrix.slice(state.hiddenRows);
}

function toVisibleCells(cells: ReadonlyArray<PieceCell>, hiddenRows: number): PieceCell[] {
  return cells
    .map((cell) => ({ row: cell.row - hiddenRows, col: cell.col }))
    .filter((cell) => cell.row >= 0);
}

export function getVisibleActiveCells(state: TetrisBoardState): PieceCell[] {
  if (!state.activePiece) return [];
  return toVisibleCells(translatePieceCells(state.activePiece), state.hiddenRows);
}

export function getVisibleGhostCells(state: TetrisBoardState): PieceCell[] {
  if (!state.activePiece || state.ghostRow === null) return [];
  const ghostPiece = { ...state.activePiece, row: state.ghostRow };
  return toVisibleCells(translatePieceCells(ghostPiece), state.hiddenRows);
}

export function buildTetrisRenderGrid(state: TetrisBoardState): TetrisRenderCell[][] {
  const visibleMatrix = getVisibleMatrix(state);
  const activeCells = getVisibleActiveCells(state);
  const ghostCells = getVisibleGhostCells(state);
  const activeSet = new Set(activeCells.map((cell) => `${cell.row}:${cell.col}`));
  const ghostSet = new Set(ghostCells.map((cell) => `${cell.row}:${cell.col}`));

  return visibleMatrix.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const key = `${rowIndex}:${colIndex}`;
      const isActive = activeSet.has(key);
      const isGhost = ghostSet.has(key) && !isActive;
      const activeKind = isActive && state.activePiece ? state.activePiece.kind : null;
      return {
        kind: activeKind ?? cell,
        active: isActive,
        ghost: isGhost,
      };
    }),
  );
}

function formatPuzzleSequence(sequence: TetrominoKind[]): string {
  if (sequence.length === 0) return '待设定序列';
  return sequence.join(' → ');
}

export function getTetrisModeLabel(mode: TetrisBoardState['mode']): string {
  switch (mode) {
    case 'marathon':
      return '马拉松';
    case 'sprint':
      return '40行竞速';
    case 'ultra':
      return '120秒冲分';
    default:
      return mode;
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTetrisModeGoalText(state: TetrisBoardState): string {
  if (state.goalType === 'sprint_lines') return `目标：尽快完成 ${state.sprintTargetLines} 行`;
  if (state.goalType === 'score_attack') return `目标：${Math.floor(state.ultraDurationMs / 1000)} 秒内尽量高分`;
  if (state.goalType === 'dig') {
    const regionLabel = state.digRegionHeight > 0 ? `底部 ${state.digRegionHeight} 行区域中` : '底部区域中';
    return `目标：${regionLabel}清理 ${state.digRowsRequired} 行`;
  }
  if (state.goalType === 'puzzle') {
    if (state.puzzleSequence.length > 0) {
      return `目标：依次放置 ${formatPuzzleSequence(state.puzzleSequence)}`;
    }
    return '目标：按顺序完成指定数据块';
  }
  return '目标：稳住堆高并持续升级';
}

export function getTetrisModeProgressText(state: TetrisBoardState): string {
  if (state.goalType === 'sprint_lines') {
    const cleared = Math.min(state.sprintTargetLines, state.linesCleared);
    const remain = Math.max(0, state.sprintTargetLines - cleared);
    return `进度 ${cleared}/${state.sprintTargetLines} 行 | 剩余 ${remain} 行`;
  }

  if (state.goalType === 'score_attack') {
    return `剩余 ${formatDuration(state.remainingMs ?? 0)} | 当前得分 ${state.score.toLocaleString()}`;
  }

  if (state.goalType === 'dig') {
    const regionLabel = state.digRegionHeight > 0 ? `计入底部 ${state.digRegionHeight} 行区域` : '计入底部区域';
    return `底部 ${state.digProgress}/${state.digRowsRequired} 行已清 | ${regionLabel}`;
  }

  if (state.goalType === 'puzzle') {
    const total = state.puzzleSequence.length;
    if (total === 0) {
      return '置块 0/0 | 序列未设定';
    }
    const remaining = Math.max(0, total - state.puzzleProgress);
    const nextPiece = state.puzzleSequence[state.puzzleProgress] ?? '—';
    return `置块 ${state.puzzleProgress}/${total} | 剩余 ${remaining} 块 | 下一块 ${nextPiece}`;
  }

  if (state.goalType === 'level_target' && state.targetLevel !== null) {
    const remain = Math.max(0, state.targetLevel - state.level);
    return `等级 ${state.level}/${state.targetLevel} | 剩余 ${remain} 级`;
  }

  const linesToNextLevel = 10 - (state.linesCleared % 10 || 0);
  return `等级 ${state.level} | 距下一级 ${linesToNextLevel} 行`;
}

export function getTetrisStackHeight(state: TetrisBoardState): number {
  const visibleMatrix = getVisibleMatrix(state);
  const firstOccupiedRow = visibleMatrix.findIndex((row) => row.some((cell) => cell !== null));
  if (firstOccupiedRow === -1) return 0;
  return visibleMatrix.length - firstOccupiedRow;
}

export function getTetrisDangerTier(state: TetrisBoardState): TetrisDangerTier {
  const visibleMatrix = getVisibleMatrix(state);
  const firstOccupiedRow = visibleMatrix.findIndex((row) => row.some((cell) => cell !== null));
  if (firstOccupiedRow === -1) return 'safe';
  if (firstOccupiedRow <= 1) return 'critical';
  if (firstOccupiedRow <= 3) return 'danger';
  if (firstOccupiedRow <= 6) return 'caution';
  return 'safe';
}

export function getTetrisDangerText(state: TetrisBoardState): string {
  const stackHeight = getTetrisStackHeight(state);
  const tier = getTetrisDangerTier(state);

  if (tier === 'critical') return `危险：堆高 ${stackHeight} 行，已接近顶部`;
  if (tier === 'danger') return `警告：堆高 ${stackHeight} 行，请尽快消行`;
  if (tier === 'caution') return `注意：堆高 ${stackHeight} 行，建议压低地形`;
  return `安全：堆高 ${stackHeight} 行`;
}

export function getTetrisFormulaText(state: TetrisBoardState): string {
  if (state.status === 'idle') return '=待整理数据块已装载';
  if (state.status === 'paused') return '=处理流程暂停中';
  if (state.status === 'dead') return '=#SPILL! 待整理区域已溢出';
  if (state.status === 'finished') {
    if (state.goalType === 'sprint_lines') {
      return `=${state.sprintTargetLines}行竞速完成 | 用时 ${formatDuration(state.elapsedMs)}`;
    }
    if (state.goalType === 'score_attack') {
      return `=${Math.floor(state.ultraDurationMs / 1000)}秒回合结束 | 得分 ${state.score.toLocaleString()}`;
    }
    if (state.goalType === 'level_target' && state.targetLevel !== null) {
      return `=等级挑战完成 | 达到 ${state.targetLevel} 级`;
    }
    return '=整理完成，准备下一轮';
  }

  if (state.goalType === 'sprint_lines') {
    return `=${state.sprintTargetLines}行竞速中 | 进度 ${Math.min(state.sprintTargetLines, state.linesCleared)}/${state.sprintTargetLines}`;
  }
  if (state.goalType === 'score_attack') {
    return `=${Math.floor(state.ultraDurationMs / 1000)}秒冲分中 | 剩余 ${Math.max(0, Math.ceil((state.remainingMs ?? 0) / 1000))}秒 | 得分 ${state.score.toLocaleString()}`;
  }
  if (state.goalType === 'dig') {
    const regionLabel = state.digRegionHeight > 0 ? `${state.digRegionHeight} 行区域` : '底部区域';
    return `=底部清理中 ${state.digProgress}/${state.digRowsRequired} 行 | 目标区域 ${regionLabel}`;
  }
  if (state.goalType === 'puzzle') {
    const total = state.puzzleSequence.length;
    if (total === 0) {
      return '=解谜中 | 序列未设定';
    }
    const remaining = Math.max(0, total - state.puzzleProgress);
    const nextPiece = state.puzzleSequence[state.puzzleProgress] ?? '—';
    return `=解谜中 | 下一块 ${nextPiece} | 置块 ${state.puzzleProgress}/${total} | 剩余 ${remaining} 块`;
  }
  if (state.goalType === 'level_target' && state.targetLevel !== null) {
    return `=等级挑战中 | 当前 ${state.level} 级 / 目标 ${state.targetLevel} 级`;
  }

  const dangerTag = getTetrisDangerTier(state);
  if (dangerTag === 'critical') {
    return `=马拉松整理中 | 紧急预警 | 消行 ${state.linesCleared} | 等级 ${state.level}`;
  }
  if (dangerTag === 'danger') {
    return `=马拉松整理中 | 堆高危险 | 消行 ${state.linesCleared} | 等级 ${state.level}`;
  }
  return `=马拉松整理中 | 消行 ${state.linesCleared} | 等级 ${state.level}`;
}

export function getTetrisGoalHint(state: TetrisBoardState): string | null {
  if (state.goalType === 'dig') {
    const regionLabel = state.digRegionHeight > 0 ? `底部 ${state.digRegionHeight} 行区域` : '底部区域';
    return `提示：保持 ${regionLabel} 低位，集中在目标区域完成 ${state.digRowsRequired} 次行消。`;
  }
  if (state.goalType === 'puzzle') {
    const sequenceLabel =
      state.puzzleSequence.length > 0 ? formatPuzzleSequence(state.puzzleSequence) : '待设定序列';
    return `提示：依次放置 ${sequenceLabel}，避免多余消行打乱预设顺序。`;
  }
  return null;
}

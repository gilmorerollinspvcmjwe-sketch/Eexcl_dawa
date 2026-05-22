import { TETROMINO_ORDER, translatePieceCells } from './tetrisPieceRegistry.ts';
import { getSimpleWallKickOffsets, rotateState } from './tetrisRotation.ts';
import type {
  ActivePiece,
  CreateTetrisBoardOptions,
  MatrixCell,
  RotationDirection,
  TetrisBoardState,
  TetrisClearType,
  TetrisGoalType,
  TetrisMode,
  TetrisStatus,
  TetrominoKind,
} from './tetrisTypes.ts';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;
const DEFAULT_HIDDEN_ROWS = 2;
const NEXT_QUEUE_VISIBLE_COUNT = 5;
const ULTRA_DURATION_MS = 120_000;
const SPRINT_TARGET_LINES = 40;

function createEmptyRow(cols: number): MatrixCell[] {
  return Array.from({ length: cols }, () => null);
}

export function createEmptyMatrix(totalRows: number, cols: number): MatrixCell[][] {
  return Array.from({ length: totalRows }, () => createEmptyRow(cols));
}

function shuffleBag(): TetrominoKind[] {
  const bag = [...TETROMINO_ORDER];
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }
  return bag;
}

function ensureQueue(queue: TetrominoKind[], bag: TetrominoKind[], targetLength: number): { queue: TetrominoKind[]; bag: TetrominoKind[] } {
  const nextQueue = [...queue];
  let nextBag = [...bag];
  while (nextQueue.length < targetLength) {
    if (nextBag.length === 0) {
      nextBag = shuffleBag();
    }
    const head = nextBag[0];
    if (!head) break;
    nextQueue.push(head);
    nextBag = nextBag.slice(1);
  }
  return { queue: nextQueue, bag: nextBag };
}

function createSpawnPiece(kind: TetrominoKind, cols: number): ActivePiece {
  return {
    kind,
    row: 0,
    col: Math.floor(cols / 2) - 2,
    rotation: 0,
  };
}

export function getDropIntervalMs(level: number): number {
  const tier = Math.max(1, Math.min(15, level));
  const table: Record<number, number> = {
    1: 900,
    2: 750,
    3: 620,
    4: 500,
    5: 400,
    6: 320,
    7: 260,
    8: 210,
    9: 170,
    10: 140,
    11: 120,
    12: 100,
    13: 85,
    14: 70,
    15: 60,
  };
  return table[tier];
}

export function clearFullLines(
  matrix: MatrixCell[][],
  cols: number,
): { matrix: MatrixCell[][]; cleared: number; clearedRows: number[] } {
  const clearedRows: number[] = [];
  const keptRows: MatrixCell[][] = [];
  matrix.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) {
      clearedRows.push(index);
    } else {
      keptRows.push(row);
    }
  });

  const cleared = clearedRows.length;
  const paddingRows = Array.from({ length: cleared }, () => createEmptyRow(cols));
  return {
    matrix: [...paddingRows, ...keptRows],
    cleared,
    clearedRows,
  };
}

function getClearType(lines: number): TetrisClearType {
  if (lines <= 0) return 'none';
  if (lines === 1) return 'single';
  if (lines === 2) return 'double';
  if (lines === 3) return 'triple';
  return 'tetris';
}

function getLineClearScore(lines: number, level: number): number {
  const multiplier = Math.max(1, level);
  if (lines === 1) return 100 * multiplier;
  if (lines === 2) return 300 * multiplier;
  if (lines === 3) return 500 * multiplier;
  if (lines >= 4) return 800 * multiplier;
  return 0;
}

function isInBounds(state: TetrisBoardState, row: number, col: number): boolean {
  return row >= 0 && row < state.totalRows && col >= 0 && col < state.cols;
}

function canPlacePiece(state: TetrisBoardState, piece: ActivePiece): boolean {
  return translatePieceCells(piece).every((cell) => {
    if (!isInBounds(state, cell.row, cell.col)) return false;
    return state.matrix[cell.row]?.[cell.col] === null;
  });
}

function calculateGhostRow(state: TetrisBoardState): number | null {
  if (!state.activePiece) return null;
  let probeRow = state.activePiece.row;
  while (true) {
    const probe = { ...state.activePiece, row: probeRow + 1 };
    if (!canPlacePiece(state, probe)) return probeRow;
    probeRow += 1;
  }
}

function withGhost(state: TetrisBoardState): TetrisBoardState {
  return {
    ...state,
    ghostRow: calculateGhostRow(state),
  };
}

function applyModeCompletion(state: TetrisBoardState): TetrisBoardState {
  if (state.goalType === 'sprint_lines' && state.linesCleared >= state.sprintTargetLines) {
    return { ...state, status: 'finished', activePiece: null, ghostRow: null };
  }
  if (state.goalType === 'score_attack' && (state.remainingMs ?? state.ultraDurationMs) <= 0) {
    return { ...state, status: 'finished', activePiece: null, ghostRow: null, remainingMs: 0 };
  }
  if (state.goalType === 'level_target' && state.targetLevel !== null && state.level >= state.targetLevel) {
    return { ...state, status: 'finished', activePiece: null, ghostRow: null };
  }
  if (state.goalType === 'dig' && state.digRowsRequired > 0 && state.digProgress >= state.digRowsRequired) {
    return { ...state, status: 'finished', activePiece: null, ghostRow: null };
  }
  if (state.goalType === 'puzzle' && state.puzzleSequence.length > 0 && state.puzzleProgress >= state.puzzleSequence.length) {
    return { ...state, status: 'finished', activePiece: null, ghostRow: null };
  }
  return state;
}

function spawnNextPiece(state: TetrisBoardState): TetrisBoardState {
  const ensured = ensureQueue(state.nextQueue, state.bag, NEXT_QUEUE_VISIBLE_COUNT + 1);
  const puzzleKind =
    state.goalType === 'puzzle' && state.puzzleSequence.length > state.puzzleProgress
      ? state.puzzleSequence[state.puzzleProgress]
      : null;
  const nextKind = puzzleKind ?? ensured.queue[0];
  if (!nextKind) {
    return { ...state, status: 'dead', activePiece: null, ghostRow: null };
  }

  const queueAfterPop = ensured.queue.slice(1);
  const queueWithPadding = ensureQueue(queueAfterPop, ensured.bag, NEXT_QUEUE_VISIBLE_COUNT + 1);
  const piece = createSpawnPiece(nextKind, state.cols);
  const spawnedState = {
    ...state,
    nextQueue: queueWithPadding.queue,
    bag: queueWithPadding.bag,
    activePiece: piece,
  };

  if (!canPlacePiece(spawnedState, piece)) {
    return {
      ...spawnedState,
      status: 'dead',
      activePiece: null,
      ghostRow: null,
    };
  }

  return withGhost(spawnedState);
}

function getGoalType(mode: TetrisMode, targetLevel: number | null): TetrisGoalType {
  if (targetLevel !== null) return 'level_target';
  if (mode === 'sprint') return 'sprint_lines';
  if (mode === 'ultra') return 'score_attack';
  return 'survive';
}

export function createTetrisBoardState(options: TetrisMode | CreateTetrisBoardOptions = 'marathon'): TetrisBoardState {
  const normalizedOptions: CreateTetrisBoardOptions = typeof options === 'string' ? { mode: options } : options;
  const mode = normalizedOptions.mode ?? 'marathon';
  const sprintTargetLines = normalizedOptions.sprintTargetLines ?? SPRINT_TARGET_LINES;
  const ultraDurationMs = normalizedOptions.ultraDurationMs ?? ULTRA_DURATION_MS;
  const targetLevel = normalizedOptions.targetLevel ?? null;
  const goalTypeOption = normalizedOptions.goalType;
  const digRowsRequired = normalizedOptions.digRowsRequired ?? 2;
  const digRegionHeight = normalizedOptions.digRegionHeight ?? 3;
  const puzzleSequence = normalizedOptions.puzzleSequence ?? [];
  const puzzleProgress = 0;
  const goalType = goalTypeOption ?? getGoalType(mode, targetLevel);
  const initial = ensureQueue([], shuffleBag(), NEXT_QUEUE_VISIBLE_COUNT + 1);
  return {
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    hiddenRows: DEFAULT_HIDDEN_ROWS,
    totalRows: DEFAULT_ROWS + DEFAULT_HIDDEN_ROWS,
    mode,
    goalType,
    status: 'idle',
    score: 0,
    level: 1,
    linesCleared: 0,
    elapsedMs: 0,
    remainingMs: mode === 'ultra' ? ultraDurationMs : undefined,
    sprintTargetLines,
    ultraDurationMs,
    targetLevel,
    digRowsRequired,
    digRegionHeight,
    digProgress: 0,
    puzzleSequence: [...puzzleSequence],
    puzzleProgress,
    dropAccumulatorMs: 0,
    matrix: createEmptyMatrix(DEFAULT_ROWS + DEFAULT_HIDDEN_ROWS, DEFAULT_COLS),
    activePiece: null,
    ghostRow: null,
    holdPiece: null,
    canHold: true,
    nextQueue: initial.queue,
    bag: initial.bag,
    combo: 0,
    backToBack: false,
    lastClearType: 'none',
  };
}

export function startTetrisGame(state: TetrisBoardState): TetrisBoardState {
  const fresh = createTetrisBoardState({
    mode: state.mode,
    sprintTargetLines: state.sprintTargetLines,
    ultraDurationMs: state.ultraDurationMs,
    targetLevel: state.targetLevel,
    goalType: state.goalType,
    digRowsRequired: state.digRowsRequired,
    digRegionHeight: state.digRegionHeight,
    puzzleSequence: state.puzzleSequence,
  });
  return spawnNextPiece({ ...fresh, status: 'playing' });
}

export function setTetrisMode(state: TetrisBoardState, mode: TetrisMode): TetrisBoardState {
  if (state.mode === mode && state.status === 'idle') return state;
  return createTetrisBoardState(mode);
}

function lockAndResolve(state: TetrisBoardState, dropPoints = 0): TetrisBoardState {
  if (!state.activePiece) return state;

  const nextMatrix = state.matrix.map((row) => [...row]);
  for (const cell of translatePieceCells(state.activePiece)) {
    if (isInBounds(state, cell.row, cell.col)) {
      nextMatrix[cell.row][cell.col] = state.activePiece.kind;
    }
  }

  const { matrix: clearedMatrix, cleared, clearedRows } = clearFullLines(nextMatrix, state.cols);
  const clearType = getClearType(cleared);
  const nextLines = state.linesCleared + cleared;
  const nextLevel = state.mode === 'marathon' ? Math.floor(nextLines / 10) + 1 : state.level;
  const nextScore = state.score + getLineClearScore(cleared, state.level) + dropPoints;

  const combo = cleared > 0 ? state.combo + 1 : 0;
  const backToBack = clearType === 'tetris' ? true : false;
  let digProgress = state.digProgress;
  if (state.goalType === 'dig' && state.digRegionHeight > 0) {
    const threshold = state.totalRows - state.digRegionHeight;
    digProgress += clearedRows.filter((row) => row >= threshold).length;
  }
  let puzzleProgress = state.puzzleProgress;
  if (state.goalType === 'puzzle' && state.puzzleSequence.length > 0) {
    puzzleProgress = Math.min(state.puzzleSequence.length, state.puzzleProgress + 1);
  }

  const resolved = applyModeCompletion({
    ...state,
    matrix: clearedMatrix,
    activePiece: null,
    ghostRow: null,
    score: nextScore,
    linesCleared: nextLines,
    level: nextLevel,
    combo,
    backToBack,
    lastClearType: clearType,
    canHold: true,
    dropAccumulatorMs: 0,
    digProgress,
    puzzleProgress,
  });

  if (resolved.status !== 'playing') return resolved;
  return spawnNextPiece(resolved);
}

function stepDown(state: TetrisBoardState, softDrop = false): TetrisBoardState {
  if (!state.activePiece) return state;
  const moved = { ...state.activePiece, row: state.activePiece.row + 1 };
  if (canPlacePiece(state, moved)) {
    const scoreGain = softDrop ? 1 : 0;
    return withGhost({
      ...state,
      activePiece: moved,
      score: state.score + scoreGain,
    });
  }
  return lockAndResolve(state);
}

export function moveActivePiece(state: TetrisBoardState, deltaCol: number): TetrisBoardState {
  if (state.status !== 'playing' || !state.activePiece) return state;
  const moved = { ...state.activePiece, col: state.activePiece.col + deltaCol };
  if (!canPlacePiece(state, moved)) return state;
  return withGhost({ ...state, activePiece: moved });
}

export function softDropActivePiece(state: TetrisBoardState): TetrisBoardState {
  if (state.status !== 'playing') return state;
  return stepDown(state, true);
}

export function hardDropActivePiece(state: TetrisBoardState): TetrisBoardState {
  if (state.status !== 'playing' || !state.activePiece) return state;
  let moved = state.activePiece;
  let dropDistance = 0;
  while (true) {
    const probe = { ...moved, row: moved.row + 1 };
    if (!canPlacePiece(state, probe)) break;
    moved = probe;
    dropDistance += 1;
  }
  return lockAndResolve({ ...state, activePiece: moved }, dropDistance * 2);
}

export function rotateActivePiece(state: TetrisBoardState, direction: RotationDirection): TetrisBoardState {
  if (state.status !== 'playing' || !state.activePiece) return state;

  const targetRotation = rotateState(state.activePiece.rotation, direction);
  for (const offset of getSimpleWallKickOffsets()) {
    const rotated: ActivePiece = {
      ...state.activePiece,
      rotation: targetRotation,
      col: state.activePiece.col + offset,
    };
    if (canPlacePiece(state, rotated)) {
      return withGhost({ ...state, activePiece: rotated });
    }
  }
  return state;
}

export function holdActivePiece(state: TetrisBoardState): TetrisBoardState {
  if (state.status !== 'playing' || !state.activePiece || !state.canHold) return state;

  if (!state.holdPiece) {
    const nextState = spawnNextPiece({
      ...state,
      holdPiece: state.activePiece.kind,
      activePiece: null,
      canHold: false,
    });
    return nextState;
  }

  const swappedPiece = createSpawnPiece(state.holdPiece, state.cols);
  const swappedState = {
    ...state,
    holdPiece: state.activePiece.kind,
    activePiece: swappedPiece,
    canHold: false,
  };
  if (!canPlacePiece(swappedState, swappedPiece)) {
    return { ...swappedState, status: 'dead', activePiece: null, ghostRow: null };
  }
  return withGhost(swappedState);
}

export function toggleTetrisPause(state: TetrisBoardState): TetrisBoardState {
  if (state.status === 'playing') return { ...state, status: 'paused' };
  if (state.status === 'paused') return { ...state, status: 'playing' };
  return state;
}

export function restartTetrisGame(state: TetrisBoardState): TetrisBoardState {
  return startTetrisGame(
    createTetrisBoardState({
      mode: state.mode,
      sprintTargetLines: state.sprintTargetLines,
      ultraDurationMs: state.ultraDurationMs,
      targetLevel: state.targetLevel,
      goalType: state.goalType,
      digRowsRequired: state.digRowsRequired,
      digRegionHeight: state.digRegionHeight,
      puzzleSequence: state.puzzleSequence,
    }),
  );
}

export function tickTetrisBoard(state: TetrisBoardState, elapsedMs: number): TetrisBoardState {
  if (state.status !== 'playing') return state;

  let nextState: TetrisBoardState = {
    ...state,
    elapsedMs: state.elapsedMs + elapsedMs,
    dropAccumulatorMs: state.dropAccumulatorMs + elapsedMs,
    remainingMs:
      state.mode === 'ultra'
        ? Math.max(0, (state.remainingMs ?? state.ultraDurationMs) - elapsedMs)
        : state.remainingMs,
  };

  nextState = applyModeCompletion(nextState);
  if (nextState.status !== 'playing') return nextState;

  const interval = getDropIntervalMs(nextState.level);
  while (nextState.dropAccumulatorMs >= interval && nextState.status === 'playing') {
    nextState = {
      ...nextState,
      dropAccumulatorMs: nextState.dropAccumulatorMs - interval,
    };
    nextState = stepDown(nextState);
    nextState = applyModeCompletion(nextState);
  }

  return nextState;
}

export function getStateLabel(status: TetrisStatus): string {
  if (status === 'idle') return '就绪';
  if (status === 'playing') return '整理中';
  if (status === 'paused') return '暂停';
  if (status === 'dead') return '溢出';
  return '完成';
}

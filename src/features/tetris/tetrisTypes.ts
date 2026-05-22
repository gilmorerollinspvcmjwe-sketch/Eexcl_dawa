export type TetrominoKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3;
export type RotationDirection = 'cw' | 'ccw';

export type TetrisMode = 'marathon' | 'sprint' | 'ultra';
export type TetrisStatus = 'idle' | 'playing' | 'paused' | 'dead' | 'finished';
export type TetrisClearType = 'none' | 'single' | 'double' | 'triple' | 'tetris';
export type TetrisGoalType = 'survive' | 'sprint_lines' | 'score_attack' | 'level_target' | 'dig' | 'puzzle';

export interface PieceCell {
  row: number;
  col: number;
}

export interface ActivePiece {
  kind: TetrominoKind;
  row: number;
  col: number;
  rotation: RotationState;
}

export type MatrixCell = TetrominoKind | null;

export interface TetrisBoardState {
  rows: number;
  cols: number;
  hiddenRows: number;
  totalRows: number;
  mode: TetrisMode;
  goalType: TetrisGoalType;
  status: TetrisStatus;
  score: number;
  level: number;
  linesCleared: number;
  elapsedMs: number;
  remainingMs?: number;
  sprintTargetLines: number;
  ultraDurationMs: number;
  targetLevel: number | null;
  dropAccumulatorMs: number;
  matrix: MatrixCell[][];
  activePiece: ActivePiece | null;
  ghostRow: number | null;
  holdPiece: TetrominoKind | null;
  canHold: boolean;
  nextQueue: TetrominoKind[];
  bag: TetrominoKind[];
  combo: number;
  backToBack: boolean;
  lastClearType: TetrisClearType;
  digRowsRequired: number;
  digRegionHeight: number;
  digProgress: number;
  puzzleSequence: TetrominoKind[];
  puzzleProgress: number;
}

export interface CreateTetrisBoardOptions {
  mode?: TetrisMode;
  sprintTargetLines?: number;
  ultraDurationMs?: number;
  targetLevel?: number | null;
  goalType?: TetrisGoalType;
  digRowsRequired?: number;
  digRegionHeight?: number;
  puzzleSequence?: TetrominoKind[];
}

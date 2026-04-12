import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearFullLines,
  createEmptyMatrix,
  createTetrisBoardState,
  hardDropActivePiece,
  holdActivePiece,
  moveActivePiece,
  rotateActivePiece,
  softDropActivePiece,
  startTetrisGame,
  tickTetrisBoard,
} from '../src/features/tetris/tetrisBoardState.ts';
import type { TetrominoKind, TetrisBoardState } from '../src/features/tetris/tetrisTypes.ts';

function countFilledCells(state: TetrisBoardState): number {
  return state.matrix.reduce(
    (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0),
    0,
  );
}

test('createTetrisBoardState initializes idle board with queue', () => {
  const state = createTetrisBoardState();
  assert.equal(state.status, 'idle');
  assert.equal(state.rows, 20);
  assert.equal(state.cols, 10);
  assert.ok(state.nextQueue.length >= 5);
});

test('startTetrisGame spawns an active piece', () => {
  const started = startTetrisGame(createTetrisBoardState('marathon'));
  assert.equal(started.status, 'playing');
  assert.ok(started.activePiece);
  assert.ok(started.ghostRow !== null);
});

test('moveActivePiece blocks movement when hitting wall', () => {
  const started = startTetrisGame(createTetrisBoardState('marathon'));
  assert.ok(started.activePiece);
  const constrained: TetrisBoardState = {
    ...started,
    activePiece: { ...started.activePiece, kind: 'O', col: -1, row: 0, rotation: 0 },
  };

  const moved = moveActivePiece(constrained, -1);
  assert.equal(moved.activePiece?.col, -1);
});

test('rotateActivePiece applies wall kick for tight positions', () => {
  const started = startTetrisGame(createTetrisBoardState('marathon'));
  const tuned: TetrisBoardState = {
    ...started,
    activePiece: {
      kind: 'I',
      row: 0,
      col: 7,
      rotation: 1,
    },
  };

  const rotated = rotateActivePiece(tuned, 'cw');
  assert.equal(rotated.activePiece?.rotation, 2);
  assert.equal(rotated.activePiece?.col, 6);
});

test('softDropActivePiece moves piece down while keeping game alive', () => {
  const started = startTetrisGame(createTetrisBoardState('marathon'));
  const baseRow = started.activePiece?.row ?? -1;

  const next = softDropActivePiece(started);
  assert.equal(next.status, 'playing');
  assert.ok((next.activePiece?.row ?? -1) >= baseRow);
});

test('hardDropActivePiece locks cells and spawns next piece', () => {
  let state = startTetrisGame(createTetrisBoardState('marathon'));
  const before = countFilledCells(state);
  state = hardDropActivePiece(state);
  const after = countFilledCells(state);

  assert.ok(after > before);
  assert.equal(state.status, 'playing');
  assert.ok(state.activePiece);
});

test('clearFullLines removes completed rows', () => {
  const matrix = createEmptyMatrix(4, 4);
  matrix[3] = ['I', 'I', 'I', 'I'];

  const next = clearFullLines(matrix, 4);
  assert.equal(next.cleared, 1);
  assert.deepEqual(next.matrix[0], [null, null, null, null]);
});

test('holdActivePiece can only be used once before a lock', () => {
  const started = startTetrisGame(createTetrisBoardState('marathon'));
  const firstHold = holdActivePiece(started);
  const secondHold = holdActivePiece(firstHold);

  assert.ok(firstHold.holdPiece);
  assert.equal(firstHold.canHold, false);
  assert.deepEqual(secondHold, firstHold);
});

test('sprint mode finishes when line target is reached', () => {
  const started = startTetrisGame(createTetrisBoardState('sprint'));
  const nearDone: TetrisBoardState = { ...started, linesCleared: 40 };
  const next = tickTetrisBoard(nearDone, 16);

  assert.equal(next.status, 'finished');
});

test('ultra mode finishes when countdown expires', () => {
  const started = startTetrisGame(createTetrisBoardState('ultra'));
  const endingSoon: TetrisBoardState = { ...started, remainingMs: 10 };
  const next = tickTetrisBoard(endingSoon, 25);

  assert.equal(next.status, 'finished');
  assert.equal(next.remainingMs, 0);
});

test('level challenge finishes when target level is reached', () => {
  const started = startTetrisGame(createTetrisBoardState({ mode: 'marathon', targetLevel: 10 }));
  const leveled: TetrisBoardState = { ...started, level: 10 };
  const next = tickTetrisBoard(leveled, 16);

  assert.equal(next.status, 'finished');
  assert.equal(next.targetLevel, 10);
});

test('dig goal finishes when regional clears meet requirement', () => {
  const state = startTetrisGame(createTetrisBoardState({ mode: 'marathon', goalType: 'dig', digRowsRequired: 1, digRegionHeight: 2 }));
  const progressed: TetrisBoardState = { ...state, status: 'playing', digProgress: 1 };
  const next = tickTetrisBoard(progressed, 16);
  assert.equal(next.status, 'finished');
});

test('puzzle goal finishes once sequence length reached', () => {
  const sequence: TetrominoKind[] = ['I', 'O', 'T'];
  const state = startTetrisGame(createTetrisBoardState({ mode: 'marathon', goalType: 'puzzle', puzzleSequence: sequence }));
  const progressed: TetrisBoardState = { ...state, status: 'playing', puzzleProgress: sequence.length };
  const next = tickTetrisBoard(progressed, 16);
  assert.equal(next.status, 'finished');
});

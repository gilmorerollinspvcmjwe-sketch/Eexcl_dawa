import test from 'node:test';
import assert from 'node:assert/strict';
import { createTetrisBoardState } from '../src/features/tetris/tetrisBoardState.ts';
import {
  getTetrisDangerText,
  getTetrisDangerTier,
  getTetrisFormulaText,
  getTetrisModeGoalText,
  getTetrisModeProgressText,
  getTetrisGoalHint,
  getTetrisStackHeight,
} from '../src/features/tetris/tetrisSelectors.ts';

function withVisibleStackTop(visibleTopRow: number) {
  const state = createTetrisBoardState('marathon');
  const matrix = state.matrix.map((row) => [...row]);
  const matrixRow = state.hiddenRows + visibleTopRow;
  if (matrix[matrixRow]) {
    matrix[matrixRow][0] = 'I';
  }
  return { ...state, matrix };
}

test('mode goal text matches each mode', () => {
  assert.match(getTetrisModeGoalText(createTetrisBoardState('marathon')), /升级/);
  assert.match(getTetrisModeGoalText(createTetrisBoardState('sprint')), /40/);
  assert.match(getTetrisModeGoalText(createTetrisBoardState('ultra')), /120/);
});

test('mode progress text is mode-specific', () => {
  const sprint = { ...createTetrisBoardState('sprint'), linesCleared: 14 };
  const ultra = { ...createTetrisBoardState('ultra'), remainingMs: 53_000, score: 4200 };
  const marathon = { ...createTetrisBoardState('marathon'), linesCleared: 19, level: 2 };

  assert.match(getTetrisModeProgressText(sprint), /14\/40/);
  assert.match(getTetrisModeProgressText(ultra), /剩余/);
  assert.match(getTetrisModeProgressText(marathon), /等级 2/);
});

test('formula text reflects mode goal while playing', () => {
  const sprintPlaying = { ...createTetrisBoardState('sprint'), status: 'playing' as const, linesCleared: 7 };
  const ultraPlaying = { ...createTetrisBoardState('ultra'), status: 'playing' as const, score: 1600, remainingMs: 75_000 };
  const marathonPlaying = { ...createTetrisBoardState('marathon'), status: 'playing' as const, linesCleared: 9, level: 2 };

  assert.match(getTetrisFormulaText(sprintPlaying), /40行竞速中/);
  assert.match(getTetrisFormulaText(ultraPlaying), /120秒冲分中/);
  assert.match(getTetrisFormulaText(marathonPlaying), /马拉松整理中/);
});

test('stack height and danger tier reflect visible top pressure', () => {
  const safeState = createTetrisBoardState('marathon');
  const cautionState = withVisibleStackTop(6);
  const dangerState = withVisibleStackTop(3);
  const criticalState = withVisibleStackTop(1);

  assert.equal(getTetrisStackHeight(safeState), 0);
  assert.equal(getTetrisDangerTier(safeState), 'safe');

  assert.equal(getTetrisDangerTier(cautionState), 'caution');
  assert.equal(getTetrisDangerTier(dangerState), 'danger');
  assert.equal(getTetrisDangerTier(criticalState), 'critical');
});

test('danger text includes tier wording and stack height value', () => {
  const dangerState = withVisibleStackTop(3);
  const criticalState = withVisibleStackTop(0);
  const safeState = createTetrisBoardState('marathon');

  assert.equal(getTetrisDangerText(safeState), '安全：堆高 0 行');
  assert.match(getTetrisDangerText(dangerState), /警告：堆高 17 行/);
  assert.match(getTetrisDangerText(criticalState), /危险：堆高 20 行/);
});

test('marathon formula text escalates at danger tiers', () => {
  const safePlaying = { ...withVisibleStackTop(8), status: 'playing' as const, linesCleared: 6, level: 2 };
  const dangerPlaying = { ...withVisibleStackTop(3), status: 'playing' as const, linesCleared: 11, level: 3 };
  const criticalPlaying = { ...withVisibleStackTop(1), status: 'playing' as const, linesCleared: 13, level: 3 };

  assert.match(getTetrisFormulaText(safePlaying), /马拉松整理中/);
  assert.doesNotMatch(getTetrisFormulaText(safePlaying), /紧急预警|堆高危险/);
  assert.match(getTetrisFormulaText(dangerPlaying), /堆高危险/);
  assert.match(getTetrisFormulaText(criticalPlaying), /紧急预警/);
});

test('dig goal options propagate to state', () => {
  const state = createTetrisBoardState({ mode: 'marathon', goalType: 'dig', digRowsRequired: 2, digRegionHeight: 3 });
  assert.equal(state.goalType, 'dig');
  assert.equal(state.digRowsRequired, 2);
  assert.equal(state.digRegionHeight, 3);
});

test('puzzle goal stores sequence info', () => {
  const sequence: ['T', 'L', 'O'] = ['T', 'L', 'O'];
  const state = createTetrisBoardState({ mode: 'marathon', goalType: 'puzzle', puzzleSequence: sequence });
  assert.equal(state.goalType, 'puzzle');
  assert.deepEqual(state.puzzleSequence, sequence);
});

test('dig goal text and progress include region details', () => {
  const state = { ...createTetrisBoardState({ mode: 'marathon', goalType: 'dig', digRowsRequired: 2, digRegionHeight: 4 }), digProgress: 1 };
  assert.match(getTetrisModeGoalText(state), /底部 4 行区域中/);
  assert.match(getTetrisModeGoalText(state), /2 行/);
  assert.match(getTetrisModeProgressText(state), /计入底部 4 行区域/);
});

test('puzzle goal text exposes sequence and next piece', () => {
  const sequence: ['I', 'T', 'O'] = ['I', 'T', 'O'];
  const state = {
    ...createTetrisBoardState({ mode: 'marathon', goalType: 'puzzle', puzzleSequence: sequence }),
    puzzleProgress: 1,
  };
  assert.match(getTetrisModeGoalText(state), /依次放置 I/);
  assert.match(getTetrisModeProgressText(state), /下一块 T/);
});

test('goal hint surfaces dig and puzzle tips', () => {
  const digState = createTetrisBoardState({ mode: 'marathon', goalType: 'dig', digRowsRequired: 2, digRegionHeight: 5 });
  assert.match(getTetrisGoalHint(digState) ?? '', /底部 5 行区域/);
  const puzzleState = createTetrisBoardState({ mode: 'marathon', goalType: 'puzzle', puzzleSequence: ['I', 'T'] });
  assert.match(getTetrisGoalHint(puzzleState) ?? '', /依次放置 I → T/);
});

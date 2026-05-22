import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSnakeBoardState,
  setSnakeDirection,
  startSnakeBoard,
  tickSnakeBoard,
  toggleSnakePause,
} from '../src/features/snake/snakeBoardState.ts';
import { createFoodCell, createTokenFoodCell } from '../src/features/snake/snakeFoodRegistry.ts';
import type { SnakeBoardState } from '../src/features/snake/snakeTypes.ts';

function withFoodAhead(state: SnakeBoardState, food = createTokenFoodCell('A', 0, 0)) {
  const head = state.snake.segments[0];
  return {
    ...state,
    foods: [
      {
        ...food,
        row: head.row,
        col: head.col + 1,
      },
    ],
  };
}

test('snake board initializes in idle status with multiple foods', () => {
  const state = createSnakeBoardState();
  assert.equal(state.status, 'idle');
  assert.equal(state.length, 3);
  assert.equal(state.foods.length, 2);
  assert.equal(state.targetPlan.length, 0);
});

test('timed mode initializes target phrase and guaranteed target food', () => {
  const state = createSnakeBoardState({ mode: 'timed', difficulty: 'easy', random: () => 0.1 });
  assert.deepEqual(state.targetPlan, ['GO', 'HP', 'LOVE']);
  assert.ok(state.foods.some((food) => food.isTarget));
});

test('custom target plan overrides mode defaults', () => {
  const state = createSnakeBoardState({ mode: 'timed', difficulty: 'easy', targetPlan: ['LOVE YOU'] });
  assert.deepEqual(state.targetPlan, ['LOVE YOU']);
});

test('direction input starts the run', () => {
  const state = createSnakeBoardState();
  const next = setSnakeDirection(state, 'up');

  assert.equal(next.status, 'playing');
  assert.equal(next.snake.nextDirection, 'up');
});

test('reverse direction is ignored during a run', () => {
  let state = createSnakeBoardState();
  state = startSnakeBoard(state);
  const next = setSnakeDirection(state, 'left');

  assert.equal(next.snake.nextDirection, 'right');
});

test('eating token food grows snake and attaches token behind head', () => {
  let state = createSnakeBoardState();
  state = withFoodAhead(startSnakeBoard(state), createTokenFoodCell('L', 0, 0));
  const next = tickSnakeBoard(state, 250, () => 0.2);

  assert.equal(next.score, 12);
  assert.equal(next.length, 4);
  assert.deepEqual(next.chainTokens, ['L']);
  assert.equal(next.snake.segments[1]?.token, 'L');
});

test('classic mode grants bonus when recent chain forms a word', () => {
  let state = startSnakeBoard(createSnakeBoardState());
  state = withFoodAhead(state, createTokenFoodCell('L', 0, 0));
  state = tickSnakeBoard(state, 250, () => 0.2);
  state = withFoodAhead(state, createTokenFoodCell('O', 0, 0));
  state = tickSnakeBoard(state, 250, () => 0.2);
  state = withFoodAhead(state, createTokenFoodCell('V', 0, 0));
  state = tickSnakeBoard(state, 250, () => 0.2);
  state = withFoodAhead(state, createTokenFoodCell('E', 0, 0));
  const next = tickSnakeBoard(state, 250, () => 0.2);

  assert.deepEqual(next.chainTokens.slice(-4), ['L', 'O', 'V', 'E']);
  assert.ok(next.score >= 128);
  assert.match(next.lastEventText ?? '', /短词链/);
});

test('challenge mode penalizes wrong token and adds pressure obstacle', () => {
  let state = createSnakeBoardState({ mode: 'challenge', difficulty: 'easy', random: () => 0.2 });
  const initialObstacleCount = state.obstacles.length;
  state = withFoodAhead(startSnakeBoard(state), createTokenFoodCell('Z', 0, 0));
  const next = tickSnakeBoard(state, 250, () => 0.2);

  assert.equal(next.pressureLevel, 1);
  assert.ok(next.obstacles.length > initialObstacleCount);
  assert.match(next.lastEventText ?? '', /误收/);
});

test('timed mode completes target phrase and advances to next one', () => {
  let state = createSnakeBoardState({ mode: 'timed', difficulty: 'easy', random: () => 0.2 });
  state = withFoodAhead(startSnakeBoard(state), createTokenFoodCell('G', 0, 0));
  state = tickSnakeBoard(state, 250, () => 0.2);
  state = withFoodAhead(state, createTokenFoodCell('O', 0, 0));
  const next = tickSnakeBoard(state, 250, () => 0.2);

  assert.deepEqual(next.completedTargets, ['GO']);
  assert.equal(next.targetIndex, 1);
  assert.equal(next.targetProgress, 0);
  assert.ok(next.score >= 110);
});

test('phrase run segments trigger segment completion events', () => {
  let state = createSnakeBoardState({
    mode: 'timed',
    difficulty: 'normal',
    durationMs: 90_000,
    targetPlan: ['LOVE YOU'],
    targetSegmentConfig: { 'LOVE YOU': ['LOVE', 'YOU'] },
    random: () => 0.1,
  });
  state = startSnakeBoard(state);

  const tokens = ['L', 'O', 'V', 'E', 'Y', 'O', 'U'];
  for (const [index, token] of tokens.entries()) {
    state = withFoodAhead(state, createTokenFoodCell(token, 0, 0));
    state = tickSnakeBoard(state, 250, () => 0.2);
    if (index === 3) {
      assert.equal(state.segmentIndex, 1);
      assert.match(state.lastEventText ?? '', /段落/);
    }
  }

  assert.equal(state.segmentCount, 2);
});

test('challenge mode dynamic pressure spawns obstacles after interval', () => {
  const base = startSnakeBoard(createSnakeBoardState({ mode: 'challenge', difficulty: 'normal' }));
  const before = base.obstacles.length;
  const next = tickSnakeBoard(base, 10_000, () => 0.23);
  assert.ok(next.obstacles.length >= before);
  assert.ok(next.dynamicPressureTimerMs > 0);
  assert.equal(next.mode, 'challenge');
});

test('hitting wall marks dead state', () => {
  const state = {
    ...createSnakeBoardState({ rows: 6, cols: 6 }),
    status: 'playing' as const,
    snake: {
      segments: [
        { row: 2, col: 5, segmentType: 'head' as const },
        { row: 2, col: 4, segmentType: 'body' as const },
        { row: 2, col: 3, segmentType: 'tail' as const },
      ],
      direction: 'right' as const,
      nextDirection: 'right' as const,
      growBy: 0,
    },
  };

  const next = tickSnakeBoard(state, 250, () => 0.1);

  assert.equal(next.status, 'dead');
  assert.equal(next.deathReason, 'wall');
});

test('self collision marks dead state', () => {
  const state: SnakeBoardState = {
    ...createSnakeBoardState({ rows: 8, cols: 8 }),
    status: 'playing',
    snake: {
      segments: [
        { row: 3, col: 3, segmentType: 'head' },
        { row: 3, col: 2, segmentType: 'body', token: 'A' },
        { row: 2, col: 2, segmentType: 'body', token: 'B' },
        { row: 2, col: 3, segmentType: 'body', token: 'C' },
        { row: 2, col: 4, segmentType: 'tail', token: 'D' },
      ],
      direction: 'up',
      nextDirection: 'up',
      growBy: 1,
    },
    foods: [],
  };

  const next = tickSnakeBoard(state, 250, () => 0.1);

  assert.equal(next.status, 'dead');
  assert.equal(next.deathReason, 'self');
});

test('coffee grants temporary speed boost', () => {
  let state = createSnakeBoardState();
  state = withFoodAhead(startSnakeBoard(state), createFoodCell('coffee', 0, 0));
  const next = tickSnakeBoard(state, 250, () => 0.2);

  assert.ok(next.speedBoostMs > 0);
});

test('timed mode finishes when time reaches zero', () => {
  let state = createSnakeBoardState({ mode: 'timed', durationMs: 100 });
  state = startSnakeBoard(state);
  const next = tickSnakeBoard(state, 150, () => 0.2);

  assert.equal(next.status, 'finished');
  assert.equal(next.deathReason, 'timeout');
});

test('pause toggle switches between paused and playing', () => {
  const started = startSnakeBoard(createSnakeBoardState());
  const paused = toggleSnakePause(started);
  const resumed = toggleSnakePause(paused);

  assert.equal(paused.status, 'paused');
  assert.equal(resumed.status, 'playing');
});

test('challenge mode creates obstacle cells', () => {
  const state = createSnakeBoardState({ mode: 'challenge' });
  assert.ok(state.obstacles.length > 0);
});

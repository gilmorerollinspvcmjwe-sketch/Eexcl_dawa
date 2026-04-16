import test from 'node:test';
import assert from 'node:assert/strict';
import {
  continueGame2048,
  createGame2048BoardState,
  moveGame2048Board,
} from '../src/features/game2048/game2048BoardState.ts';

test('createGame2048BoardState initializes a 4x4 board with two starting tiles', () => {
  const state = createGame2048BoardState();
  const tiles = state.grid.flat().filter((cell) => cell !== null);

  assert.equal(state.rows, 4);
  assert.equal(state.cols, 4);
  assert.equal(state.status, 'idle');
  assert.equal(tiles.length, 2);
});

test('moveGame2048Board merges equal tiles once and updates score', () => {
  const state = createGame2048BoardState({
    grid: [
      [2, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    status: 'playing',
    score: 0,
  });

  const next = moveGame2048Board(state, 'left', () => 0);

  assert.equal(next.grid[0]?.[0]?.value, 4);
  assert.equal(next.score, 4);
  assert.equal(next.moves, 1);
});

test('reaching 2048 marks win and continueGame2048 returns to playing', () => {
  const state = createGame2048BoardState({
    grid: [
      [1024, 1024, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    status: 'playing',
  });

  const won = moveGame2048Board(state, 'left', () => 0.95);
  assert.equal(won.status, 'won');
  assert.equal(won.maxTile, 2048);

  const continued = continueGame2048(won);
  assert.equal(continued.status, 'playing');
  assert.equal(continued.hasWon, true);
});

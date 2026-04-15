import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBoard,
  createBoardFromConfig,
  canSwap,
  executeSwap,
  findAllMatches,
  clearMatchedTiles,
  applyGravity,
  processChain,
  decrementMoves,
  decrementTime,
  checkWinCondition,
  checkLoseCondition,
  generateResult,
  selectTile,
  clearSelection,
  startGame,
  handlePortalDrop,
  triggerSpecialEffect,
} from '../src/features/match3/match3BoardState.ts';
import {
  type Match3BoardState,
  type Match3Color,
  type Match3Goal,
  MATCH3_COLORS,
  createColorTile,
  createEmptyTile,
} from '../src/features/match3/match3Types.ts';

function createSimpleBoard(rows: number = 8, cols: number = 8): Match3BoardState {
  return createBoard({ rows, cols, palette: MATCH3_COLORS });
}

function createBoardWithPattern(pattern: (Match3Color | null)[][]): Match3BoardState {
  const rows = pattern.length;
  const cols = pattern[0]?.length ?? 0;
  const base = createBoard({ rows, cols, palette: MATCH3_COLORS });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = pattern[r][c];
      base.tiles[r][c] = color === null ? createEmptyTile(r, c) : createColorTile(r, c, color);
    }
  }

  return base;
}

test('createBoard generates a board without initial matches', () => {
  const state = createSimpleBoard(8, 8);
  assert.equal(findAllMatches(state.tiles).length, 0);
});

test('createEmptyTile creates a real empty slot', () => {
  const tile = createEmptyTile(2, 3);
  assert.equal(tile.row, 2);
  assert.equal(tile.col, 3);
  assert.equal(tile.color, null);
  assert.equal(tile.special, undefined);
});

test('canSwap only allows special direct swaps for color bomb or two specials', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green'],
    ['yellow', 'purple', 'orange'],
  ]);
  state.tiles[0][0].special = 'colorBomb';

  const beforeLeft = { color: state.tiles[0][0].color, special: state.tiles[0][0].special };
  const beforeRight = { color: state.tiles[0][1].color, special: state.tiles[0][1].special };

  assert.equal(canSwap(state, 0, 0, 0, 1), true);
  assert.deepEqual(
    { color: state.tiles[0][0].color, special: state.tiles[0][0].special },
    beforeLeft
  );
  assert.deepEqual(
    { color: state.tiles[0][1].color, special: state.tiles[0][1].special },
    beforeRight
  );
});

test('executeSwap resolves color bomb with a normal tile without corrupting board state', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green'],
    ['blue', 'purple', 'orange'],
    ['yellow', 'blue', 'red'],
  ]);
  state.tiles[0][0].special = 'colorBomb';

  const result = executeSwap(state, 0, 0, 0, 1);

  assert.equal(result.valid, true);
  assert.equal(state.lastSwap?.valid, true);
  assert.equal(state.tiles[0][0].isMatched, true);
  assert.equal(state.tiles[0][1].isMatched, true);
  assert.equal(state.tiles[1][0].isMatched, true);
  assert.equal(state.tiles[2][1].isMatched, true);
});

test('executeSwap turns color bomb plus wrapped into a full-board conversion blast', () => {
  const state = createBoardWithPattern([
    ['red', 'red', 'green'],
    ['red', 'yellow', 'red'],
    ['blue', 'red', 'orange'],
  ]);
  state.tiles[0][0].special = 'colorBomb';
  state.tiles[0][1].special = 'wrapped';

  const result = executeSwap(state, 0, 0, 0, 1);

  assert.equal(result.valid, true);
  assert.equal(state.tiles[0][2].isMatched, true);
  assert.equal(state.tiles[1][0].isMatched, true);
  assert.equal(state.tiles[1][2].isMatched, true);
  assert.equal(state.tiles[2][1].isMatched, true);
});

test('executeSwap clears the full board when two color bombs combine', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green'],
    ['yellow', 'purple', 'orange'],
    ['green', 'blue', 'red'],
  ]);
  state.tiles[0][0].special = 'colorBomb';
  state.tiles[0][1].special = 'colorBomb';

  const result = executeSwap(state, 0, 0, 0, 1);

  assert.equal(result.valid, true);
  for (const tile of state.tiles.flat()) {
    assert.equal(tile.isMatched, true);
  }
});

test('executeSwap clears triple rows and triple columns for striped plus wrapped', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green', 'yellow', 'purple'],
    ['orange', 'red', 'blue', 'green', 'yellow'],
    ['purple', 'orange', 'red', 'blue', 'green'],
    ['yellow', 'purple', 'orange', 'green', 'blue'],
    ['green', 'yellow', 'purple', 'orange', 'red'],
  ]);
  state.tiles[2][2].special = 'striped-h';
  state.tiles[2][3].special = 'wrapped';

  const result = executeSwap(state, 2, 2, 2, 3);

  assert.equal(result.valid, true);
  assert.equal(state.tiles[1][1].isMatched, true);
  assert.equal(state.tiles[2][0].isMatched, true);
  assert.equal(state.tiles[4][3].isMatched, true);
  assert.equal(state.tiles[0][4].isMatched, false);
});

test('executeSwap clears a 5x5 area for wrapped plus wrapped', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    ['orange', 'red', 'blue', 'green', 'yellow', 'purple'],
    ['purple', 'orange', 'red', 'blue', 'green', 'yellow'],
    ['yellow', 'purple', 'orange', 'red', 'blue', 'green'],
    ['green', 'yellow', 'purple', 'orange', 'red', 'blue'],
    ['blue', 'green', 'yellow', 'purple', 'orange', 'red'],
  ]);
  state.tiles[2][2].special = 'wrapped';
  state.tiles[2][3].special = 'wrapped';

  const result = executeSwap(state, 2, 2, 2, 3);

  assert.equal(result.valid, true);
  assert.equal(state.tiles[0][0].isMatched, true);
  assert.equal(state.tiles[4][4].isMatched, true);
  assert.equal(state.tiles[5][5].isMatched, false);
});

test('executeSwap leaves a generated special block on a four-match', () => {
  const state = createBoardWithPattern([
    ['green', 'blue', 'red', 'yellow'],
    ['red', 'red', 'blue', 'red'],
    ['yellow', 'green', 'purple', 'orange'],
  ]);

  const result = executeSwap(state, 0, 2, 1, 2);

  assert.equal(result.valid, true);
  const specialTiles = state.tiles.flat().filter((tile) => tile.special);
  assert.equal(specialTiles.length, 1);
  assert.ok(['striped-h', 'striped-v'].includes(specialTiles[0].special ?? ''));
  assert.equal(specialTiles[0].isMatched, false);
});

test('clearMatchedTiles turns cleared normal tiles into empty slots', () => {
  const state = createBoardWithPattern([
    ['red', 'blue'],
    ['green', 'yellow'],
  ]);

  state.tiles[0][0].isMatched = true;
  clearMatchedTiles(state);

  assert.equal(state.tiles[0][0].color, null);
  assert.equal(state.tiles[0][0].special, undefined);
});

test('clearMatchedTiles updates clearOverlay goals when an overlay is removed', () => {
  const state = createBoardWithPattern([['red']]);
  state.goals = [{ type: 'clearOverlay', target: 1, current: 0 }];
  state.tiles[0][0].obstacle = 'frost1';
  state.tiles[0][0].obstacleHp = 1;
  state.tiles[0][0].isMatched = true;

  clearMatchedTiles(state);

  assert.equal(state.goals[0].current, 1);
  assert.equal(state.tiles[0][0].obstacle, undefined);
});

test('triggerSpecialEffect updates clearObstacle goals when a blocker is destroyed', () => {
  const goal: Match3Goal = { type: 'clearObstacle', target: 1, current: 0, obstacleTarget: 'box' };
  const state = createBoardWithPattern([
    ['red', 'blue', 'green'],
    ['red', 'yellow', 'purple'],
    ['red', 'orange', 'blue'],
  ]);
  state.goals = [goal];
  state.tiles[0][1].obstacle = 'box';
  state.tiles[0][1].obstacleHp = 1;

  triggerSpecialEffect(state, 0, 2, 'striped-h');

  assert.equal(state.goals[0].current, 1);
  assert.equal(state.tiles[0][1].obstacle, undefined);
});

test('handlePortalDrop moves a dropping tile through the portal and empties the source slot', () => {
  const state = createBoardWithPattern([
    [null, 'blue'],
    ['green', null],
  ]);
  state.portals = [{ id: 'portal-1', inRow: 1, inCol: 0, outRow: 0, outCol: 0 }];
  state.tiles[1][0].isDropping = true;
  state.tiles[1][0].dropDistance = 1;

  handlePortalDrop(state);

  assert.equal(state.tiles[0][0].color, 'green');
  assert.equal(state.tiles[0][0].isDropping, true);
  assert.equal(state.tiles[1][0].color, null);
});

test('handlePortalDrop carries drop items through the portal as well', () => {
  const state = createBoardWithPattern([
    [null, 'blue'],
    ['green', null],
  ]);
  state.portals = [{ id: 'portal-1', inRow: 1, inCol: 0, outRow: 0, outCol: 0 }];
  state.tiles[1][0].dropItem = 'folder';
  state.tiles[1][0].isDropping = true;
  state.tiles[1][0].dropDistance = 1;

  handlePortalDrop(state);

  assert.equal(state.tiles[0][0].dropItem, 'folder');
  assert.equal(state.tiles[1][0].dropItem, undefined);
});

test('createBoardFromConfig applies spreader interval and initial spreader positions', () => {
  const state = createBoardFromConfig({
    id: 'spreader-test',
    name: 'Spreader Test',
    modeId: 'adventure',
    rows: 3,
    cols: 3,
    palette: [...MATCH3_COLORS],
    goals: [{ type: 'clearObstacle', target: 1, current: 0, obstacleTarget: 'spreader' }],
    maxMoves: 10,
    spreaderConfig: {
      initialPositions: [{ row: 1, col: 1 }],
      spreadInterval: 2,
    },
  });

  assert.equal(state.spreaderInterval, 2);
  assert.equal(state.spreaderActive, true);
  assert.deepEqual(state.spreaderPositions, [{ row: 1, col: 1 }]);
  assert.equal(state.tiles[1][1].obstacle, 'spreader');
});

test('createBoardFromConfig applies prebuilt specials and preserves script metadata', () => {
  const state = createBoardFromConfig({
    id: 'combo-script-test',
    name: 'Combo Script Test',
    modeId: 'puzzle',
    chapterId: 'puzzle-combos',
    chapterName: '组合谜题',
    boardTemplateId: 'combo-latch',
    rows: 4,
    cols: 4,
    palette: ['red', 'blue', 'green', 'yellow'],
    colorWeights: { red: 5, blue: 1 },
    goals: [{ type: 'triggerCombo', target: 1, current: 0, comboTarget: 'striped-wrapped' }],
    maxMoves: 6,
    prebuiltSpecials: [
      { row: 1, col: 1, color: 'red', special: 'striped-h' },
      { row: 1, col: 2, color: 'red', special: 'wrapped' },
    ],
  });

  assert.equal(state.modeId, 'puzzle');
  assert.equal(state.chapterId, 'puzzle-combos');
  assert.equal(state.chapterName, '组合谜题');
  assert.equal(state.boardTemplateId, 'combo-latch');
  assert.deepEqual(state.colorWeights, { red: 5, blue: 1 });
  assert.equal(state.tiles[1][1].special, 'striped-h');
  assert.equal(state.tiles[1][2].special, 'wrapped');
  assert.equal(state.tiles[1][1].color, 'red');
});

test('applyGravity fills empty slots with new tiles', () => {
  const state = createBoardWithPattern([
    [null, 'blue'],
    ['green', 'yellow'],
  ]);

  applyGravity(state, MATCH3_COLORS, () => 0);

  assert.equal(state.tiles[0][0].color, 'red');
  assert.equal(state.tiles[1][0].color, 'green');
});

test('applyGravity delivers drop items to exits and counts the drop goal', () => {
  const state = createBoardWithPattern([
    ['red'],
    [null],
    [null],
  ]);
  state.goals = [{ type: 'dropCollect', target: 1, current: 0, dropItemType: 'folder' }];
  state.dropExits = [{ row: 2, col: 0 }];
  state.tiles[0][0].dropItem = 'folder';
  state.tiles[0][0].isDropping = true;

  applyGravity(state, MATCH3_COLORS, () => 0);

  assert.equal(state.goals[0].current, 1);
  assert.equal(state.tiles[2][0].dropItem, undefined);
});

test('applyGravity uses state color weights when refilling empty slots', () => {
  const state = createBoardFromConfig({
    id: 'weighted-refill',
    name: 'Weighted Refill',
    modeId: 'adventure',
    rows: 2,
    cols: 2,
    palette: [...MATCH3_COLORS],
    colorWeights: { blue: 10 },
    goals: [{ type: 'score', target: 100, current: 0 }],
    maxMoves: 10,
  });

  state.tiles[0][0] = createEmptyTile(0, 0);
  applyGravity(state, undefined, () => 0.4);

  assert.equal(state.tiles[0][0].color, 'blue');
});

test('executeSwap updates triggerCombo goals for scripted combo targets', () => {
  const state = createBoardWithPattern([
    ['red', 'blue', 'green', 'yellow', 'purple'],
    ['orange', 'red', 'blue', 'green', 'yellow'],
    ['purple', 'orange', 'red', 'blue', 'green'],
    ['yellow', 'purple', 'orange', 'green', 'blue'],
    ['green', 'yellow', 'purple', 'orange', 'red'],
  ]);
  state.goals = [{ type: 'triggerCombo', target: 1, current: 0, comboTarget: 'striped-wrapped' }];
  state.tiles[2][2].special = 'striped-h';
  state.tiles[2][3].special = 'wrapped';

  const result = executeSwap(state, 2, 2, 2, 3);

  assert.equal(result.valid, true);
  assert.equal(state.goals[0].current, 1);
});

test('processChain reports whether another cascade exists', () => {
  const state = createBoardWithPattern([
    [null, 'blue', 'green'],
    ['red', 'blue', 'green'],
    ['red', 'yellow', 'purple'],
  ]);
  state.tiles[1][0].isMatched = true;
  state.tiles[2][0].isMatched = true;

  const hadChain = processChain(state, MATCH3_COLORS, () => 0);

  assert.equal(typeof hadChain, 'boolean');
});

test('decrementMoves consumes remaining moves', () => {
  const state = createSimpleBoard(8, 8);
  state.maxMoves = 30;
  state.moves = 5;

  const result = decrementMoves(state);

  assert.equal(result, true);
  assert.equal(state.moves, 4);
});

test('decrementMoves stops at zero remaining moves', () => {
  const state = createSimpleBoard(8, 8);
  state.maxMoves = 30;
  state.moves = 0;

  const result = decrementMoves(state);

  assert.equal(result, false);
  assert.equal(state.moves, 0);
});

test('decrementTime reduces remaining time and reports exhaustion', () => {
  const state = createSimpleBoard(8, 8);
  state.maxTimeMs = 60000;
  state.timeMs = 500;

  const result = decrementTime(state, 1000);

  assert.equal(result, false);
  assert.equal(state.timeMs, 0);
});

test('checkWinCondition only succeeds when every goal is complete', () => {
  const state = createSimpleBoard(8, 8);
  state.goals = [
    { type: 'score', target: 1000, current: 1000 },
    { type: 'collectColor', target: 3, current: 2, colorTarget: 'red' },
  ];

  assert.equal(checkWinCondition(state), false);

  state.goals[1].current = 3;
  assert.equal(checkWinCondition(state), true);
});

test('checkLoseCondition only fails once resources are exhausted and goals remain', () => {
  const state = createSimpleBoard(8, 8);
  state.goals = [{ type: 'score', target: 1000, current: 500 }];
  state.maxMoves = 20;
  state.moves = 1;

  assert.equal(checkLoseCondition(state).lost, false);

  state.moves = 0;
  assert.equal(checkLoseCondition(state).lost, true);
});

test('checkLoseCondition gives a player-facing hint for unfinished drop goals', () => {
  const state = createSimpleBoard(8, 8);
  state.goals = [{ type: 'dropCollect', target: 3, current: 1, dropItemType: 'folder' }];
  state.maxMoves = 20;
  state.moves = 0;

  const result = checkLoseCondition(state);

  assert.equal(result.lost, true);
  assert.match(result.reason ?? '', /还差 2/);
  assert.match(result.suggestion ?? '', /出口/);
});

test('generateResult reports used moves from remaining-move state', () => {
  const state = createSimpleBoard(8, 8);
  state.goals = [{ type: 'score', target: 1000, current: 1200 }];
  state.score = 1200;
  state.maxMoves = 30;
  state.moves = 5;
  state.maxComboReached = 3;

  const result = generateResult(state);

  assert.equal(result.won, true);
  assert.equal(result.movesUsed, 25);
  assert.equal(result.maxCombo, 3);
});

test('selectTile only works during playing phase and sets swap target for adjacent picks', () => {
  const state = createSimpleBoard(3, 3);

  selectTile(state, 1, 1);
  assert.equal(state.selectedTile, null);

  startGame(state);
  selectTile(state, 1, 1);
  selectTile(state, 1, 2);

  assert.deepEqual(state.selectedTile, { row: 1, col: 1 });
  assert.deepEqual(state.swapTarget, { row: 1, col: 2 });

  clearSelection(state);
  assert.equal(state.selectedTile, null);
  assert.equal(state.swapTarget, null);
});

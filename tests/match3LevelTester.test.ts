import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMatch3Level,
  pickMatch3SimulationSwap,
  runMatch3LevelBatch,
} from '../src/features/match3/match3LevelTester.ts';
import {
  getLevelById,
} from '../src/features/match3/match3LevelCatalog.ts';
import {
  createBoard,
  executeSwap,
  processChain,
  startGame,
} from '../src/features/match3/match3BoardState.ts';
import {
  createColorTile,
} from '../src/features/match3/match3Types.ts';

function createSimulationBoard(pattern: string[][]) {
  const board = createBoard({ rows: pattern.length, cols: pattern[0]?.length ?? 0 });
  for (let row = 0; row < pattern.length; row += 1) {
    for (let col = 0; col < pattern[row]!.length; col += 1) {
      board.tiles[row]![col] = createColorTile(row, col, pattern[row]![col] as never);
    }
  }
  startGame(board);
  return board;
}

function isSameSwap(
  choice: { from: { row: number; col: number }; to: { row: number; col: number } } | null,
  a: [number, number],
  b: [number, number],
) {
  if (!choice) return false;
  const left = `${choice.from.row},${choice.from.col}`;
  const right = `${choice.to.row},${choice.to.col}`;
  const expectedA = `${a[0]},${a[1]}`;
  const expectedB = `${b[0]},${b[1]}`;
  return (left === expectedA && right === expectedB) || (left === expectedB && right === expectedA);
}

test('analyzeMatch3Level reports missing drop exits for drop goals', () => {
  const level = {
    id: 'drop-bad',
    name: 'Bad Drop',
    packId: 'drop-collect',
    packName: '掉落收集包',
    orderInPack: 99,
    rows: 7,
    cols: 7,
    palette: ['red', 'yellow', 'blue'],
    goals: [{ type: 'dropCollect', target: 1, current: 0, dropItemType: 'folder' }],
    maxMoves: 12,
    dropItems: [{ type: 'folder', row: 0, col: 3 }],
    difficulty: 'easy' as const,
  };

  const report = analyzeMatch3Level(level);

  assert.equal(report.levelId, 'drop-bad');
  assert.ok(report.issues.some((issue) => issue.code === 'missing-drop-exit'));
});

test('analyzeMatch3Level reports at least one opening move for shipped levels', () => {
  const level = getLevelById('beginner-01');
  assert.ok(level);

  const report = analyzeMatch3Level(level!);

  assert.equal(report.hasOpeningMove, true);
  assert.equal(report.issues.some((issue) => issue.code === 'no-opening-move'), false);
});

test('collectGreedy prefers swaps that advance collect-color goals', () => {
  const board = createSimulationBoard([
    ['blue', 'red', 'red', 'green'],
    ['blue', 'yellow', 'green', 'red'],
    ['red', 'blue', 'yellow', 'red'],
    ['green', 'yellow', 'red', 'red'],
  ]);
  board.goals = [{ type: 'collectColor', target: 3, current: 0, colorTarget: 'blue' }];

  const choice = pickMatch3SimulationSwap(board, 'collectGreedy', () => 0.5);

  assert.ok(isSameSwap(choice, [2, 0], [2, 1]));
});

test('obstacleGreedy prefers swaps that clear obstacle-linked goals', () => {
  const board = createSimulationBoard([
    ['blue', 'red', 'green'],
    ['blue', 'yellow', 'green'],
    ['red', 'blue', 'yellow'],
  ]);
  board.goals = [{ type: 'clearObstacle', target: 1, current: 0, obstacleTarget: 'chain' }];
  board.tiles[0]![0]!.obstacle = 'chain';
  board.tiles[0]![0]!.obstacleHp = 1;

  const choice = pickMatch3SimulationSwap(board, 'obstacleGreedy', () => 0.5);
  assert.ok(choice);

  const clone = structuredClone(board);
  executeSwap(clone, choice!.from.row, choice!.from.col, choice!.to.row, choice!.to.col, () => 0.5);
  let cascading = true;
  while (cascading) {
    cascading = processChain(clone, clone.palette, () => 0.5);
  }

  assert.ok((clone.goals[0]?.current ?? 0) > 0);
});

test('dropGreedy prefers swaps that work on drop columns', () => {
  const board = createSimulationBoard([
    ['blue', 'red', 'red', 'green'],
    ['blue', 'yellow', 'green', 'red'],
    ['red', 'blue', 'yellow', 'red'],
    ['green', 'yellow', 'red', 'red'],
  ]);
  board.goals = [{ type: 'dropCollect', target: 1, current: 0, dropItemType: 'folder' }];
  board.tiles[0]![0]!.dropItem = 'folder';
  board.dropExits = [{ row: 3, col: 0 }];

  const choice = pickMatch3SimulationSwap(board, 'dropGreedy', () => 0.5);

  assert.ok(choice);
  assert.ok(choice!.from.col === 0 || choice!.to.col === 0);
});

test('specialGreedy prefers special-combo swaps over plain matches', () => {
  const board = createSimulationBoard([
    ['red', 'red', 'red', 'green'],
    ['blue', 'yellow', 'green', 'red'],
    ['red', 'blue', 'yellow', 'red'],
    ['green', 'yellow', 'red', 'red'],
  ]);
  board.tiles[0]![0]!.special = 'striped-h';
  board.tiles[0]![1]!.special = 'wrapped';
  board.goals = [{ type: 'score', target: 2000, current: 0 }];

  const choice = pickMatch3SimulationSwap(board, 'specialGreedy', () => 0.5);

  assert.ok(isSameSwap(choice, [0, 0], [0, 1]));
});

test('runMatch3LevelBatch returns deterministic seeded metrics', () => {
  const level = getLevelById('beginner-01');
  assert.ok(level);

  const report = runMatch3LevelBatch({
    level: level!,
    strategy: 'random',
    seeds: [11, 12, 13],
  });

  assert.equal(report.levelId, 'beginner-01');
  assert.equal(report.runs.length, 3);
  assert.equal(report.seeds.length, 3);
  assert.ok(report.winRate >= 0 && report.winRate <= 1);
  assert.ok(typeof report.averageValidMoveCount === 'number');
  assert.ok(typeof report.failureReasons === 'object');
});

test('runMatch3LevelBatch can exercise combo-oriented strategy on combo levels', () => {
  const level = getLevelById('combo-01');
  assert.ok(level);

  const report = runMatch3LevelBatch({
    level: level!,
    strategy: 'comboGreedy',
    seeds: [21, 22],
  });

  assert.equal(report.levelId, 'combo-01');
  assert.equal(report.strategy, 'comboGreedy');
  assert.equal(report.runs.length, 2);
});

test('drop-collect high-risk levels reach a minimum solvability floor after tuning', () => {
  const levels = ['drop-03', 'drop-04', 'drop-06']
    .map((id) => getLevelById(id))
    .filter(Boolean);

  assert.equal(levels.length, 3);

  const seeds = Array.from({ length: 16 }, (_, index) => 301 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: 'goalGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['drop-03']?.winRate ?? 0) >= 0.25, `drop-03 winRate=${byId['drop-03']?.winRate}`);
  assert.ok((byId['drop-04']?.winRate ?? 0) >= 0.25, `drop-04 winRate=${byId['drop-04']?.winRate}`);
  assert.ok((byId['drop-06']?.winRate ?? 0) >= 0.2, `drop-06 winRate=${byId['drop-06']?.winRate}`);
});

test('jelly-clear high-risk levels reach a minimum solvability floor after tuning', () => {
  const levels = ['jelly-05', 'jelly-06', 'jelly-09', 'jelly-10']
    .map((id) => getLevelById(id))
    .filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 401 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: 'goalGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['jelly-05']?.winRate ?? 0) >= 0.2, `jelly-05 winRate=${byId['jelly-05']?.winRate}`);
  assert.ok((byId['jelly-06']?.winRate ?? 0) >= 0.2, `jelly-06 winRate=${byId['jelly-06']?.winRate}`);
  assert.ok((byId['jelly-09']?.winRate ?? 0) >= 0.2, `jelly-09 winRate=${byId['jelly-09']?.winRate}`);
  assert.ok((byId['jelly-10']?.winRate ?? 0) >= 0.2, `jelly-10 winRate=${byId['jelly-10']?.winRate}`);
});

test('late jelly-clear high-risk levels reach a minimum solvability floor after tuning', () => {
  const levels = ['jelly-12', 'jelly-13', 'jelly-16', 'jelly-18']
    .map((id) => getLevelById(id))
    .filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 501 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: 'goalGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['jelly-12']?.winRate ?? 0) >= 0.15, `jelly-12 winRate=${byId['jelly-12']?.winRate}`);
  assert.ok((byId['jelly-13']?.winRate ?? 0) >= 0.15, `jelly-13 winRate=${byId['jelly-13']?.winRate}`);
  assert.ok((byId['jelly-16']?.winRate ?? 0) >= 0.15, `jelly-16 winRate=${byId['jelly-16']?.winRate}`);
  assert.ok((byId['jelly-18']?.winRate ?? 0) >= 0.15, `jelly-18 winRate=${byId['jelly-18']?.winRate}`);
});

test('move-strategy high-risk levels reach a minimum solvability floor after tuning', () => {
  const levelIds = ['move-05', 'move-07', 'move-09', 'move-10'];
  const levels = levelIds
    .map((id) => getLevelById(id))
    .filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 601 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: level?.id === 'move-07' ? 'goalGreedy' : 'comboGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['move-05']?.winRate ?? 0) >= 0.15, `move-05 winRate=${byId['move-05']?.winRate}`);
  assert.ok((byId['move-07']?.winRate ?? 0) >= 0.15, `move-07 winRate=${byId['move-07']?.winRate}`);
  assert.ok((byId['move-09']?.winRate ?? 0) >= 0.15, `move-09 winRate=${byId['move-09']?.winRate}`);
  assert.ok((byId['move-10']?.winRate ?? 0) >= 0.15, `move-10 winRate=${byId['move-10']?.winRate}`);
});

test('next high-risk mixed levels reach a minimum solvability floor after tuning', () => {
  const levelIds = ['drop-05', 'jelly-04', 'jelly-08', 'obstacle-02'];
  const levels = levelIds
    .map((id) => getLevelById(id))
    .filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 701 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: level?.id === 'drop-05' ? 'dropGreedy' : 'obstacleGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['drop-05']?.winRate ?? 0) >= 0.15, `drop-05 winRate=${byId['drop-05']?.winRate}`);
  assert.ok((byId['jelly-04']?.winRate ?? 0) >= 0.15, `jelly-04 winRate=${byId['jelly-04']?.winRate}`);
  assert.ok((byId['jelly-08']?.winRate ?? 0) >= 0.15, `jelly-08 winRate=${byId['jelly-08']?.winRate}`);
  assert.ok((byId['obstacle-02']?.winRate ?? 0) >= 0.15, `obstacle-02 winRate=${byId['obstacle-02']?.winRate}`);
});

test('move-strategy late high-score levels reach a minimum solvability floor after tuning', () => {
  const levelIds = ['move-11', 'move-12', 'move-13', 'move-14'];
  const levels = levelIds.map((id) => getLevelById(id)).filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 801 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: 'comboGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['move-11']?.winRate ?? 0) >= 0.15, `move-11 winRate=${byId['move-11']?.winRate}`);
  assert.ok((byId['move-12']?.winRate ?? 0) >= 0.15, `move-12 winRate=${byId['move-12']?.winRate}`);
  assert.ok((byId['move-13']?.winRate ?? 0) >= 0.15, `move-13 winRate=${byId['move-13']?.winRate}`);
  assert.ok((byId['move-14']?.winRate ?? 0) >= 0.15, `move-14 winRate=${byId['move-14']?.winRate}`);
});

test('move-strategy late expert levels reach a minimum solvability floor after tuning', () => {
  const levelIds = ['move-15', 'move-16', 'move-17', 'move-18'];
  const levels = levelIds.map((id) => getLevelById(id)).filter(Boolean);

  assert.equal(levels.length, 4);

  const seeds = Array.from({ length: 16 }, (_, index) => 901 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: ['move-15', 'move-16'].includes(level!.id) ? 'collectGreedy' : 'comboGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['move-15']?.winRate ?? 0) >= 0.15, `move-15 winRate=${byId['move-15']?.winRate}`);
  assert.ok((byId['move-16']?.winRate ?? 0) >= 0.15, `move-16 winRate=${byId['move-16']?.winRate}`);
  assert.ok((byId['move-17']?.winRate ?? 0) >= 0.15, `move-17 winRate=${byId['move-17']?.winRate}`);
  assert.ok((byId['move-18']?.winRate ?? 0) >= 0.15, `move-18 winRate=${byId['move-18']?.winRate}`);
});

test('remaining high-risk levels reach a minimum solvability floor after tuning', () => {
  const levelIds = ['move-06', 'move-08', 'move-19', 'move-20', 'jelly-14', 'jelly-15', 'jelly-17', 'obstacle-03', 'obstacle-04', 'obstacle-05', 'obstacle-06', 'combo-06'];
  const levels = levelIds.map((id) => getLevelById(id)).filter(Boolean);

  assert.equal(levels.length, 12);

  const seeds = Array.from({ length: 16 }, (_, index) => 1201 + index);
  const reports = levels.map((level) =>
    runMatch3LevelBatch({
      level: level!,
      strategy: level!.id.startsWith('drop-')
        ? 'dropGreedy'
        : level!.id.startsWith('move-') && ['move-06'].includes(level!.id)
          ? 'collectGreedy'
          : level!.id.startsWith('move-') ? 'comboGreedy'
          : level!.id === 'combo-06'
            ? 'specialGreedy'
            : 'obstacleGreedy',
      seeds,
    })
  );

  const byId = Object.fromEntries(reports.map((report) => [report.levelId, report]));

  assert.ok((byId['move-06']?.winRate ?? 0) >= 0.15, `move-06 winRate=${byId['move-06']?.winRate}`);
  assert.ok((byId['move-08']?.winRate ?? 0) >= 0.15, `move-08 winRate=${byId['move-08']?.winRate}`);
  assert.ok((byId['move-19']?.winRate ?? 0) >= 0.15, `move-19 winRate=${byId['move-19']?.winRate}`);
  assert.ok((byId['move-20']?.winRate ?? 0) >= 0.15, `move-20 winRate=${byId['move-20']?.winRate}`);
  assert.ok((byId['jelly-14']?.winRate ?? 0) >= 0.15, `jelly-14 winRate=${byId['jelly-14']?.winRate}`);
  assert.ok((byId['jelly-15']?.winRate ?? 0) >= 0.15, `jelly-15 winRate=${byId['jelly-15']?.winRate}`);
  assert.ok((byId['jelly-17']?.winRate ?? 0) >= 0.15, `jelly-17 winRate=${byId['jelly-17']?.winRate}`);
  assert.ok((byId['obstacle-03']?.winRate ?? 0) >= 0.15, `obstacle-03 winRate=${byId['obstacle-03']?.winRate}`);
  assert.ok((byId['obstacle-04']?.winRate ?? 0) >= 0.15, `obstacle-04 winRate=${byId['obstacle-04']?.winRate}`);
  assert.ok((byId['obstacle-05']?.winRate ?? 0) >= 0.15, `obstacle-05 winRate=${byId['obstacle-05']?.winRate}`);
  assert.ok((byId['obstacle-06']?.winRate ?? 0) >= 0.15, `obstacle-06 winRate=${byId['obstacle-06']?.winRate}`);
  assert.ok((byId['combo-06']?.winRate ?? 0) >= 0.15, `combo-06 winRate=${byId['combo-06']?.winRate}`);
});

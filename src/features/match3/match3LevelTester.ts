/* 三消关卡测试器：提供静态验关与无 UI 批量仿真，帮助评估可过性和难度风险。 */

import {
  canSwap,
  checkLoseCondition,
  checkWinCondition,
  createBoardFromConfig,
  createSeededRandom,
  decrementMoves,
  executeSwap,
  findAllMatches,
  findValidSwaps,
  generateResult,
  hasValidSwaps,
  processChain,
  shuffleBoard,
  startGame,
} from './match3BoardState.ts';
import type { Match3BoardState, Match3Goal } from './match3Types.ts';
import type { Match3LevelScript } from './match3LevelCatalog.ts';
import { convertScriptToConfig } from './match3LevelCatalog.ts';

export type Match3SimulationStrategy = 'random' | 'goalGreedy' | 'comboGreedy';
export type Match3SpecializedSimulationStrategy =
  | 'collectGreedy'
  | 'obstacleGreedy'
  | 'dropGreedy'
  | 'specialGreedy';
export type Match3AnySimulationStrategy = Match3SimulationStrategy | Match3SpecializedSimulationStrategy;

export interface Match3LevelIssue {
  code: 'missing-drop-exit' | 'initial-match' | 'no-opening-move' | 'combo-budget-risk';
  message: string;
}

export interface Match3LevelAnalysis {
  levelId: string;
  issues: Match3LevelIssue[];
  hasOpeningMove: boolean;
}

export interface Match3SimulationRun {
  seed: number;
  won: boolean;
  turns: number;
  reshuffleCount: number;
  averageValidMoveCount: number;
  failureReason?: string;
  score: number;
}

export interface Match3LevelBatchReport {
  levelId: string;
  strategy: Match3AnySimulationStrategy;
  seeds: number[];
  runs: Match3SimulationRun[];
  winRate: number;
  averageValidMoveCount: number;
  failureReasons: Record<string, number>;
}

interface CandidateSwap {
  from: { row: number; col: number };
  to: { row: number; col: number };
  immediateScore: number;
  comboPotential: number;
  goalPressure: number;
  goalGain: number;
  collectGain: number;
  obstacleGain: number;
  dropGoalGain: number;
  dropLaneGain: number;
  specialGain: number;
}

function countRemainingGoals(goals: Match3Goal[]): number {
  return goals.reduce((total, goal) => total + Math.max(0, goal.target - goal.current), 0);
}

function getGoalLaneColumns(state: Match3BoardState): number[] {
  const columns = new Set<number>();
  for (const tile of state.tiles.flat()) {
    if (tile.dropItem) columns.add(tile.col);
  }
  for (const exit of state.dropExits) {
    columns.add(exit.col);
  }
  return [...columns];
}

function calculateDropLaneGain(
  state: Match3BoardState,
  clone: Match3BoardState,
  from: { row: number; col: number },
  to: { row: number; col: number },
): number {
  const goalColumns = getGoalLaneColumns(state);
  if (goalColumns.length === 0) return 0;

  let gain = 0;
  const usedColumns = [from.col, to.col];
  for (const column of goalColumns) {
    if (usedColumns.includes(column)) {
      gain += 12;
      if (from.row !== to.row) gain += 8;
    }
  }

  gain += clone.tiles.flat().reduce((total, tile) => {
    if (!tile.isMatched) return total;
    return goalColumns.includes(tile.col) ? total + 18 : total;
  }, 0);

  return gain;
}

function calculateGoalGains(before: Match3Goal[], after: Match3Goal[]): {
  total: number;
  collect: number;
  obstacle: number;
  drop: number;
} {
  let total = 0;
  let collect = 0;
  let obstacle = 0;
  let drop = 0;
  for (let index = 0; index < before.length; index += 1) {
    const previous = before[index];
    const next = after[index];
    if (!previous || !next) continue;
    const delta = Math.max(0, next.current - previous.current);
    if (delta === 0) continue;

    switch (previous.type) {
      case 'dropCollect':
        total += delta * 220;
        drop += delta * 220;
        break;
      case 'clearObstacle':
      case 'clearOverlay':
        total += delta * 140;
        obstacle += delta * 140;
        break;
      case 'collectColor':
        total += delta * 80;
        collect += delta * 80;
        break;
      case 'triggerCombo':
        total += delta * 180;
        break;
      case 'score':
        total += delta / 25;
        break;
      default:
        total += delta * 40;
    }
  }
  return { total, collect, obstacle, drop };
}

function calculateSpecialGain(
  state: Match3BoardState,
  clone: Match3BoardState,
  from: { row: number; col: number },
  to: { row: number; col: number },
  comboPotential: number,
): number {
  const sourceA = state.tiles[from.row]?.[from.col];
  const sourceB = state.tiles[to.row]?.[to.col];
  let gain = 0;
  if (sourceA?.special) gain += 120;
  if (sourceB?.special) gain += 120;
  gain += comboPotential * 60;
  gain += clone.tiles.flat().reduce((total, tile) => total + (tile.special ? 12 : 0), 0);
  return gain;
}

function buildCandidateSwaps(state: Match3BoardState): CandidateSwap[] {
  const candidates: CandidateSwap[] = [];
  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const pairs = [
        [row, col + 1],
        [row + 1, col],
      ];
      for (const [nextRow, nextCol] of pairs) {
        if (nextRow >= state.rows || nextCol >= state.cols) continue;
        if (!canSwap(state, row, col, nextRow, nextCol)) continue;
        const beforeGoals = state.goals.map((goal) => ({ ...goal }));
        const clone = structuredClone(state);
        const result = executeSwap(clone, row, col, nextRow, nextCol, () => 0.5);
        const goalGains = calculateGoalGains(beforeGoals, clone.goals);
        candidates.push({
          from: { row, col },
          to: { row: nextRow, col: nextCol },
          immediateScore: result.score,
          comboPotential: result.comboLevel,
          goalPressure: countRemainingGoals(clone.goals),
          goalGain: goalGains.total,
          collectGain: goalGains.collect,
          obstacleGain: goalGains.obstacle,
          dropGoalGain: goalGains.drop,
          dropLaneGain: calculateDropLaneGain(state, clone, { row, col }, { row: nextRow, col: nextCol }),
          specialGain: calculateSpecialGain(state, clone, { row, col }, { row: nextRow, col: nextCol }, result.comboLevel),
        });
      }
    }
  }
  return candidates;
}

function selectSwap(
  state: Match3BoardState,
  strategy: Match3AnySimulationStrategy,
  random: () => number,
): CandidateSwap | null {
  const candidates = buildCandidateSwaps(state);
  if (candidates.length === 0) return null;

  if (strategy === 'random') {
    return candidates[Math.floor(random() * candidates.length)] ?? null;
  }

  const sorted = [...candidates].sort((left, right) => {
    if (strategy === 'comboGreedy') {
      return (
        right.goalGain - left.goalGain ||
        right.comboPotential - left.comboPotential ||
        right.immediateScore - left.immediateScore ||
        right.dropLaneGain - left.dropLaneGain ||
        left.goalPressure - right.goalPressure
      );
    }
    if (strategy === 'collectGreedy') {
      return (
        right.collectGain - left.collectGain ||
        right.goalGain - left.goalGain ||
        right.immediateScore - left.immediateScore ||
        right.comboPotential - left.comboPotential
      );
    }
    if (strategy === 'obstacleGreedy') {
      return (
        right.obstacleGain - left.obstacleGain ||
        right.goalGain - left.goalGain ||
        right.specialGain - left.specialGain ||
        right.immediateScore - left.immediateScore
      );
    }
    if (strategy === 'dropGreedy') {
      return (
        right.dropGoalGain - left.dropGoalGain ||
        right.dropLaneGain - left.dropLaneGain ||
        right.goalGain - left.goalGain ||
        right.immediateScore - left.immediateScore
      );
    }
    if (strategy === 'specialGreedy') {
      return (
        right.specialGain - left.specialGain ||
        right.comboPotential - left.comboPotential ||
        right.immediateScore - left.immediateScore ||
        right.goalGain - left.goalGain
      );
    }
    return (
      right.goalGain - left.goalGain ||
      right.dropLaneGain - left.dropLaneGain ||
      left.goalPressure - right.goalPressure ||
      right.immediateScore - left.immediateScore ||
      right.comboPotential - left.comboPotential
    );
  });
  return sorted[0] ?? null;
}

// 对外暴露当前策略 bot 选中的下一步，供测试和调参工具直接调用。
export function pickMatch3SimulationSwap(
  state: Match3BoardState,
  strategy: Match3AnySimulationStrategy,
  random: () => number = Math.random,
): Pick<CandidateSwap, 'from' | 'to' | 'immediateScore' | 'comboPotential'> | null {
  const choice = selectSwap(state, strategy, random);
  if (!choice) return null;
  return {
    from: choice.from,
    to: choice.to,
    immediateScore: choice.immediateScore,
    comboPotential: choice.comboPotential,
  };
}

// 读取脚本并做最基础的静态验关，优先抓明显坏关。
export function analyzeMatch3Level(level: Match3LevelScript): Match3LevelAnalysis {
  const issues: Match3LevelIssue[] = [];
  const board = createBoardFromConfig(convertScriptToConfig(level), createSeededRandom(1));

  if (level.goals.some((goal) => goal.type === 'dropCollect') && (!level.dropExits || level.dropExits.length === 0)) {
    issues.push({ code: 'missing-drop-exit', message: '掉落目标关缺少 dropExits，收集物没有出口。' });
  }

  if (findAllMatches(board.tiles).length > 0) {
    issues.push({ code: 'initial-match', message: '初盘仍存在自动三连，开局会自解。' });
  }

  const hasOpeningMove = hasValidSwaps(board);
  if (!hasOpeningMove) {
    issues.push({ code: 'no-opening-move', message: '初盘没有合法交换，玩家开局无步可走。' });
  }

  const comboGoal = level.goals.find((goal) => goal.type === 'triggerCombo');
  if (comboGoal && level.maxMoves < comboGoal.target * 2) {
    issues.push({ code: 'combo-budget-risk', message: '组合目标步数预算偏紧，可能需要预置更多组合入口。' });
  }

  return {
    levelId: level.id,
    issues,
    hasOpeningMove,
  };
}

function runSingleSimulation(
  level: Match3LevelScript,
  seed: number,
  strategy: Match3AnySimulationStrategy,
): Match3SimulationRun {
  const random = createSeededRandom(seed);
  const state = createBoardFromConfig(convertScriptToConfig(level), random);
  startGame(state);

  let turns = 0;
  let reshuffleCount = 0;
  let validMoveTotal = 0;

  while (state.phase === 'playing' && turns < 300) {
    const validMoves = findValidSwaps(state);
    validMoveTotal += validMoves.length;

    if (validMoves.length === 0) {
      shuffleBoard(state, state.palette, random);
      reshuffleCount += 1;
      turns += 1;
      continue;
    }

    const choice = selectSwap(state, strategy, random);
    if (!choice) break;

    const result = executeSwap(state, choice.from.row, choice.from.col, choice.to.row, choice.to.col, random);
    if (!result.valid) {
      turns += 1;
      continue;
    }

    decrementMoves(state);
    let cascading = true;
    while (cascading) {
      cascading = processChain(state, state.palette, random);
    }

    if (!hasValidSwaps(state)) {
      shuffleBoard(state, state.palette, random);
      reshuffleCount += 1;
    }

    if (checkWinCondition(state)) {
      state.phase = 'won';
      break;
    }

    const lose = checkLoseCondition(state);
    if (lose.lost) {
      state.phase = 'lost';
      state.failureReason = lose.reason;
      state.failureSuggestion = lose.suggestion;
      break;
    }

    turns += 1;
  }

  const result = generateResult(state);
  return {
    seed,
    won: result.won,
    turns,
    reshuffleCount,
    averageValidMoveCount: turns > 0 ? validMoveTotal / turns : validMoveTotal,
    failureReason: result.failureReason,
    score: result.score,
  };
}

// 批量跑固定 seed，输出通关率和失败分布，给调关使用。
export function runMatch3LevelBatch(input: {
  level: Match3LevelScript;
  seeds: number[];
  strategy?: Match3AnySimulationStrategy;
}): Match3LevelBatchReport {
  const strategy = input.strategy ?? 'random';
  const runs = input.seeds.map((seed) => runSingleSimulation(input.level, seed, strategy));
  const wins = runs.filter((run) => run.won).length;
  const failureReasons = runs.reduce<Record<string, number>>((summary, run) => {
    if (!run.failureReason) return summary;
    summary[run.failureReason] = (summary[run.failureReason] ?? 0) + 1;
    return summary;
  }, {});

  return {
    levelId: input.level.id,
    strategy,
    seeds: [...input.seeds],
    runs,
    winRate: runs.length === 0 ? 0 : wins / runs.length,
    averageValidMoveCount: runs.length === 0 ? 0 : runs.reduce((total, run) => total + run.averageValidMoveCount, 0) / runs.length,
    failureReasons,
  };
}

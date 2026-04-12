/* 负责贪吃蛇文本链、目标词组和奖励词库，供状态层与界面层共用。 */
import type { SnakeBoardState, SnakeDifficulty, SnakeMode } from './snakeTypes.ts';

type ChainBonus = {
  text: string;
  bonus: number;
  label: string;
};

const CHAIN_BONUSES: ChainBonus[] = [
  { text: 'VLOOKUP', bonus: 220, label: '查找链' },
  { text: 'LOVEYOU', bonus: 200, label: '句子链' },
  { text: 'EXCEL', bonus: 140, label: '工作簿链' },
  { text: 'LOVE', bonus: 80, label: '短词链' },
  { text: '2026', bonus: 90, label: '年份链' },
  { text: '404', bonus: 60, label: '错误码链' },
  { text: 'SUM', bonus: 50, label: '公式链' },
  { text: 'EXP', bonus: 40, label: '成长链' },
  { text: 'HP', bonus: 30, label: '状态链' },
];

const TARGET_PLANS: Record<Exclude<SnakeMode, 'classic'>, Record<SnakeDifficulty, string[]>> = {
  timed: {
    easy: ['GO', 'HP', 'LOVE'],
    normal: ['LOVE', 'EXCEL', '2026'],
    hard: ['SUM', 'EXCEL', 'LOVE YOU'],
  },
  challenge: {
    easy: ['LOVE', '404', 'EXCEL'],
    normal: ['SUM', '2026', 'LOVE YOU'],
    hard: ['EXCEL', 'SUM', 'LOVE YOU', 'VLOOKUP'],
  },
};

const CONFUSABLE_TOKENS: Record<string, string[]> = {
  O: ['0', 'Q', 'D'],
  0: ['O', '8', '6'],
  I: ['1', 'L', 'T'],
  1: ['I', 'L', '7'],
  S: ['5', '8', 'E'],
  5: ['S', '8', '6'],
  E: ['F', '3', 'C'],
  A: ['4', 'H', 'R'],
  T: ['7', 'Y', 'I'],
  V: ['Y', 'U', 'A'],
  U: ['V', 'Y', 'O'],
  M: ['N', 'W', 'H'],
};

const FORMULA_SYMBOLS = new Set(['+', '-', '=', '!', '?', '#', '$', '@', '%']);

function isPlayableToken(token: string): boolean {
  return /^[A-Z0-9]$/.test(token) || FORMULA_SYMBOLS.has(token);
}

export function getSnakeTargetSegments(target: string, overrides?: string[]): string[] {
  if (overrides && overrides.length > 0) {
    return overrides;
  }
  return target
    .split(/\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function getSnakeSegmentBoundaries(target: string, overrides?: string[]): number[] {
  const segments = getSnakeTargetSegments(target, overrides);
  let cumulative = 0;
  return segments.map((segment) => {
    const tokens = getSnakeTargetTokens(segment);
    cumulative += tokens.length;
    return cumulative;
  });
}

export function getSnakeTargetPlan(mode: SnakeMode, difficulty: SnakeDifficulty): string[] {
  if (mode === 'classic') return [];
  return TARGET_PLANS[mode][difficulty];
}

export function getSnakeTargetTokens(target: string): string[] {
  return [...target.toUpperCase()].filter((token) => isPlayableToken(token));
}

export function getCurrentSnakeTarget(state: Pick<SnakeBoardState, 'targetPlan' | 'targetIndex'>): string | null {
  return state.targetPlan[state.targetIndex] ?? null;
}

export function getExpectedTargetToken(
  state: Pick<SnakeBoardState, 'targetPlan' | 'targetIndex' | 'targetProgress'>,
): string | null {
  const currentTarget = getCurrentSnakeTarget(state);
  if (!currentTarget) return null;
  return getSnakeTargetTokens(currentTarget)[state.targetProgress] ?? null;
}

export function formatSnakeChainText(tokens: string[], maxVisible = 14): string {
  if (tokens.length === 0) return '空';
  const text = tokens.join('');
  if (text.length <= maxVisible) return text;
  return `...${text.slice(-maxVisible)}`;
}

export function getSnakeTargetProgressLabel(
  state: Pick<SnakeBoardState, 'targetPlan' | 'targetIndex' | 'targetProgress'>,
): string {
  const target = getCurrentSnakeTarget(state);
  if (!target) return '自由拼链';

  const tokens = getSnakeTargetTokens(target);
  if (tokens.length === 0) return target;

  const completed = tokens.slice(0, state.targetProgress).join('');
  const pending = tokens.slice(state.targetProgress).join('');
  return `${target}  ${completed}[${pending || '完成'}]`;
}

export function resolveSnakeChainBonus(tokens: string[]): ChainBonus | null {
  const chainText = tokens.join('');
  for (const bonus of CHAIN_BONUSES) {
    if (chainText.endsWith(bonus.text)) {
      return bonus;
    }
  }
  return null;
}

export function getDistractorToken(expectedToken: string | null, random: () => number): string {
  if (expectedToken && CONFUSABLE_TOKENS[expectedToken]) {
    const pool = CONFUSABLE_TOKENS[expectedToken];
    return pool[Math.floor(random() * pool.length)] ?? pool[0];
  }

  const fallbackPool = 'DATAFLOWSHEETGRID2026';
  return fallbackPool[Math.floor(random() * fallbackPool.length)] ?? 'X';
}

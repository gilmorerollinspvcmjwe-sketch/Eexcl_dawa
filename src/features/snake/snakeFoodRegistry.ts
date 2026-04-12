/* 负责生成贪吃蛇食物，包括字母数字链、万能格和现有功能道具。 */
import { getDistractorToken } from './snakeTextChain.ts';
import type { FoodCell, FoodKind } from './snakeTypes.ts';

type SnakeFoodDefinition = {
  kind: FoodKind;
  value: number;
  growth: number;
  boostMs?: number;
  spawnWeight: number;
};

const TOKEN_FOOD_REGISTRY: Record<'letter' | 'digit' | 'wild', SnakeFoodDefinition> = {
  letter: { kind: 'letter', value: 12, growth: 1, spawnWeight: 46 },
  digit: { kind: 'digit', value: 14, growth: 1, spawnWeight: 14 },
  wild: { kind: 'wild', value: 35, growth: 1, spawnWeight: 4 },
};

const STATIC_FOOD_REGISTRY: Record<'coin' | 'coffee' | 'gold' | 'error_na' | 'error_div' | 'meeting', SnakeFoodDefinition & { label: string }> = {
  coin: { kind: 'coin', label: '$', value: 50, growth: 1, spawnWeight: 10 },
  coffee: { kind: 'coffee', label: 'C', value: 30, growth: 1, boostMs: 3000, spawnWeight: 8 },
  gold: { kind: 'gold', label: '*', value: 100, growth: 2, spawnWeight: 4 },
  error_na: { kind: 'error_na', label: 'NA', value: 80, growth: 1, spawnWeight: 4 },
  error_div: { kind: 'error_div', label: 'DV', value: 60, growth: 1, spawnWeight: 4 },
  meeting: { kind: 'meeting', label: 'M', value: 20, growth: 1, spawnWeight: 2 },
};

const RANDOM_FOOD_WEIGHTS = [
  TOKEN_FOOD_REGISTRY.letter,
  TOKEN_FOOD_REGISTRY.digit,
  TOKEN_FOOD_REGISTRY.wild,
  STATIC_FOOD_REGISTRY.coin,
  STATIC_FOOD_REGISTRY.coffee,
  STATIC_FOOD_REGISTRY.gold,
  STATIC_FOOD_REGISTRY.error_na,
  STATIC_FOOD_REGISTRY.error_div,
  STATIC_FOOD_REGISTRY.meeting,
];

const LETTER_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGIT_POOL = '0123456789';

function pickWeightedKind(random: () => number): FoodKind {
  const totalWeight = RANDOM_FOOD_WEIGHTS.reduce((sum, definition) => sum + definition.spawnWeight, 0);
  let cursor = random() * totalWeight;

  for (const definition of RANDOM_FOOD_WEIGHTS) {
    cursor -= definition.spawnWeight;
    if (cursor <= 0) return definition.kind;
  }

  return 'letter';
}

function pickRandomToken(pool: string, random: () => number): string {
  return pool[Math.floor(random() * pool.length)] ?? pool[0];
}

export function createTokenFoodCell(token: string, row: number, col: number, isTarget = false): FoodCell {
  const normalizedToken = token.toUpperCase();
  const definition =
    normalizedToken === '@'
      ? TOKEN_FOOD_REGISTRY.wild
      : /^\d$/.test(normalizedToken)
        ? TOKEN_FOOD_REGISTRY.digit
        : TOKEN_FOOD_REGISTRY.letter;

  return {
    row,
    col,
    kind: definition.kind,
    label: normalizedToken,
    value: definition.value,
    growth: definition.growth,
    boostMs: definition.boostMs ?? 0,
    token: normalizedToken,
    isTarget,
  };
}

export function createFoodCell(kind: Exclude<FoodKind, 'letter' | 'digit' | 'wild'>, row: number, col: number): FoodCell {
  const definition = STATIC_FOOD_REGISTRY[kind];
  return {
    row,
    col,
    kind,
    label: definition.label,
    value: definition.value,
    growth: definition.growth,
    boostMs: definition.boostMs ?? 0,
  };
}

export function createRandomFoodCell(
  row: number,
  col: number,
  random: () => number = Math.random,
  options: { distractorFor?: string | null } = {},
): FoodCell {
  const kind = pickWeightedKind(random);

  if (kind === 'letter') {
    const token =
      options.distractorFor && random() < 0.55 ? getDistractorToken(options.distractorFor, random) : pickRandomToken(LETTER_POOL, random);
    return createTokenFoodCell(token, row, col);
  }

  if (kind === 'digit') {
    const token =
      options.distractorFor && random() < 0.45 ? getDistractorToken(options.distractorFor, random) : pickRandomToken(DIGIT_POOL, random);
    return createTokenFoodCell(token, row, col);
  }

  if (kind === 'wild') {
    return createTokenFoodCell('@', row, col);
  }

  return createFoodCell(kind, row, col);
}

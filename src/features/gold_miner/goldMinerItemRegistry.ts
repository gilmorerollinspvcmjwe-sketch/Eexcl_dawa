import type { GoldMinerItemKind } from './goldMinerTypes.ts';

export interface GoldMinerItemDefinition {
  kind: GoldMinerItemKind;
  label: string;
  minValue: number;
  maxValue: number;
  weight: number;
  radius: number;
  retractSpeedMultiplier: number;
  isMoving?: boolean;
}

export const GOLD_MINER_ITEM_REGISTRY: Record<GoldMinerItemKind, GoldMinerItemDefinition> = {
  gold_small: { kind: 'gold_small', label: '小金块', minValue: 30, maxValue: 120, weight: 1, radius: 18, retractSpeedMultiplier: 1 },
  gold_medium: { kind: 'gold_medium', label: '中金块', minValue: 220, maxValue: 520, weight: 2.6, radius: 24, retractSpeedMultiplier: 0.66 },
  gold_large: { kind: 'gold_large', label: '大金块', minValue: 520, maxValue: 760, weight: 4.8, radius: 30, retractSpeedMultiplier: 0.38 },
  rock_small: { kind: 'rock_small', label: '小石头', minValue: 18, maxValue: 28, weight: 4.2, radius: 22, retractSpeedMultiplier: 0.42 },
  rock_large: { kind: 'rock_large', label: '大石头', minValue: 28, maxValue: 42, weight: 6.2, radius: 32, retractSpeedMultiplier: 0.26 },
  diamond: { kind: 'diamond', label: '钻石', minValue: 600, maxValue: 600, weight: 0.5, radius: 14, retractSpeedMultiplier: 1.45 },
  money_bag: { kind: 'money_bag', label: '钱袋', minValue: 80, maxValue: 880, weight: 1.2, radius: 18, retractSpeedMultiplier: 0.9 },
  mystery_bag: { kind: 'mystery_bag', label: '神秘袋', minValue: 120, maxValue: 520, weight: 1.8, radius: 18, retractSpeedMultiplier: 0.84 },
  mole: { kind: 'mole', label: '鼹鼠', minValue: 20, maxValue: 90, weight: 0.8, radius: 16, retractSpeedMultiplier: 1.2, isMoving: true },
  bat: { kind: 'bat', label: '蝙蝠', minValue: 20, maxValue: 90, weight: 0.8, radius: 16, retractSpeedMultiplier: 1.18, isMoving: true },
};

export function getGoldMinerItemDefinition(kind: GoldMinerItemKind): GoldMinerItemDefinition {
  return GOLD_MINER_ITEM_REGISTRY[kind];
}

export function rollGoldMinerItemValue(kind: GoldMinerItemKind, random: () => number): number {
  const definition = GOLD_MINER_ITEM_REGISTRY[kind];
  if (definition.minValue === definition.maxValue) return definition.minValue;
  return definition.minValue + Math.round((definition.maxValue - definition.minValue) * random());
}

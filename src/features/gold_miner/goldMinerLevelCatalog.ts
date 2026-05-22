import type { GoldMinerItemKind, GoldMinerLevelDefinition, GoldMinerMode } from './goldMinerTypes.ts';

function buildBudget(entries: Array<[GoldMinerItemKind, number]>): Partial<Record<GoldMinerItemKind, number>> {
  return Object.fromEntries(entries) as Partial<Record<GoldMinerItemKind, number>>;
}

export const GOLD_MINER_LEVELS: GoldMinerLevelDefinition[] = [
  { id: 1, mode: 'adventure', title: '新手矿区', targetScore: 900, timeLimitSec: 60, itemBudget: buildBudget([['gold_small', 9], ['gold_medium', 2], ['rock_small', 2]]) },
  { id: 2, mode: 'adventure', title: '黄金课堂', targetScore: 1500, timeLimitSec: 58, itemBudget: buildBudget([['gold_small', 8], ['gold_medium', 3], ['rock_small', 3], ['money_bag', 1]]) },
  { id: 3, mode: 'adventure', title: '钻石预警', targetScore: 2200, timeLimitSec: 58, itemBudget: buildBudget([['gold_small', 7], ['gold_medium', 4], ['diamond', 1], ['rock_small', 4]]) },
  { id: 4, mode: 'adventure', title: '沉重矿脉', targetScore: 3200, timeLimitSec: 56, itemBudget: buildBudget([['gold_small', 5], ['gold_medium', 4], ['gold_large', 1], ['rock_small', 4], ['rock_large', 1]]) },
  { id: 5, mode: 'adventure', title: '幸运钱袋', targetScore: 4300, timeLimitSec: 56, itemBudget: buildBudget([['gold_small', 5], ['gold_medium', 4], ['money_bag', 3], ['rock_small', 4], ['rock_large', 1]]) },
  { id: 6, mode: 'adventure', title: '神秘补给', targetScore: 5600, timeLimitSec: 54, itemBudget: buildBudget([['gold_small', 5], ['gold_medium', 4], ['gold_large', 1], ['mystery_bag', 2], ['rock_small', 5]]) },
  { id: 7, mode: 'adventure', title: '鼹鼠走廊', targetScore: 7100, timeLimitSec: 52, itemBudget: buildBudget([['gold_small', 4], ['gold_medium', 4], ['gold_large', 1], ['mole', 3], ['rock_small', 5], ['rock_large', 1]]), rules: { enableMovingItems: true } },
  { id: 8, mode: 'adventure', title: '蝙蝠矿洞', targetScore: 8800, timeLimitSec: 50, itemBudget: buildBudget([['gold_small', 4], ['gold_medium', 4], ['diamond', 2], ['bat', 3], ['rock_small', 5], ['rock_large', 1]]), rules: { enableMovingItems: true } },
  { id: 9, mode: 'adventure', title: '下沉矿脉', targetScore: 10800, timeLimitSec: 48, itemBudget: buildBudget([['gold_small', 4], ['gold_medium', 4], ['gold_large', 2], ['money_bag', 2], ['rock_small', 5], ['rock_large', 2]]), rules: { sinkItems: true } },
  { id: 10, mode: 'adventure', title: '极速摆臂', targetScore: 13200, timeLimitSec: 46, itemBudget: buildBudget([['gold_small', 3], ['gold_medium', 5], ['gold_large', 2], ['diamond', 2], ['mole', 2], ['rock_small', 5], ['rock_large', 2]]), rules: { enableMovingItems: true, fasterSwing: true } },
  { id: 11, mode: 'adventure', title: '盲抓回路', targetScore: 15800, timeLimitSec: 44, itemBudget: buildBudget([['gold_small', 2], ['gold_medium', 4], ['gold_large', 2], ['diamond', 2], ['mystery_bag', 2], ['bat', 2], ['rock_small', 5], ['rock_large', 2]]), rules: { enableMovingItems: true, hiddenItems: true } },
  { id: 12, mode: 'adventure', title: '百万数据井', targetScore: 18600, timeLimitSec: 42, itemBudget: buildBudget([['gold_small', 2], ['gold_medium', 4], ['gold_large', 3], ['diamond', 3], ['money_bag', 2], ['mystery_bag', 2], ['mole', 2], ['bat', 2], ['rock_small', 5], ['rock_large', 3]]), rules: { enableMovingItems: true, sinkItems: true, fasterSwing: true } },
];

export function getGoldMinerLevel(levelId: number): GoldMinerLevelDefinition {
  return GOLD_MINER_LEVELS.find((level) => level.id === levelId) ?? GOLD_MINER_LEVELS[0];
}

export function getGoldMinerMaxAdventureLevel(): number {
  return GOLD_MINER_LEVELS[GOLD_MINER_LEVELS.length - 1]?.id ?? 1;
}

export function createEndlessGoldMinerLevel(levelId: number): GoldMinerLevelDefinition {
  const stage = Math.max(1, levelId);
  return {
    id: stage,
    mode: 'endless',
    title: `无尽矿坑 ${stage}`,
    targetScore: Math.round(2800 * Math.pow(1.22, stage - 1)),
    timeLimitSec: Math.max(28, 60 - Math.floor((stage - 1) / 2) * 2),
    itemBudget: buildBudget([
      ['gold_small', Math.max(2, 8 - Math.floor(stage / 4))],
      ['gold_medium', 4 + Math.floor(stage / 3)],
      ['gold_large', 1 + Math.floor(stage / 4)],
      ['diamond', Math.min(4, 1 + Math.floor(stage / 5))],
      ['money_bag', 1 + Math.floor(stage / 6)],
      ['mystery_bag', 1 + Math.floor(stage / 6)],
      ['mole', Math.min(4, Math.floor(stage / 3))],
      ['bat', Math.min(4, Math.floor(stage / 4))],
      ['rock_small', 5 + Math.floor(stage / 3)],
      ['rock_large', 1 + Math.floor(stage / 5)],
    ]),
    rules: { enableMovingItems: stage >= 3, sinkItems: stage >= 6, fasterSwing: stage >= 8, hiddenItems: stage >= 10 },
  };
}

export function getGoldMinerStartingLevel(mode: GoldMinerMode): GoldMinerLevelDefinition {
  return mode === 'endless' ? createEndlessGoldMinerLevel(1) : getGoldMinerLevel(1);
}

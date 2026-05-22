/* 提供贪吃蛇的模式包与关卡包配置，供前端选择和战局初始化使用。 */
import type { SnakeDifficulty, SnakeMapSizePreset, SnakeMode } from './snakeTypes.ts';

export type SnakePackId = 'starter' | 'target_words' | 'pressure_maps';

export type SnakePresetDefinition = {
  id: string;
  packId: SnakePackId;
  title: string;
  summary: string;
  mode: SnakeMode;
  difficulty: SnakeDifficulty;
  mapSize: SnakeMapSizePreset;
  durationMs?: number;
  targetPlan?: string[];
  badge: string;
  targetSegmentsConfig?: Record<string, string[]>;
};

export type SnakePackDefinition = {
  id: SnakePackId;
  title: string;
  summary: string;
  accent: string;
};

export const SNAKE_PACKS: SnakePackDefinition[] = [
  {
    id: 'starter',
    title: '基础训练包',
    summary: '先熟悉文字链、限时冲分和基础路径规划。',
    accent: '#0f766e',
  },
  {
    id: 'target_words',
    title: '目标词包',
    summary: '围绕顺序吃字和短词完成做正式关卡。',
    accent: '#1d4ed8',
  },
  {
    id: 'pressure_maps',
    title: '压力地图包',
    summary: '把挑战模式、障碍模板和高压走位绑在一起。',
    accent: '#b45309',
  },
];

export const SNAKE_PRESETS: SnakePresetDefinition[] = [
  {
    id: 'starter_go',
    packId: 'starter',
    title: '训练 01：起步 GO',
    summary: '最短目标词，主要用来熟悉“吃字会挂在身体上”的节奏。',
    mode: 'timed',
    difficulty: 'easy',
    mapSize: 'small',
    durationMs: 60_000,
    targetPlan: ['GO', 'HP'],
    badge: '入门',
  },
  {
    id: 'starter_love',
    packId: 'starter',
    title: '训练 02：短词 LOVE',
    summary: '开始引入完整四字目标，适合练习顺序与回头路径。',
    mode: 'timed',
    difficulty: 'normal',
    mapSize: 'medium',
    durationMs: 75_000,
    targetPlan: ['LOVE', '404'],
    badge: '进阶',
  },
  {
    id: 'starter_flow',
    packId: 'starter',
    title: '训练 03：自由拼链',
    summary: '回到纯 classic，让玩家追求更长链条与自动词组奖励。',
    mode: 'classic',
    difficulty: 'normal',
    mapSize: 'medium',
    badge: '经典',
  },
  {
    id: 'target_excel',
    packId: 'target_words',
    title: '目标词：EXCEL',
    summary: '标准中图词组关，强调稳扎稳打地推进 5 字目标。',
    mode: 'challenge',
    difficulty: 'normal',
    mapSize: 'medium',
    targetPlan: ['EXCEL'],
    badge: '词组',
  },
  {
    id: 'target_formula',
    packId: 'target_words',
    title: '目标词：SUM / 404',
    summary: '把公式味和错误码一起塞进短局，适合练习连续切换目标。',
    mode: 'timed',
    difficulty: 'hard',
    mapSize: 'medium',
    durationMs: 90_000,
    targetPlan: ['SUM', '404'],
    badge: '公式',
  },
  {
    id: 'target_phrase',
    packId: 'target_words',
    title: '短句：LOVE YOU',
    summary: '首个句子型关卡，地图更大，允许玩家围绕完整短句规划。',
    mode: 'challenge',
    difficulty: 'hard',
    mapSize: 'large',
    targetPlan: ['LOVE YOU'],
    badge: '短句',
    targetSegmentsConfig: {
      'LOVE YOU': ['LOVE', 'YOU'],
    },
  },
  {
    id: 'pressure_freeze',
    packId: 'pressure_maps',
    title: '压力图：冻结线',
    summary: '中图挑战，适合在有限直线空间里处理压力障碍。',
    mode: 'challenge',
    difficulty: 'normal',
    mapSize: 'medium',
    targetPlan: ['LOVE', 'EXCEL'],
    badge: '控线',
  },
  {
    id: 'pressure_audit',
    packId: 'pressure_maps',
    title: '压力图：审计区',
    summary: '大图高压版本，目标更长，吃错字的惩罚更明显。',
    mode: 'challenge',
    difficulty: 'hard',
    mapSize: 'large',
    targetPlan: ['EXCEL', 'SUM', '404'],
    badge: '高压',
  },
  {
    id: 'formula_fix',
    packId: 'pressure_maps',
    title: '公式修复：A1+B2',
    summary: '以公式目标补充文字链玩法，强调符号与顺序。',
    mode: 'challenge',
    difficulty: 'hard',
    mapSize: 'large',
    targetPlan: ['A1+B2'],
    badge: '公式',
    targetSegmentsConfig: {
      'A1+B2': ['A1+', 'B2'],
    },
  },
];

export function getSnakePack(packId: SnakePackId): SnakePackDefinition {
  return SNAKE_PACKS.find((pack) => pack.id === packId) ?? SNAKE_PACKS[0];
}

export function getSnakePresetsByPack(packId: SnakePackId): SnakePresetDefinition[] {
  return SNAKE_PRESETS.filter((preset) => preset.packId === packId);
}

export function getSnakePresetById(presetId: string): SnakePresetDefinition {
  return SNAKE_PRESETS.find((preset) => preset.id === presetId) ?? SNAKE_PRESETS[0];
}

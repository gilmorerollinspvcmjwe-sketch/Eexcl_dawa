// 敌人相关类型定义

export type TargetType = 'head' | 'body' | 'feet';

// P0: 单格敌人系统 - 部位类型
export type PartType = 'head' | 'body' | 'leftHand' | 'rightHand' | 'foot';

export interface Target {
  id: string;
  type: TargetType;
  row: number;
  col: number;
  createdAt: number;
  expiresAt?: number;
}

// P0: 部位生成权重 (按难度) - 修复：难度越高头部越多
export interface PartWeights {
  head: number;
  body: number;
  leftHand: number;
  rightHand: number;
  foot: number;
}

// 文字敌人形状类型
export type TextEnemyShape = 'humanoid' | 'target' | 'custom';

// 部位位置定义
export interface PartPosition {
  row: number;
  col: number;
}

// 完整敌人形状（多格组合）
export interface FullEnemyShape {
  head?: PartPosition;
  body: PartPosition[];
  leftHand?: PartPosition;
  rightHand?: PartPosition;
  foot?: PartPosition;
}

// 目标分数配置
export const TARGET_SCORES: Record<TargetType, number> = {
  head: 100,
  body: 50,
  feet: 25,
};

// 目标生成概率
export const TARGET_PROBS: Record<TargetType, number> = {
  head: 0.25,
  body: 0.45,
  feet: 0.30,
};

// P0: 部位分值常量
export const PART_SCORES: Record<PartType, number> = {
  head: 150,
  body: 100,
  leftHand: 60,
  rightHand: 60,
  foot: 40,
};

// 部位颜色
export const PART_COLORS: Record<PartType, string> = {
  head: '#dc2626',
  body: '#f97316',
  leftHand: '#eab308',
  rightHand: '#eab308',
  foot: '#6b7280',
};

// 部位显示文字
export const PART_TEXTS: Record<PartType, string> = {
  head: '头',
  body: '身',
  leftHand: '手',
  rightHand: '手',
  foot: '脚',
};

// 按难度设置的部位生成权重
export const DIFFICULTY_PART_WEIGHTS: Record<string, PartWeights> = {
  easy: { head: 0.10, body: 0.45, leftHand: 0.20, rightHand: 0.20, foot: 0.05 },
  normal: { head: 0.15, body: 0.40, leftHand: 0.20, rightHand: 0.20, foot: 0.05 },
  hard: { head: 0.22, body: 0.35, leftHand: 0.18, rightHand: 0.18, foot: 0.07 },
  expert: { head: 0.30, body: 0.30, leftHand: 0.15, rightHand: 0.15, foot: 0.10 },
};

// 完整敌人形状定义
export const FULL_ENEMY_SHAPE: FullEnemyShape = {
  head: { row: 0, col: 1 },
  body: [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  leftHand: { row: 2, col: 0 },
  rightHand: { row: 2, col: 2 },
  foot: { row: 3, col: 1 },
};
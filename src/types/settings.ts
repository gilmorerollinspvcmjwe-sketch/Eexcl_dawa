// 设置相关类型定义

import type { Difficulty } from './game';

export type CrosshairStyle = 'dot' | 'cross' | 'circle' | 't-shape' | 'valorant' | 'cs2' | 'cf';

export type GamePreset = 'valorant' | 'cs2' | 'cf' | 'custom';

export interface GameSettings {
  sensitivity: number;
  sensitivityX: number;
  sensitivityY: number;
  customCursor: boolean;
  crosshairStyle: CrosshairStyle;
  crosshairColor: string;
  crosshairSize: number; // 8-24 px
  spawnRate: number; // 1-10
  targetDuration: number; // 1-10
  targetSize: number; // 16-32 px
  soundEnabled: boolean;
  difficulty: Difficulty;
  headshotLineEnabled: boolean;
  headshotLineRow: number; // 默认第 10 行
  gamePreset: GamePreset;
  trainingDuration?: 30 | 60 | 120; // 训练时长（秒）
  // 移动目标配置
  enemyMoveSpeed?: number; // 格/秒
  enemyMovePattern?: 'linear' | 'sine' | 'bounce';
  enemyRenderMode?: 'text' | 'icon';
  // 无色模式 - Excel风格
  colorlessMode?: boolean; // 无色模式，敌人显示为纯文字
  // 反馈模式
  feedbackMode?: 'fancy' | 'excel'; // 炫酷模式/Excel模式
  // 伪装图片
  coverImage?: string; // base64图片，用于隐藏时显示
  // 关卡进度
  unlockedLevels?: number[];
  credits?: number;
}

// 游戏预设灵敏度配置
export const GAME_PRESETS: Record<GamePreset, { name: string; sensitivityX: number; sensitivityY: number; dpi: number; multiplier: number }> = {
  valorant: { name: '瓦罗兰特', sensitivityX: 0.5, sensitivityY: 0.5, dpi: 800, multiplier: 1.0 },
  cs2: { name: 'CS2', sensitivityX: 1.2, sensitivityY: 1.2, dpi: 800, multiplier: 0.85 },
  cf: { name: 'CF', sensitivityX: 1.5, sensitivityY: 1.5, dpi: 800, multiplier: 0.7 },
  custom: { name: '自定义', sensitivityX: 1.0, sensitivityY: 1.0, dpi: 800, multiplier: 1.0 },
};
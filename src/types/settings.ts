// 设置相关类型定义

import type { Difficulty } from './game';

export type CrosshairStyle = 'dot' | 'cross' | 'circle' | 't-shape' | 'valorant' | 'cs2' | 'cf' | 'apex' | 'overwatch' | 'split' | 'squircle';

export type GamePreset = 'valorant' | 'cs2' | 'cf' | 'custom';

// 单元格颜色模式
export type CellColorMode = 'default' | 'random' | 'density' | 'checkerboard' | 'heatmap' | 'rainbow';

// 单元格设置
export interface CellSettings {
  // 单元格大小
  cellWidth: number;      // 40-100, default: 64
  cellHeight: number;     // 15-40, default: 20
  
  // 颜色模式
  colorMode: CellColorMode;
  
  // 颜色强度/密度 (0-100)
  colorIntensity: number;
  
  // 动态效果
  enableAnimation: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  colorShift: boolean;
}

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
  // 视觉系统设置
  colorHarmonyMode?: 'none' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
  spawnAnimation?: 'none' | 'fadeIn' | 'popIn' | 'slideUp' | 'bounceIn' | 'flashIn';
  enemyFontSize?: number; // 10-24
  enemyFontWeight?: 'normal' | 'bold' | '300' | '500';
  // 单元格设置 (Sheet2 外观)
  cellSettings?: CellSettings;
}

// 游戏预设灵敏度配置
export const GAME_PRESETS: Record<GamePreset, { name: string; sensitivityX: number; sensitivityY: number; dpi: number; multiplier: number }> = {
  valorant: { name: '瓦罗兰特', sensitivityX: 0.5, sensitivityY: 0.5, dpi: 800, multiplier: 1.0 },
  cs2: { name: 'CS2', sensitivityX: 1.2, sensitivityY: 1.2, dpi: 800, multiplier: 0.85 },
  cf: { name: 'CF', sensitivityX: 1.5, sensitivityY: 1.5, dpi: 800, multiplier: 0.7 },
  custom: { name: '自定义', sensitivityX: 1.0, sensitivityY: 1.0, dpi: 800, multiplier: 1.0 },
};
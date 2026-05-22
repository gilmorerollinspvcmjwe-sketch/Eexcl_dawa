import type { Difficulty } from './game';
import type {
  GlobalWorkbookSettings,
  PerlerSettings,
  PvZSettings,
  SnakeSettings,
  TetrisSettings,
} from './workbook';

export type CrosshairStyle =
  | 'dot'
  | 'cross'
  | 'circle'
  | 't-shape'
  | 'valorant'
  | 'cs2'
  | 'cf'
  | 'apex'
  | 'overwatch'
  | 'split'
  | 'squircle';

export type GamePreset = 'valorant' | 'cs2' | 'cf' | 'custom';

export type CellColorMode = 'default' | 'random' | 'density' | 'checkerboard' | 'heatmap' | 'rainbow';

export interface CellSettings {
  cellWidth: number;
  cellHeight: number;
  colorMode: CellColorMode;
  colorIntensity: number;
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
  crosshairSize: number;
  spawnRate: number;
  targetDuration: number;
  targetSize: number;
  soundEnabled: boolean;
  difficulty: Difficulty;
  headshotLineEnabled: boolean;
  headshotLineRow: number;
  gamePreset: GamePreset;
  trainingDuration?: 30 | 60 | 120;
  enemyMoveSpeed?: number;
  enemyMovePattern?: 'linear' | 'sine' | 'bounce';
  enemyRenderMode?: 'text' | 'icon';
  colorlessMode?: boolean;
  feedbackMode?: 'fancy' | 'excel';
  coverImage?: string;
  unlockedLevels?: number[];
  credits?: number;
  colorHarmonyMode?: 'none' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
  spawnAnimation?: 'none' | 'fadeIn' | 'popIn' | 'slideUp' | 'bounceIn' | 'flashIn';
  enemyFontSize?: number;
  enemyFontWeight?: 'normal' | 'bold' | '300' | '500';
  cellSettings?: CellSettings;
  global?: GlobalWorkbookSettings;
  snake?: SnakeSettings;
  tetris?: TetrisSettings;
  perler?: PerlerSettings;
  pvz?: PvZSettings;
}

export const GAME_PRESETS: Record<
  GamePreset,
  { name: string; sensitivityX: number; sensitivityY: number; dpi: number; multiplier: number }
> = {
  valorant: { name: '瓦罗兰特', sensitivityX: 0.5, sensitivityY: 0.5, dpi: 800, multiplier: 1.0 },
  cs2: { name: 'CS2', sensitivityX: 1.2, sensitivityY: 1.2, dpi: 800, multiplier: 0.85 },
  cf: { name: 'CF', sensitivityX: 1.5, sensitivityY: 1.5, dpi: 800, multiplier: 0.7 },
  custom: { name: '自定义', sensitivityX: 1.0, sensitivityY: 1.0, dpi: 800, multiplier: 1.0 },
};

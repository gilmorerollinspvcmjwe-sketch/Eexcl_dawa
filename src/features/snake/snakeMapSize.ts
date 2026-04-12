import type { SnakeMapSizePreset } from './snakeTypes.ts';

export interface SnakeMapSizeOption {
  preset: SnakeMapSizePreset;
  label: string;
  rows: number;
  cols: number;
}

export const SNAKE_MAP_SIZE_OPTIONS: SnakeMapSizeOption[] = [
  { preset: 'small', label: '小', rows: 12, cols: 16 },
  { preset: 'medium', label: '中', rows: 15, cols: 20 },
  { preset: 'large', label: '大', rows: 18, cols: 24 },
];

const SNAKE_MAP_SIZE_PRESET_SET = new Set<SnakeMapSizePreset>(SNAKE_MAP_SIZE_OPTIONS.map((option) => option.preset));

export function isSnakeMapSizePreset(value: unknown): value is SnakeMapSizePreset {
  return typeof value === 'string' && SNAKE_MAP_SIZE_PRESET_SET.has(value as SnakeMapSizePreset);
}

export function getSnakeMapSizeOption(preset: SnakeMapSizePreset): SnakeMapSizeOption {
  return SNAKE_MAP_SIZE_OPTIONS.find((option) => option.preset === preset) ?? SNAKE_MAP_SIZE_OPTIONS[1];
}

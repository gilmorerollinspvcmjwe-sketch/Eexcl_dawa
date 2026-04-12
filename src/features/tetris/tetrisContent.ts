/* 提供俄罗斯方块的模式包与挑战包配置，供前端配置面板使用。 */
import type { CreateTetrisBoardOptions, TetrisMode } from './tetrisTypes.ts';

export type TetrisPackId = 'core' | 'level' | 'dig' | 'puzzle';

export type TetrisPresetDefinition = {
  id: string;
  packId: TetrisPackId;
  title: string;
  summary: string;
  badge: string;
  enabled: boolean;
  boardOptions: CreateTetrisBoardOptions;
};

export type TetrisPackDefinition = {
  id: TetrisPackId;
  title: string;
  summary: string;
  accent: string;
};

export const TETRIS_PACKS: TetrisPackDefinition[] = [
  { id: 'core', title: '基础档', summary: '最先上线的三种标准模式。', accent: '#2563eb' },
  { id: 'level', title: '等级挑战', summary: '把 Marathon 改造成明确等级目标。', accent: '#7c3aed' },
  { id: 'dig', title: '清理包', summary: '保留为后续指定区域清除玩法。', accent: '#ea580c' },
  { id: 'puzzle', title: '解谜包', summary: '保留为固定序列与预设地形玩法。', accent: '#0f766e' },
];

export const TETRIS_PRESETS: TetrisPresetDefinition[] = [
  {
    id: 'marathon_main',
    packId: 'core',
    title: 'Marathon 主模式',
    summary: '最接近原版的持续生存与整理地形体验。',
    badge: '核心',
    enabled: true,
    boardOptions: { mode: 'marathon' },
  },
  {
    id: 'sprint_40',
    packId: 'core',
    title: 'Sprint 40 行',
    summary: '短局效率挑战，适合快速摸一把。',
    badge: '短局',
    enabled: true,
    boardOptions: { mode: 'sprint', sprintTargetLines: 40 },
  },
  {
    id: 'ultra_180',
    packId: 'core',
    title: 'Ultra 180 秒',
    summary: '限时冲分，要求高频清行与更稳定的节奏。',
    badge: '冲分',
    enabled: true,
    boardOptions: { mode: 'ultra', ultraDurationMs: 180_000 },
  },
  {
    id: 'dig_battle',
    packId: 'dig',
    title: '深掘清理',
    summary: '清理底部区域，必须反复压低地形并在底部区域连续消行。',
    badge: '清理',
    enabled: true,
    boardOptions: { mode: 'marathon', goalType: 'dig', digRowsRequired: 3, digRegionHeight: 3 },
  },
  {
    id: 'puzzle_script',
    packId: 'puzzle',
    title: '序列解谜',
    summary: '固定序列的放置挑战，按顺序完成所有指定数据块。',
    badge: '解谜',
    enabled: true,
    boardOptions: { mode: 'marathon', goalType: 'puzzle', puzzleSequence: ['I', 'T', 'O', 'L', 'J'] },
  },
  {
    id: 'level_10',
    packId: 'level',
    title: '等级挑战 Lv10',
    summary: '用 Marathon 的核心操作练稳定上分与堆高控制。',
    badge: '挑战',
    enabled: true,
    boardOptions: { mode: 'marathon', targetLevel: 10 },
  },
  {
    id: 'level_15',
    packId: 'level',
    title: '等级挑战 Lv15',
    summary: '更长的生存线，更适合作为进阶标准。',
    badge: '进阶',
    enabled: true,
    boardOptions: { mode: 'marathon', targetLevel: 15 },
  },
  {
    id: 'level_20',
    packId: 'level',
    title: '等级挑战 Lv20',
    summary: '首发阶段最高等级目标，定位为高手关。',
    badge: '高手',
    enabled: true,
    boardOptions: { mode: 'marathon', targetLevel: 20 },
  },
  {
    id: 'dig_preview',
    packId: 'dig',
    title: '深掘清理',
    summary: '后续会加入固定底部清理区域与更强目标提示。',
    badge: '预留',
    enabled: false,
    boardOptions: { mode: 'marathon' },
  },
  {
    id: 'puzzle_preview',
    packId: 'puzzle',
    title: '序列解谜',
    summary: '后续会加入预设地形和固定块序列的解法关。',
    badge: '预留',
    enabled: false,
    boardOptions: { mode: 'marathon' },
  },
];

export function getTetrisPresetsByPack(packId: TetrisPackId): TetrisPresetDefinition[] {
  return TETRIS_PRESETS.filter((preset) => preset.packId === packId);
}

export function getTetrisPresetById(presetId: string): TetrisPresetDefinition {
  return TETRIS_PRESETS.find((preset) => preset.id === presetId) ?? TETRIS_PRESETS[0];
}

export function findDefaultTetrisPresetId(mode: TetrisMode): string {
  if (mode === 'sprint') return 'sprint_40';
  if (mode === 'ultra') return 'ultra_180';
  return 'marathon_main';
}

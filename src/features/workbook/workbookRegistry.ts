export type AppSheetId =
  | 'hub'
  | 'game'
  | 'stats'
  | 'settings'
  | 'config'
  | 'perler'
  | 'pvz'
  | 'pvz_collection'
  | 'pvz_lab'
  | 'snake'
  | 'tetris'
  | 'pacman'
  | 'pacman_guide'
  | 'zuma'
  | 'zuma_collection'
  | 'match3'
  | 'match3_lab'
  | 'fantasy_lane'
  | 'fantasy_lane_roster'
  | 'fantasy_lane_chapter'
  | 'gold_miner'
  | 'gold_miner_guide'
  | 'game2048';

export interface SheetDefinition {
  id: AppSheetId;
  label: string;
  icon: string;
  title: string;
}

export type ArcadeGameId =
  | 'aim'
  | 'snake'
  | 'tetris'
  | 'perler'
  | 'pvz'
  | 'pacman'
  | 'zuma'
  | 'match3'
  | 'fantasy_lane'
  | 'gold_miner'
  | 'game2048';

export interface ArcadeModuleDefinition {
  id: ArcadeGameId;
  sheetId: AppSheetId;
  title: string;
  summary: string;
  accent: string;
  supportsResume: boolean;
  supportsSave: boolean;
  entrySheetId: AppSheetId;
  defaultConfigSheetId: AppSheetId;
}

export const SHEET_REGISTRY: SheetDefinition[] = [
  { id: 'hub', label: 'Sheet1', icon: '🎮', title: '游戏中心' },
  { id: 'game', label: 'Sheet2', icon: '🎯', title: '练枪区' },
  { id: 'stats', label: 'Sheet3', icon: '📊', title: '统计' },
  { id: 'settings', label: 'Sheet4', icon: '⚙', title: '设置' },
  { id: 'config', label: 'Sheet5', icon: '🧪', title: '配置中心' },
  { id: 'perler', label: 'Sheet6', icon: '🧩', title: '拼豆' },
  { id: 'pvz', label: 'Sheet7', icon: '🪴', title: '植物大战僵尸' },
  { id: 'pvz_collection', label: 'Sheet8', icon: '📖', title: '图鉴' },
  { id: 'pvz_lab', label: 'Sheet9', icon: '🔬', title: '实验室' },
  { id: 'snake', label: 'Sheet10', icon: '🐍', title: '贪吃蛇' },
  { id: 'tetris', label: 'Sheet11', icon: '🧱', title: '俄罗斯方块' },
  { id: 'pacman', label: 'Sheet12', icon: '🟡', title: '吃豆人' },
  { id: 'pacman_guide', label: 'Sheet13', icon: '📉', title: '吃豆人图鉴' },
  { id: 'zuma', label: 'Sheet14', icon: '🐸', title: '祖玛' },
  { id: 'zuma_collection', label: 'Sheet15', icon: '📖', title: '祖玛图鉴' },
  { id: 'match3', label: 'Sheet16', icon: '💎', title: '三消' },
  { id: 'match3_lab', label: 'Sheet17', icon: '📉', title: '三消实验室' },
  { id: 'fantasy_lane', label: 'Sheet18', icon: '⚔', title: '奇幻战线' },
  { id: 'fantasy_lane_roster', label: 'Sheet19', icon: '🛡', title: '兵种与英雄' },
  { id: 'fantasy_lane_chapter', label: 'Sheet20', icon: '🗺', title: '章节与关卡' },
  { id: 'gold_miner', label: 'Sheet21', icon: '⛏', title: '黄金矿工' },
  { id: 'gold_miner_guide', label: 'Sheet22', icon: '📒', title: '矿工图鉴' },
  { id: 'game2048', label: 'Sheet23', icon: '🔢', title: '2048' },
];

export const ARCADE_MODULE_REGISTRY: ArcadeModuleDefinition[] = [
  {
    id: 'aim',
    sheetId: 'game',
    title: '练枪',
    summary: '=练枪 / 热手 / 立即开打。',
    accent: '#16a34a',
    supportsResume: false,
    supportsSave: true,
    entrySheetId: 'game',
    defaultConfigSheetId: 'config',
  },
  {
    id: 'snake',
    sheetId: 'snake',
    title: '贪吃蛇',
    summary: '=贪吃蛇 / 数据流 / Sheet10。',
    accent: '#0ea5e9',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'snake',
    defaultConfigSheetId: 'snake',
  },
  {
    id: 'tetris',
    sheetId: 'tetris',
    title: '俄罗斯方块',
    summary: '=俄罗斯方块 / 整理流 / Sheet11。',
    accent: '#475569',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'tetris',
    defaultConfigSheetId: 'tetris',
  },
  {
    id: 'perler',
    sheetId: 'perler',
    title: '拼豆',
    summary: '=拼豆 / Sheet6。',
    accent: '#c084fc',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'perler',
    defaultConfigSheetId: 'perler',
  },
  {
    id: 'pvz',
    sheetId: 'pvz',
    title: '植物大战僵尸',
    summary: '=植物大战僵尸 / Sheet7。',
    accent: '#f59e0b',
    supportsResume: false,
    supportsSave: true,
    entrySheetId: 'pvz',
    defaultConfigSheetId: 'pvz_lab',
  },
  {
    id: 'pacman',
    sheetId: 'pacman',
    title: '吃豆人',
    summary: '=吃豆人 / 迷宫流 / Sheet12。',
    accent: '#facc15',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'pacman',
    defaultConfigSheetId: 'pacman_guide',
  },
  {
    id: 'zuma',
    sheetId: 'zuma',
    title: '祖玛',
    summary: '=祖玛 / 轨道流 / Sheet14。',
    accent: '#22c55e',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'zuma',
    defaultConfigSheetId: 'zuma_collection',
  },
  {
    id: 'match3',
    sheetId: 'match3',
    title: '三消',
    summary: '=三消 / 消除流 / Sheet16。',
    accent: '#6366f1',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'match3',
    defaultConfigSheetId: 'match3_lab',
  },
  {
    id: 'fantasy_lane',
    sheetId: 'fantasy_lane',
    title: '奇幻战线',
    summary: '=奇幻战线 / 单线对推 / Sheet18。',
    accent: '#b45309',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'fantasy_lane',
    defaultConfigSheetId: 'fantasy_lane_chapter',
  },
  {
    id: 'gold_miner',
    sheetId: 'gold_miner',
    title: '黄金矿工',
    summary: '=黄金矿工 / 数据抓取 / Sheet21。',
    accent: '#d97706',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'gold_miner',
    defaultConfigSheetId: 'gold_miner_guide',
  },
  {
    id: 'game2048',
    sheetId: 'game2048',
    title: '2048',
    summary: '=2048 / 数据聚合 / Sheet23。',
    accent: '#b45309',
    supportsResume: true,
    supportsSave: true,
    entrySheetId: 'game2048',
    defaultConfigSheetId: 'game2048',
  },
];

export const ARCADE_MODULE_MAP = Object.fromEntries(
  ARCADE_MODULE_REGISTRY.map((module) => [module.id, module]),
) as Record<ArcadeGameId, ArcadeModuleDefinition>;

export type AppSheetId = 'hub' | 'game' | 'stats' | 'settings' | 'config' | 'perler' | 'pvz' | 'pvz_collection' | 'pvz_lab';

export interface SheetDefinition {
  id: AppSheetId;
  label: string;
  icon: string;
  title: string;
}

export const SHEET_REGISTRY: SheetDefinition[] = [
  { id: 'hub', label: 'Sheet1', icon: '🎮', title: '游戏中心' },
  { id: 'game', label: 'Sheet2', icon: '🎯', title: '练枪区' },
  { id: 'stats', label: 'Sheet3', icon: '📊', title: '统计' },
  { id: 'settings', label: 'Sheet4', icon: '⚙', title: '设置' },
  { id: 'config', label: 'Sheet5', icon: '🧭', title: '配置中心' },
  { id: 'perler', label: 'Sheet6', icon: '🧩', title: '拼豆' },
  { id: 'pvz', label: 'Sheet7', icon: '🪴', title: '植物大战僵尸' },
  { id: 'pvz_collection', label: 'Sheet8', icon: '📗', title: '图鉴' },
  { id: 'pvz_lab', label: 'Sheet9', icon: '🧪', title: '实验室' },
];

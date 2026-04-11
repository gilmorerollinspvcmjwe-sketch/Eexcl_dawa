export type AppSheetId = 'hub' | 'game' | 'stats' | 'settings' | 'config' | 'perler';

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
];


import type { AppSheetId, ArcadeGameId } from './workbookRegistry.ts';

export interface WorkbookWorkspaceDefinition {
  gameId: ArcadeGameId;
  mainSheetId: AppSheetId;
  configSheetId: AppSheetId;
  extraSheetIds: AppSheetId[];
  visibleSheetIds: AppSheetId[];
}

// 动态工作区注册表：后续新增游戏时，只需要在这里登记主页面、配置页和附加页。
export const WORKSPACE_REGISTRY: Record<ArcadeGameId, WorkbookWorkspaceDefinition> = {
  aim: {
    gameId: 'aim',
    mainSheetId: 'game',
    configSheetId: 'settings',
    extraSheetIds: ['stats'],
    visibleSheetIds: ['hub', 'game', 'stats', 'settings'],
  },
  perler: {
    gameId: 'perler',
    mainSheetId: 'perler',
    configSheetId: 'settings',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'perler', 'settings'],
  },
  pvz: {
    gameId: 'pvz',
    mainSheetId: 'pvz',
    configSheetId: 'pvz_lab',
    extraSheetIds: ['pvz_collection'],
    visibleSheetIds: ['hub', 'pvz', 'pvz_lab'],
  },
  snake: {
    gameId: 'snake',
    mainSheetId: 'snake',
    configSheetId: 'settings',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'snake', 'settings'],
  },
  tetris: {
    gameId: 'tetris',
    mainSheetId: 'tetris',
    configSheetId: 'settings',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'tetris', 'settings'],
  },
  pacman: {
    gameId: 'pacman',
    mainSheetId: 'pacman',
    configSheetId: 'pacman_guide',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'pacman', 'pacman_guide'],
  },
  zuma: {
    gameId: 'zuma',
    mainSheetId: 'zuma',
    configSheetId: 'zuma_collection',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'zuma', 'zuma_collection'],
  },
  match3: {
    gameId: 'match3',
    mainSheetId: 'match3',
    configSheetId: 'match3_lab',
    extraSheetIds: [],
    visibleSheetIds: ['hub', 'match3', 'match3_lab'],
  },
};

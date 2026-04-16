import type { AppSheetId, ArcadeGameId } from './workbookRegistry.ts';

export interface WorkbookWorkspaceDefinition {
  gameId: ArcadeGameId;
  mainSheetId: AppSheetId;
  configSheetId: AppSheetId;
  extraSheetIds: AppSheetId[];
  visibleSheetIds: AppSheetId[];
}

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
    configSheetId: 'perler',
    extraSheetIds: [],
    visibleSheetIds: ['perler'],
  },
  pvz: {
    gameId: 'pvz',
    mainSheetId: 'pvz',
    configSheetId: 'pvz_lab',
    extraSheetIds: ['pvz_collection'],
    visibleSheetIds: ['pvz', 'pvz_collection', 'pvz_lab'],
  },
  snake: {
    gameId: 'snake',
    mainSheetId: 'snake',
    configSheetId: 'snake',
    extraSheetIds: [],
    visibleSheetIds: ['snake'],
  },
  tetris: {
    gameId: 'tetris',
    mainSheetId: 'tetris',
    configSheetId: 'tetris',
    extraSheetIds: [],
    visibleSheetIds: ['tetris'],
  },
  pacman: {
    gameId: 'pacman',
    mainSheetId: 'pacman',
    configSheetId: 'pacman_guide',
    extraSheetIds: [],
    visibleSheetIds: ['pacman', 'pacman_guide'],
  },
  zuma: {
    gameId: 'zuma',
    mainSheetId: 'zuma',
    configSheetId: 'zuma_collection',
    extraSheetIds: [],
    visibleSheetIds: ['zuma', 'zuma_collection'],
  },
  match3: {
    gameId: 'match3',
    mainSheetId: 'match3',
    configSheetId: 'match3_lab',
    extraSheetIds: [],
    visibleSheetIds: ['match3', 'match3_lab'],
  },
  fantasy_lane: {
    gameId: 'fantasy_lane',
    mainSheetId: 'fantasy_lane',
    configSheetId: 'fantasy_lane_chapter',
    extraSheetIds: ['fantasy_lane_roster'],
    visibleSheetIds: ['fantasy_lane', 'fantasy_lane_roster', 'fantasy_lane_chapter'],
  },
  gold_miner: {
    gameId: 'gold_miner',
    mainSheetId: 'gold_miner',
    configSheetId: 'gold_miner_guide',
    extraSheetIds: [],
    visibleSheetIds: ['gold_miner', 'gold_miner_guide'],
  },
  game2048: {
    gameId: 'game2048',
    mainSheetId: 'game2048',
    configSheetId: 'game2048',
    extraSheetIds: [],
    visibleSheetIds: ['game2048'],
  },
};

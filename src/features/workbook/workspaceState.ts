import type { AppSheetId, ArcadeGameId } from './workbookRegistry.ts';
import { WORKSPACE_REGISTRY } from './workspaceRegistry.ts';

export function getWorkspaceByGame(gameId: ArcadeGameId) {
  return WORKSPACE_REGISTRY[gameId];
}

export function getVisibleSheetsForWorkspace(gameId: ArcadeGameId): AppSheetId[] {
  return WORKSPACE_REGISTRY[gameId].visibleSheetIds;
}


import type { AppSheetId, ArcadeGameId } from './workbookRegistry.ts';
import { WORKSPACE_REGISTRY } from './workspaceRegistry.ts';

export function getWorkspaceByGame(gameId: ArcadeGameId) {
  return WORKSPACE_REGISTRY[gameId];
}

export function getVisibleSheetsForWorkspace(gameId: ArcadeGameId): AppSheetId[] {
  return WORKSPACE_REGISTRY[gameId].visibleSheetIds;
}

export function getGameForSheet(sheetId: AppSheetId): ArcadeGameId | null {
  if (sheetId === 'hub') return null;
  for (const workspace of Object.values(WORKSPACE_REGISTRY)) {
    if (workspace.visibleSheetIds.includes(sheetId)) {
      return workspace.gameId;
    }
  }
  return null;
}

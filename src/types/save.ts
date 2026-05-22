import type { AppSheetId, ArcadeGameId } from '../features/workbook/workbookRegistry.ts';

export interface SaveSlot {
  id: string;
  name: string;
  gameType: ArcadeGameId;
  timestamp: number;
  data: SaveData;
}

export interface SaveData {
  gameType: ArcadeGameId;
  workspaceId: ArcadeGameId;
  currentSheet: AppSheetId;
  payload: Record<string, unknown>;
}

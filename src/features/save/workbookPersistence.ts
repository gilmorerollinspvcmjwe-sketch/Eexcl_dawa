import type { AppSheetId, ArcadeGameId } from '../workbook/workbookRegistry.ts';

const WORKBOOK_PERSISTENCE_KEY = 'excel-workbook-persistence-v1';

export interface WorkbookPersistenceState {
  workspaceGameId: ArcadeGameId | null;
  currentSheet: AppSheetId;
  currentSaveSlotId: string | null;
  gameSnapshots: Partial<Record<ArcadeGameId, unknown>>;
}

export function createEmptyWorkbookPersistence(): WorkbookPersistenceState {
  return {
    workspaceGameId: null,
    currentSheet: 'hub',
    currentSaveSlotId: null,
    gameSnapshots: {},
  };
}

export function loadWorkbookPersistence(): WorkbookPersistenceState {
  try {
    const raw = localStorage.getItem(WORKBOOK_PERSISTENCE_KEY);
    if (!raw) return createEmptyWorkbookPersistence();
    const parsed = JSON.parse(raw) as WorkbookPersistenceState;
    return {
      workspaceGameId: parsed.workspaceGameId ?? null,
      currentSheet: parsed.currentSheet ?? 'hub',
      currentSaveSlotId: parsed.currentSaveSlotId ?? null,
      gameSnapshots: parsed.gameSnapshots ?? {},
    };
  } catch {
    return createEmptyWorkbookPersistence();
  }
}

export function saveWorkbookPersistence(state: WorkbookPersistenceState): void {
  localStorage.setItem(WORKBOOK_PERSISTENCE_KEY, JSON.stringify(state));
}

export function exportWorkbookPersistenceJson(state: WorkbookPersistenceState): string {
  return JSON.stringify(
    {
      version: 1,
      timestamp: Date.now(),
      ...state,
    },
    null,
    2,
  );
}

export function importWorkbookPersistenceJson(raw: string): WorkbookPersistenceState {
  const parsed = JSON.parse(raw) as WorkbookPersistenceState & { version?: number };
  return {
    workspaceGameId: parsed.workspaceGameId ?? null,
    currentSheet: parsed.currentSheet ?? 'hub',
    currentSaveSlotId: parsed.currentSaveSlotId ?? null,
    gameSnapshots: parsed.gameSnapshots ?? {},
  };
}


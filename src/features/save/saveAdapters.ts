import type { AppSheetId, ArcadeGameId } from '../workbook/workbookRegistry.ts';
import type { SaveData, SaveSlot } from '../../types/save.ts';
import { createNewSlot } from '../../utils/saveStorage.ts';

export interface WorkbookSaveAdapter {
  gameId: ArcadeGameId;
  createInitialPayload: () => Record<string, unknown>;
}

const DEFAULT_SAVE_ADAPTERS: Record<ArcadeGameId, WorkbookSaveAdapter> = {
  aim: { gameId: 'aim', createInitialPayload: () => ({ mode: 'timed' }) },
  perler: { gameId: 'perler', createInitialPayload: () => ({ entryMode: 'library' }) },
  pvz: { gameId: 'pvz', createInitialPayload: () => ({ chapterId: 'day', phase: 'setup' }) },
  snake: { gameId: 'snake', createInitialPayload: () => ({ mode: 'classic' }) },
  tetris: { gameId: 'tetris', createInitialPayload: () => ({ mode: 'marathon' }) },
  pacman: { gameId: 'pacman', createInitialPayload: () => ({ pack: 'arcade' }) },
  zuma: { gameId: 'zuma', createInitialPayload: () => ({ difficulty: 'normal' }) },
  match3: { gameId: 'match3', createInitialPayload: () => ({ level: 1 }) },
  gold_miner: { gameId: 'gold_miner', createInitialPayload: () => ({ mode: 'adventure', levelId: 1, phase: 'swinging' }) },
  game2048: { gameId: 'game2048', createInitialPayload: () => ({ mode: 'classic', gridSize: 4, targetTile: 2048 }) },
  fantasy_lane: {
    gameId: 'fantasy_lane',
    createInitialPayload: () => ({
      chapterId: 'chapter-1',
      levelId: '1-1',
      heroId: 'warlord',
      tacticalId: 'fireball',
      loadoutUnitIds: [
        'goblin_shield',
        'archer',
        'flame_warlock',
        'orc_heavy',
        'crypt_crawler',
        'elf_shooter',
        'ice_witch',
        'griffin_knight',
      ],
      phase: 'setup',
    }),
  },
};

export function createWorkbookSaveData(input: {
  gameType: ArcadeGameId;
  currentSheet: AppSheetId;
  workspaceId: ArcadeGameId;
  payload: Record<string, unknown>;
}): SaveData {
  return {
    gameType: input.gameType,
    workspaceId: input.workspaceId,
    currentSheet: input.currentSheet,
    payload: input.payload,
  };
}

export function createInitialSaveSlot(name: string, gameId: ArcadeGameId, currentSheet: AppSheetId): SaveSlot {
  const adapter = DEFAULT_SAVE_ADAPTERS[gameId];
  return createNewSlot(
    name,
    gameId,
    createWorkbookSaveData({
      gameType: gameId,
      workspaceId: gameId,
      currentSheet,
      payload: adapter.createInitialPayload(),
    }),
  );
}

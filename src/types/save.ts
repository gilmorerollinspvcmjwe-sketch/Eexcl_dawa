export interface SaveSlot {
  id: string;
  name: string;
  gameId: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export interface SaveData {
  slotId: string;
  gameId: string;
  gameState: Record<string, unknown>;
  savedAt: number;
}

export type GameId = 'pvz' | 'snake' | 'tetris' | 'match3' | 'pacman' | 'zuma';

export const GAME_NAMES: Record<GameId, string> = {
  pvz: '植物大战僵尸',
  snake: '贪吃蛇',
  tetris: '俄罗斯方块',
  match3: '消消乐',
  pacman: '吃豆人',
  zuma: '祖玛',
};

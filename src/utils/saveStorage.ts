import type { SaveSlot, SaveData, GameId } from '../types/save.ts';

const STORAGE_PREFIX = 'game-save-';
const SLOTS_KEY = 'game-save-slots';

export function listSaves(gameId?: GameId): SaveSlot[] {
  const slotsJson = localStorage.getItem(SLOTS_KEY);
  if (!slotsJson) return [];
  const slots: SaveSlot[] = JSON.parse(slotsJson);
  if (gameId) return slots.filter(s => s.gameId === gameId);
  return slots;
}

export function saveToStorage(slot: SaveSlot, data: SaveData): void {
  const slotsJson = localStorage.getItem(SLOTS_KEY);
  const slots: SaveSlot[] = slotsJson ? JSON.parse(slotsJson) : [];
  const existingIndex = slots.findIndex(s => s.id === slot.id);
  if (existingIndex >= 0) {
    slots[existingIndex] = { ...slot, updatedAt: Date.now() };
  } else {
    slots.push(slot);
  }
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  localStorage.setItem(STORAGE_PREFIX + slot.id, JSON.stringify(data));
}

export function loadFromStorage(slotId: string): SaveData | null {
  const json = localStorage.getItem(STORAGE_PREFIX + slotId);
  if (!json) return null;
  return JSON.parse(json);
}

export function deleteFromStorage(slotId: string): void {
  const slotsJson = localStorage.getItem(SLOTS_KEY);
  if (!slotsJson) return;
  const slots: SaveSlot[] = JSON.parse(slotsJson);
  const filtered = slots.filter(s => s.id !== slotId);
  localStorage.setItem(SLOTS_KEY, JSON.stringify(filtered));
  localStorage.removeItem(STORAGE_PREFIX + slotId);
}

export function createSlot(name: string, gameId: GameId): SaveSlot {
  return {
    id: `${gameId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    gameId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

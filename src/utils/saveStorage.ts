import type { SaveSlot, SaveData } from '../types/save';

const STORAGE_KEY = 'excel-aim-trainer-saves';

export function saveToStorage(slot: SaveSlot): void {
  const saves = listSaves();
  const existingIndex = saves.findIndex(s => s.id === slot.id);
  if (existingIndex >= 0) {
    saves[existingIndex] = slot;
  } else {
    saves.push(slot);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function loadFromStorage(slotId: string): SaveSlot | null {
  const saves = listSaves();
  return saves.find(s => s.id === slotId) || null;
}

export function deleteFromStorage(slotId: string): void {
  const saves = listSaves().filter(s => s.id !== slotId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function listSaves(): SaveSlot[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function listSavesByGame(gameType: SaveSlot['gameType']): SaveSlot[] {
  return listSaves().filter((slot) => slot.gameType === gameType);
}

export function createNewSlot(name: string, gameType: SaveSlot['gameType'], data: SaveData): SaveSlot {
  return {
    id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    gameType,
    timestamp: Date.now(),
    data,
  };
}

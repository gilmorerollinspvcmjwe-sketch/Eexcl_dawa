import React, { useMemo, useState } from 'react';
import type { SaveSlot } from '../types/save';
import type { AppSheetId } from '../features/workbook/workbookRegistry';
import { ARCADE_MODULE_MAP } from '../features/workbook/workbookRegistry';
import { createInitialSaveSlot } from '../features/save/saveAdapters';
import { listSaves, listSavesByGame, deleteFromStorage, saveToStorage } from '../utils/saveStorage';

interface SaveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGame?: SaveSlot['gameType'];
  currentSheet?: AppSheetId;
  currentSlotId?: string | null;
  onSave?: (slot: SaveSlot) => void;
  onLoad?: (slot: SaveSlot) => void;
}

export const SaveManager: React.FC<SaveManagerProps> = ({ isOpen, onClose, currentGame, currentSheet, currentSlotId, onSave, onLoad }) => {
  const [selectedSlot, setSelectedSlot] = useState<SaveSlot | null>(null);
  const [showNewSaveDialog, setShowNewSaveDialog] = useState(false);
  const [newSaveName, setNewSaveName] = useState('');
  const saves = useMemo(
    () => (currentGame ? listSavesByGame(currentGame) : listSaves()),
    [currentGame],
  );

  const handleDelete = (slotId: string) => {
    if (window.confirm('确定要删除这个存档吗？')) {
      deleteFromStorage(slotId);
      setSelectedSlot(null);
    }
  };

  const handleNewSave = () => {
    if (!newSaveName.trim()) return;
    const gameType = currentGame || 'pvz';
    const targetSheet = currentSheet || ARCADE_MODULE_MAP[gameType].entrySheetId;
    const newSlot = createInitialSaveSlot(newSaveName, gameType, targetSheet);
    saveToStorage(newSlot);
    setShowNewSaveDialog(false);
    setNewSaveName('');
    if (onSave) onSave(newSlot);
  };

  const handleLoad = (slot: SaveSlot) => {
    setSelectedSlot(slot);
    if (onLoad) onLoad(slot);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="save-manager-overlay" onClick={onClose}>
      <div className="save-manager-dialog" onClick={e => e.stopPropagation()}>
        <div className="save-manager-header">
          <h3>存档管理</h3>
          <button className="save-manager-close" onClick={onClose}>✕</button>
        </div>

        {currentGame && <div className="save-manager-current-game">当前游戏：{ARCADE_MODULE_MAP[currentGame].title}</div>}

        <div className="save-manager-actions">
          <button className="save-manager-btn primary" onClick={() => setShowNewSaveDialog(true)}>
            新建存档
          </button>
        </div>

        {showNewSaveDialog && (
          <div className="save-manager-new-save">
            <input
              type="text"
              placeholder="输入存档名称"
              value={newSaveName}
              onChange={e => setNewSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNewSave()}
            />
            <button className="save-manager-btn primary" onClick={handleNewSave}>确定</button>
            <button className="save-manager-btn" onClick={() => setShowNewSaveDialog(false)}>取消</button>
          </div>
        )}

        <div className="save-manager-list">
          {saves.length === 0 ? (
            <p className="save-manager-empty">暂无存档</p>
          ) : (
            saves.map(slot => (
              <div
                key={slot.id}
                className={`save-manager-item ${(selectedSlot?.id === slot.id || currentSlotId === slot.id) ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="save-manager-item-info">
                  <span className="save-manager-item-name">{slot.name}</span>
                  <span className="save-manager-item-game">{ARCADE_MODULE_MAP[slot.gameType].title}</span>
                  <span className="save-manager-item-time">
                    {new Date(slot.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="save-manager-item-actions">
                  <button className="save-manager-btn small" onClick={() => handleLoad(slot)}>
                    加载
                  </button>
                  <button className="save-manager-btn small danger" onClick={() => handleDelete(slot.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

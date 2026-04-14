// 存档管理组件：显示存档列表，支持新建、保存、加载、删除存档
import React, { useState, useEffect, useCallback } from 'react';
import { listSaves, saveToStorage, loadFromStorage, deleteFromStorage, createSlot } from '../utils/saveStorage.ts';
import type { SaveSlot, SaveData, GameId } from '../types/save.ts';
import { GAME_NAMES } from '../types/save.ts';

interface SaveManagerProps {
  gameId: GameId;
  currentGameState?: Record<string, unknown>;
  onLoad?: (data: SaveData) => void;
}

export const SaveManager: React.FC<SaveManagerProps> = ({
  gameId,
  currentGameState,
  onLoad,
}) => {
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewNameInput, setShowNewNameInput] = useState(false);
  const [newName, setNewName] = useState('');

  const refreshSaves = useCallback(() => {
    setSaves(listSaves(gameId));
  }, [gameId]);

  useEffect(() => {
    refreshSaves();
  }, [refreshSaves]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const slot = createSlot(newName.trim(), gameId);
    const data: SaveData = {
      slotId: slot.id,
      gameId,
      gameState: currentGameState || {},
      savedAt: Date.now(),
    };
    saveToStorage(slot, data);
    setNewName('');
    setShowNewNameInput(false);
    refreshSaves();
  };

  const handleSave = () => {
    if (!selectedId || !currentGameState) return;
    const slot = saves.find(s => s.id === selectedId);
    if (!slot) return;
    const data: SaveData = {
      slotId: selectedId,
      gameId,
      gameState: currentGameState,
      savedAt: Date.now(),
    };
    saveToStorage(slot, data);
    refreshSaves();
  };

  const handleLoad = () => {
    if (!selectedId) return;
    const data = loadFromStorage(selectedId);
    if (data && onLoad) {
      onLoad(data);
    }
  };

  const handleDeleteRequest = () => {
    if (!selectedId) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedId) return;
    deleteFromStorage(selectedId);
    setSelectedId(null);
    setShowDeleteConfirm(false);
    refreshSaves();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const selectedSlot = saves.find(s => s.id === selectedId) || null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="save-manager-container">
      <div className="save-manager-header">
        <span className="save-manager-title">📂 存档管理</span>
        <span className="save-manager-game-tag">{GAME_NAMES[gameId]}</span>
      </div>

      {/* 新建存档 */}
      <div className="save-manager-actions">
        {!showNewNameInput ? (
          <button className="save-btn save-btn-create" onClick={() => setShowNewNameInput(true)}>
            ＋ 新建存档
          </button>
        ) : (
          <div className="save-new-input-row">
            <input
              className="save-new-input"
              type="text"
              placeholder="输入存档名称"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={20}
              autoFocus
            />
            <button className="save-btn save-btn-sm save-btn-confirm" onClick={handleCreate} disabled={!newName.trim()}>
              确定
            </button>
            <button className="save-btn save-btn-sm save-btn-cancel" onClick={() => { setShowNewNameInput(false); setNewName(''); }}>
              取消
            </button>
          </div>
        )}
      </div>

      {/* 存档列表 */}
      <div className="save-list">
        {saves.length === 0 ? (
          <div className="save-list-empty">暂无存档，点击上方按钮创建</div>
        ) : (
          saves.map(slot => (
            <div
              key={slot.id}
              className={`save-list-item ${selectedId === slot.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(slot.id)}
            >
              <div className="save-item-info">
                <div className="save-item-name">{slot.name}</div>
                <div className="save-item-time">{formatTime(slot.updatedAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 操作按钮 */}
      <div className="save-manager-buttons">
        <button
          className="save-btn save-btn-load"
          onClick={handleLoad}
          disabled={!selectedId}
        >
          📥 加载存档
        </button>
        <button
          className="save-btn save-btn-save"
          onClick={handleSave}
          disabled={!selectedId || !currentGameState}
        >
          💾 保存当前
        </button>
        <button
          className="save-btn save-btn-delete"
          onClick={handleDeleteRequest}
          disabled={!selectedId}
        >
          🗑️ 删除存档
        </button>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && selectedSlot && (
        <div className="save-confirm-overlay" onClick={handleDeleteCancel}>
          <div className="save-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="save-confirm-title">⚠️ 确认删除</div>
            <div className="save-confirm-message">
              确定要删除存档「{selectedSlot.name}」吗？此操作不可撤销。
            </div>
            <div className="save-confirm-buttons">
              <button className="save-btn save-btn-sm save-btn-cancel" onClick={handleDeleteCancel}>
                取消
              </button>
              <button className="save-btn save-btn-sm save-btn-danger" onClick={handleDeleteConfirm}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveManager;

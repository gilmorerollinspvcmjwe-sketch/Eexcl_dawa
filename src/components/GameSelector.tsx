import React from 'react';
import { ARCADE_MODULE_REGISTRY } from '../features/workbook/workbookRegistry';

interface GameSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameType: string) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ isOpen, onClose, onSelectGame }) => {
  if (!isOpen) return null;

  return (
    <div className="game-selector-overlay" onClick={onClose}>
      <div className="game-selector-dialog" onClick={e => e.stopPropagation()}>
        <div className="game-selector-header">
          <h3>选择游戏</h3>
          <button className="game-selector-close" onClick={onClose}>✕</button>
        </div>

        <div className="game-selector-list">
          {ARCADE_MODULE_REGISTRY.map(game => (
            <button
              key={game.id}
              className="game-selector-item"
              onClick={() => {
                onSelectGame(game.id);
                onClose();
              }}
            >
              <span className="game-selector-icon">{game.accent ? '🎮' : '🎮'}</span>
              <div className="game-selector-info">
                <span className="game-selector-name">{game.title}</span>
                <span className="game-selector-desc">{game.summary.replace(/^=/, '')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

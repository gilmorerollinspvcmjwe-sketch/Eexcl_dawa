// 游戏选择界面 - 显示可用游戏列表供用户选择

import React from 'react';
import { GAME_NAMES, type GameId } from '../types/save.ts';

interface GameSelectorProps {
  onSelectGame: (gameId: GameId) => void;
  onBack?: () => void;
}

const GAME_ICONS: Record<GameId, string> = {
  pvz: '🌻',
  snake: '🐍',
  tetris: '🧱',
  match3: '💎',
  pacman: '👾',
  zuma: '🔮',
};

export const GameSelector: React.FC<GameSelectorProps> = ({ onSelectGame, onBack }) => {
  const gameIds: GameId[] = ['pvz', 'snake', 'tetris', 'match3', 'pacman', 'zuma'];

  return (
    <div className="game-selector">
      <div className="game-selector-header">
        <h2>选择游戏</h2>
        {onBack && (
          <button className="game-selector-back-btn" onClick={onBack}>
            返回
          </button>
        )}
      </div>
      <div className="game-selector-grid">
        {gameIds.map(gameId => (
          <button
            key={gameId}
            className="game-selector-card"
            onClick={() => onSelectGame(gameId)}
          >
            <span className="game-selector-icon">{GAME_ICONS[gameId]}</span>
            <span className="game-selector-name">{GAME_NAMES[gameId]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSelector;

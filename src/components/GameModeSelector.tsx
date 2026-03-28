// 经典模式选择器 - GameHub 子组件

import React from 'react';
import type { GameModeType } from './GameHub';

interface GameModeSelectorProps {
  selectedMode: GameModeType;
  onSelectMode: (mode: GameModeType) => void;
  disabled?: boolean;
}

const CLASSIC_MODES: { id: GameModeType; name: string; icon: string; desc: string }[] = [
  { id: 'timed', name: '限时', icon: '⏱️', desc: '30秒挑战' },
  { id: 'endless', name: '无限', icon: '♾️', desc: '3命制' },
  { id: 'zen', name: '禅', icon: '🧘', desc: '无压力练习' },
  { id: 'headshot', name: '爆头线', icon: '🎯', desc: '爆头专项' },
];

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled,
}) => {
  return (
    <div className="mode-grid">
      {CLASSIC_MODES.map(mode => (
        <button
          key={mode.id}
          className={`mode-button ${selectedMode === mode.id ? 'selected' : ''}`}
          onClick={() => onSelectMode(mode.id)}
          disabled={disabled}
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <span className="mode-icon">{mode.icon}</span>
          <span className="mode-name">{mode.name}</span>
          <span className="mode-desc">{mode.desc}</span>
        </button>
      ))}
    </div>
  );
};

export default GameModeSelector;
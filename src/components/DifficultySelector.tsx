// 难度选择器 - GameHub 子组件

import React from 'react';
import type { DifficultyLevel } from './GameHub';

interface DifficultySelectorHubProps {
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTY_LEVELS: { id: DifficultyLevel; name: string; color: string; desc: string }[] = [
  { id: 'very_easy', name: '非常简单', color: '#22c55e', desc: '入门级' },
  { id: 'easy', name: '简单', color: '#84cc16', desc: '适合新手' },
  { id: 'normal', name: '中等', color: '#eab308', desc: '标准难度' },
  { id: 'medium', name: '普通', color: '#f97316', desc: '有一定挑战' },
  { id: 'hard', name: '困难', color: '#ef4444', desc: '高难度' },
  { id: 'expert', name: '专家', color: '#dc2626', desc: '极限挑战' },
];

export const DifficultySelectorHub: React.FC<DifficultySelectorHubProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  return (
    <div className="difficulty-selector-hub">
      {DIFFICULTY_LEVELS.map(diff => (
        <button
          key={diff.id}
          className={`difficulty-btn ${selectedDifficulty === diff.id ? 'selected' : ''}`}
          onClick={() => onSelectDifficulty(diff.id)}
          title={diff.desc}
          style={{
            '--btn-color': diff.color,
          } as React.CSSProperties}
        >
          {diff.name}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelectorHub;
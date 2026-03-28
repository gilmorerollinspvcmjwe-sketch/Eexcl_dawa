// 挑战关卡面板 - GameHub 子组件

import React from 'react';
import { getAvailableLevels } from '../levelGenerator';

interface ChallengeLevelsPanelProps {
  onStartLevel: (level: number) => void;
}

export const ChallengeLevelsPanel: React.FC<ChallengeLevelsPanelProps> = ({
  onStartLevel,
}) => {
  const levels = getAvailableLevels();

  // 按难度分组
  const beginnerLevels = levels.filter(l => l.level <= 4);
  const intermediateLevels = levels.filter(l => l.level > 4 && l.level <= 8);
  const expertLevels = levels.filter(l => l.level > 8);

  const renderLevelGroup = (
    groupLevels: typeof levels,
    title: string,
    icon: string,
    color: string
  ) => (
    <div className="challenge-group">
      <div className="challenge-group-title" style={{ color }}>
        <span>{icon}</span>
        <span>{title}</span>
        <span className="level-count">({groupLevels.length}关)</span>
      </div>
      <div className="challenge-levels-grid">
        {groupLevels.map(({ level, name }) => (
          <button
            key={level}
            className="level-button"
            onClick={() => onStartLevel(level)}
            title={name}
          >
            <span className="level-num">关卡 {level}</span>
            <span className="level-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {renderLevelGroup(beginnerLevels, '新手组', '🌱', '#107c41')}
      {renderLevelGroup(intermediateLevels, '进阶组', '📈', '#2563eb')}
      {renderLevelGroup(expertLevels, '专家组', '🏅', '#dc2626')}
    </div>
  );
};

export default ChallengeLevelsPanel;
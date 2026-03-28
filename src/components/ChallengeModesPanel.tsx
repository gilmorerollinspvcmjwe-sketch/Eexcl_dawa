import React from 'react';
import { getAvailableLevels } from '../levelGenerator';

type FPSTrainingMode = 'motion_track' | 'peek_shot' | 'switch_track' | 'reaction' | 'precision';

interface ChallengeModesPanelProps {
  onStartGame: (mode: 'timed' | 'endless' | 'zen' | 'headshot' | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number) => void;
  onStartFPSTraining?: (mode: FPSTrainingMode) => void;
  selectedFPSMode?: FPSTrainingMode | null;
}

const FPS_MODES = [
  { id: 'motion_track' as const, name: '移动射击', icon: '🎯', color: '#3b82f6', desc: '追踪移动目标' },
  { id: 'peek_shot' as const, name: '拐角射击', icon: '👀', color: '#ea580c', desc: '快速反应探头' },
  { id: 'switch_track' as const, name: '目标切换', icon: '🔄', color: '#8b5cf6', desc: '多目标切换' },
  { id: 'reaction' as const, name: '反应测试', icon: '⚡', color: '#f59e0b', desc: '纯粹反应速度' },
  { id: 'precision' as const, name: '精准射击', icon: '🔫', color: '#dc2626', desc: '精准度训练' },
];

export const ChallengeModesPanel: React.FC<ChallengeModesPanelProps> = ({
  onStartGame,
  onStartFPSTraining,
  selectedFPSMode,
}) => {
  const levels = getAvailableLevels();

  // 按难度分组关卡
  const beginnerLevels = levels.filter(l => l.level <= 4);
  const intermediateLevels = levels.filter(l => l.level > 4 && l.level <= 8);
  const expertLevels = levels.filter(l => l.level > 8);

  const renderLevelGroup = (groupLevels: typeof levels, title: string, icon: string, color: string) => (
    <div className="challenge-group">
      <div className="challenge-group-title" style={{ color }}>
        <span>{icon}</span>
        <span>{title}</span>
        <span className="level-count">({groupLevels.length}关)</span>
      </div>
      <div className="challenge-buttons">
        {groupLevels.map(({ level, name, difficulty }) => (
          <button
            key={level}
            className="level-btn"
            onClick={() => onStartGame('part_training', undefined, level)}
            title={`${difficulty} - ${name}`}
            style={{ 
              '--level-color': color,
            } as React.CSSProperties}
          >
            <span className="level-num">{level}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="challenge-modes-section">
      {/* 分区标题 */}
      <div className="settings-section-header">
        <span className="section-icon">🏆</span>
        <span>挑战模式</span>
      </div>

      {/* 经典挑战 - 关卡系统 */}
      <div className="settings-card">
        <div className="card-title">
          <span className="card-icon">📚</span>
          <span>经典挑战</span>
        </div>
        
        {/* 新手组 */}
        {renderLevelGroup(beginnerLevels, '新手组', '🌱', '#107c41')}
        
        {/* 进阶组 */}
        {renderLevelGroup(intermediateLevels, '进阶组', '🔥', '#2563eb')}
        
        {/* 专家组 */}
        {renderLevelGroup(expertLevels, '专家组', '💀', '#dc2626')}
      </div>

      {/* FPS 专项训练 */}
      <div className="settings-card">
        <div className="card-title">
          <span className="card-icon">🎮</span>
          <span>FPS 专项训练</span>
        </div>
        
        <div className="fps-modes-grid">
          {FPS_MODES.map(mode => (
            <button
              key={mode.id}
              className={`fps-mode-btn ${selectedFPSMode === mode.id ? 'active' : ''}`}
              onClick={() => onStartFPSTraining?.(mode.id)}
              style={{
                '--mode-color': mode.color,
              } as React.CSSProperties}
            >
              <span className="fps-icon">{mode.icon}</span>
              <span className="fps-name">{mode.name}</span>
              <span className="fps-desc">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 特殊训练模式 */}
      <div className="settings-card">
        <div className="card-title">
          <span className="card-icon">🎯</span>
          <span>特殊训练</span>
        </div>
        
        <div className="special-modes-row">
          <button
            className="special-mode-btn peek-shot"
            onClick={() => onStartGame('peek_shot')}
          >
            <span className="special-icon">👀</span>
            <span className="special-name">拐角射击</span>
            <span className="special-desc">目标从边缘探头</span>
          </button>
          <button
            className="special-mode-btn moving-target"
            onClick={() => onStartGame('moving_target')}
          >
            <span className="special-icon">🏃</span>
            <span className="special-name">移动目标</span>
            <span className="special-desc">目标随机移动</span>
          </button>
        </div>
      </div>
    </div>
  );
};
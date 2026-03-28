import React, { useState } from 'react';

type TrainingMode = 'classic' | 'fps';

interface QuickStartPanelProps {
  onStartGame: (mode: 'timed' | 'endless' | 'zen' | 'headshot' | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number) => void;
  onStartFPSTraining?: (mode: 'motion_track' | 'peek_shot' | 'switch_track' | 'reaction' | 'precision') => void;
}

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({
  onStartGame,
  onStartFPSTraining,
}) => {
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('classic');

  const handleStartGame = () => {
    if (trainingMode === 'classic') {
      // 默认开始 60 秒限时模式
      onStartGame('timed', 60);
    } else {
      // FPS 专项训练 - 默认选择移动射击
      onStartFPSTraining?.('motion_track');
    }
  };

  return (
    <div className="quick-start-section">
      {/* 分区标题 */}
      <div className="settings-section-header">
        <span className="section-icon">🚀</span>
        <span>快速开始</span>
      </div>

      {/* 训练模式选择 */}
      <div className="settings-card">
        <div className="settings-row">
          <label className="settings-label">训练模式</label>
          <div className="training-mode-selector">
            <button
              className={`mode-btn ${trainingMode === 'classic' ? 'active' : ''}`}
              onClick={() => setTrainingMode('classic')}
            >
              <span className="mode-icon">🎯</span>
              <span className="mode-name">经典模式</span>
              <span className="mode-desc">传统瞄准训练</span>
            </button>
            <button
              className={`mode-btn ${trainingMode === 'fps' ? 'active' : ''}`}
              onClick={() => setTrainingMode('fps')}
            >
              <span className="mode-icon">🎮</span>
              <span className="mode-name">FPS 专项训练</span>
              <span className="mode-desc">技能强化训练</span>
            </button>
          </div>
        </div>
      </div>

      {/* 快速启动按钮 */}
      <button className="start-game-btn" onClick={handleStartGame}>
        <span className="btn-icon">▶️</span>
        <span className="btn-text">开始游戏</span>
        <span className="btn-hint">
          {trainingMode === 'classic' ? '60秒限时训练' : '移动射击训练'}
        </span>
      </button>

      {/* 快捷入口 */}
      <div className="quick-access-row">
        <button 
          className="quick-access-btn timed"
          onClick={() => onStartGame('timed', 30)}
          title="30秒限时模式"
        >
          ⏱️ 30秒
        </button>
        <button 
          className="quick-access-btn endless"
          onClick={() => onStartGame('endless')}
          title="3命制无限模式"
        >
          ♾️ 无限
        </button>
        <button 
          className="quick-access-btn zen"
          onClick={() => onStartGame('zen')}
          title="无压力禅模式"
        >
          🧘 禅模式
        </button>
        <button 
          className="quick-access-btn headshot"
          onClick={() => onStartGame('headshot')}
          title="爆头线专项训练"
        >
          🎯 爆头
        </button>
      </div>
    </div>
  );
};
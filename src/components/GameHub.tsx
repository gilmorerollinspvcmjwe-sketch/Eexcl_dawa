// 游戏中心 - Sheet1 主组件 (Excel 表格风格)
// 整合所有游戏启动入口

import React, { useState } from 'react';
import type { FPSTrainingMode } from './TrainingModeSelector';
import '../styles/gamehub.css';

export type GameModeType = 'timed' | 'endless' | 'zen' | 'headshot';

export type DifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'medium' | 'hard' | 'expert';

interface GameHubProps {
  onStartGame: (
    mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target',
    duration?: 30 | 60 | 120,
    level?: number,
    difficulty?: DifficultyLevel
  ) => void;
  onStartFPSTraining: (mode: FPSTrainingMode, config?: any) => void;
  onSwitchSheet: (sheet: 'game' | 'stats' | 'settings') => void;
  selectedFPSMode?: FPSTrainingMode | null;
  trainingDuration?: 30 | 60 | 120;
  difficulty?: DifficultyLevel;
}

export const GameHub: React.FC<GameHubProps> = ({
  onStartGame,
  onStartFPSTraining,
  onSwitchSheet,
}) => {
  const [trainingCategory, setTrainingCategory] = useState<'classic' | 'fps'>('classic');
  const [selectedClassicMode, setSelectedClassicMode] = useState<GameModeType>('timed');
  const [selectedFPSModeLocal, setSelectedFPSModeLocal] = useState<FPSTrainingMode | null>(null);
  const [fpsConfig, setFpsConfig] = useState<any>({});

  const fpsModeConfigs: Record<FPSTrainingMode, any> = {
    motion_track: { speed: 'normal', pattern: 'linear', duration: 60 },
    peek_shot: { duration: 'normal', interval: 1500 },
    switch_track: { targetCount: 3, showPriority: true },
    reaction: {},
    precision: { targetScale: 0.5, targetCount: 3 },
  };

  const handleStartGame = () => {
    if (trainingCategory === 'classic') {
      onStartGame(selectedClassicMode, 60, undefined, 'normal');
      onSwitchSheet('game');
    } else if (selectedFPSModeLocal) {
      const config = { ...fpsModeConfigs[selectedFPSModeLocal], ...fpsConfig };
      onStartFPSTraining(selectedFPSModeLocal, config);
      onSwitchSheet('game');
    }
  };

  const handleLevelStart = (level: number) => {
    onStartGame('part_training', undefined, level, 'normal');
    onSwitchSheet('game');
  };

  const handleFPSModeSelect = (mode: FPSTrainingMode) => {
    setSelectedFPSModeLocal(mode);
    setTrainingCategory('fps');
    setFpsConfig(fpsModeConfigs[mode]);
  };

  return (
    <div className="excel-game-hub">
      <div className="excel-sheet-wrapper">
        <div className="excel-col-headers-row">
          <div className="excel-corner-cell"></div>
          <div className="excel-col-header">A</div>
          <div className="excel-col-header">B</div>
          <div className="excel-col-header">C</div>
          <div className="excel-col-header">D</div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">1</div>
          <div className="excel-cell excel-title-cell">
            <span className="excel-title-icon">🎮</span>
            <span className="excel-title-text">Excel Aim Trainer - 游戏中心</span>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">2</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row excel-start-row">
          <div className="excel-row-header">3</div>
          <div className="excel-cell excel-main-start-cell">
            <button
              className="excel-main-start-btn"
              onClick={handleStartGame}
              disabled={trainingCategory === 'fps' && !selectedFPSModeLocal}
            >
              <span className="main-btn-icon">▶️</span>
              <span className="main-btn-text">立即开始训练</span>
            </button>
            <span className="excel-mock-text">就你那手速，能玩的明白？</span>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">4</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">5</div>
          <div className="excel-cell">
            <div className="excel-inline-control">
              <span className="excel-label">训练模式：</span>
              <select
                className="excel-select"
                value={trainingCategory}
                onChange={(e) => setTrainingCategory(e.target.value as 'classic' | 'fps')}
              >
                <option value="classic">🎯 经典模式</option>
                <option value="fps">🔫 FPS 专项</option>
              </select>
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">6</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">7</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🎯</span>
            <span>经典模式</span>
          </div>
        </div>

        <div className="excel-row excel-modes-row">
          <div className="excel-row-header">8</div>
          <div className="excel-cell excel-modes-cell">
            <div className="excel-mode-grid">
              {[
                { id: 'timed', icon: '⏱️', name: '限时', desc: '「与时间赛跑，分秒必争」' },
                { id: 'endless', icon: '♾️', name: '无限', desc: '「没有尽头，只有突破」' },
                { id: 'zen', icon: '🧘', name: '禅', desc: '「心无旁骛，万物皆空」' },
                { id: 'headshot', icon: '🎯', name: '爆头线', desc: '「一击必杀，瞄准即正义」' },
              ].map(mode => (
                <div key={mode.id} className="excel-mode-item">
                  <button
                    className={`excel-mode-btn ${selectedClassicMode === mode.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedClassicMode(mode.id as GameModeType); setTrainingCategory('classic'); }}
                  >
                    <span className="mode-icon">{mode.icon}</span>
                    <span className="mode-name">{mode.name}</span>
                  </button>
                  <span className="excel-mode-desc">{mode.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">9</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">10</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🔫</span>
            <span>FPS 专项训练</span>
          </div>
        </div>

        <div className="excel-row excel-modes-row">
          <div className="excel-row-header">11</div>
          <div className="excel-cell excel-modes-cell excel-fps-cell">
            <div className="excel-fps-grid">
              {[
                { id: 'motion_track', icon: '🏃', name: '移动射击', desc: '「追猎移动目标，预判即命中」' },
                { id: 'peek_shot', icon: '👀', name: '拐角射击', desc: '「转角遇到爱，探头即暴击」' },
                { id: 'switch_track', icon: '🔄', name: '目标切换', desc: '「眼观六路，快速切换」' },
                { id: 'reaction', icon: '⚡', name: '反应测试', desc: '「神经反射，极限挑战」' },
                { id: 'precision', icon: '🎯', name: '精准射击', desc: '「毫厘之间，胜负已分」' },
              ].map(mode => (
                <div key={mode.id} className="excel-fps-item">
                  <button
                    className={`excel-fps-btn ${selectedFPSModeLocal === mode.id ? 'selected' : ''}`}
                    onClick={() => handleFPSModeSelect(mode.id as FPSTrainingMode)}
                  >
                    <span className="fps-icon">{mode.icon}</span>
                    <span className="fps-name">{mode.name}</span>
                  </button>
                  <span className="excel-mode-desc fps-desc">{mode.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedFPSModeLocal && trainingCategory === 'fps' && (
          <div className="excel-row">
            <div className="excel-row-header">12</div>
            <div className="excel-cell excel-config-cell">
              <FPSConfigInline
                mode={selectedFPSModeLocal}
                config={fpsConfig}
                onChange={setFpsConfig}
              />
            </div>
          </div>
        )}

        <div className="excel-row">
          <div className="excel-row-header">13</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">14</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🏆</span>
            <span>挑战关卡</span>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">15</div>
          <div className="excel-cell excel-challenge-group">
            <span className="group-icon">🌱</span>
            <span className="group-title">新手组</span>
            <div className="excel-level-buttons">
              {[1, 2, 3, 4].map(level => (
                <button
                  key={level}
                  className="excel-level-btn beginner"
                  onClick={() => handleLevelStart(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">16</div>
          <div className="excel-cell excel-challenge-group">
            <span className="group-icon">📈</span>
            <span className="group-title">进阶组</span>
            <div className="excel-level-buttons">
              {[5, 6, 7, 8].map(level => (
                <button
                  key={level}
                  className="excel-level-btn intermediate"
                  onClick={() => handleLevelStart(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">17</div>
          <div className="excel-cell excel-challenge-group">
            <span className="group-icon">🏅</span>
            <span className="group-title">专家组</span>
            <div className="excel-level-buttons">
              {[9, 10, 11, 12].map(level => (
                <button
                  key={level}
                  className="excel-level-btn expert"
                  onClick={() => handleLevelStart(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">18</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">19</div>
          <div className="excel-cell excel-nav-cell">
            <span className="nav-hint">更多设置和统计 →</span>
            <div className="excel-nav-buttons">
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('settings')}>
                ⚙️ 设置
              </button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('stats')}>
                📊 统计
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FPSConfigInline: React.FC<{
  mode: FPSTrainingMode;
  config: any;
  onChange: (config: any) => void;
}> = ({ mode, config, onChange }) => {
  switch (mode) {
    case 'motion_track':
      return (
        <div className="excel-inline-config">
          <span className="config-label">速度：</span>
          <div className="excel-button-group">
            {['slow', 'normal', 'fast', 'extreme'].map(speed => (
              <button
                key={speed}
                className={`excel-mini-btn ${config.speed === speed ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, speed })}
              >
                {speed === 'slow' ? '慢' : speed === 'normal' ? '中' : speed === 'fast' ? '快' : '极'}
              </button>
            ))}
          </div>
          <span className="config-label config-label-right">模式：</span>
          <div className="excel-button-group">
            {['linear', 'sine', 'bounce'].map(pattern => (
              <button
                key={pattern}
                className={`excel-mini-btn ${config.pattern === pattern ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, pattern })}
              >
                {pattern === 'linear' ? '直线' : pattern === 'sine' ? '正弦' : '弹跳'}
              </button>
            ))}
          </div>
        </div>
      );

    case 'peek_shot':
      return (
        <div className="excel-inline-config">
          <span className="config-label">停留时间：</span>
          <div className="excel-button-group">
            {[
              { id: 'long', name: '长' },
              { id: 'normal', name: '中' },
              { id: 'short', name: '短' },
              { id: 'blink', name: '闪' },
            ].map(d => (
              <button
                key={d.id}
                className={`excel-mini-btn ${config.duration === d.id ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, duration: d.id })}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      );

    case 'switch_track':
      return (
        <div className="excel-inline-config">
          <span className="config-label">目标数：</span>
          <div className="excel-button-group">
            {[2, 3, 4, 5].map(count => (
              <button
                key={count}
                className={`excel-mini-btn ${config.targetCount === count ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetCount: count })}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      );

    case 'precision':
      return (
        <div className="excel-inline-config">
          <span className="config-label">目标数：</span>
          <div className="excel-button-group">
            {[1, 2, 3, 4, 5].map(count => (
              <button
                key={count}
                className={`excel-mini-btn ${config.targetCount === count ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetCount: count })}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default GameHub;

// 游戏中心 - Sheet1 主组件 (Excel 表格风格)
// 整合所有游戏启动入口

import React, { useState } from 'react';
import type { FPSTrainingMode } from './TrainingModeSelector';
import '../styles/gamehub.css';

// 游戏模式类型
export type GameModeType = 'timed' | 'endless' | 'zen' | 'headshot';

// 难度类型
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
  selectedFPSMode?: FPSTrainingMode | null; // kept for compatibility
}

export const GameHub: React.FC<GameHubProps> = ({
  onStartGame,
  onStartFPSTraining,
  onSwitchSheet,
  // selectedFPSMode is kept for API compatibility but not used internally
}) => {
  // 状态管理
  const [trainingCategory, setTrainingCategory] = useState<'classic' | 'fps'>('classic');
  const [selectedClassicMode, setSelectedClassicMode] = useState<GameModeType>('timed');
  const [selectedFPSModeLocal, setSelectedFPSModeLocal] = useState<FPSTrainingMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 120>(60);
  const [fpsConfig, setFpsConfig] = useState<any>({});

  // FPS 训练模式配置
  const fpsModeConfigs: Record<FPSTrainingMode, any> = {
    motion_track: { speed: 'normal', pattern: 'linear', duration: 60 },
    peek_shot: { duration: 'normal', interval: 1500 },
    switch_track: { targetCount: 3, showPriority: true },
    reaction: {},
    precision: { targetScale: 0.5, targetCount: 3 },
  };

  // 处理开始游戏
  const handleStartGame = () => {
    if (trainingCategory === 'classic') {
      onStartGame(selectedClassicMode, selectedDuration, undefined, selectedDifficulty);
      onSwitchSheet('game');
    } else if (selectedFPSModeLocal) {
      const config = { ...fpsModeConfigs[selectedFPSModeLocal], ...fpsConfig };
      onStartFPSTraining(selectedFPSModeLocal, config);
      onSwitchSheet('game');
    }
  };

  // 处理快捷模式启动
  const handleQuickStart = (mode: GameModeType, duration?: 30 | 60 | 120) => {
    onStartGame(mode, duration, undefined, selectedDifficulty);
    onSwitchSheet('game');
  };

  // 处理关卡启动
  const handleLevelStart = (level: number) => {
    onStartGame('part_training', undefined, level, selectedDifficulty);
    onSwitchSheet('game');
  };

  // 处理 FPS 模式选择
  const handleFPSModeSelect = (mode: FPSTrainingMode) => {
    setSelectedFPSModeLocal(mode);
    setTrainingCategory('fps');
    setFpsConfig(fpsModeConfigs[mode]);
  };

  return (
    <div className="excel-game-hub">
      {/* Excel 表格结构 */}
      <div className="excel-sheet-wrapper">
        {/* 列标识行 */}
        <div className="excel-col-headers-row">
          <div className="excel-corner-cell"></div>
          <div className="excel-col-header">A</div>
          <div className="excel-col-header">B</div>
          <div className="excel-col-header">C</div>
          <div className="excel-col-header">D</div>
        </div>

        {/* 行 1: 标题 */}
        <div className="excel-row">
          <div className="excel-row-header">1</div>
          <div className="excel-cell excel-title-cell">
            <span className="excel-title-icon">🎮</span>
            <span className="excel-title-text">Excel Aim Trainer - 游戏中心</span>
          </div>
        </div>

        {/* 行 2: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">2</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 3: 快速开始标题 */}
        <div className="excel-row">
          <div className="excel-row-header">3</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🚀</span>
            <span>快速开始</span>
          </div>
        </div>

        {/* 行 4: 训练模式选择 */}
        <div className="excel-row">
          <div className="excel-row-header">4</div>
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
          <div className="excel-cell excel-start-cell">
            <button
              className="excel-button excel-start-btn"
              onClick={handleStartGame}
              disabled={trainingCategory === 'fps' && !selectedFPSModeLocal}
            >
              <span className="btn-icon">▶️</span>
              <span className="btn-text">立即开始</span>
            </button>
          </div>
        </div>

        {/* 行 5: 时长选择（经典模式时显示） */}
        {trainingCategory === 'classic' && selectedClassicMode === 'timed' && (
          <div className="excel-row">
            <div className="excel-row-header">5</div>
            <div className="excel-cell">
              <div className="excel-inline-control">
                <span className="excel-label">训练时长：</span>
                <div className="excel-button-group">
                  {[30, 60, 120].map(d => (
                    <button
                      key={d}
                      className={`excel-mini-btn ${selectedDuration === d ? 'selected' : ''}`}
                      onClick={() => setSelectedDuration(d as 30 | 60 | 120)}
                    >
                      {d}秒
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 行 6: 快捷入口 */}
        <div className="excel-row">
          <div className="excel-row-header">6</div>
          <div className="excel-cell excel-quick-access-cell">
            <div className="excel-quick-buttons">
              <button className="excel-quick-btn timed" onClick={() => handleQuickStart('timed', 30)}>
                ⏱️ 30秒
              </button>
              <button className="excel-quick-btn endless" onClick={() => handleQuickStart('endless')}>
                ♾️ 无限
              </button>
              <button className="excel-quick-btn zen" onClick={() => handleQuickStart('zen')}>
                🧘 禅模式
              </button>
              <button className="excel-quick-btn headshot" onClick={() => handleQuickStart('headshot')}>
                🎯 爆头线
              </button>
            </div>
          </div>
        </div>

        {/* 行 7: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">7</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 8: 经典模式标题 */}
        <div className="excel-row">
          <div className="excel-row-header">8</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🎯</span>
            <span>经典模式</span>
          </div>
        </div>

        {/* 行 9: 经典模式选择 */}
        <div className="excel-row excel-modes-row">
          <div className="excel-row-header">9</div>
          <div className="excel-cell excel-modes-cell">
            <div className="excel-mode-grid">
              <button
                className={`excel-mode-btn ${selectedClassicMode === 'timed' ? 'selected' : ''}`}
                onClick={() => setSelectedClassicMode('timed')}
              >
                <span className="mode-icon">⏱️</span>
                <span className="mode-name">限时</span>
              </button>
              <button
                className={`excel-mode-btn ${selectedClassicMode === 'endless' ? 'selected' : ''}`}
                onClick={() => setSelectedClassicMode('endless')}
              >
                <span className="mode-icon">♾️</span>
                <span className="mode-name">无限</span>
              </button>
              <button
                className={`excel-mode-btn ${selectedClassicMode === 'zen' ? 'selected' : ''}`}
                onClick={() => setSelectedClassicMode('zen')}
              >
                <span className="mode-icon">🧘</span>
                <span className="mode-name">禅</span>
              </button>
              <button
                className={`excel-mode-btn ${selectedClassicMode === 'headshot' ? 'selected' : ''}`}
                onClick={() => setSelectedClassicMode('headshot')}
              >
                <span className="mode-icon">🎯</span>
                <span className="mode-name">爆头线</span>
              </button>
            </div>
          </div>
        </div>

        {/* 行 10: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">10</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 11: FPS 专项训练标题 */}
        <div className="excel-row">
          <div className="excel-row-header">11</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🔫</span>
            <span>FPS 专项训练</span>
          </div>
        </div>

        {/* 行 12: FPS 模式选择 */}
        <div className="excel-row excel-modes-row">
          <div className="excel-row-header">12</div>
          <div className="excel-cell excel-modes-cell excel-fps-cell">
            <div className="excel-fps-grid">
              {[
                { id: 'motion_track', icon: '🏃', name: '移动射击' },
                { id: 'peek_shot', icon: '👀', name: '拐角射击' },
                { id: 'switch_track', icon: '🔄', name: '目标切换' },
                { id: 'reaction', icon: '⚡', name: '反应测试' },
                { id: 'precision', icon: '🎯', name: '精准射击' },
              ].map(mode => (
                <button
                  key={mode.id}
                  className={`excel-fps-btn ${selectedFPSModeLocal === mode.id ? 'selected' : ''}`}
                  onClick={() => handleFPSModeSelect(mode.id as FPSTrainingMode)}
                >
                  <span className="fps-icon">{mode.icon}</span>
                  <span className="fps-name">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 行 13: FPS 配置（选中时显示） */}
        {selectedFPSModeLocal && trainingCategory === 'fps' && (
          <div className="excel-row">
            <div className="excel-row-header">13</div>
            <div className="excel-cell excel-config-cell">
              <FPSConfigInline
                mode={selectedFPSModeLocal}
                config={fpsConfig}
                onChange={setFpsConfig}
              />
            </div>
          </div>
        )}

        {/* 行 14: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">14</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 15: 挑战关卡标题 */}
        <div className="excel-row">
          <div className="excel-row-header">15</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🏆</span>
            <span>挑战关卡</span>
          </div>
        </div>

        {/* 行 16: 新手组 */}
        <div className="excel-row">
          <div className="excel-row-header">16</div>
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

        {/* 行 17: 进阶组 */}
        <div className="excel-row">
          <div className="excel-row-header">17</div>
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

        {/* 行 18: 专家组 */}
        <div className="excel-row">
          <div className="excel-row-header">18</div>
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

        {/* 行 19: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">19</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 20: 难度选择标题 */}
        <div className="excel-row">
          <div className="excel-row-header">20</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">⚡</span>
            <span>难度选择</span>
          </div>
        </div>

        {/* 行 21: 难度按钮 */}
        <div className="excel-row">
          <div className="excel-row-header">21</div>
          <div className="excel-cell excel-difficulty-cell">
            <div className="excel-difficulty-grid">
              {[
                { id: 'very_easy', name: '非常简单', color: '#22c55e' },
                { id: 'easy', name: '简单', color: '#84cc16' },
                { id: 'normal', name: '中等', color: '#eab308' },
                { id: 'medium', name: '普通', color: '#f97316' },
                { id: 'hard', name: '困难', color: '#ef4444' },
                { id: 'expert', name: '专家', color: '#dc2626' },
              ].map(diff => (
                <button
                  key={diff.id}
                  className={`excel-difficulty-btn ${selectedDifficulty === diff.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDifficulty(diff.id as DifficultyLevel)}
                  style={{ '--diff-color': diff.color } as React.CSSProperties}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 行 22: 空行 */}
        <div className="excel-row">
          <div className="excel-row-header">22</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        {/* 行 23: 快捷导航 */}
        <div className="excel-row">
          <div className="excel-row-header">23</div>
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

// FPS 配置内联组件
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
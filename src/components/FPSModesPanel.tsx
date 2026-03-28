// FPS 专项训练面板 - GameHub 子组件

import React from 'react';
import type { FPSTrainingMode } from './TrainingModeSelector';

interface FPSModesPanelProps {
  selectedMode: FPSTrainingMode | null;
  onSelectMode: (mode: FPSTrainingMode) => void;
  config?: any;
  onConfigChange?: (config: any) => void;
  disabled?: boolean;
}

const FPS_MODES: { id: FPSTrainingMode; name: string; icon: string; desc: string }[] = [
  { id: 'motion_track', name: '移动射击', icon: '🎯', desc: '追踪移动目标' },
  { id: 'peek_shot', name: '拐角射击', icon: '👀', desc: '预瞄反应训练' },
  { id: 'switch_track', name: '目标切换', icon: '🔄', desc: '多目标切换' },
  { id: 'reaction', name: '反应测试', icon: '⚡', desc: '纯粹反应速度' },
  { id: 'precision', name: '精准射击', icon: '🔫', desc: '微小目标精度' },
];

export const FPSModesPanel: React.FC<FPSModesPanelProps> = ({
  selectedMode,
  onSelectMode,
  config,
  onConfigChange,
  disabled,
}) => {
  return (
    <div>
      <div className="fps-modes-grid-hub">
        {FPS_MODES.map(mode => (
          <button
            key={mode.id}
            className={`fps-mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <span className="fps-icon">{mode.icon}</span>
            <span className="fps-name">{mode.name}</span>
            <span className="fps-desc">{mode.desc}</span>
          </button>
        ))}
      </div>

      {/* 配置面板 - 可根据选中模式显示不同配置 */}
      {selectedMode && onConfigChange && (
        <FPSConfigPanel
          mode={selectedMode}
          config={config || {}}
          onChange={onConfigChange}
        />
      )}
    </div>
  );
};

// FPS 模式配置面板
const FPSConfigPanel: React.FC<{
  mode: FPSTrainingMode;
  config: any;
  onChange: (config: any) => void;
}> = ({ mode, config, onChange }) => {
  switch (mode) {
    case 'motion_track':
      return (
        <div className="mode-config-panel">
          <div className="config-row">
            <span className="config-label">速度</span>
            <div className="config-buttons">
              {['slow', 'normal', 'fast', 'extreme'].map(speed => (
                <button
                  key={speed}
                  className={`config-btn ${config.speed === speed ? 'selected' : ''}`}
                  onClick={() => onChange({ ...config, speed })}
                >
                  {speed === 'slow' ? '慢速' : speed === 'normal' ? '正常' : speed === 'fast' ? '快速' : '极速'}
                </button>
              ))}
            </div>
          </div>
          <div className="config-row">
            <span className="config-label">模式</span>
            <div className="config-buttons">
              {['linear', 'sine', 'bounce'].map(pattern => (
                <button
                  key={pattern}
                  className={`config-btn ${config.pattern === pattern ? 'selected' : ''}`}
                  onClick={() => onChange({ ...config, pattern })}
                >
                  {pattern === 'linear' ? '直线' : pattern === 'sine' ? '正弦' : '弹跳'}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'peek_shot':
      return (
        <div className="mode-config-panel">
          <div className="config-row">
            <span className="config-label">停留时间</span>
            <div className="config-buttons">
              {[
                { id: 'long', name: '长(2s)' },
                { id: 'normal', name: '中(1.2s)' },
                { id: 'short', name: '短(0.6s)' },
                { id: 'blink', name: '闪(0.3s)' },
              ].map(d => (
                <button
                  key={d.id}
                  className={`config-btn ${config.duration === d.id ? 'selected' : ''}`}
                  onClick={() => onChange({ ...config, duration: d.id })}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'switch_track':
      return (
        <div className="mode-config-panel">
          <div className="config-row">
            <span className="config-label">目标数量</span>
            <div className="config-buttons">
              {[2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  className={`config-btn ${config.targetCount === count ? 'selected' : ''}`}
                  onClick={() => onChange({ ...config, targetCount: count })}
                >
                  {count}个
                </button>
              ))}
            </div>
          </div>
          <div className="config-row">
            <span className="config-label">显示序号</span>
            <input
              type="checkbox"
              checked={config.showPriority || false}
              onChange={e => onChange({ ...config, showPriority: e.target.checked })}
              style={{ marginLeft: '8px' }}
            />
          </div>
        </div>
      );

    case 'precision':
      return (
        <div className="mode-config-panel">
          <div className="config-row">
            <span className="config-label">目标数量</span>
            <div className="config-buttons">
              {[1, 2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  className={`config-btn ${config.targetCount === count ? 'selected' : ''}`}
                  onClick={() => onChange({ ...config, targetCount: count })}
                >
                  {count}个
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default FPSModesPanel;
// 训练模式选择器组件

import React from 'react';
import type { MovePattern } from '../types/enemy';

// 训练模式类型
export type FPSTrainingMode = 
  | 'motion_track'   // 移动射击
  | 'peek_shot'      // 拐角射击
  | 'switch_track'   // 多目标切换
  | 'reaction'       // 反应测试
  | 'precision';     // 精准射击

// 配置类型
export interface MotionTrackConfig {
  speed: 'slow' | 'normal' | 'fast' | 'extreme';
  pattern: MovePattern;
  duration: number;
}

export interface PeekShotConfig {
  duration: 'long' | 'normal' | 'short' | 'blink';
  interval: number;
  targetCount: number;
}

export interface SwitchTrackConfig {
  targetCount: number;
  showPriority: boolean;
  wrongOrderPenalty: 'reset' | 'none';
}

export interface PrecisionConfig {
  targetScale: number;
  targetCount: number;
}

interface TrainingModeSelectorProps {
  currentMode: FPSTrainingMode | null;
  onSelectMode: (mode: FPSTrainingMode) => void;
  config: any;
  onConfigChange: (config: any) => void;
  onStart: () => void;
  isPlaying: boolean;
}

// 训练模式配置
const TRAINING_MODES: { id: FPSTrainingMode; name: string; description: string; icon: string }[] = [
  {
    id: 'motion_track',
    name: '移动射击',
    description: '追踪移动目标，训练跟枪能力',
    icon: '🎯',
  },
  {
    id: 'peek_shot',
    name: '拐角射击',
    description: '目标从掩体探头，训练预瞄反应',
    icon: '👀',
  },
  {
    id: 'switch_track',
    name: '目标切换',
    description: '按优先级射击多个目标',
    icon: '🔄',
  },
  {
    id: 'reaction',
    name: '反应测试',
    description: '测量纯反应时间',
    icon: '⚡',
  },
  {
    id: 'precision',
    name: '精准射击',
    description: '训练对微小目标的精准度',
    icon: '🎯',
  },
];

// 移动模式配置
const MOVE_PATTERNS: { id: MovePattern; name: string }[] = [
  { id: 'linear', name: '直线' },
  { id: 'sine', name: '正弦波' },
  { id: 'bounce', name: '弹跳' },
];

// 速度配置
const SPEED_LEVELS: { id: 'slow' | 'normal' | 'fast' | 'extreme'; name: string }[] = [
  { id: 'slow', name: '慢速' },
  { id: 'normal', name: '正常' },
  { id: 'fast', name: '快速' },
  { id: 'extreme', name: '极速' },
];

// 探头持续时间
const PEEK_DURATIONS: { id: 'long' | 'normal' | 'short' | 'blink'; name: string }[] = [
  { id: 'long', name: '长 (2秒)' },
  { id: 'normal', name: '中 (1.2秒)' },
  { id: 'short', name: '短 (0.6秒)' },
  { id: 'blink', name: '闪烁 (0.3秒)' },
];

export const TrainingModeSelector: React.FC<TrainingModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  config,
  onConfigChange,
  onStart,
  isPlaying,
}) => {
  return (
    <div className="training-mode-selector" style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 12,
      padding: 20,
      color: 'white',
    }}>
      {/* 模式选择标题 */}
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: 18, 
        fontWeight: 600,
        color: '#94a3b8',
      }}>
        🎮 训练模式
      </h3>

      {/* 模式按钮 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 20,
      }}>
        {TRAINING_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '12px 8px',
              background: currentMode === mode.id 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'rgba(255,255,255,0.05)',
              border: currentMode === mode.id 
                ? '2px solid #60a5fa'
                : '2px solid transparent',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (currentMode !== mode.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentMode !== mode.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
          >
            <span style={{ fontSize: 24 }}>{mode.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{mode.name}</span>
          </button>
        ))}
      </div>

      {/* 模式配置 */}
      {currentMode && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}>
          <ModeConfigPanel 
            mode={currentMode} 
            config={config} 
            onChange={onConfigChange} 
          />
        </div>
      )}

      {/* 开始按钮 */}
      <button
        onClick={onStart}
        disabled={!currentMode || isPlaying}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: isPlaying 
            ? '#475569'
            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          fontSize: 16,
          fontWeight: 600,
          cursor: isPlaying ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isPlaying ? '⏸ 训练中...' : '▶ 开始训练'}
      </button>
    </div>
  );
};

// 模式配置面板
const ModeConfigPanel: React.FC<{
  mode: FPSTrainingMode;
  config: any;
  onChange: (config: any) => void;
}> = ({ mode, config, onChange }) => {
  switch (mode) {
    case 'motion_track':
      return (
        <MotionTrackConfigPanel 
          config={config as MotionTrackConfig} 
          onChange={onChange} 
        />
      );
    case 'peek_shot':
      return (
        <PeekShotConfigPanel 
          config={config as PeekShotConfig} 
          onChange={onChange} 
        />
      );
    case 'switch_track':
      return (
        <SwitchTrackConfigPanel 
          config={config as SwitchTrackConfig} 
          onChange={onChange} 
        />
      );
    case 'precision':
      return (
        <PrecisionConfigPanel 
          config={config as PrecisionConfig} 
          onChange={onChange} 
        />
      );
    default:
      return (
        <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
          此模式无需额外配置
        </p>
      );
  }
};

// 移动射击配置
const MotionTrackConfigPanel: React.FC<{
  config: MotionTrackConfig;
  onChange: (config: MotionTrackConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
          移动模式
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {MOVE_PATTERNS.map(pattern => (
            <button
              key={pattern.id}
              onClick={() => onChange({ ...config, pattern: pattern.id })}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: config.pattern === pattern.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {pattern.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
          移动速度
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {SPEED_LEVELS.map(speed => (
            <button
              key={speed.id}
              onClick={() => onChange({ ...config, speed: speed.id })}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: config.speed === speed.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {speed.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 拐角射击配置
const PeekShotConfigPanel: React.FC<{
  config: PeekShotConfig;
  onChange: (config: PeekShotConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
          停留时间
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PEEK_DURATIONS.map(duration => (
            <button
              key={duration.id}
              onClick={() => onChange({ ...config, duration: duration.id })}
              style={{
                flex: 1,
                minWidth: 60,
                padding: '8px 12px',
                background: config.duration === duration.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {duration.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 目标切换配置
const SwitchTrackConfigPanel: React.FC<{
  config: SwitchTrackConfig;
  onChange: (config: SwitchTrackConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
          目标数量: {config.targetCount}
        </label>
        <input
          type="range"
          min={2}
          max={5}
          value={config.targetCount}
          onChange={(e) => onChange({ ...config, targetCount: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={config.showPriority}
            onChange={(e) => onChange({ ...config, showPriority: e.target.checked })}
          />
          显示优先级图标
        </label>
      </div>
    </div>
  );
};

// 精准射击配置
const PrecisionConfigPanel: React.FC<{
  config: PrecisionConfig;
  onChange: (config: PrecisionConfig) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
          目标数量: {config.targetCount}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={config.targetCount}
          onChange={(e) => onChange({ ...config, targetCount: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default TrainingModeSelector;
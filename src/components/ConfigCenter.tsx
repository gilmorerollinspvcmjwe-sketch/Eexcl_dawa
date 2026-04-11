import React, { useEffect, useState } from 'react';
import type { FPSTrainingMode } from './TrainingModeSelector';
import type { GameModeType, DifficultyLevel } from './GameHub';
import type { AppSheetId } from '../features/sheets/sheetRegistry';
import { LEGACY_CHALLENGE_GROUPS, LEGACY_CLASSIC_MODES, LEGACY_FPS_MODE_CONFIGS, LEGACY_FPS_MODES, type LegacyFPSConfigMap } from '../features/config/legacyAimHubData';
import '../styles/gamehub.css';

interface ConfigCenterProps {
  onStartGame: (mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number, difficulty?: DifficultyLevel) => void;
  onStartFPSTraining: (mode: FPSTrainingMode, config?: LegacyFPSConfigMap) => void;
  onSwitchSheet: (sheet: AppSheetId) => void;
  onFormulaChange?: (text: string) => void;
}

export const ConfigCenter: React.FC<ConfigCenterProps> = ({
  onStartGame,
  onStartFPSTraining,
  onSwitchSheet,
  onFormulaChange,
}) => {
  const [trainingCategory, setTrainingCategory] = useState<'classic' | 'fps'>('classic');
  const [selectedClassicMode, setSelectedClassicMode] = useState<GameModeType>('timed');
  const [selectedFPSModeLocal, setSelectedFPSModeLocal] = useState<FPSTrainingMode | null>(null);
  const [fpsConfig, setFpsConfig] = useState<LegacyFPSConfigMap>({});

  useEffect(() => {
    onFormulaChange?.('=Sheet5：已恢复旧版开始页，用于原始练枪启动流。');
  }, [onFormulaChange]);

  const handleStartGame = () => {
    if (trainingCategory === 'classic') {
      onStartGame(selectedClassicMode, 60, undefined, 'normal');
      onSwitchSheet('game');
    } else if (selectedFPSModeLocal) {
      const config = { ...LEGACY_FPS_MODE_CONFIGS[selectedFPSModeLocal], ...fpsConfig };
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
    setFpsConfig(LEGACY_FPS_MODE_CONFIGS[mode]);
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
              {LEGACY_CLASSIC_MODES.map((mode) => (
                <div key={mode.id} className="excel-mode-item">
                  <button
                    className={`excel-mode-btn ${selectedClassicMode === mode.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedClassicMode(mode.id);
                      setTrainingCategory('classic');
                    }}
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
              {LEGACY_FPS_MODES.map((mode) => (
                <div key={mode.id} className="excel-fps-item">
                  <button
                    className={`excel-fps-btn ${selectedFPSModeLocal === mode.id ? 'selected' : ''}`}
                    onClick={() => handleFPSModeSelect(mode.id)}
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
              <FPSConfigInline mode={selectedFPSModeLocal} config={fpsConfig} onChange={setFpsConfig} />
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

        {LEGACY_CHALLENGE_GROUPS.map((group, index) => (
          <div className="excel-row" key={group.title}>
            <div className="excel-row-header">{15 + index}</div>
            <div className="excel-cell excel-challenge-group">
              <span className="group-icon">{group.icon}</span>
              <span className="group-title">{group.title}</span>
              <div className="excel-level-buttons">
                {group.levels.map((level) => (
                  <button
                    key={level}
                    className={`excel-level-btn ${group.className}`}
                    onClick={() => handleLevelStart(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="excel-row">
          <div className="excel-row-header">18</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">19</div>
          <div className="excel-cell excel-nav-cell">
            <span className="nav-hint">更多设置和统计 →</span>
            <div className="excel-nav-buttons">
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('settings')}>⚙️ 设置</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('stats')}>📊 统计</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FPSConfigInline: React.FC<{
  mode: FPSTrainingMode;
  config: LegacyFPSConfigMap;
  onChange: (config: LegacyFPSConfigMap) => void;
}> = ({ mode, config, onChange }) => {
  switch (mode) {
    case 'motion_track':
      return (
        <div className="excel-inline-config">
          <span className="config-label">速度：</span>
          <div className="excel-button-group">
            {['slow', 'normal', 'fast', 'extreme'].map((speed) => (
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
            {['linear', 'sine', 'bounce'].map((pattern) => (
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
            ].map((item) => (
              <button
                key={item.id}
                className={`excel-mini-btn ${config.duration === item.id ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, duration: item.id })}
              >
                {item.name}
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
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                className={`excel-mini-btn ${config.targetCount === count ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetCount: count })}
              >
                {count}
              </button>
            ))}
          </div>
          <label style={{ marginLeft: 16, fontSize: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.showPriority !== false}
              onChange={(event) => onChange({ ...config, showPriority: event.target.checked })}
              style={{ marginRight: 4 }}
            />
            显示优先级
          </label>
        </div>
      );
    case 'reaction':
      return (
        <div className="excel-inline-config">
          <span className="config-label">测试轮数：</span>
          <div className="excel-button-group">
            {[10, 20, 30].map((rounds) => (
              <button
                key={rounds}
                className={`excel-mini-btn ${config.rounds === rounds ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, rounds })}
              >
                {rounds}轮
              </button>
            ))}
          </div>
          <span className="config-label config-label-right">间隔：</span>
          <div className="excel-button-group">
            {[
              { id: 1.5, name: '短' },
              { id: 2, name: '中' },
              { id: 3, name: '长' },
            ].map((item) => (
              <button
                key={item.id}
                className={`excel-mini-btn ${config.interval === item.id ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, interval: item.id })}
              >
                {item.name}
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
            {[1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                className={`excel-mini-btn ${config.targetCount === count ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetCount: count })}
              >
                {count}
              </button>
            ))}
          </div>
          <span className="config-label config-label-right">大小：</span>
          <div className="excel-button-group">
            {[
              { id: 0.25, name: '25%' },
              { id: 0.5, name: '50%' },
              { id: 0.75, name: '75%' },
            ].map((item) => (
              <button
                key={item.id}
                className={`excel-mini-btn ${config.targetScale === item.id ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetScale: item.id })}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

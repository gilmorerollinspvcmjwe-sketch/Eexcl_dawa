import React from 'react';
import type { GameSettings, GamePreset, CrosshairStyle } from '../types';
import { GAME_PRESETS } from '../types';
import { generateSimpleColLetters } from '../utils/gridUtils';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onApplyPreset: (preset: GamePreset) => void;
  onStartGame: (mode: 'timed' | 'endless' | 'zen' | 'headshot' | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number) => void;
  onResetSettings?: () => void;
  // 临时设置相关
  tempSettings?: GameSettings;
  onUpdateTempSetting?: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onSaveSettings?: () => void;
  onCancelSettings?: () => void;
}

const CROSSHAIR_STYLES: { id: CrosshairStyle; name: string; preview: string }[] = [
  { id: 'cross', name: '十字', preview: '✛' },
  { id: 'dot', name: '点', preview: '●' },
  { id: 'circle', name: '圆', preview: '○' },
  { id: 't-shape', name: 'T 形', preview: '⊥' },
  { id: 'valorant', name: '瓦罗兰特', preview: '╋' },
  { id: 'cs2', name: 'CS2', preview: '╋' },
  { id: 'cf', name: 'CF', preview: '╋' },
  { id: 'apex', name: 'Apex', preview: '◎' },
  { id: 'overwatch', name: '守望', preview: '◉' },
  { id: 'split', name: '分离', preview: '┼' },
  { id: 'squircle', name: '圆角', preview: '▢' },
];

const DIFFICULTY_LEVELS = [
  { id: 'very_easy', name: '非常简单', color: '#22c55e', desc: '适合新手入门' },
  { id: 'easy', name: '简单', color: '#84cc16', desc: '目标较大较慢' },
  { id: 'normal', name: '普通', color: '#eab308', desc: '标准难度', recommended: true },
  { id: 'medium', name: '中等', color: '#f97316', desc: '有一定挑战' },
  { id: 'hard', name: '困难', color: '#ef4444', desc: '目标小速度快' },
  { id: 'expert', name: '专家', color: '#dc2626', desc: '极限挑战' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onApplyPreset,
  onStartGame: _onStartGame,
  onResetSettings,
  // 临时设置相关
  tempSettings,
  onUpdateTempSetting,
  onSaveSettings,
  onCancelSettings,
}) => {
  // 使用临时设置（如果提供），否则使用实际设置
  const displaySettings = tempSettings || settings;
  const hasUnsavedChanges = tempSettings !== undefined && JSON.stringify(tempSettings) !== JSON.stringify(settings);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    if (onUpdateTempSetting && tempSettings) {
      // 使用临时设置模式
      onUpdateTempSetting(key, value);
    } else {
      // 使用实时更新模式
      onUpdateSettings(key, value);
    }
  };

  const applyPreset = (preset: GamePreset) => {
    onApplyPreset(preset);
  };

  const colLetters = React.useMemo(() => generateSimpleColLetters(15), []);

  const renderCrosshairPreview = () => {
    const size = displaySettings.crosshairSize || 12;
    const color = displaySettings.crosshairColor;
    
    switch (displaySettings.crosshairStyle) {
      case 'dot':
        return <circle cx="12" cy="12" r={size / 3} fill={color} />;
      case 'cross':
        return (
          <>
            <line x1="12" y1={12 - size / 2} x2="12" y2={12 + size / 2} stroke={color} strokeWidth={2} />
            <line x1={12 - size / 2} y1="12" x2={12 + size / 2} y2="12" stroke={color} strokeWidth={2} />
          </>
        );
      case 'circle':
        return <circle cx="12" cy="12" r={size / 2} stroke={color} strokeWidth={2} fill="none" />;
      case 't-shape':
        return (
          <>
            <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth={2} />
            <line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth={2} />
          </>
        );
      case 'valorant':
        return (
          <>
            <line x1="12" y1="4" x2="12" y2="9" stroke={color} strokeWidth={2} />
            <line x1="12" y1="15" x2="12" y2="20" stroke={color} strokeWidth={2} />
            <line x1="4" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} />
            <line x1="15" y1="12" x2="20" y2="12" stroke={color} strokeWidth={2} />
            <circle cx="12" cy="12" r="1.5" fill={color} />
          </>
        );
      case 'cs2':
        return (
          <>
            <line x1="12" y1="3" x2="12" y2="8" stroke={color} strokeWidth={2} />
            <line x1="12" y1="16" x2="12" y2="21" stroke={color} strokeWidth={2} />
            <line x1="3" y1="12" x2="8" y2="12" stroke={color} strokeWidth={2} />
            <line x1="16" y1="12" x2="21" y2="12" stroke={color} strokeWidth={2} />
            <circle cx="12" cy="12" r="2" fill={color} opacity="0.5" />
          </>
        );
      case 'cf':
        return (
          <>
            <line x1="12" y1="5" x2="12" y2="10" stroke={color} strokeWidth={3} />
            <line x1="12" y1="14" x2="12" y2="19" stroke={color} strokeWidth={3} />
            <line x1="5" y1="12" x2="10" y2="12" stroke={color} strokeWidth={3} />
            <line x1="14" y1="12" x2="19" y2="12" stroke={color} strokeWidth={3} />
          </>
        );
      case 'apex':
        return (
          <>
            <line x1="12" y1="2" x2="12" y2="8" stroke={color} strokeWidth={2} />
            <line x1="12" y1="16" x2="12" y2="22" stroke={color} strokeWidth={2} />
            <line x1="2" y1="12" x2="8" y2="12" stroke={color} strokeWidth={2} />
            <line x1="16" y1="12" x2="22" y2="12" stroke={color} strokeWidth={2} />
            <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} fill="none" />
          </>
        );
      case 'overwatch':
        return (
          <>
            <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} fill="none" />
            <line x1="12" y1="4" x2="12" y2="7" stroke={color} strokeWidth={2} />
            <line x1="12" y1="17" x2="12" y2="20" stroke={color} strokeWidth={2} />
            <line x1="4" y1="12" x2="7" y2="12" stroke={color} strokeWidth={2} />
            <line x1="17" y1="12" x2="20" y2="12" stroke={color} strokeWidth={2} />
          </>
        );
      case 'split':
        return (
          <>
            <line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth={2} />
            <line x1="12" y1="15" x2="12" y2="22" stroke={color} strokeWidth={2} />
            <line x1="2" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} />
            <line x1="15" y1="12" x2="22" y2="12" stroke={color} strokeWidth={2} />
            <circle cx="12" cy="12" r="1" fill={color} />
          </>
        );
      case 'squircle':
        return (
          <>
            <rect x="6" y="6" width="12" height="12" rx="3" stroke={color} strokeWidth={2} fill="none" />
            <circle cx="12" cy="12" r="1.5" fill={color} />
          </>
        );
      default:
        return (
          <>
            <line x1="12" y1={12 - size / 2} x2="12" y2={12 + size / 2} stroke={color} strokeWidth={2} />
            <line x1={12 - size / 2} y1="12" x2={12 + size / 2} y2="12" stroke={color} strokeWidth={2} />
          </>
        );
    }
  };

  const renderSectionHeader = (row: number, icon: string, title: string, bgColor: string = '#107c41') => (
    <tr key={`header-${row}`}>
      <td className="excel-row-header">{row}</td>
      <td 
        className="excel-cell" 
        colSpan={7} 
        style={{ 
          background: bgColor, 
          color: 'white', 
          fontWeight: 'bold',
          paddingLeft: 8,
        }}
      >
        {icon} {title}
      </td>
    </tr>
  );

  const renderEmptyRow = (row: number) => (
    <tr key={`empty-${row}`}>
      <td className="excel-row-header">{row}</td>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="excel-cell" />
      ))}
    </tr>
  );

  return (
    <div className="excel-grid-container settings-panel-container">
      <div className="excel-grid-wrapper settings-panel-wrapper" style={{ padding: 0 }}>
        <table className="excel-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="excel-corner-cell" />
              {colLetters.slice(0, 8).map(letter => (
                <th key={letter} className="excel-col-header">{letter}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 标题行 */}
            <tr>
              <td className="excel-row-header">1</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  fontSize: 14, 
                  color: '#107c41',
                  background: 'linear-gradient(180deg, #e6f4ea 0%, #d4edda 100%)',
                  borderBottom: '2px solid #107c41',
                }}
              >
                练枪配置参数表
              </td>
            </tr>

            {renderEmptyRow(2)}

            {/* ========== 🎮 基础设置 ========== */}
            {renderSectionHeader(3, '🎮', '基础设置')}
            
            {/* 训练时长 */}
            <tr>
              <td className="excel-row-header">4</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>训练时长</td>
              <td className="excel-cell" colSpan={3}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[30, 60, 120].map(d => (
                    <button
                      key={d}
                      className={`game-preset-btn ${(displaySettings.trainingDuration || 60) === d ? 'active' : ''}`}
                      onClick={() => updateSetting('trainingDuration', d as 30 | 60 | 120)}
                      style={{ 
                        background: (displaySettings.trainingDuration || 60) === d ? '#107c41' : '#e5e7eb', 
                        color: (displaySettings.trainingDuration || 60) === d ? 'white' : '#333',
                        minWidth: 60
                      }}
                    >
                      {d}秒{d === 60 ? ' ⭐' : ''}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" colSpan={3} style={{ color: '#666', fontSize: 10 }}>
                每局训练的时间长度，推荐60秒
              </td>
            </tr>

            {/* 难度等级 */}
            <tr>
              <td className="excel-row-header">5</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>难度等级</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIFFICULTY_LEVELS.map(diff => (
                    <button
                      key={diff.id}
                      className={`game-preset-btn ${displaySettings.difficulty === diff.id ? 'active' : ''}`}
                      onClick={() => updateSetting('difficulty', diff.id as GameSettings['difficulty'])}
                      title={diff.desc}
                      style={{ 
                        background: displaySettings.difficulty === diff.id ? diff.color : '#e5e7eb', 
                        color: displaySettings.difficulty === diff.id ? 'white' : '#333',
                        minWidth: 65
                      }}
                    >
                      {diff.name}{diff.recommended ? ' ⭐' : ''}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                难度越高，目标越小、消失越快
              </td>
            </tr>

            {/* 启用音效 */}
            <tr>
              <td className="excel-row-header">6</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>启用音效</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={displaySettings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
              <td className="excel-cell" colSpan={5} style={{ color: '#666', fontSize: 10 }}>
                开启后点击和命中会有音效提示
              </td>
            </tr>

            {renderEmptyRow(7)}

            {/* ========== 👁️ 显示设置 ========== */}
            {renderSectionHeader(8, '👁️', '显示设置', '#059669')}

            {/* 敌人显示 */}
            <tr>
              <td className="excel-row-header">9</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>敌人显示</td>
              <td className="excel-cell" colSpan={3}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`game-preset-btn ${(displaySettings.enemyRenderMode || 'text') === 'text' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'text')}
                    style={{ background: (displaySettings.enemyRenderMode || 'text') === 'text' ? '#059669' : '#e5e7eb', color: (displaySettings.enemyRenderMode || 'text') === 'text' ? 'white' : '#333' }}
                  >
                    文字模式 ⭐
                  </button>
                  <button
                    className={`game-preset-btn ${displaySettings.enemyRenderMode === 'icon' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'icon')}
                    style={{ background: displaySettings.enemyRenderMode === 'icon' ? '#059669' : '#e5e7eb', color: displaySettings.enemyRenderMode === 'icon' ? 'white' : '#333' }}
                  >
                    图标模式
                  </button>
                </div>
              </td>
              <td className="excel-cell" colSpan={3} style={{ color: '#666', fontSize: 10 }}>
                文字模式显示中文部位名，图标模式更简洁
              </td>
            </tr>

            {/* 无色模式 */}
            <tr>
              <td className="excel-row-header">10</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>无色模式</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={displaySettings.colorlessMode || false}
                  onChange={(e) => updateSetting('colorlessMode', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
              <td className="excel-cell" colSpan={5} style={{ color: '#666', fontSize: 10 }}>
                纯黑白显示，更像真实Excel表格，适合办公环境
              </td>
            </tr>

            {/* 反馈模式 */}
            <tr>
              <td className="excel-row-header">11</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>反馈模式</td>
              <td className="excel-cell" colSpan={3}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`game-preset-btn ${(displaySettings.feedbackMode || 'fancy') === 'fancy' ? 'active' : ''}`}
                    onClick={() => updateSetting('feedbackMode', 'fancy')}
                    style={{ 
                      background: (displaySettings.feedbackMode || 'fancy') === 'fancy' ? '#8b5cf6' : '#e5e7eb', 
                      color: (displaySettings.feedbackMode || 'fancy') === 'fancy' ? 'white' : '#333'
                    }}
                  >
                    ✨ 炫酷 ⭐
                  </button>
                  <button
                    className={`game-preset-btn ${displaySettings.feedbackMode === 'excel' ? 'active' : ''}`}
                    onClick={() => updateSetting('feedbackMode', 'excel')}
                    style={{ 
                      background: displaySettings.feedbackMode === 'excel' ? '#059669' : '#e5e7eb', 
                      color: displaySettings.feedbackMode === 'excel' ? 'white' : '#333'
                    }}
                  >
                    📝 Excel
                  </button>
                </div>
              </td>
              <td className="excel-cell" colSpan={3} style={{ color: '#666', fontSize: 10 }}>
                炫酷模式有动画特效，Excel模式仅文字提示
              </td>
            </tr>

            {/* 启用爆头线 */}
            <tr>
              <td className="excel-row-header">12</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>启用爆头线</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={displaySettings.headshotLineEnabled}
                  onChange={(e) => updateSetting('headshotLineEnabled', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>爆头线位置</td>
              <td className="excel-cell">
                <input
                  type="number"
                  min="1"
                  max={50}
                  value={displaySettings.headshotLineRow}
                  onChange={(e) => updateSetting('headshotLineRow', parseInt(e.target.value) || 10)}
                  className="settings-cell-input"
                  style={{ width: 60, textAlign: 'center' }}
                />
              </td>
              <td className="excel-cell" colSpan={3} style={{ color: '#666', fontSize: 10 }}>
                显示一条参考线，帮助练习爆头瞄准
              </td>
            </tr>

            {renderEmptyRow(13)}

            {/* ========== 🎯 准星设置 ========== */}
            {renderSectionHeader(14, '🎯', '准星设置', '#0891b2')}

            {/* 准星样式 */}
            <tr>
              <td className="excel-row-header">15</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>准星样式</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CROSSHAIR_STYLES.map(style => (
                    <button
                      key={style.id}
                      className={`game-preset-btn ${displaySettings.crosshairStyle === style.id ? 'active' : ''}`}
                      onClick={() => updateSetting('crosshairStyle', style.id)}
                      style={{ minWidth: 70, fontSize: 14, padding: '6px 10px', background: displaySettings.crosshairStyle === style.id ? '#0891b2' : '#e5e7eb', color: displaySettings.crosshairStyle === style.id ? 'white' : '#333' }}
                      title={style.name}
                    >
                      <span style={{ fontSize: 18, marginRight: 4 }}>{style.preview}</span>
                      <span style={{ fontSize: 11 }}>{style.name}</span>
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                选择你习惯的准星外观
              </td>
            </tr>

            {/* 准星大小和颜色 */}
            <tr>
              <td className="excel-row-header">16</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>准星大小</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="8"
                  max="24"
                  step="1"
                  value={displaySettings.crosshairSize || 12}
                  onChange={(e) => updateSetting('crosshairSize', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#0891b2' }}>{displaySettings.crosshairSize || 12}px</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>准星颜色</td>
              <td className="excel-cell">
                <input
                  type="color"
                  value={displaySettings.crosshairColor}
                  onChange={(e) => updateSetting('crosshairColor', e.target.value)}
                  style={{ width: 50, height: 28, cursor: 'pointer', border: '1px solid #d4d4d4', borderRadius: 3 }}
                />
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                推荐绿色或青色
              </td>
            </tr>

            {/* 使用准星光标 */}
            <tr>
              <td className="excel-row-header">17</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>使用准星光标</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={displaySettings.customCursor}
                  onChange={(e) => updateSetting('customCursor', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                隐藏系统鼠标，使用自定义准星
              </td>
              <td className="excel-cell" colSpan={3}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16,
                  padding: '8px 12px',
                  background: '#f9fafb',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    {renderCrosshairPreview()}
                  </svg>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>实时预览</span>
                </div>
              </td>
            </tr>

            {renderEmptyRow(18)}

            {/* ========== 🏃 移动设置 ========== */}
            {renderSectionHeader(19, '🏃', '移动设置', '#7c3aed')}

            {/* 移动速度 */}
            <tr>
              <td className="excel-row-header">20</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>移动速度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={displaySettings.enemyMoveSpeed || 1.0}
                  onChange={(e) => updateSetting('enemyMoveSpeed', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#7c3aed' }}>{(displaySettings.enemyMoveSpeed || 1.0).toFixed(1)} 格/秒</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>移动模式</td>
              <td className="excel-cell" colSpan={2}>
                <select
                  className="settings-cell-select"
                  value={displaySettings.enemyMovePattern || 'linear'}
                  onChange={(e) => updateSetting('enemyMovePattern', e.target.value as 'linear' | 'sine' | 'bounce')}
                >
                  <option value="linear">直线</option>
                  <option value="sine">波浪</option>
                  <option value="bounce">弹跳</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="excel-row-header">21</td>
              <td className="excel-cell" colSpan={7} style={{ color: '#666', fontSize: 10, fontStyle: 'italic' }}>
                💡 仅在FPS移动射击模式中生效：移动速度控制目标移动快慢，移动模式控制目标移动轨迹
              </td>
            </tr>

            {renderEmptyRow(22)}

            {/* ========== ⚙️ 高级设置 ========== */}
            {renderSectionHeader(23, '⚙️', '高级设置', '#6b7280')}

            {/* 目标生成频率 */}
            <tr>
              <td className="excel-row-header">24</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>目标生成频率</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="1"
                  max="10"
                  value={displaySettings.spawnRate}
                  onChange={(e) => updateSetting('spawnRate', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{displaySettings.spawnRate}</strong>
              </td>
              <td className="excel-cell" colSpan={4} style={{ color: '#666', fontSize: 10 }}>
                新目标出现的速度，数字越大越频繁
              </td>
            </tr>

            {/* 目标持续时间 */}
            <tr>
              <td className="excel-row-header">25</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>目标持续时间</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="1"
                  max="10"
                  value={displaySettings.targetDuration}
                  onChange={(e) => updateSetting('targetDuration', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{displaySettings.targetDuration}</strong>
              </td>
              <td className="excel-cell" colSpan={4} style={{ color: '#666', fontSize: 10 }}>
                目标在屏幕上停留的时间，值越大停留越久
              </td>
            </tr>

            {/* 目标大小 */}
            <tr>
              <td className="excel-row-header">26</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>目标大小</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="14"
                  max="32"
                  value={displaySettings.targetSize}
                  onChange={(e) => updateSetting('targetSize', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{displaySettings.targetSize}px</strong>
              </td>
              <td className="excel-cell" colSpan={4} style={{ color: '#666', fontSize: 10 }}>
                目标的大小，影响命中难度
              </td>
            </tr>

            {renderEmptyRow(27)}

            {/* 游戏预设 */}
            <tr>
              <td className="excel-row-header">28</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>游戏预设</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(Object.keys(GAME_PRESETS) as GamePreset[]).map(preset => (
                    <button
                      key={preset}
                      className={`game-preset-btn ${displaySettings.gamePreset === preset ? 'active' : ''}`}
                      onClick={() => applyPreset(preset)}
                      title={`${GAME_PRESETS[preset].name} - X: ${GAME_PRESETS[preset].sensitivityX}, Y: ${GAME_PRESETS[preset].sensitivityY}`}
                      style={{ background: displaySettings.gamePreset === preset ? '#6b7280' : '#e5e7eb', color: displaySettings.gamePreset === preset ? 'white' : '#333' }}
                    >
                      {GAME_PRESETS[preset].name}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                快速应用常用游戏的灵敏度配置
              </td>
            </tr>

            {/* X/Y轴灵敏度 */}
            <tr>
              <td className="excel-row-header">29</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>X轴灵敏度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={displaySettings.sensitivityX}
                  onChange={(e) => updateSetting('sensitivityX', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{displaySettings.sensitivityX.toFixed(1)}</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>Y轴灵敏度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={displaySettings.sensitivityY}
                  onChange={(e) => updateSetting('sensitivityY', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{displaySettings.sensitivityY.toFixed(1)}</strong>
              </td>
            </tr>
            <tr>
              <td className="excel-row-header">30</td>
              <td className="excel-cell" colSpan={7} style={{ color: '#666', fontSize: 10, fontStyle: 'italic' }}>
                💡 灵敏度用于模拟不同游戏的鼠标手感，一般保持默认即可
              </td>
            </tr>

            {renderEmptyRow(31)}

            {/* ========== 🎨 视觉设置 ========== */}
            {renderSectionHeader(32, '🎨', '视觉设置', '#ec4899')}

            {/* 配置冲突提示 */}
            {displaySettings.colorlessMode && (
              <tr>
                <td className="excel-row-header"></td>
                <td className="excel-cell" colSpan={7} style={{ 
                  background: '#fef3c7', 
                  color: '#92400e',
                  fontSize: 11,
                  fontStyle: 'italic',
                  border: '1px solid #fcd34d',
                }}>
                  ⚠️ 无色模式已启用，颜色和谐设置将被忽略
                </td>
              </tr>
            )}

            {/* 敌人颜色和谐模式 */}
            <tr>
              <td className="excel-row-header">33</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>颜色和谐模式</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'none', name: '无', desc: '各部位独立颜色' },
                    { id: 'complementary', name: '互补色', desc: '对比强烈' },
                    { id: 'analogous', name: '类似色', desc: '和谐统一' },
                    { id: 'triadic', name: '三色组', desc: '色彩丰富' },
                    { id: 'split-complementary', name: '分裂互补', desc: '动态平衡' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      className={`game-preset-btn ${(settings as any).colorHarmonyMode === mode.id ? 'active' : ''}`}
                      onClick={() => onUpdateSettings('colorHarmonyMode' as any, mode.id as any)}
                      disabled={displaySettings.colorlessMode}
                      style={{ 
                        minWidth: 80, 
                        fontSize: 11, 
                        padding: '5px 8px', 
                        background: displaySettings.colorlessMode 
                          ? '#d1d5db' 
                          : (displaySettings as any).colorHarmonyMode === mode.id 
                            ? '#ec4899' 
                            : '#e5e7eb', 
                        color: displaySettings.colorlessMode 
                          ? '#9ca3af' 
                          : (displaySettings as any).colorHarmonyMode === mode.id 
                            ? 'white' 
                            : '#333',
                        cursor: displaySettings.colorlessMode ? 'not-allowed' : 'pointer',
                        opacity: displaySettings.colorlessMode ? 0.6 : 1,
                      }}
                      title={displaySettings.colorlessMode ? '无色模式下不可用' : mode.desc}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                {displaySettings.colorlessMode ? '⚠️ 无色模式下忽略' : '敌人各部位的颜色搭配方式'}
              </td>
            </tr>

            {/* 敌人出现动画 */}
            <tr>
              <td className="excel-row-header">34</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>出现动画</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'none', name: '无', icon: '—' },
                    { id: 'fadeIn', name: '淡入', icon: '🌅' },
                    { id: 'popIn', name: '弹出', icon: '💥' },
                    { id: 'slideUp', name: '滑入', icon: '⬆️' },
                    { id: 'bounceIn', name: '弹跳', icon: '🎾' },
                    { id: 'flashIn', name: '闪烁', icon: '⚡' },
                  ].map(anim => (
                    <button
                      key={anim.id}
                      className={`game-preset-btn ${(settings as any).spawnAnimation === anim.id ? 'active' : ''}`}
                      onClick={() => onUpdateSettings('spawnAnimation' as any, anim.id as any)}
                      style={{ 
                        minWidth: 70, 
                        fontSize: 11, 
                        padding: '5px 8px', 
                        background: (settings as any).spawnAnimation === anim.id ? '#ec4899' : '#e5e7eb', 
                        color: (settings as any).spawnAnimation === anim.id ? 'white' : '#333' 
                      }}
                    >
                      {anim.icon} {anim.name}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                敌人出现时的动画效果
              </td>
            </tr>

            {/* 文本样式 */}
            <tr>
              <td className="excel-row-header">35</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>敌人字号</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="10"
                  max="24"
                  step="1"
                  value={(settings as any).enemyFontSize || 14}
                  onChange={(e) => onUpdateSettings('enemyFontSize' as any, parseInt(e.target.value) as any)}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#ec4899' }}>{(settings as any).enemyFontSize || 14}px</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>敌人字重</td>
              <td className="excel-cell">
                <select
                  value={(settings as any).enemyFontWeight || 'bold'}
                  onChange={(e) => onUpdateSettings('enemyFontWeight' as any, e.target.value as any)}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    border: '1px solid #d4d4d4',
                    fontSize: 12,
                  }}
                >
                  <option value="normal">常规</option>
                  <option value="bold">加粗</option>
                  <option value="300">细体</option>
                  <option value="500">中等</option>
                </select>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                调整敌人文字的显示样式
              </td>
            </tr>

            {renderEmptyRow(36)}

            {/* ========== 📊 单元格设置 (Sheet2 外观) ========== */}
            {renderSectionHeader(37, '📊', '单元格设置 (Sheet2 外观)', '#8b5cf6')}

            {/* 单元格大小 */}
            <tr>
              <td className="excel-row-header">38</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>单元格宽度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="40"
                  max="100"
                  step="4"
                  value={displaySettings.cellSettings?.cellWidth || 64}
                  onChange={(e) => {
                    const newSettings = {
                      cellHeight: displaySettings.cellSettings?.cellHeight || 20,
                      colorMode: displaySettings.cellSettings?.colorMode || 'default',
                      colorIntensity: displaySettings.cellSettings?.colorIntensity || 50,
                      enableAnimation: displaySettings.cellSettings?.enableAnimation || false,
                      animationSpeed: displaySettings.cellSettings?.animationSpeed || 'normal',
                      colorShift: displaySettings.cellSettings?.colorShift || false,
                      cellWidth: parseInt(e.target.value)
                    };
                    updateSetting('cellSettings', newSettings);
                  }}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#8b5cf6' }}>{displaySettings.cellSettings?.cellWidth || 64}px</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>单元格高度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="15"
                  max="40"
                  step="1"
                  value={displaySettings.cellSettings?.cellHeight || 20}
                  onChange={(e) => {
                    const newSettings = {
                      cellWidth: displaySettings.cellSettings?.cellWidth || 64,
                      colorMode: displaySettings.cellSettings?.colorMode || 'default',
                      colorIntensity: displaySettings.cellSettings?.colorIntensity || 50,
                      enableAnimation: displaySettings.cellSettings?.enableAnimation || false,
                      animationSpeed: displaySettings.cellSettings?.animationSpeed || 'normal',
                      colorShift: displaySettings.cellSettings?.colorShift || false,
                      cellHeight: parseInt(e.target.value)
                    };
                    updateSetting('cellSettings', newSettings);
                  }}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#8b5cf6' }}>{displaySettings.cellSettings?.cellHeight || 20}px</strong>
              </td>
            </tr>
            <tr>
              <td className="excel-row-header">39</td>
              <td className="excel-cell" colSpan={7} style={{ color: '#666', fontSize: 10, fontStyle: 'italic' }}>
                💡 更小的单元格 = 更高的游戏难度。建议保持默认 64x20px 以获得最佳体验
              </td>
            </tr>

            {/* 颜色模式 */}
            <tr>
              <td className="excel-row-header">40</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>颜色模式</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'default', name: '默认', desc: 'Excel 经典风格', icon: '⬜' },
                    { id: 'random', name: '随机', desc: '完全随机颜色', icon: '🎲' },
                    { id: 'density', name: '密度', desc: '区域密度变化', icon: '🌊' },
                    { id: 'checkerboard', name: '棋盘', desc: '棋盘格模式', icon: '⬛' },
                    { id: 'heatmap', name: '热图', desc: '中心亮边缘暗', icon: '🔥' },
                    { id: 'rainbow', name: '彩虹', desc: '彩虹渐变', icon: '🌈' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      className={`game-preset-btn ${displaySettings.cellSettings?.colorMode === mode.id ? 'active' : ''}`}
                      onClick={() => {
                        const newSettings = {
                          cellWidth: displaySettings.cellSettings?.cellWidth || 64,
                          cellHeight: displaySettings.cellSettings?.cellHeight || 20,
                          colorIntensity: displaySettings.cellSettings?.colorIntensity || 50,
                          enableAnimation: displaySettings.cellSettings?.enableAnimation || false,
                          animationSpeed: displaySettings.cellSettings?.animationSpeed || 'normal',
                          colorShift: displaySettings.cellSettings?.colorShift || false,
                          colorMode: mode.id as any
                        };
                        updateSetting('cellSettings', newSettings);
                      }}
                      style={{ 
                        minWidth: 70, 
                        fontSize: 11, 
                        padding: '5px 8px', 
                        background: displaySettings.cellSettings?.colorMode === mode.id ? '#8b5cf6' : '#e5e7eb', 
                        color: displaySettings.cellSettings?.colorMode === mode.id ? 'white' : '#333' 
                      }}
                      title={mode.desc}
                    >
                      {mode.icon} {mode.name}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                单元格背景颜色模式
              </td>
            </tr>

            {/* 颜色强度 */}
            <tr>
              <td className="excel-row-header">41</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>颜色强度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="0"
                  max="100"
                  step="5"
                  value={displaySettings.cellSettings?.colorIntensity || 50}
                  onChange={(e) => {
                    const newSettings = {
                      cellWidth: displaySettings.cellSettings?.cellWidth || 64,
                      cellHeight: displaySettings.cellSettings?.cellHeight || 20,
                      colorMode: displaySettings.cellSettings?.colorMode || 'default',
                      enableAnimation: displaySettings.cellSettings?.enableAnimation || false,
                      animationSpeed: displaySettings.cellSettings?.animationSpeed || 'normal',
                      colorShift: displaySettings.cellSettings?.colorShift || false,
                      colorIntensity: parseInt(e.target.value)
                    };
                    updateSetting('cellSettings', newSettings);
                  }}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#8b5cf6' }}>{displaySettings.cellSettings?.colorIntensity || 50}%</strong>
              </td>
              <td className="excel-cell" colSpan={4} style={{ color: '#666', fontSize: 10 }}>
                控制颜色变化的强度和对比度，0% = 几乎无色，100% = 最鲜艳
              </td>
            </tr>

            {/* 动态效果 */}
            <tr>
              <td className="excel-row-header">42</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>动态效果</td>
              <td className="excel-cell" colSpan={2}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={displaySettings.cellSettings?.enableAnimation || false}
                    onChange={(e) => {
                      const newSettings = {
                        cellWidth: displaySettings.cellSettings?.cellWidth || 64,
                        cellHeight: displaySettings.cellSettings?.cellHeight || 20,
                        colorMode: displaySettings.cellSettings?.colorMode || 'default',
                        colorIntensity: displaySettings.cellSettings?.colorIntensity || 50,
                        animationSpeed: displaySettings.cellSettings?.animationSpeed || 'normal',
                        colorShift: displaySettings.cellSettings?.colorShift || false,
                        enableAnimation: e.target.checked
                      };
                      updateSetting('cellSettings', newSettings);
                    }}
                  />
                  <span>启用闪烁</span>
                </label>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>闪烁速度</td>
              <td className="excel-cell">
                <select
                  value={displaySettings.cellSettings?.animationSpeed || 'normal'}
                  onChange={(e) => {
                    const newSettings = {
                      cellWidth: displaySettings.cellSettings?.cellWidth || 64,
                      cellHeight: displaySettings.cellSettings?.cellHeight || 20,
                      colorMode: displaySettings.cellSettings?.colorMode || 'default',
                      colorIntensity: displaySettings.cellSettings?.colorIntensity || 50,
                      enableAnimation: displaySettings.cellSettings?.enableAnimation || false,
                      colorShift: displaySettings.cellSettings?.colorShift || false,
                      animationSpeed: e.target.value as 'slow' | 'normal' | 'fast'
                    };
                    updateSetting('cellSettings', newSettings);
                  }}
                  disabled={!displaySettings.cellSettings?.enableAnimation}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    border: '1px solid #d4d4d4',
                    fontSize: 12,
                    opacity: displaySettings.cellSettings?.enableAnimation ? 1 : 0.5,
                  }}
                >
                  <option value="slow">慢</option>
                  <option value="normal">中</option>
                  <option value="fast">快</option>
                </select>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                {displaySettings.cellSettings?.enableAnimation ? '单元格会闪烁变化' : '动态效果已关闭'}
              </td>
            </tr>

            {renderEmptyRow(43)}

            {/* ========== 🖼️ 伪装设置 ========== */}
            {renderSectionHeader(44, '🖼️', '伪装设置', '#3b82f6')}

            {/* 上传伪装图片 */}
            <tr>
              <td className="excel-row-header">38</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>上传伪装图片</td>
              <td className="excel-cell" colSpan={4}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label 
                    style={{ 
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    📁 选择图片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateSetting('coverImage', ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {displaySettings.coverImage && (
                    <button
                      onClick={() => updateSetting('coverImage', '')}
                      style={{ 
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      删除图片
                    </button>
                  )}
                </div>
              </td>
              <td className="excel-cell" colSpan={2} style={{ color: '#666', fontSize: 10 }}>
                上传一张Excel截图，按Esc隐藏时显示
              </td>
            </tr>

            {/* 图片预览 */}
            {displaySettings.coverImage && (
              <tr>
                <td className="excel-row-header">39</td>
                <td className="excel-cell" style={{ fontWeight: 500 }}>图片预览</td>
                <td className="excel-cell" colSpan={6}>
                  <div style={{ 
                    maxWidth: 300, 
                    maxHeight: 150, 
                    border: '1px solid #d4d4d4',
                    borderRadius: 4,
                    overflow: 'hidden',
                    padding: 4,
                    background: '#f9fafb',
                  }}>
                    <img 
                      src={displaySettings.coverImage} 
                      alt="伪装图片预览" 
                      style={{ maxWidth: '100%', maxHeight: 140, display: 'block' }}
                    />
                  </div>
                </td>
              </tr>
            )}

            {renderEmptyRow(40)}

            {/* 保存/取消按钮 - 第41行 */}
            {onSaveSettings && onCancelSettings && (
              <tr>
                <td className="excel-row-header">41</td>
                <td 
                  className="excel-cell" 
                  colSpan={7} 
                  style={{ 
                    background: hasUnsavedChanges ? '#fef3c7' : '#f3f4f6',
                    border: hasUnsavedChanges ? '2px solid #f59e0b' : 'none',
                    borderRadius: 4,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasUnsavedChanges ? (
                        <>
                          <span style={{ color: '#92400e', fontWeight: 'bold' }}>⚠️ 有未保存的更改</span>
                          <span style={{ color: '#92400e', fontSize: 11 }}>点击"保存设置"应用更改</span>
                        </>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: 11 }}>✅ 所有更改已保存</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {onResetSettings && (
                        <button
                          onClick={onResetSettings}
                          style={{
                            padding: '8px 16px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          🔄 恢复默认
                        </button>
                      )}
                      <button
                        onClick={onCancelSettings}
                        style={{
                          padding: '8px 16px',
                          background: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        ❌ 取消
                      </button>
                      <button
                        onClick={onSaveSettings}
                        disabled={!hasUnsavedChanges}
                        style={{
                          padding: '8px 16px',
                          background: hasUnsavedChanges ? '#107c41' : '#9ca3af',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        💾 保存设置
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* 操作说明 */}
            <tr>
              <td className="excel-row-header">42</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  background: '#f3f4f6', 
                  color: '#6b7280',
                  fontSize: 10,
                  paddingLeft: 8,
                }}
              >
                📝 操作说明：Esc = 隐藏/恢复游戏 | P = 暂停 | 点击目标进行射击 | 左上角悬停 3 秒 = 快速隐藏
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettingsPanel;

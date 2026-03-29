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
  onStartGame,
  onResetSettings,
}) => {
  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings(key, value);
  };

  const applyPreset = (preset: GamePreset) => {
    onApplyPreset(preset);
  };

  const colLetters = React.useMemo(() => generateSimpleColLetters(15), []);

  const renderCrosshairPreview = () => {
    const size = settings.crosshairSize || 12;
    const color = settings.crosshairColor;
    
    switch (settings.crosshairStyle) {
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
                      className={`game-preset-btn ${(settings.trainingDuration || 60) === d ? 'active' : ''}`}
                      onClick={() => updateSetting('trainingDuration', d as 30 | 60 | 120)}
                      style={{ 
                        background: (settings.trainingDuration || 60) === d ? '#107c41' : '#e5e7eb', 
                        color: (settings.trainingDuration || 60) === d ? 'white' : '#333',
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
                      className={`game-preset-btn ${settings.difficulty === diff.id ? 'active' : ''}`}
                      onClick={() => updateSetting('difficulty', diff.id as GameSettings['difficulty'])}
                      title={diff.desc}
                      style={{ 
                        background: settings.difficulty === diff.id ? diff.color : '#e5e7eb', 
                        color: settings.difficulty === diff.id ? 'white' : '#333',
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
                  checked={settings.soundEnabled}
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
                    className={`game-preset-btn ${(settings.enemyRenderMode || 'text') === 'text' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'text')}
                    style={{ background: (settings.enemyRenderMode || 'text') === 'text' ? '#059669' : '#e5e7eb', color: (settings.enemyRenderMode || 'text') === 'text' ? 'white' : '#333' }}
                  >
                    文字模式 ⭐
                  </button>
                  <button
                    className={`game-preset-btn ${settings.enemyRenderMode === 'icon' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'icon')}
                    style={{ background: settings.enemyRenderMode === 'icon' ? '#059669' : '#e5e7eb', color: settings.enemyRenderMode === 'icon' ? 'white' : '#333' }}
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
                  checked={settings.colorlessMode || false}
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
                    className={`game-preset-btn ${(settings.feedbackMode || 'fancy') === 'fancy' ? 'active' : ''}`}
                    onClick={() => updateSetting('feedbackMode', 'fancy')}
                    style={{ 
                      background: (settings.feedbackMode || 'fancy') === 'fancy' ? '#8b5cf6' : '#e5e7eb', 
                      color: (settings.feedbackMode || 'fancy') === 'fancy' ? 'white' : '#333'
                    }}
                  >
                    ✨ 炫酷 ⭐
                  </button>
                  <button
                    className={`game-preset-btn ${settings.feedbackMode === 'excel' ? 'active' : ''}`}
                    onClick={() => updateSetting('feedbackMode', 'excel')}
                    style={{ 
                      background: settings.feedbackMode === 'excel' ? '#059669' : '#e5e7eb', 
                      color: settings.feedbackMode === 'excel' ? 'white' : '#333'
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
                  checked={settings.headshotLineEnabled}
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
                  value={settings.headshotLineRow}
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
                      className={`game-preset-btn ${settings.crosshairStyle === style.id ? 'active' : ''}`}
                      onClick={() => updateSetting('crosshairStyle', style.id)}
                      style={{ minWidth: 70, fontSize: 14, padding: '6px 10px', background: settings.crosshairStyle === style.id ? '#0891b2' : '#e5e7eb', color: settings.crosshairStyle === style.id ? 'white' : '#333' }}
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
                  value={settings.crosshairSize || 12}
                  onChange={(e) => updateSetting('crosshairSize', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#0891b2' }}>{settings.crosshairSize || 12}px</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>准星颜色</td>
              <td className="excel-cell">
                <input
                  type="color"
                  value={settings.crosshairColor}
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
                  checked={settings.customCursor}
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
                  value={settings.enemyMoveSpeed || 1.0}
                  onChange={(e) => updateSetting('enemyMoveSpeed', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#7c3aed' }}>{(settings.enemyMoveSpeed || 1.0).toFixed(1)} 格/秒</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>移动模式</td>
              <td className="excel-cell" colSpan={2}>
                <select
                  className="settings-cell-select"
                  value={settings.enemyMovePattern || 'linear'}
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
                  value={settings.spawnRate}
                  onChange={(e) => updateSetting('spawnRate', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{settings.spawnRate}</strong>
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
                  value={settings.targetDuration}
                  onChange={(e) => updateSetting('targetDuration', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{settings.targetDuration}</strong>
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
                  value={settings.targetSize}
                  onChange={(e) => updateSetting('targetSize', parseInt(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{settings.targetSize}px</strong>
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
                      className={`game-preset-btn ${settings.gamePreset === preset ? 'active' : ''}`}
                      onClick={() => applyPreset(preset)}
                      title={`${GAME_PRESETS[preset].name} - X: ${GAME_PRESETS[preset].sensitivityX}, Y: ${GAME_PRESETS[preset].sensitivityY}`}
                      style={{ background: settings.gamePreset === preset ? '#6b7280' : '#e5e7eb', color: settings.gamePreset === preset ? 'white' : '#333' }}
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
                  value={settings.sensitivityX}
                  onChange={(e) => updateSetting('sensitivityX', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{settings.sensitivityX.toFixed(1)}</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>Y轴灵敏度</td>
              <td className="excel-cell">
                <input
                  type="range"
                  className="settings-cell-range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.sensitivityY}
                  onChange={(e) => updateSetting('sensitivityY', parseFloat(e.target.value))}
                />
              </td>
              <td className="excel-cell" style={{ textAlign: 'center' }}>
                <strong style={{ color: '#6b7280' }}>{settings.sensitivityY.toFixed(1)}</strong>
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
                      style={{ 
                        minWidth: 80, 
                        fontSize: 11, 
                        padding: '5px 8px', 
                        background: (settings as any).colorHarmonyMode === mode.id ? '#ec4899' : '#e5e7eb', 
                        color: (settings as any).colorHarmonyMode === mode.id ? 'white' : '#333' 
                      }}
                      title={mode.desc}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </td>
              <td className="excel-cell" style={{ color: '#666', fontSize: 10 }}>
                敌人各部位的颜色搭配方式
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

            {/* ========== 🖼️ 伪装设置 ========== */}
            {renderSectionHeader(37, '🖼️', '伪装设置', '#3b82f6')}

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
                  {settings.coverImage && (
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
            {settings.coverImage && (
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
                      src={settings.coverImage} 
                      alt="伪装图片预览" 
                      style={{ maxWidth: '100%', maxHeight: 140, display: 'block' }}
                    />
                  </div>
                </td>
              </tr>
            )}

            {renderEmptyRow(40)}

            {/* 操作说明和恢复默认 */}
            <tr>
              <td className="excel-row-header">41</td>
              <td 
                className="excel-cell" 
                colSpan={5} 
                style={{ 
                  background: '#f3f4f6', 
                  color: '#6b7280',
                  fontSize: 10,
                  paddingLeft: 8,
                }}
              >
                📝 操作说明：Esc = 隐藏/恢复游戏 | P = 暂停 | 点击目标进行射击 | 左上角悬停 3 秒 = 快速隐藏
              </td>
              <td className="excel-cell" colSpan={2}>
                {onResetSettings && (
                  <button
                    onClick={onResetSettings}
                    style={{
                      padding: '6px 12px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    🔄 恢复默认设置
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettingsPanel;

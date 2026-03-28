import React from 'react';
import type { GameSettings, GamePreset, CrosshairStyle } from '../types';
import { GAME_PRESETS } from '../types';
import { generateSimpleColLetters } from '../utils/gridUtils';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onApplyPreset: (preset: GamePreset) => void;
  onStartGame: (mode: 'timed' | 'endless' | 'zen' | 'headshot' | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number) => void;
}

const CROSSHAIR_STYLES: { id: CrosshairStyle; name: string; preview: string }[] = [
  { id: 'cross', name: '十字', preview: '✛' },
  { id: 'dot', name: '点', preview: '●' },
  { id: 'circle', name: '圆', preview: '○' },
  { id: 't-shape', name: 'T 形', preview: '⊥' },
  { id: 'valorant', name: '瓦罗兰特', preview: '╋' },
  { id: 'cs2', name: 'CS2', preview: '╋' },
  { id: 'cf', name: 'CF', preview: '╋' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onApplyPreset,
  onStartGame,
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
      default:
        return (
          <>
            <line x1="12" y1={12 - size / 2} x2="12" y2={12 + size / 2} stroke={color} strokeWidth={2} />
            <line x1={12 - size / 2} y1="12" x2={12 + size / 2} y2="12" stroke={color} strokeWidth={2} />
          </>
        );
    }
  };

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

            <tr>
              <td className="excel-row-header">2</td>
              {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">3</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  background: '#107c41', 
                  color: 'white', 
                  fontWeight: 'bold',
                  paddingLeft: 8,
                }}
              >
                🎮 游戏设置
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">4</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>难度等级</td>
              <td className="excel-cell" colSpan={2}>
                <select
                  className="settings-cell-select"
                  value={settings.difficulty}
                  onChange={(e) => updateSetting('difficulty', e.target.value as GameSettings['difficulty'])}
                >
                  <option value="easy">简单</option>
                  <option value="normal">普通</option>
                  <option value="hard">困难</option>
                  <option value="expert">专家</option>
                </select>
              </td>
              <td className="excel-cell" style={{ color: '#888', fontSize: 10 }}>
                影响：目标生成速度
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            <tr>
              <td className="excel-row-header">5</td>
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
                <strong style={{ color: '#107c41' }}>{settings.spawnRate}</strong>
              </td>
              <td className="excel-cell" style={{ color: '#888', fontSize: 10 }}>
                1=最慢，10=最快
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            <tr>
              <td className="excel-row-header">6</td>
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
                <strong style={{ color: '#107c41' }}>{settings.targetDuration}</strong>
              </td>
              <td className="excel-cell" style={{ color: '#888', fontSize: 10 }}>
                秒数 = 值 × 0.5 + 1
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            <tr>
              <td className="excel-row-header">7</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>目标大小 (px)</td>
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
                <strong style={{ color: '#107c41' }}>{settings.targetSize}px</strong>
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            <tr>
              <td className="excel-row-header">8</td>
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
                <strong style={{ color: '#107c41' }}>{(settings.enemyMoveSpeed || 1.0).toFixed(1)} 格/秒</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>移动模式</td>
              <td className="excel-cell" colSpan={2}>
                <select
                  className="settings-cell-select"
                  value={settings.enemyMovePattern || 'linear'}
                  onChange={(e) => updateSetting('enemyMovePattern', e.target.value as 'linear' | 'sine' | 'bounce')}
                >
                  <option value="linear">直线</option>
                  <option value="sine">正弦波</option>
                  <option value="bounce">弹跳</option>
                </select>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">9</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>敌人显示</td>
              <td className="excel-cell" colSpan={3}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`game-preset-btn ${(settings.enemyRenderMode || 'text') === 'text' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'text')}
                    style={{ background: (settings.enemyRenderMode || 'text') === 'text' ? '#107c41' : '#e5e7eb', color: (settings.enemyRenderMode || 'text') === 'text' ? 'white' : '#333' }}
                  >
                    文字模式
                  </button>
                  <button
                    className={`game-preset-btn ${settings.enemyRenderMode === 'icon' ? 'active' : ''}`}
                    onClick={() => updateSetting('enemyRenderMode', 'icon')}
                    style={{ background: settings.enemyRenderMode === 'icon' ? '#107c41' : '#e5e7eb', color: settings.enemyRenderMode === 'icon' ? 'white' : '#333' }}
                  >
                    图标模式
                  </button>
                </div>
              </td>
              <td className="excel-cell" colSpan={2} style={{ color: '#888', fontSize: 10 }}>
                文字：显示中文部位名称
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">10</td>
              {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">11</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  background: '#107c41', 
                  color: 'white', 
                  fontWeight: 'bold',
                  paddingLeft: 8,
                }}
              >
                🎯 灵敏度设置
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">12</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>游戏预设</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(Object.keys(GAME_PRESETS) as GamePreset[]).map(preset => (
                    <button
                      key={preset}
                      className={`game-preset-btn ${settings.gamePreset === preset ? 'active' : ''}`}
                      onClick={() => applyPreset(preset)}
                      title={`${GAME_PRESETS[preset].name} - X: ${GAME_PRESETS[preset].sensitivityX}, Y: ${GAME_PRESETS[preset].sensitivityY}`}
                    >
                      {GAME_PRESETS[preset].name}
                    </button>
                  ))}
                </div>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">13</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>X 轴灵敏度</td>
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
                <strong style={{ color: '#107c41' }}>{settings.sensitivityX.toFixed(1)}</strong>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>Y 轴灵敏度</td>
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
                <strong style={{ color: '#107c41' }}>{settings.sensitivityY.toFixed(1)}</strong>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">14</td>
              <td className="excel-cell" colSpan={7} style={{ color: '#888', fontSize: 10, fontStyle: 'italic' }}>
                💡 注：本游戏为点击式瞄准训练，灵敏度设置用于模拟不同游戏的鼠标移动手感。预设已配置常用游戏的灵敏度倍率。
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">15</td>
              {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">16</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  background: '#107c41', 
                  color: 'white', 
                  fontWeight: 'bold',
                  paddingLeft: 8,
                }}
              >
                ✨ 准星设置
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">17</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>准星样式</td>
              <td className="excel-cell" colSpan={5}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CROSSHAIR_STYLES.map(style => (
                    <button
                      key={style.id}
                      className={`game-preset-btn ${settings.crosshairStyle === style.id ? 'active' : ''}`}
                      onClick={() => updateSetting('crosshairStyle', style.id)}
                      style={{ minWidth: 70, fontSize: 14, padding: '6px 10px' }}
                      title={style.name}
                    >
                      <span style={{ fontSize: 18, marginRight: 4 }}>{style.preview}</span>
                      <span style={{ fontSize: 11 }}>{style.name}</span>
                    </button>
                  ))}
                </div>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">18</td>
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
                <strong style={{ color: '#107c41' }}>{settings.crosshairSize || 12}px</strong>
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
              <td className="excel-cell" style={{ fontWeight: 500 }}>预览</td>
            </tr>

            <tr>
              <td className="excel-row-header">19</td>
              <td className="excel-cell" style={{ fontWeight: 500 }}>使用准星光标</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={settings.customCursor}
                  onChange={(e) => updateSetting('customCursor', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
              <td className="excel-cell" style={{ color: '#888', fontSize: 10 }}>
                ✓ 启用后隐藏系统鼠标
              </td>
              <td className="excel-cell" colSpan={2}>
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
              <td className="excel-cell" style={{ fontWeight: 500 }}>启用音效</td>
              <td className="excel-cell">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">20</td>
              {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">21</td>
              <td 
                className="excel-cell" 
                colSpan={7} 
                style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  fontWeight: 'bold',
                  paddingLeft: 8,
                }}
              >
                💥 爆头线专项模式
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">22</td>
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
              <td className="excel-cell" style={{ color: '#888', fontSize: 10 }}>
                行号 (1-50)
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            <tr>
              <td className="excel-row-header">23</td>
              {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">24</td>
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
                📝 操作说明：Esc = 紧急隐藏 | F5 = 恢复游戏 | P = 暂停 | 点击目标进行射击 | 左上角悬停 3 秒 = 快速隐藏
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

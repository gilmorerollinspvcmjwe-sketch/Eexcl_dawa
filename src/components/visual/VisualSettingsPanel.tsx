import React, { useState, useCallback } from 'react';
import type { 
  VisualSystemConfig, 
  TextStyleConfig, 
  SpawnAnimationConfig,
  ColorHarmonyMode,
  HSVColorConfig,
} from '../types/visual';
import { 
  DEFAULT_VISUAL_CONFIG, 
  PRESET_COLORS, 
  SPAWN_ANIMATION_PRESETS,
} from '../types/visual';
import { rgbToHex, hexToRgb } from '../utils/colorUtils';
import '../styles/visual-effects.css';

interface VisualSettingsPanelProps {
  config?: VisualSystemConfig;
  onChange?: (config: VisualSystemConfig) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export const VisualSettingsPanel: React.FC<VisualSettingsPanelProps> = ({
  config: externalConfig,
  onChange,
  onApply,
  onReset,
}) => {
  const [config, setConfig] = useState<VisualSystemConfig>(
    externalConfig ?? DEFAULT_VISUAL_CONFIG
  );
  const [activeTab, setActiveTab] = useState<'text' | 'enemy' | 'effects'>('text');

  const updateConfig = useCallback((updates: Partial<VisualSystemConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange?.(newConfig);
  }, [config, onChange]);

  const updateTextStyle = useCallback((updates: Partial<TextStyleConfig>) => {
    updateConfig({
      textStyles: { ...config.textStyles, ...updates },
    });
  }, [config.textStyles, updateConfig]);

  const updateEnemyVisual = useCallback((updates: Partial<typeof config.enemyVisual>) => {
    updateConfig({
      enemyVisual: { ...config.enemyVisual, ...updates },
    });
  }, [config.enemyVisual, updateConfig]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_VISUAL_CONFIG);
    onReset?.();
  }, [onReset]);

  return (
    <div className="visual-settings-panel" style={{
      background: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: 16,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#374151' }}>
          🎨 视觉设置
        </h3>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'text', label: '📝 文本样式' },
            { id: 'enemy', label: '👾 敌人视觉' },
            { id: 'effects', label: '✨ 动态效果' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 6,
                background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
                color: activeTab === tab.id ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'text' && (
        <TextStyleSection 
          config={config.textStyles} 
          onChange={updateTextStyle} 
        />
      )}

      {activeTab === 'enemy' && (
        <EnemyVisualSection 
          config={config.enemyVisual}
          onChange={updateEnemyVisual}
        />
      )}

      {activeTab === 'effects' && (
        <EffectsSection 
          config={config.effects}
          onChange={(effects) => updateConfig({ effects })}
        />
      )}

      <div style={{ 
        marginTop: 16, 
        paddingTop: 16, 
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
      }}>
        <button
          onClick={onApply}
          style={{
            padding: '8px 16px',
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          应用
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
};

const TextStyleSection: React.FC<{
  config: TextStyleConfig;
  onChange: (updates: Partial<TextStyleConfig>) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          颜色
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => onChange({ color: { mode: 'preset', preset: color.id } })}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: config.color.mode === 'preset' && config.color.preset === color.id 
                  ? '2px solid #3b82f6' 
                  : '1px solid #d1d5db',
                background: color.value,
                cursor: 'pointer',
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          字号: {config.fontSize}px
        </label>
        <input
          type="range"
          min={8}
          max={72}
          value={config.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
            字重
          </label>
          <select
            value={config.fontWeight}
            onChange={(e) => onChange({ fontWeight: e.target.value as TextStyleConfig['fontWeight'] })}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #d1d5db',
              fontSize: 13,
            }}
          >
            <option value="normal">常规</option>
            <option value="bold">加粗</option>
            <option value={300}>细体</option>
            <option value={500}>中等</option>
            <option value={700}>粗体</option>
            <option value={900}>黑体</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.fontStyle === 'italic'}
              onChange={(e) => onChange({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
            />
            <span style={{ fontSize: 13 }}>斜体</span>
          </label>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          下划线
        </label>
        <select
          value={config.textDecoration}
          onChange={(e) => onChange({ textDecoration: e.target.value as TextStyleConfig['textDecoration'] })}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            fontSize: 13,
          }}
        >
          <option value="none">无</option>
          <option value="underline">下划线</option>
          <option value="line-through">删除线</option>
        </select>
      </div>

      <div style={{ 
        padding: 12, 
        background: '#f9fafb', 
        borderRadius: 6,
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>预览</div>
        <div style={{
          color: config.color.mode === 'preset' 
            ? PRESET_COLORS.find(c => c.id === config.color.preset)?.value ?? '#dc2626'
            : '#dc2626',
          fontSize: config.fontSize,
          fontWeight: config.fontWeight,
          fontStyle: config.fontStyle,
          textDecoration: config.textDecoration,
          letterSpacing: config.letterSpacing,
        }}>
          示例文本 Sample Text
        </div>
      </div>
    </div>
  );
};

const EnemyVisualSection: React.FC<{
  config: typeof DEFAULT_VISUAL_CONFIG.enemyVisual;
  onChange: (updates: Partial<typeof DEFAULT_VISUAL_CONFIG.enemyVisual>) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          颜色和谐模式
        </label>
        <select
          value={config.colorSystem.harmonyMode}
          onChange={(e) => onChange({
            colorSystem: {
              ...config.colorSystem,
              harmonyMode: e.target.value as ColorHarmonyMode,
            },
          })}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            fontSize: 13,
            width: '100%',
          }}
        >
          <option value="none">无</option>
          <option value="complementary">互补色</option>
          <option value="analogous">类似色</option>
          <option value="triadic">三色组</option>
          <option value="split-complementary">分裂互补</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          色相范围 (H)
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            min={0}
            max={360}
            value={config.colorSystem.baseConfig.h.value ?? 0}
            onChange={(e) => onChange({
              colorSystem: {
                ...config.colorSystem,
                baseConfig: {
                  ...config.colorSystem.baseConfig,
                  h: { mode: 'fixed', value: Number(e.target.value) },
                },
              },
            })}
            style={{
              width: 80,
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid #d1d5db',
              fontSize: 13,
            }}
          />
          <span style={{ fontSize: 12, color: '#6b7280' }}>° (0-360)</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
            饱和度 (S): {config.colorSystem.baseConfig.s.value ?? 80}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.colorSystem.baseConfig.s.value ?? 80}
            onChange={(e) => onChange({
              colorSystem: {
                ...config.colorSystem,
                baseConfig: {
                  ...config.colorSystem.baseConfig,
                  s: { mode: 'fixed', value: Number(e.target.value) },
                },
              },
            })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
            明度 (V): {config.colorSystem.baseConfig.v.value ?? 90}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.colorSystem.baseConfig.v.value ?? 90}
            onChange={(e) => onChange({
              colorSystem: {
                ...config.colorSystem,
                baseConfig: {
                  ...config.colorSystem.baseConfig,
                  v: { mode: 'fixed', value: Number(e.target.value) },
                },
              },
            })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          出现动画
        </label>
        <select
          value={config.spawnAnimation.type}
          onChange={(e) => {
            const preset = SPAWN_ANIMATION_PRESETS[e.target.value];
            if (preset) {
              onChange({ spawnAnimation: preset });
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            fontSize: 13,
            width: '100%',
          }}
        >
          <option value="none">无动画</option>
          <option value="fadeIn">淡入</option>
          <option value="popIn">弹出</option>
          <option value="slideUp">滑入</option>
          <option value="bounceIn">弹跳</option>
          <option value="flashIn">闪烁</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          动画时长: {config.spawnAnimation.duration}ms
        </label>
        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={config.spawnAnimation.duration}
          onChange={(e) => onChange({
            spawnAnimation: {
              ...config.spawnAnimation,
              duration: Number(e.target.value),
            },
          })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ 
        padding: 12, 
        background: '#f9fafb', 
        borderRadius: 6,
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>敌人预览</div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <EnemyPreview config={config} />
        </div>
      </div>
    </div>
  );
};

const EnemyPreview: React.FC<{ config: typeof DEFAULT_VISUAL_CONFIG.enemyVisual }> = ({ config }) => {
  const { h, s, v } = config.colorSystem.baseConfig;
  const hue = h.value ?? 0;
  const sat = s.value ?? 80;
  const val = v.value ?? 90;

  const getHueForPart = (index: number): number => {
    switch (config.colorSystem.harmonyMode) {
      case 'complementary':
        return index === 0 ? hue : (hue + 180) % 360;
      case 'analogous':
        return (hue + index * 30) % 360;
      case 'triadic':
        return (hue + index * 120) % 360;
      case 'split-complementary':
        return index === 0 ? hue : (hue + 150 + (index - 1) * 60) % 360;
      default:
        return hue;
    }
  };

  const hsvToHex = (h: number, s: number, v: number): string => {
    const c = v / 100 * s / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v / 100 - c;
    
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const headColor = hsvToHex(getHueForPart(0), sat, val);
  const bodyColor = hsvToHex(getHueForPart(1), sat, val);
  const handColor = hsvToHex(getHueForPart(2), sat, val);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: headColor,
        margin: '0 auto 2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
      }}>头</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: handColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 10,
        }}>手</div>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: bodyColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
        }}>身</div>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: handColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 10,
        }}>手</div>
      </div>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: bodyColor,
        margin: '2px auto 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 10,
      }}>脚</div>
    </div>
  );
};

const EffectsSection: React.FC<{
  config: typeof DEFAULT_VISUAL_CONFIG.effects;
  onChange: (effects: typeof DEFAULT_VISUAL_CONFIG.effects) => void;
}> = ({ config, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#6b7280', fontSize: 13 }}>
        动态效果配置（开发中）
      </div>
      <div style={{ 
        padding: 16, 
        background: '#f9fafb', 
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          闪烁、渐变、打字机等效果<br />将在后续版本中提供
        </div>
      </div>
    </div>
  );
};

export default VisualSettingsPanel;

# FPS 训练 UI 设计

> 版本：1.0  
> 最后更新：2026-03-28  
> 状态：设计完成，待实现

---

## 1. 训练模式选择界面布局

### 1.1 整体布局结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Excel Aim Trainer                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  📊 统计面板                                                       │ │
│  │  命中率：85%  |  连击：x12  |  得分：1,240                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                     🎮 训练模式选择                               │ │
│  │                                                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │   🎯        │  │   👀        │  │   🔄        │               │ │
│  │  │  移动射击   │  │  拐角射击   │  │  目标切换   │               │ │
│  │  │ MotionTrack │  │  PeekShot   │  │ SwitchTrack │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  │                                                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐                                │ │
│  │  │   ⚡        │  │   🎯        │                                │ │
│  │  │  反应测试   │  │  精准射击   │                                │ │
│  │  │  Reaction   │  │ Precision   │                                │ │
│  │  └─────────────┘  └─────────────┘                                │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ⚙️ 模式配置                                                       │ │
│  │  [根据选中模式显示不同配置项]                                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    ▶ 开始训练                                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 模式按钮排列方式

采用 **3+2 网格布局**：

```css
.training-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

/* 最后一行居中 */
.training-mode-grid > button:nth-last-child(-n+2):first-child:nth-last-child(n+4),
.training-mode-grid > button:nth-last-child(-n+2):first-child:nth-last-child(n+4) ~ button {
  /* 第二行两个按钮居中显示 */
}
```

**按钮尺寸**：
- 宽度：160px
- 高度：100px
- 间距：12px

### 1.3 选中状态视觉反馈

```typescript
interface ModeButtonState {
  default: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    opacity: 1,
    transform: 'scale(1)',
  };
  hover: {
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.3)',
    transform: 'scale(1.02)',
  };
  selected: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    border: '2px solid #60a5fa',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transform: 'scale(1.05)',
  };
  disabled: {
    background: 'rgba(255,255,255,0.02)',
    border: '2px solid rgba(255,255,255,0.1)',
    opacity: 0.5,
    cursor: 'not-allowed',
  };
}
```

**动画效果**：
- 悬停：0.2s ease-out
- 选中：0.3s ease-out + 脉冲光晕
- 点击：0.1s scale(0.98)

### 1.4 模式说明文本显示

每个模式按钮包含：

```tsx
<div className="mode-button">
  <span className="mode-icon" style={{ fontSize: 32 }}>🎯</span>
  <span className="mode-name" style={{ fontSize: 14, fontWeight: 600 }}>移动射击</span>
  <span className="mode-desc" style={{ fontSize: 11, color: '#94a3b8' }}>追踪移动目标</span>
</div>
```

**选中时显示详细说明**：

```tsx
{selectedMode && (
  <div className="mode-detail-panel">
    <h4>{selectedMode.name}</h4>
    <p>{selectedMode.fullDescription}</p>
    <div className="mode-stats">
      <span>⏱️ 推荐时长：60-90 秒</span>
      <span>📈 训练目标：跟枪能力</span>
      <span>⭐ 难度：中等</span>
    </div>
  </div>
)}
```

---

## 2. 训练配置面板

### 2.1 配置面板布局

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ 移动射击 配置                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  移动模式                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  直线    │  │ 正弦波   │  │  弹跳    │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
│  移动速度：快速 ████████░░ 2.0 格/秒                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░        │    │
│  └────────────────────────────────────────────────────────┘    │
│  慢速        正常        快速        极速                       │
│                                                                 │
│  训练时长：60 秒                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ████████████████████████████████░░░░░░░░░░░░          │    │
│  └────────────────────────────────────────────────────────┘    │
│  30s         60s         90s        120s                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👁️ 实时预览                                             │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                                                 │   │   │
│  │  │         ┌───┐                                   │   │   │
│  │  │         │目标│  → → → → → → →                   │   │   │
│  │  │         └───┘                                   │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 各模式配置项

#### 2.2.1 Motion Track 配置

| 配置项 | 类型 | 选项 | 默认值 |
|--------|------|------|--------|
| 移动模式 | 按钮组 | 直线/正弦波/弹跳 | 直线 |
| 移动速度 | 滑块 | slow/normal/fast/extreme | normal |
| 训练时长 | 滑块 | 30/60/90/120 秒 | 60 秒 |

#### 2.2.2 Peek Shot 配置

| 配置项 | 类型 | 选项 | 默认值 |
|--------|------|------|--------|
| 停留时间 | 按钮组 | 长/中/短/闪烁 | 中 |
| 探头间隔 | 滑块 | 1.5/2/2.5/3 秒 | 2.5 秒 |
| 目标数量 | 滑块 | 1/2/3/4 | 1 |

#### 2.2.3 Switch Track 配置

| 配置项 | 类型 | 选项 | 默认值 |
|--------|------|------|--------|
| 目标数量 | 滑块 | 2/3/4/5 | 3 |
| 显示优先级 | 复选框 | ✓/✗ | ✓ |
| 错误惩罚 | 单选 | 重置/扣分 | 重置 |

#### 2.2.4 Reaction 配置

| 配置项 | 类型 | 选项 | 默认值 |
|--------|------|------|--------|
| 测试轮数 | 滑块 | 3/5/10/15 | 5 |
| 警告时间 | 滑块 | 0.5/1/1.5/2 秒 | 1.5 秒 |

#### 2.2.5 Precision 配置

| 配置项 | 类型 | 选项 | 默认值 |
|--------|------|------|--------|
| 目标缩放 | 滑块 | 25%/50%/75%/100% | 50% |
| 目标数量 | 滑块 | 1/2/3/4/5 | 3 |
| 目标移动 | 复选框 | 静止/移动 | 静止 |

### 2.3 UI 组件样式

#### 滑块组件

```tsx
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  marks: { value: number; label: string }[];
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, marks, onChange }) => (
  <div className="slider-container">
    <label className="slider-label">
      {label}: <span className="slider-value">{value}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider-input"
    />
    <div className="slider-marks">
      {marks.map((mark) => (
        <span
          key={mark.value}
          className={`mark ${mark.value === value ? 'active' : ''}`}
        >
          {mark.label}
        </span>
      ))}
    </div>
  </div>
);
```

**滑块样式**：

```css
.slider-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  outline: none;
  -webkit-appearance: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #60a5fa;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: transform 0.1s;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
}

.slider-marks .mark.active {
  color: #3b82f6;
  font-weight: 600;
}
```

#### 按钮组组件

```tsx
interface ButtonGroupProps {
  options: { value: string; label: string; icon?: string }[];
  selected: string;
  onChange: (value: string) => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, selected, onChange }) => (
  <div className="button-group">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`group-btn ${selected === option.value ? 'active' : ''}`}
      >
        {option.icon && <span className="btn-icon">{option.icon}</span>}
        <span>{option.label}</span>
      </button>
    ))}
  </div>
);
```

**按钮组样式**：

```css
.button-group {
  display: flex;
  gap: 6px;
}

.group-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-btn:hover {
  background: rgba(255,255,255,0.1);
}

.group-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #60a5fa;
}
```

### 2.4 实时预览区域

```tsx
interface PreviewProps {
  mode: FPSTrainingMode;
  config: any;
}

const PreviewPanel: React.FC<PreviewProps> = ({ mode, config }) => {
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span>👁️</span>
        <span>实时预览</span>
      </div>
      <div className="preview-canvas">
        {/* 根据模式和配置渲染简化预览 */}
        <PreviewRenderer mode={mode} config={config} />
      </div>
    </div>
  );
};
```

**预览区域样式**：

```css
.preview-panel {
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.preview-canvas {
  width: 100%;
  height: 120px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
```

---

## 3. 训练 HUD 设计

### 3.1 HUD 布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  训练 HUD                                                         │ │
│  │                                                                   │ │
│  │  ┌─────────┐                              ┌─────────────────┐    │ │
│  │  │ ⏱️ 45.2s │                              │ 🎯 目标：3/10   │    │ │
│  │  └─────────┘                              └─────────────────┘    │ │
│  │                                                                   │ │
│  │         ┌─────────────────────────────────────────────┐          │ │
│  │         │              🔥 连击 x12                    │          │ │
│  │         │              ████████████░░░░ 87%           │          │ │
│  │         └─────────────────────────────────────────────┘          │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐                    ┌─────────────────────┐  │ │
│  │  │ 💯 命中率：85%  │                    │ 📊 当前评分：A      │  │ │
│  │  └─────────────────┘                    └─────────────────────┘  │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 HUD 信息元素

| 元素 | 位置 | 内容 | 字体大小 | 颜色 |
|------|------|------|---------|------|
| 计时器 | 左上 | ⏱️ 45.2s | 20px | #ffffff |
| 目标进度 | 右上 | 🎯 3/10 | 16px | #94a3b8 |
| 连击显示 | 中上 | 🔥 x12 + 进度条 | 24px | #f97316 |
| 命中率 | 左下 | 💯 85% | 16px | #22c55e |
| 当前评分 | 右下 | 📊 A | 16px | #3b82f6 |

### 3.3 连击进度条

```tsx
interface ComboDisplayProps {
  combo: number;
  maxCombo: number;
  accuracy: number;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo, maxCombo, accuracy }) => {
  const percentage = (combo / maxCombo) * 100;
  
  return (
    <div className="combo-display">
      <div className="combo-count">
        <span className="combo-icon">🔥</span>
        <span className="combo-number">x{combo}</span>
      </div>
      <div className="combo-bar">
        <div 
          className="combo-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="combo-accuracy">
        {accuracy.toFixed(0)}%
      </div>
    </div>
  );
};
```

**连击样式**：

```css
.combo-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.combo-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  font-weight: 700;
  color: #f97316;
  text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
}

.combo-bar {
  width: 200px;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.combo-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316 0%, #ef4444 100%);
  transition: width 0.2s;
}

.combo-accuracy {
  font-size: 12px;
  color: #94a3b8;
}
```

### 3.4 优先级计时器（Switch Track 模式）

```tsx
interface PriorityTimerProps {
  priority: Priority;
  remaining: number; // ms
  total: number; // ms
}

const PriorityTimer: React.FC<PriorityTimerProps> = ({ priority, remaining, total }) => {
  const config = PRIORITY_CONFIG[priority];
  const percentage = (remaining / total) * 100;
  const isWarning = percentage < 30;
  
  return (
    <div className={`priority-timer ${isWarning ? 'warning' : ''}`}>
      <div className="priority-icon">{config.icon}</div>
      <div className="priority-bar">
        <div 
          className="priority-fill"
          style={{ 
            width: `${percentage}%`,
            background: config.color,
          }}
        />
      </div>
      <div className="priority-time">
        {(remaining / 1000).toFixed(1)}s
      </div>
    </div>
  );
};
```

**优先级计时器样式**：

```css
.priority-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0,0,0,0.5);
  border-radius: 6px;
  animation: pulse 1s infinite;
}

.priority-timer.warning {
  animation: pulse 0.5s infinite;
}

.priority-bar {
  width: 100px;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.priority-fill {
  height: 100%;
  transition: width 0.1s linear;
}

.priority-time {
  font-size: 12px;
  font-weight: 600;
  color: white;
  min-width: 35px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 3.5 反应时间显示（Reaction 模式）

```tsx
interface ReactionTimerProps {
  isWaiting: boolean;
  isReady: boolean;
  reactionTime?: number;
}

const ReactionTimer: React.FC<ReactionTimerProps> = ({ isWaiting, isReady, reactionTime }) => {
  if (isWaiting) {
    return (
      <div className="reaction-waiting">
        <span>⏳ 准备...</span>
      </div>
    );
  }
  
  if (isReady) {
    return (
      <div className="reaction-ready">
        <span className="ready-text">点击!</span>
      </div>
    );
  }
  
  if (reactionTime !== undefined) {
    const rating = getReactionRating(reactionTime);
    return (
      <div className="reaction-result">
        <span className="reaction-time">{reactionTime}ms</span>
        <span className="reaction-rating" style={{ color: rating.color }}>
          {rating.rating}
        </span>
      </div>
    );
  }
  
  return null;
};
```

---

## 4. 训练报告界面

### 4.1 整体布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         训练完成！                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  模式：移动射击 (Motion Track)                  难度：Hard        │ │
│  │  时间：2026-03-28 14:30                         持续：90 秒        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  总得分      │  │  命中率      │  │  最高连击    │  │  评级      │ │
│  │              │  │              │  │              │  │            │ │
│  │   1,850      │  │    87%       │  │     x24      │  │     A      │ │
│  │              │  │              │  │              │  │            │ │
│  │  ▲ +230      │  │  ▲ +5%       │  │  ▲ +8        │  │  前 15%    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  📊 详细统计                                                       │ │
│  │                                                                   │ │
│  │  • 总射击：120 次    • 命中：104 次    • 失误：16 次               │ │
│  │  • 追踪准确率：82%   • 平均瞄准时间：1.2s                          │ │
│  │  • 爆头率：N/A       • 平均反应时间：N/A                           │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  📈 得分趋势（近 10 次训练）                                        │ │
│  │                                                                   │ │
│  │     2200 ┤                              ●                         │ │
│  │     2000 ┤                    ●         │                         │ │
│  │     1800 ┤          ●    ●    │    ●────┘                         │ │
│  │     1600 ┤    ●     │    │    │                                  │ │
│  │     1400 ┤────┴─────┴────┴────┴─────────────────────────────────  │ │
│  │           1    2    3    4    5    6    7    8    9    10         │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  🎯 准确率雷达图                                                   │ │
│  │                                                                   │ │
│  │            精准度                                                 │ │
│  │               ●                                                   │ │
│  │              / \                                                  │ │
│  │             /   \                                                 │ │
│  │    反应 ●───     ───● 追踪                                       │ │
│  │            \     /                                                │ │
│  │             \   /                                                 │ │
│  │              \ /                                                  │ │
│  │               ●                                                   │ │
│  │            稳定性                                                 │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  💡 改进建议                                                       │ │
│  │                                                                   │ │
│  │  ⚠️ 追踪准确率有提升空间                                          │ │
│  │     当前 82%，建议尝试 Normal 难度巩固基础                         │ │
│  │                                                                   │ │
│  │  ✓ 连击能力优秀                                                   │ │
│  │     最高 24 连击，超过 80% 的玩家                                   │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  [🔄 重新训练]  [🎮 更换模式]  [📊 详细分析]  [📤 分享成绩]       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 统计卡片布局

```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, delta, icon, color }) => (
  <div className="stat-card">
    <div className="stat-header">
      {icon && <span className="stat-icon">{icon}</span>}
      <span className="stat-title">{title}</span>
    </div>
    <div className="stat-value" style={{ color }}>
      {value}
    </div>
    {delta !== undefined && (
      <div className={`stat-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
      </div>
    )}
  </div>
);
```

**统计卡片样式**：

```css
.stat-card {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  min-width: 140px;
  text-align: center;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-delta {
  font-size: 12px;
  font-weight: 600;
}

.stat-delta.positive {
  color: #22c55e;
}

.stat-delta.negative {
  color: #ef4444;
}
```

### 4.3 得分趋势图

使用 SVG 或 Canvas 绘制折线图：

```tsx
interface TrendChartProps {
  data: number[];
  width: number;
  height: number;
  personalBest?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, width, height, personalBest }) => {
  const max = Math.max(...data, personalBest ?? 0);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="trend-chart">
      {/* 网格线 */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={0}
          y1={height * ratio}
          x2={width}
          y2={height * ratio}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}
      
      {/* 个人最佳线 */}
      {personalBest && (
        <line
          x1={0}
          y1={height - ((personalBest - min) / range) * height}
          x2={width}
          y2={height - ((personalBest - min) / range) * height}
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}
      
      {/* 数据折线 */}
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 数据点 */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={4}
            fill="#60a5fa"
            stroke="#1e293b"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
};
```

### 4.4 准确率雷达图

```tsx
interface RadarChartProps {
  stats: {
    accuracy: number;
    reaction: number;
    tracking: number;
    stability: number;
    precision: number;
  };
  size: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ stats, size }) => {
  const center = size / 2;
  const radius = size * 0.35;
  const labels = ['精准度', '反应', '追踪', '稳定性', '命中率'];
  const values = [stats.precision, stats.reaction, stats.tracking, stats.stability, stats.accuracy];
  
  const angleStep = (Math.PI * 2) / values.length;
  const points = values.map((value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });
  
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  return (
    <svg width={size} height={size} className="radar-chart">
      {/* 背景网格 */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={values.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const r = ratio * radius;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}
      
      {/* 轴线 */}
      {values.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        );
      })}
      
      {/* 数据区域 */}
      <polygon
        points={polygonPoints}
        fill="rgba(59, 130, 246, 0.3)"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      
      {/* 数据点 */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="#60a5fa"
          stroke="#1e293b"
          strokeWidth={2}
        />
      ))}
      
      {/* 标签 */}
      {labels.map((label, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const labelRadius = radius + 15;
        return (
          <text
            key={index}
            x={center + labelRadius * Math.cos(angle)}
            y={center + labelRadius * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize={11}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};
```

### 4.5 改进建议卡片

```tsx
interface SuggestionCardProps {
  category: 'accuracy' | 'reaction' | 'priority' | 'consistency' | 'encouragement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  tip?: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  category, priority, title, description, tip 
}) => {
  const icons = {
    accuracy: '🎯',
    reaction: '⚡',
    priority: '🔴',
    consistency: '📊',
    encouragement: '✓',
  };
  
  const priorityColors = {
    high: '#ef4444',
    medium: '#f97316',
    low: '#22c55e',
  };
  
  return (
    <div className="suggestion-card">
      <div className="suggestion-header">
        <span className="suggestion-icon">{icons[category]}</span>
        <span className="suggestion-title">{title}</span>
        <span 
          className="suggestion-priority"
          style={{ color: priorityColors[priority] }}
        >
          {priority === 'high' ? '⚠️' : priority === 'medium' ? '📌' : '💡'}
        </span>
      </div>
      <p className="suggestion-description">{description}</p>
      {tip && (
        <div className="suggestion-tip">
          💡 {tip}
        </div>
      )}
    </div>
  );
};
```

**建议卡片样式**：

```css
.suggestion-card {
  background: rgba(30, 41, 59, 0.5);
  border-left: 4px solid;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.suggestion-card:nth-child(1) {
  border-color: #ef4444;
}

.suggestion-card:nth-child(2) {
  border-color: #f97316;
}

.suggestion-card:nth-child(3) {
  border-color: #22c55e;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-icon {
  font-size: 18px;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.suggestion-description {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.suggestion-tip {
  font-size: 12px;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
}
```

### 4.6 操作按钮

```tsx
interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, variant = 'secondary' }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      border: 'none',
    },
    secondary: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid #3b82f6',
    },
  };
  
  return (
    <button 
      className="action-button"
      onClick={onClick}
      style={variants[variant]}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  );
};
```

**按钮组样式**：

```css
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.action-button:active {
  transform: translateY(0);
}
```

---

## 5. 响应式设计

### 5.1 断点配置

```css
/* 移动端 */
@media (max-width: 640px) {
  .training-mode-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    min-width: 100px;
    padding: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}

/* 平板 */
@media (max-width: 1024px) {
  .training-mode-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .report-grid {
    grid-template-columns: 1fr;
  }
}

/* 桌面 */
@media (min-width: 1025px) {
  .training-mode-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .report-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 5.2 深色主题

```css
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-blue: #3b82f6;
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-orange: #f97316;
  --accent-yellow: #eab308;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## 6. 交互状态总结

### 6.1 模式选择状态

| 状态 | 触发 | 效果 |
|------|------|------|
| 默认 | 无 | 半透明背景，无边框 |
| 悬停 | 鼠标移入 | 背景变亮，轻微缩放 |
| 选中 | 点击 | 蓝色渐变，光晕效果 |
| 禁用 | 训练中 | 半透明，不可点击 |

### 6.2 配置调整状态

| 状态 | 触发 | 效果 |
|------|------|------|
| 默认 | 无 | 正常显示 |
| 调整中 | 拖动滑块 | 实时更新预览 |
| 完成 | 释放滑块 | 保存配置 |

### 6.3 训练中状态

| 状态 | 触发 | 效果 |
|------|------|------|
| 正常 | 训练中 | HUD 显示 |
| 暂停 | 按 ESC | 暂停覆盖层 |
| 结束 | 时间到 | 报告界面 |

### 6.4 报告状态

| 状态 | 触发 | 效果 |
|------|------|------|
| 加载 | 刚完成 | 淡入动画 |
| 查看 | 查看中 | 可交互图表 |
| 操作 | 点击按钮 | 对应动作 |

---

*文档结束*

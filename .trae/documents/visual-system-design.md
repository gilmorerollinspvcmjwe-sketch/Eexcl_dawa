# 游戏视觉系统设计方案

## 一、系统概述

### 1.1 设计目标
为 Excel Aim Trainer 游戏构建一套完整的视觉表现系统，支持多样化的文本样式、动态效果和敌人视觉表现，提升游戏的可定制性和视觉吸引力。

### 1.2 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    视觉系统架构                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 文本样式系统 │  │ 动态效果系统 │  │ 敌人视觉系统        │  │
│  │ TextStyle   │  │ Animation   │  │ EnemyVisual        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴──────┐      │
│  │              视觉配置管理器                        │      │
│  │         VisualConfigManager                       │      │
│  └─────────────────────┬─────────────────────────────┘      │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────┐      │
│  │              渲染引擎适配层                        │      │
│  │         (CSS / Canvas / SVG)                      │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、文本样式系统

### 2.1 功能需求

| 功能 | 参数范围 | 默认值 |
|------|----------|--------|
| 颜色 | 预设色板 + RGB输入 | #dc2626 |
| 字体粗细 | normal / bold / 100-900 | bold |
| 字号 | 8px - 72px | 14px |
| 斜体 | true / false | false |
| 下划线 | none / solid / dashed / dotted | none |
| 字间距 | -2px - 10px | 0px |
| 文字阴影 | 可配置偏移/模糊/颜色 | 默认阴影 |

### 2.2 类型定义

```typescript
interface TextStyleConfig {
  color: ColorConfig;
  fontWeight: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontSize: number; // 8-72
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textDecorationStyle?: 'solid' | 'dashed' | 'dotted';
  letterSpacing: number; // -2 to 10
  textShadow?: TextShadowConfig;
}

interface ColorConfig {
  mode: 'preset' | 'custom';
  preset?: string; // 预设颜色ID
  custom?: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
    a?: number; // 0-1
  };
}

interface TextShadowConfig {
  offsetX: number; // -10 to 10
  offsetY: number; // -10 to 10
  blur: number; // 0 to 20
  color: string;
}
```

### 2.3 预设色板

```typescript
const PRESET_COLORS = [
  { id: 'red', name: '红色', value: '#dc2626' },
  { id: 'orange', name: '橙色', value: '#f97316' },
  { id: 'yellow', name: '黄色', value: '#eab308' },
  { id: 'green', name: '绿色', value: '#22c55e' },
  { id: 'cyan', name: '青色', value: '#06b6d4' },
  { id: 'blue', name: '蓝色', value: '#3b82f6' },
  { id: 'purple', name: '紫色', value: '#8b5cf6' },
  { id: 'pink', name: '粉色', value: '#ec4899' },
  { id: 'white', name: '白色', value: '#ffffff' },
  { id: 'black', name: '黑色', value: '#000000' },
];
```

---

## 三、动态文本效果系统

### 3.1 效果类型

#### 3.1.1 闪烁效果 (Blink)
```typescript
interface BlinkEffect {
  type: 'blink';
  frequency: number; // 0.5-3 Hz
  minOpacity: number; // 0-1, default 0.3
  maxOpacity: number; // 0-1, default 1
  colorShift?: {
    fromColor: string;
    toColor: string;
  };
}
```

#### 3.1.2 渐变色彩效果 (Gradient)
```typescript
interface GradientEffect {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  colors: Array<{
    color: string;
    position: number; // 0-100%
  }>;
  angle?: number; // 0-360, for linear
  animated?: boolean;
  animationSpeed?: number; // 1-10
  animationDirection?: 'forward' | 'reverse' | 'alternate';
}
```

#### 3.1.3 打字机效果 (Typewriter)
```typescript
interface TypewriterEffect {
  type: 'typewriter';
  speed: number; // 5-50 字符/秒
  cursor?: {
    show: boolean;
    char: string; // '|' or '_' etc.
    blinkSpeed: number; // Hz
  };
  onComplete?: 'hide' | 'stay' | 'loop';
  delay?: number; // 开始延迟 ms
}
```

#### 3.1.4 额外效果类型
```typescript
interface WaveEffect {
  type: 'wave';
  amplitude: number; // 1-20px
  frequency: number; // 0.5-5
  direction: 'horizontal' | 'vertical';
}

interface GlitchEffect {
  type: 'glitch';
  intensity: number; // 1-10
  colorOffset: string;
  frequency: number;
}

interface BounceEffect {
  type: 'bounce';
  height: number; // 5-50px
  speed: number; // 0.5-3
}
```

### 3.2 效果组合

```typescript
interface TextEffectConfig {
  effects: Array<BlinkEffect | GradientEffect | TypewriterEffect | WaveEffect | GlitchEffect>;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  globalTiming?: 'sync' | 'stagger' | 'random';
}
```

---

## 四、敌人视觉系统

### 4.1 随机颜色生成系统

#### 4.1.1 HSV色彩空间配置
```typescript
interface HSVColorConfig {
  h: {
    mode: 'fixed' | 'random' | 'range';
    value?: number; // 0-360
    range?: [number, number]; // [min, max]
  };
  s: {
    mode: 'fixed' | 'random' | 'range';
    value?: number; // 0-100
    range?: [number, number];
  };
  v: {
    mode: 'fixed' | 'random' | 'range';
    value?: number; // 0-100
    range?: [number, number];
  };
}

interface RandomColorGenerator {
  baseConfig: HSVColorConfig;
  variations: {
    head: Partial<HSVColorConfig>;
    body: Partial<HSVColorConfig>;
    hands: Partial<HSVColorConfig>;
    foot: Partial<HSVColorConfig>;
  };
  harmonyMode: 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'none';
}
```

#### 4.1.2 颜色和谐模式
```typescript
const COLOR_HARMONY_PRESETS = {
  complementary: (baseH: number) => [baseH, (baseH + 180) % 360],
  analogous: (baseH: number) => [baseH, (baseH + 30) % 360, (baseH + 330) % 360],
  triadic: (baseH: number) => [baseH, (baseH + 120) % 360, (baseH + 240) % 360],
  splitComplementary: (baseH: number) => [baseH, (baseH + 150) % 360, (baseH + 210) % 360],
};
```

### 4.2 闪烁出现动画

#### 4.2.1 动画类型配置
```typescript
interface SpawnAnimationConfig {
  type: 'fade' | 'scale' | 'slide' | 'bounce' | 'flip' | 'custom';
  duration: number; // 100-2000ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  customEasing?: [number, number, number, number]; // bezier control points
  
  // 组合效果
  combine?: {
    fade: boolean;
    scale: { from: number; to: number };
    translate?: { x: number; y: number };
    rotate?: { from: number; to: number };
  };
  
  // 闪烁参数
  flash?: {
    count: number; // 闪烁次数
    interval: number; // 间隔ms
    colors: string[]; // 闪烁颜色序列
  };
}
```

#### 4.2.2 预设动画模板
```typescript
const SPAWN_ANIMATION_PRESETS: Record<string, SpawnAnimationConfig> = {
  fadeIn: {
    type: 'fade',
    duration: 300,
    easing: 'ease-out',
  },
  popIn: {
    type: 'scale',
    duration: 250,
    easing: 'cubic-bezier',
    customEasing: [0.175, 0.885, 0.32, 1.275],
    combine: { fade: true, scale: { from: 0, to: 1 } },
  },
  slideUp: {
    type: 'slide',
    duration: 400,
    easing: 'ease-out',
    combine: { 
      fade: true, 
      scale: { from: 1, to: 1 },
      translate: { x: 0, y: 30 } 
    },
  },
  bounceIn: {
    type: 'bounce',
    duration: 600,
    easing: 'ease-out',
    combine: { fade: true, scale: { from: 0.3, to: 1 } },
  },
  flashIn: {
    type: 'fade',
    duration: 500,
    easing: 'ease-out',
    flash: { count: 3, interval: 80, colors: ['#fff', '#dc2626', '#f97316'] },
  },
};
```

### 4.3 敌人完整视觉配置

```typescript
interface EnemyVisualConfig {
  // 基础样式
  baseStyle: TextStyleConfig;
  
  // 部位特定样式
  partStyles: {
    head: Partial<TextStyleConfig>;
    body: Partial<TextStyleConfig>;
    leftHand: Partial<TextStyleConfig>;
    rightHand: Partial<TextStyleConfig>;
    foot: Partial<TextStyleConfig>;
  };
  
  // 颜色系统
  colorSystem: RandomColorGenerator;
  
  // 出现动画
  spawnAnimation: SpawnAnimationConfig;
  
  // 状态动画
  stateAnimations: {
    damaged: AnimationConfig;
    critical: AnimationConfig;
    dying: AnimationConfig;
  };
  
  // 持续效果
  idleEffects: TextEffectConfig;
}
```

---

## 五、参数配置界面设计

### 5.1 界面布局

```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 视觉设置面板                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📝 文本样式                                              │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│ │ │ 颜色选择器  │ │ 字号滑块    │ │ 字重选择    │        │ │
│ │ │ [预设/RGB] │ │ [8 ──── 72]│ │ [常规/加粗] │        │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘        │ │
│ │ ┌─────────────┐ ┌─────────────┐                        │ │
│ │ │ □ 斜体     │ │ 下划线样式  │                        │ │
│ │ └─────────────┘ └─────────────┘                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✨ 动态效果                                              │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 效果类型: [闪烁 ▼] [渐变 ▼] [打字机 ▼] [添加]    │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 闪烁频率: [●────────] 1.5 Hz                      │   │ │
│ │ │ 透明度:   [────●────] 0.3 - 1.0                   │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👾 敌人视觉                                              │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 颜色模式: [随机 ▼]                                │   │ │
│ │ │ 色相范围: [0 ──────── 360]                        │   │ │
│ │ │ 饱和度:   [50 ──────── 100]                       │   │ │
│ │ │ 明度:     [60 ──────── 100]                       │   │ │
│ │ │ 和谐模式: [互补色 ▼]                              │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 出现动画: [弹出 ▼]                                │   │ │
│ │ │ 动画时长: [────●────] 300ms                       │   │ │
│ │ │ □ 启用闪烁效果                                   │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [预览区域 - 实时展示效果]                               │ │
│ │                                                         │ │
│ │        ┌───┐                                            │ │
│ │        │头 │  ← 动态预览敌人                            │ │
│ │      ┌─┼───┼─┐                                          │ │
│ │      │手│身 │手│                                        │ │
│ │      └─┴───┴─┘                                          │ │
│ │        │脚 │                                            │ │
│ │        └───┘                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [应用] [重置] [导出配置] [导入配置]                         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 组件结构

```typescript
interface VisualSettingsPanelProps {
  config: VisualSystemConfig;
  onChange: (config: VisualSystemConfig) => void;
  onApply: () => void;
  onReset: () => void;
}

const VisualSettingsPanel: React.FC<VisualSettingsPanelProps> = ({
  config,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <div className="visual-settings-panel">
      <TextStyleSection />
      <DynamicEffectsSection />
      <EnemyVisualSection />
      <PreviewArea />
      <ActionButtons />
    </div>
  );
};
```

---

## 六、性能优化策略

### 6.1 CSS动画优化

```css
/* 使用 transform 和 opacity 实现GPU加速 */
.enemy-animate {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 使用 CSS变量实现动态样式 */
.enemy-part {
  --enemy-color: var(--base-color);
  --enemy-scale: 1;
  --enemy-opacity: 1;
  
  color: var(--enemy-color);
  transform: scale(var(--enemy-scale));
  opacity: var(--enemy-opacity);
  transition: 
    color 0.15s ease-out,
    transform 0.15s ease-out,
    opacity 0.15s ease-out;
}
```

### 6.2 动画帧率控制

```typescript
class AnimationFrameController {
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / this.targetFPS;
  private lastFrameTime: number = 0;
  
  shouldRender(currentTime: number): boolean {
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed >= this.frameInterval) {
      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
      return true;
    }
    return false;
  }
  
  setTargetFPS(fps: number): void {
    this.targetFPS = Math.min(60, Math.max(15, fps));
    this.frameInterval = 1000 / this.targetFPS;
  }
}
```

### 6.3 效果实例池化

```typescript
class EffectInstancePool {
  private pool: Map<string, EffectInstance[]> = new Map();
  private maxPoolSize: number = 50;
  
  acquire<T extends EffectInstance>(type: string): T {
    const instances = this.pool.get(type) || [];
    if (instances.length > 0) {
      return instances.pop() as T;
    }
    return this.createInstance(type) as T;
  }
  
  release(type: string, instance: EffectInstance): void {
    const instances = this.pool.get(type) || [];
    if (instances.length < this.maxPoolSize) {
      instance.reset();
      instances.push(instance);
      this.pool.set(type, instances);
    }
  }
}
```

### 6.4 懒加载与虚拟化

```typescript
// 仅渲染可见区域内的敌人效果
const useVisibleEffects = (effects: Effect[], viewport: Viewport) => {
  return useMemo(() => {
    return effects.filter(effect => 
      isInViewport(effect.position, viewport)
    );
  }, [effects, viewport]);
};
```

---

## 七、与现有系统集成方案

### 7.1 集成点分析

| 现有模块 | 集成方式 | 影响范围 |
|---------|---------|---------|
| MultiGridEnemyRenderer | 注入视觉配置 | 敌人渲染 |
| useMultiGridEnemy | 扩展敌人数据结构 | 敌人状态管理 |
| SettingsContext | 新增视觉配置字段 | 全局设置 |
| GameSettings类型 | 扩展类型定义 | 类型系统 |
| index.css | 新增动画类 | 样式系统 |

### 7.2 数据流设计

```
┌─────────────────┐
│ SettingsContext │ ← 存储视觉配置
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ VisualConfigMgr │ ← 配置解析与验证
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useMultiGridEnemy│ ← 应用到敌人实例
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ EnemyRenderer   │ ← 最终渲染
└─────────────────┘
```

### 7.3 扩展现有类型

```typescript
// 扩展 GameSettings
interface GameSettings {
  // ... 现有字段
  
  // 新增视觉系统配置
  visualConfig?: VisualSystemConfig;
}

// 扩展 MultiGridEnemy
interface MultiGridEnemy {
  // ... 现有字段
  
  // 新增视觉属性
  visualOverride?: Partial<EnemyVisualConfig>;
  spawnAnimationProgress?: number;
  currentAnimation?: ActiveAnimation;
}
```

### 7.4 向后兼容

```typescript
// 默认配置保持现有行为
const DEFAULT_VISUAL_CONFIG: VisualSystemConfig = {
  textStyles: {
    color: { mode: 'preset', preset: 'red' },
    fontWeight: 'bold',
    fontSize: 14,
    fontStyle: 'normal',
    textDecoration: 'none',
  },
  effects: [],
  enemyVisual: {
    colorSystem: {
      baseConfig: { h: { mode: 'fixed', value: 0 }, s: { mode: 'fixed', value: 80 }, v: { mode: 'fixed', value: 90 } },
      harmonyMode: 'none',
    },
    spawnAnimation: SPAWN_ANIMATION_PRESETS.popIn,
  },
};
```

---

## 八、技术实现建议

### 8.1 推荐技术栈

| 功能 | 技术方案 | 理由 |
|------|---------|------|
| 文本样式 | CSS-in-JS + CSS变量 | 动态性强，性能好 |
| 动画效果 | CSS Keyframes + requestAnimationFrame | 兼顾简单动画和复杂动画 |
| 颜色计算 | color库 / 自定义HSV转换 | 轻量级，精确控制 |
| 配置存储 | localStorage + JSON | 持久化，简单可靠 |

### 8.2 文件结构

```
src/
├── types/
│   └── visual.ts              # 视觉系统类型定义
├── utils/
│   ├── colorUtils.ts          # 颜色处理工具
│   ├── animationUtils.ts      # 动画工具函数
│   └── visualConfigUtils.ts   # 配置解析工具
├── hooks/
│   └── useVisualSystem.ts     # 视觉系统主Hook
├── components/
│   ├── visual/
│   │   ├── VisualSettingsPanel.tsx    # 设置面板
│   │   ├── TextStyleEditor.tsx        # 文本样式编辑器
│   │   ├── EffectEditor.tsx           # 效果编辑器
│   │   ├── EnemyVisualEditor.tsx      # 敌人视觉编辑器
│   │   └── VisualPreview.tsx          # 预览组件
│   └── grid/
│       └── MultiGridEnemyRenderer.tsx # 修改：集成视觉系统
└── styles/
    └── visual-effects.css     # 动画样式定义
```

### 8.3 实现优先级

| 优先级 | 功能模块 | 预计工时 |
|--------|---------|---------|
| P0 | 类型定义与基础架构 | 4h |
| P0 | 文本样式系统核心 | 6h |
| P1 | 敌人颜色系统 | 8h |
| P1 | 出现动画系统 | 6h |
| P2 | 动态文本效果 | 10h |
| P2 | 配置界面 | 8h |
| P3 | 性能优化 | 4h |
| P3 | 测试与文档 | 4h |

---

## 九、资源需求评估

### 9.1 开发资源

| 角色 | 工作内容 | 预计工时 |
|------|---------|---------|
| 前端开发 | 核心功能实现 | 40h |
| UI设计 | 配置界面设计 | 8h |
| 测试 | 功能测试与性能测试 | 8h |

### 9.2 技术依赖

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "color": "^4.2.0"
  },
  "devDependencies": {
    "@types/color": "^3.0.0"
  }
}
```

### 9.3 性能影响评估

| 指标 | 预期影响 | 优化后 |
|------|---------|--------|
| 首次渲染 | +5-10ms | +2-3ms |
| 内存占用 | +2-5MB | +1-2MB |
| 动画帧率 | 稳定60fps | 稳定60fps |
| 配置加载 | <50ms | <20ms |

---

## 十、实施计划

### Phase 1: 基础架构 (Week 1)
- [ ] 创建类型定义文件
- [ ] 实现颜色工具函数
- [ ] 搭建配置管理器

### Phase 2: 文本样式系统 (Week 1-2)
- [ ] 实现TextStyleConfig解析
- [ ] 创建样式编辑器组件
- [ ] 集成到敌人渲染器

### Phase 3: 敌人视觉系统 (Week 2-3)
- [ ] 实现HSV颜色生成器
- [ ] 开发出现动画系统
- [ ] 创建动画预设库

### Phase 4: 动态效果系统 (Week 3-4)
- [ ] 实现闪烁/渐变/打字机效果
- [ ] 开发效果编辑器
- [ ] 效果组合与调度

### Phase 5: 集成与优化 (Week 4)
- [ ] 完整配置界面
- [ ] 性能优化
- [ ] 测试与文档

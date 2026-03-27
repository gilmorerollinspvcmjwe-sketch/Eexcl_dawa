# Excel Aim Trainer 跟枪手感优化方案

> 报告日期：2026-03-27  
> 目标：解决跟枪手感差、目标移动不流畅、鼠标跟踪延迟问题

---

## 一、问题诊断分析

### 1.1 当前代码问题识别

通过分析现有代码，发现以下关键问题：

| 问题点 | 位置 | 影响 |
|--------|------|------|
| **setInterval 固定帧率** | `useGameLogic.ts` 游戏计时器 | 帧率不稳定，无法适配高刷新率屏幕 |
| **无目标移动算法** | `useGameLogic.ts` spawnTarget | 目标生成后静止，无法练习跟枪 |
| **100ms 清理间隔** | cleanup interval | 目标消失响应慢，手感滞后 |
| **目标生成随机延迟** | spawnTimer | 生成间隔不均匀，影响节奏 |
| **灵敏度配置未生效** | SettingsPanel.tsx | sensitivityX/Y 定义但未实际使用 |

---

## 二、优化方案

### 方案 1：目标移动算法 + 平滑轨迹

**问题诊断**：当前目标生成后完全静止，无法满足跟枪练习需求

**优化措施**：
```typescript
// 新增目标移动接口
interface MovingTarget extends Target {
  velocityX: number;  // 水平速度 (格/秒)
  velocityY: number; // 垂直速度 (格/秒)
  movePattern: 'linear' | 'sine' | 'bounce';
}

// 生成移动目标
function spawnMovingTarget(difficulty: Difficulty): MovingTarget {
  const speedRange = {
    easy: [0.3, 0.5],
    normal: [0.5, 1.0],
    hard: [1.0, 1.5],
    expert: [1.5, 2.5],
  };
  const [min, max] = speedRange[difficulty];
  const speed = min + Math.random() * (max - min);
  const angle = Math.random() * Math.PI * 2;
  
  return {
    ...spawnStaticTarget(),
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    movePattern: 'linear',
  };
}

// 游戏循环使用 requestAnimationFrame
function gameLoop(timestamp: number) {
  const deltaTime = (timestamp - lastFrameTime) / 1000;
  
  // 更新目标位置
  setTargets(prev => prev.map(t => {
    if (!('velocityX' in t)) return t;
    const mt = t as MovingTarget;
    return {
      ...mt,
      col: clamp(mt.col + mt.velocityX * deltaTime, 2, COLS + 1),
      row: clamp(mt.row + mt.velocityY * deltaTime, 1, ROWS),
    };
  }));
  
  requestAnimationFrame(gameLoop);
}
```

**预期效果**：
- 目标沿直线平滑移动，支持不同速度档位
- 可练习移动目标跟枪能力
- 与真实 FPS 游戏目标移动模式接近

**实现难度**：⭐⭐⭐ (中等)
- 需重构游戏循环，改用 RAF
- 边界碰撞处理需要额外逻辑

---

### 方案 2：启用原始输入 (Raw Input) + 灵敏度校准

**问题诊断**：灵敏度配置定义但未实际使用，无法精确控制鼠标跟随

**优化措施**：
```typescript
// 新增灵敏度计算Hook
function useSensitivityCalibration(settings: GameSettings) {
  // 鼠标 DPI × 游戏内灵敏度 = 最终移动系数
  const effectiveSensitivity = useMemo(() => {
    const DPI = 800; // 可配置
    const cmPer360 = 30; // 厘米/360° 玩家手感基准
    
    // 计算游戏内灵敏度
    const gameSens = (settings.sensitivityX + settings.sensitivityY) / 2;
    return {
      x: gameSens * settings.sensitivityX,
      y: gameSens * settings.sensitivityY,
      rawInput: true, // 启用原始输入模式
    };
  }, [settings]);
  
  return effectiveSensitivity;
}

// CSS 禁用鼠标加速
const excelCellStyle = {
  cursor: 'none', // 隐藏系统光标
  pointerEvents: 'auto',
};
```

**UI 控制方式**：
- 在设置面板新增「灵敏度校准」按钮
- 显示 cm/360° 预测值
- 提供「测试模式」让玩家感受灵敏度

**预期效果**：
- 鼠标移动与目标移动 1:1 对应，手感精准
- 消除系统鼠标加速干扰
- 支持不同灵敏度配置文件快速切换

**实现难度**：⭐⭐ (较低)
- 主要是配置整合，现有灵敏度参数已存在
- 需添加校准UI和本地存储

---

### 方案 3：requestAnimationFrame 统一渲染 + 帧率锁定

**问题诊断**：
- `setInterval(cleanup, 100)` 清理频率仅 10fps
- 游戏计时器使用 1000ms 间隔，不精确

**优化措施**：
```typescript
// 统一的 RAF 游戏循环
export function useGameLoop(isPlaying: boolean) {
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsRef = useRef(60);
  
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationId: number;
    const loop = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // 计算 FPS
      frameCountRef.current++;
      if (frameCountRef.current % 30 === 0) {
        fpsRef.current = Math.round(1000 / delta);
        setFps(fpsRef.current);
      }
      
      // 目标移动更新 (使用 deltaTime)
      updateTargets(delta / 1000);
      
      // 过期目标清理 (更精准的时间判断)
      cleanupExpiredTargets(time);
      
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);
  
  return { fps };
}
```

**预期效果**：
- 目标移动与渲染同步，60fps+ 流畅度
- 过期目标检测更及时（精确到帧而非 100ms）
- 可显示实时 FPS 监控

**实现难度**：⭐⭐⭐ (中等)
- 需重构现有 useEffect 结构
- 需保留 React 状态更新的同时实现平滑渲染

---

### 方案 4：目标消失动画 + 命中反馈增强

**问题诊断**：目标消失生硬，缺乏视觉反馈

**优化措施**：
```typescript
// 添加目标消失动画
interface TargetAnimation {
  id: string;
  type: 'spawn' | 'hit' | 'expire';
  progress: number; // 0-1
}

function TargetRenderer({ target, onComplete }) {
  const [animation, setAnimation] = useState<'spawn' | 'idle' | 'hit' | 'expire'>('spawn');
  
  // 使用 CSS animation 或 framer-motion
  const spawnAnimation = {
    scale: [0, 1.2, 1],
    opacity: [0, 1],
    duration: 150,
    easing: 'ease-out',
  };
  
  const hitAnimation = {
    scale: [1, 1.5, 0],
    opacity: [1, 0.5, 0],
    duration: 200,
  };
  
  return <animated.div style={useAnimatedStyle(spawnAnimation)} />;
}
```

**预期效果**：
- 目标生成时有弹性出现动画
- 命中时有明显的收缩/爆炸效果
- 过期目标有淡出动画

**实现难度**：⭐⭐ (较低)
- 纯前端动画实现，不涉及核心逻辑
- 建议使用 CSS animation 或轻量库

---

### 方案 5：Sheet1 格子大小自定义功能

**需求分析**：
- 用户希望调整表格单元格大小（放大/缩小）
- 影响视觉体验和瞄准难度

**UI 控制方式**：

```typescript
// 新增设置项
interface GridSettings {
  cellWidth: number;   // 单元格宽度 (px)
  cellHeight: number;  // 单元格高度 (px)
  scale: number;       // 缩放比例 (0.5 - 2.0)
}

// 设置面板 UI
<div className="grid-size-control">
  <label>格子大小</label>
  <input 
    type="range" 
    min="24" 
    max="80" 
    value={settings.gridSize}
    onChange={(e) => updateSetting('gridSize', parseInt(e.target.value))}
  />
  <span>{settings.gridSize}px</span>
  
  {/* 快捷按钮 */}
  <button onClick={() => updateSetting('gridSize', 32)}>默认</button>
  <button onClick={() => updateSetting('gridSize', 48)}>大</button>
  <button onClick={() => updateSetting('gridSize', 24)}>小</button>
</div>
```

**存储方式**：
```typescript
// localStorage 持久化
const GRID_SETTINGS_KEY = 'excel-aim-grid-settings';

function saveGridSettings(settings: GridSettings) {
  localStorage.setItem(GRID_SETTINGS_KEY, JSON.stringify(settings));
}

function loadGridSettings(): GridSettings {
  const saved = localStorage.getItem(GRID_SETTINGS_KEY);
  return saved ? JSON.parse(saved) : { 
    cellWidth: 40, 
    cellHeight: 20,
    scale: 1.0 
  };
}

// 渲染时应用
const gridStyle = {
  '--excel-cell-width': `${settings.cellWidth}px`,
  '--excel-cell-height': `${settings.cellHeight}px`,
  transform: `scale(${settings.scale})`,
  transformOrigin: 'top left',
} as React.CSSProperties;
```

**预期效果**：
- 玩家可根据习惯调整格子大小
- 大格子 = 更容易瞄准，但移动幅度大
- 小格子 = 更接近真实 Excel 体验

**实现难度**：⭐ (低)
- 纯 UI + CSS 变量调整
- 建议作为 v2.1 优先级功能

---

## 三、方案优先级建议

| 优先级 | 方案 | 核心价值 | 工作量 |
|--------|------|----------|--------|
| 1️⃣ | 方案3: RAF统一渲染 | 解决延迟感根源 | 中等 |
| 2️⃣ | 方案1: 目标移动算法 | 核心玩法增强 | 中等 |
| 3️⃣ | 方案4: 视觉反馈增强 | 体验优化 | 低 |
| 4️⃣ | 方案2: 灵敏度校准 | 精准控制 | 低 |
| 5️⃣ | 方案5: 格子大小自定义 | 辅助功能 | 低 |

---

## 四、技术实现注意事项

1. **向后兼容**：优化不应破坏现有游戏模式（限时/无限/禅/爆头线）
2. **性能监控**：建议添加 FPS 计数器，便于调试
3. **响应式处理**：不同屏幕尺寸下格子大小需适配
4. **键盘快捷键**：移动目标时可考虑添加暂停/减速功能

---

*本报告可作为后续开发的技术参考文档*
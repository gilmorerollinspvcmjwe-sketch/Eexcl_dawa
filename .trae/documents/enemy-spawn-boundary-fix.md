# 敌人刷新区域与计分板遮挡问题修复方案

## 问题分析

### 问题1：计分板遮挡敌人刷新区域
- **现状**：GameHUD (计分板) 位于左上角，`z-index: 50`
- **连击进度条**位于右上角，`z-index: 200`
- 敌人可能在屏幕顶部区域刷新，被这些UI元素遮挡

### 问题2：屏幕尺寸变化时敌人刷新出区域
- **现状**：使用固定常量 `COLS = 30`, `ROWS = 50`
- 敌人生成逻辑使用 `Math.random() * (COLS - 10)` 等计算
- 没有根据实际容器尺寸动态计算可用区域
- 当屏幕尺寸变化时，可能出现：
  - 敌人刷新在可见区域外
  - 敌人部分被截断

## 解决方案

### 方案1：定义安全刷新区域（Safe Zone）

```
┌─────────────────────────────────────────┐
│  [GameHUD]        [ComboProgress]       │  ← 顶部UI区域 (预留)
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      安全刷新区域               │    │  ← 敌人生成在此区域内
│  │      (Safe Zone)                │    │
│  │                                 │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**实现方式**：
1. 在敌人生成时，预留顶部UI区域（约3-5行）
2. 修改 `spawnEnemy` 函数，限制 `anchorRow` 的最小值

### 方案2：动态网格尺寸计算

**实现方式**：
1. 使用 `ResizeObserver` 监听容器尺寸变化
2. 根据实际容器尺寸计算可用的行列数
3. 敌人生成时基于实际可用区域计算位置

### 方案3：响应式边界检查

**实现方式**：
1. 在 `useMultiGridEnemy` 中添加边界检查
2. 敌人移动时检查是否超出可见区域
3. 生成新敌人时确保完整身体在可见区域内

## 具体实施步骤

### 步骤1：添加安全区域常量
```typescript
// constants.ts
export const SAFE_ZONE_ROWS = 5; // 顶部预留5行给UI
export const SAFE_ZONE_COLS = 2; // 左右各预留2列
```

### 步骤2：修改敌人生成逻辑
```typescript
// useMultiGridEnemy.ts
const spawnEnemy = useCallback((options?: SpawnOptions) => {
  // ...
  
  // 计算安全区域
  const minRow = SAFE_ZONE_ROWS;
  const maxRow = ROWS - 5; // 底部预留
  const minCol = SAFE_ZONE_COLS;
  const maxCol = COLS - SAFE_ZONE_COLS - 3; // 敌人宽度约3列
  
  let anchorRow: number;
  let anchorCol: number;
  
  if (effectiveMode === 'headshot' || mode === 'headshot') {
    anchorRow = headshotLineRow;
    anchorCol = Math.max(minCol, Math.min(maxCol, 
      finalOptions.anchorCol ?? (minCol + Math.floor(Math.random() * (maxCol - minCol)))
    ));
  } else {
    anchorRow = Math.max(minRow, Math.min(maxRow,
      finalOptions.anchorRow ?? (minRow + Math.floor(Math.random() * (maxRow - minRow)))
    ));
    anchorCol = Math.max(minCol, Math.min(maxCol,
      finalOptions.anchorCol ?? (minCol + Math.floor(Math.random() * (maxCol - minCol)))
    ));
  }
  
  // ...
}, [/* deps */]);
```

### 步骤3：添加动态尺寸检测（可选增强）
```typescript
// useGridDimensions.ts
export function useGridDimensions(containerRef: RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({
    cols: COLS,
    rows: ROWS,
    cellWidth: CELL_WIDTH,
    cellHeight: CELL_HEIGHT,
  });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // 计算实际可用行列数
      const availableRows = Math.floor((height - 20) / CELL_HEIGHT); // 减去列头高度
      const availableCols = Math.floor((width - 24) / CELL_WIDTH); // 减去行头宽度
      
      setDimensions({
        cols: Math.min(COLS, availableCols),
        rows: Math.min(ROWS, availableRows),
        cellWidth: CELL_WIDTH,
        cellHeight: CELL_HEIGHT,
      });
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);
  
  return dimensions;
}
```

### 步骤4：调整计分板位置（备选方案）
如果安全区域不够，可以考虑：
1. 将计分板移到屏幕底部
2. 或者使用半透明背景，允许点击穿透
3. 或者缩小计分板尺寸

## 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `src/constants.ts` | 添加安全区域常量 |
| `src/hooks/useMultiGridEnemy.ts` | 修改敌人生成逻辑，添加边界检查 |
| `src/components/grid/GameHUD.tsx` | 可选：调整位置或添加点击穿透 |
| `src/components/ComboProgressBar.tsx` | 可选：调整位置 |

## 测试验证点

1. 敌人生成位置始终在可见区域内
2. 敌人不会被计分板或连击条遮挡
3. 屏幕尺寸变化时，敌人位置自适应
4. 爆头模式下，敌人仍在爆头线附近生成
5. 移动目标模式下，敌人不会移出边界

## 优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 添加安全区域常量 | 快速修复，立竿见影 |
| P0 | 修改敌人生成逻辑 | 核心修复 |
| P1 | 动态尺寸检测 | 增强体验，适配不同屏幕 |
| P2 | 调整UI位置 | 备选方案，如仍有遮挡再考虑 |

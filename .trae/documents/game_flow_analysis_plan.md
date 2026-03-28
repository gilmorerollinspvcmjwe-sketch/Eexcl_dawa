# 游戏流程分析计划

## 一、当前游戏流程分析

### 1. 点击开始后的流程

```
GameHub.handleStartGame()
    ↓
App.handleStartGameFromHub()
    ↓ (更新难度设置)
useGameLogic.startGame()
    ↓
resetGameState() → clearEnemies() → setCurrentSheet('game')
    ↓
useEffect 触发敌人生成
    ↓
spawnEnemy({}) → 创建人形敌人
```

### 2. 敌人生成流程

```
useGameLogic.useEffect (监听 isPlaying)
    ↓
spawnEnemy({})
    ↓
createHumanoidEnemy()
    - anchorRow: 5 + random(ROWS-10) = 5~45
    - anchorCol: 5 + random(COLS-10) = 5~25
    - 创建 6 个部位: head, leftHand, body, rightHand, body, foot
    ↓
setEnemies(prev => [...prev, enemy])
```

### 3. 敌人渲染流程

```
GridTable (渲染表格)
    ↓
MultiGridEnemies (渲染敌人层)
    ↓
MultiGridEnemyRenderer (渲染单个敌人)
    ↓
PartCell (渲染每个部位)
    - baseLeft = (anchorCol - 2) * 64
    - baseTop = (anchorRow - 1) * 20
    - 部位位置 = baseLeft/Top + relativeCol/Row * cellWidth/Height
```

### 4. 玩家点击流程

```
GridTable.handleCellClick(row, col)
    ↓
ExcelGrid.handleCellClickWithSound()
    ↓
useGameLogic.handleCellClick()
    ↓
遍历 multiGridEnemies 查找匹配部位
    ↓
hitPart() → 更新敌人状态 → 返回得分结果
    ↓
setHitEffects() → 添加命中特效
setGameState() → 更新分数、连击
```

---

## 二、发现的问题

### 问题1: FPS模式配置未生效 ❌

**位置**: `useGameLogic.ts:startGameWithMode()`

```typescript
// 当前代码只是打印日志，没有实际应用配置
if (mode === 'motion_track' && config) {
  console.log(`Motion Track: speed=${config.speed}, pattern=${config.pattern}`);
  // 缺少: 将 config 应用到敌人生成逻辑
}
```

**影响**:
- `motion_track` 的速度/模式配置不生效
- `peek_shot` 的停留时间配置不生效
- `switch_track` 的目标数量配置不生效
- `precision` 的目标缩放配置不生效

### 问题2: 难度设置可能未及时生效 ⚠️

**位置**: `App.tsx:handleStartGameFromHub()`

```typescript
if (difficulty && difficulty !== settings.difficulty) {
  updateSetting('difficulty', difficulty);  // 异步更新
}
startGame(mode, duration);  // 立即调用，可能使用旧设置
```

**影响**: 游戏可能使用旧的难度设置生成敌人

### 问题3: 敌人位置可能超出边界 ⚠️

**位置**: `useMultiGridEnemy.ts:spawnEnemy()`

```typescript
anchorCol: 5 + Math.floor(Math.random() * (COLS - 10))  // 5~25
// 但 leftHand 的 relativeCol = -1，所以实际列号是 4~24
// body 有两格 (relativeRow 1 和 2)
// foot 的 relativeRow = 3
```

**影响**: 敌人可能太靠近边界，部分部位显示不全

### 问题4: 敌人自动清理逻辑问题 ❌

**位置**: `useMultiGridEnemy.ts:useEffect`

```typescript
useEffect(() => {
  const cleanup = setInterval(() => {
    setEnemies(prev => prev.filter(e => {
      if (!e.isAlive) return false;  // 移除死亡敌人
      // ...
    }));
  }, 200);
}, []);
```

**影响**: 每 200ms 检查一次，可能导致敌人刚死亡就被移除，玩家看不到死亡效果

### 问题5: 命中特效位置计算 ⚠️

**位置**: `useGameLogic.ts:handleCellClick()`

```typescript
const effect: HitEffect = {
  row, col,  // 使用点击的行列号
  // ...
};
```

**影响**: 命中特效显示在点击的单元格位置，但如果敌人正在移动，位置可能不准确

### 问题6: 移动敌人位置同步 ❌

**位置**: `useGameLogic.ts` 和 `useMultiGridEnemy.ts`

- 敌人位置使用浮点数 (`anchorCol` 可能是 15.3)
- 点击检测使用 `Math.round()` 
- 渲染也使用 `Math.round()`
- 但更新频率是 100ms，可能导致位置不同步

---

## 三、UI层面缺失的功能

### 1. 敌人状态反馈缺失

- **受伤效果**: 有实现但可能不够明显
- **死亡动画**: 敌人死亡时直接消失，没有动画
- **部位销毁效果**: 部位被击毁后直接消失

### 2. 游戏状态反馈缺失

- **连击提示**: 只有 HUD 显示，没有弹出效果
- **得分动画**: 得分增加没有动画效果
- **Miss 提示**: 只有音效，没有视觉反馈

### 3. FPS模式特有UI缺失

- **移动轨迹**: 移动敌人没有轨迹显示
- **探头动画**: 探头模式没有平滑动画
- **目标切换提示**: 多目标模式没有优先级指示

---

## 四、修复计划

### 阶段1: 修复核心逻辑问题

1. **修复FPS模式配置应用**
   - 在 `startGameWithMode` 中将配置传递给 `useMultiGridEnemy`
   - 修改 `spawnEnemy` 接受并应用配置参数

2. **修复难度设置同步**
   - 使用 `useEffect` 确保设置更新后再开始游戏
   - 或在 `startGame` 中直接传递难度参数

3. **修复敌人位置边界**
   - 调整敌人生成位置范围
   - 确保所有部位都在可见区域内

### 阶段2: 修复UI反馈问题

1. **添加敌人死亡动画**
   - 敌人死亡时播放爆炸/消失动画
   - 延迟移除敌人，让动画播放完成

2. **添加命中反馈增强**
   - 得分弹出动画
   - 连击提示增强
   - Miss 视觉反馈

3. **添加FPS模式特有UI**
   - 移动轨迹显示
   - 探头动画优化
   - 目标优先级显示

### 阶段3: 优化游戏体验

1. **优化敌人更新频率**
   - 使用 requestAnimationFrame 替代 setInterval
   - 确保位置同步

2. **优化命中检测**
   - 考虑敌人移动速度
   - 添加命中容差

---

## 五、具体实现步骤

### 步骤1: 修复FPS模式配置 (高优先级)

修改文件:
- `src/hooks/useGameLogic.ts`
- `src/hooks/useMultiGridEnemy.ts`

### 步骤2: 修复难度设置同步 (高优先级)

修改文件:
- `src/App.tsx`
- `src/hooks/useGameLogic.ts`

### 步骤3: 添加敌人死亡动画 (中优先级)

修改文件:
- `src/hooks/useMultiGridEnemy.ts`
- `src/components/grid/MultiGridEnemyRenderer.tsx`
- `src/index.css`

### 步骤4: 添加命中反馈增强 (中优先级)

修改文件:
- `src/components/ExcelGrid.tsx`
- `src/components/grid/HitEffectRenderer.tsx`
- `src/index.css`

### 步骤5: 优化敌人更新机制 (低优先级)

修改文件:
- `src/hooks/useGameLogic.ts`
- `src/hooks/useMultiGridEnemy.ts`

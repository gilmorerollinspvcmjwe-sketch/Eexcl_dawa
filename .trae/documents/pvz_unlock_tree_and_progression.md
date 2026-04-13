# FPS训练模式计分规则实现计划

## 需求分析

用户要求为不同FPS训练模式实现不同的计分规则：

### 1. 目标切换模式 (switch\_track)

* **规则**：必须按优先级顺序击中目标 A → B → C → D → E

* **无效击中**：如果当前应该击中A，但击中了B/C/D/E，则不算击中

* **计分**：只有击中正确的优先级目标才计分

### 2. 其他模式的计分规则优化

* **拐角射击 (peek\_shot)**：正常计分，但可以增加peek状态判断

* **反应测试 (reaction)**：基于反应时间计分，越快分数越高

* **精准射击 (precision)**：基于目标大小计分，越小目标分数越高

## 实现步骤

### Phase 1: 扩展类型定义

**文件**: `src/types/enemy.ts`

* 添加 `currentPriorityTarget` 字段到 MultiGridEnemy 或游戏状态

* 添加 `switchTrackOrder` 字段记录当前应该击中的优先级

### Phase 2: 修改 useMultiGridEnemy Hook

**文件**: `src/hooks/useMultiGridEnemy.ts`

* 添加 `currentPriorityTarget` state，记录当前应该击中的优先级（'A' | 'B' | 'C' | 'D' | 'E'）

* 修改 `hitPart` 函数：

  * 如果是 switch\_track 模式，检查击中的敌人优先级是否等于 currentPriorityTarget

  * 如果不等于，返回 null（不算击中）

  * 如果等于，计分并更新 currentPriorityTarget 到下一个优先级

* 添加 `resetPriorityOrder` 函数，在游戏开始或完成一轮后重置

### Phase 3: 修改 useGameLogic Hook

**文件**: `src/hooks/useGameLogic.ts`

* 在 switch\_track 模式下，跟踪当前应该击中的优先级

* 修改击中处理逻辑，调用 useMultiGridEnemy 的新方法

### Phase 4: 添加UI反馈

**文件**: `src/components/grid/MultiGridEnemyRenderer.tsx` 或 `src/components/ExcelGrid.tsx`

* 在 switch\_track 模式下，高亮显示当前应该击中的目标

* 添加视觉提示（如边框高亮）指示正确目标

### Phase 5: 其他模式计分优化

#### 反应测试模式

**文件**: `src/hooks/useMultiGridEnemy.ts`

* 记录目标出现时间 `appearTime`

* 击中时计算反应时间 `reactionTime = Date.now() - appearTime`

* 基于反应时间计算分数：

  * < 200ms: 100分

  * 200-300ms: 80分

  * 300-400ms: 60分

  * 400-500ms: 40分

  * <br />

    > 500ms: 20分

#### 精准射击模式

**文件**: `src/hooks/useMultiGridEnemy.ts`

* 基于 targetScale 计算分数：

  * 25% 大小: 4x 基础分数

  * 50% 大小: 2x 基础分数

  * 75% 大小: 1.5x 基础分数

### Phase 6: 测试和验证

* 测试 switch\_track 模式的优先级顺序逻辑

* 测试反应测试模式的计分

* 测试精准射击模式的计分

* 确保其他模式不受影响

## 关键代码变更

### useMultiGridEnemy.ts 修改示例

```typescript
// 添加状态
const [currentPriorityTarget, setCurrentPriorityTarget] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

// 修改 hitPart 函数
const hitPart = useCallback((enemyId: string, partType: PartType, combo: number) => {
  const enemy = enemiesRef.current.find(e => e.id === enemyId);
  if (!enemy || !enemy.isAlive) return null;
  
  // switch_track 模式：检查优先级
  if (fpsMode === 'switch_track') {
    if (enemy.priority !== currentPriorityTarget) {
      // 击中错误优先级，不算击中
      return null;
    }
    // 更新到下一个优先级
    const priorities = ['A', 'B', 'C', 'D', 'E'];
    const currentIndex = priorities.indexOf(currentPriorityTarget);
    if (currentIndex < priorities.length - 1) {
      setCurrentPriorityTarget(priorities[currentIndex + 1] as typeof currentPriorityTarget);
    } else {
      // 完成一轮，重置
      setCurrentPriorityTarget('A');
    }
  }
  
  // ... 原有计分逻辑
}, [fpsMode, currentPriorityTarget]);
```

## 文件清单

1. `src/types/enemy.ts` - 类型定义
2. `src/hooks/useMultiGridEnemy.ts` - 核心计分逻辑
3. `src/hooks/useGameLogic.ts` - 游戏逻辑协调
4. `src/components/grid/MultiGridEnemyRenderer.tsx` - UI反馈

## 预期结果

* 目标切换模式：必须按A→B→C→D→E顺序击中，错误顺序不计分

* 反应测试模式：基于反应时间动态计分

* 精准射击模式：基于目标大小动态计分

* 拐角射击模式：保持原有计分逻辑


# FPS 专项训练模式实现计划

## 问题分析

目前四个 FPS 专项训练模式（拐角射击、目标切换、反应测试、精准射击）点击后没有生效，原因是：
1. `useGameLogic` 中没有引入 `useFPSTraining` hook
2. `useMultiGridEnemy` 中只实现了 `peek_shot` 的部分逻辑，其他三个模式没有处理
3. 游戏主循环的 `spawnEnemy` 调用没有传递模式特定的配置

## 实现方案

采用 **扩展 `useMultiGridEnemy` + 集成 `useFPSTraining`** 的混合方案：
- 在 `useMultiGridEnemy` 中完善四个模式的敌人生成逻辑
- 在 `useGameLogic` 中引入 `useFPSTraining` 处理模式特定的游戏逻辑
- 修改游戏主循环，根据当前模式调用不同的生成策略

## 详细步骤

### Phase 1: 扩展 useMultiGridEnemy 的 spawnEnemy 函数

**文件**: `src/hooks/useMultiGridEnemy.ts`

1. **拐角射击 (peek_shot)** - 已有基础实现，需要完善
   - 敌人初始状态为 hidden
   - 实现 peek 动画逻辑（在 updateEnemies 中）
   - 配置参数：peekDuration, peekDirection

2. **目标切换 (switch_track)** - 新增实现
   - 同时生成多个目标（targetCount 配置）
   - 每个目标显示优先级标识（A/B/C 或 1/2/3）
   - 记录击中顺序，判断是否正确

3. **反应测试 (reaction)** - 新增实现
   - 随机延迟后显示目标
   - 记录从显示到击中的时间
   - 目标显示时间很短，考验反应速度

4. **精准射击 (precision)** - 新增实现
   - 生成缩小版目标（targetScale 配置 0.25-1.0）
   - 目标数量较少但更小
   - 可以添加移动轨迹

### Phase 2: 在 useGameLogic 中集成 useFPSTraining

**文件**: `src/hooks/useGameLogic.ts`

1. 引入 `useFPSTraining` hook
2. 在 `startGameWithMode` 中初始化 FPS 训练配置
3. 修改游戏主循环：
   - 经典模式：保持现有 spawnEnemy 调用
   - FPS 模式：调用 `useFPSTraining` 的 `updateTraining` 控制生成逻辑
4. 传递必要的回调函数给 `useFPSTraining`

### Phase 3: 完善 updateEnemies 中的模式特定逻辑

**文件**: `src/hooks/useMultiGridEnemy.ts`

1. **peek_shot 动画更新**
   - 处理 peekState 状态机：hidden -> peeking -> hidden
   - 根据 peekDuration 控制显示/隐藏

2. **switch_track 顺序验证**
   - 在 hitPart 中验证击中顺序
   - 更新正确/错误计数

3. **reaction 时间记录**
   - 记录目标显示时间
   - 计算并存储反应时间

4. **precision 移动更新**
   - 小目标的微移动
   - 更短的存活时间

### Phase 4: UI 配置面板完善

**文件**: `src/components/GameHub.tsx` (FPSConfigInline 组件)

目前 FPSConfigInline 只实现了：
- ✅ motion_track (移动射击)
- ✅ peek_shot (拐角射击)
- ❌ switch_track (目标切换) - 需要添加
- ❌ reaction (反应测试) - 需要添加
- ❌ precision (精准射击) - 需要添加

需要为这三个模式添加配置 UI：

1. **switch_track 配置面板**
   - 目标数量滑块 (2-5)
   - 显示优先级开关
   - 错误顺序惩罚选项

2. **reaction 配置面板**
   - 测试轮数选择
   - 警告时间设置

3. **precision 配置面板**
   - 目标大小缩放 (0.25-1.0)
   - 目标数量 (1-5)

### Phase 5: 前端对接

**文件**: `src/components/GameHub.tsx`, `src/App.tsx`

1. **GameHub 组件**
   - 确保 FPS 模式选择后正确传递配置
   - 验证 `handleStartGame` 调用 `onStartFPSTraining`

2. **App.tsx 对接**
   - 确认 `handleStartFPSTrainingFromHub` 正确处理 FPS 模式
   - 验证模式教程显示逻辑
   - 确保游戏启动参数正确传递

3. **游戏状态同步**
   - FPS 模式统计数据的收集和显示
   - 训练报告的数据对接

### Phase 6: 更新类型定义和配置

**文件**: `src/types/enemy.ts`, `src/types/game.ts`

1. 扩展 `MultiGridEnemy` 类型，添加 FPS 模式特定字段
2. 确保 `FPSTrainingMode` 类型一致
3. 添加模式配置的类型定义

### Phase 7: 测试和调试

1. 逐个模式测试：
   - 拐角射击：验证探头动画和击中判定
   - 目标切换：验证多目标和顺序判定
   - 反应测试：验证延迟和反应时间计算
   - 精准射击：验证小目标生成和击中

2. 边界情况：
   - 暂停/恢复游戏
   - 切换 sheet
   - 游戏结束统计

## 技术细节

### 拐角射击 (peek_shot) 实现要点
```typescript
// 敌人生成时
enemy.peekState = 'hidden';
enemy.peekProgress = 0;
enemy.peekTimer = 0;
enemy.peekDuration = config.duration ?? 1200;
enemy.peekDirection = options?.peekDirection ?? (Math.random() > 0.5 ? 'left' : 'right');

// updateEnemies 中更新
if (enemy.peekState === 'hidden') {
  enemy.peekTimer += deltaTime;
  if (enemy.peekTimer > enemy.peekDuration) {
    enemy.peekState = 'peeking';
    enemy.peekProgress = 0;
  }
}
```

### 目标切换 (switch_track) 实现要点
```typescript
// 生成多个目标，每个有不同优先级
for (let i = 0; i < targetCount; i++) {
  spawnEnemy({
    priority: ['A', 'B', 'C'][i] as Priority,
    anchorRow: ..., // 分散位置
    anchorCol: ...,
  });
}

// hitPart 中验证顺序
const currentExpectedPriority = getExpectedPriority();
if (part.priority !== currentExpectedPriority) {
  // 错误顺序惩罚
}
```

### 反应测试 (reaction) 实现要点
```typescript
// 使用随机延迟
const randomDelay = 1000 + Math.random() * 2000; // 1-3秒随机
setTimeout(() => {
  spawnEnemy({});
  reactionStartTimeRef.current = Date.now();
}, randomDelay);

// 击中时计算反应时间
const reactionTime = Date.now() - reactionStartTimeRef.current;
```

### 精准射击 (precision) 实现要点
```typescript
// 生成小目标
spawnEnemy({
  targetScale: config.targetScale ?? 0.5,
  anchorRow: ..., // 可以添加微移动
  anchorCol: ...,
});

// 更短的存活时间
enemy.expiresAt = Date.now() + (targetDuration * 0.5) * 1000; // 一半时间
```

## UI 配置面板代码示例

### switch_track 配置面板
```tsx
case 'switch_track':
  return (
    <div className="excel-inline-config">
      <span className="config-label">目标数量：</span>
      <input
        type="range"
        min={2}
        max={5}
        value={config.targetCount || 3}
        onChange={(e) => onChange({ ...config, targetCount: parseInt(e.target.value) })}
        style={{ width: 100 }}
      />
      <span>{config.targetCount || 3}</span>
      <label style={{ marginLeft: 16 }}>
        <input
          type="checkbox"
          checked={config.showPriority !== false}
          onChange={(e) => onChange({ ...config, showPriority: e.target.checked })}
        />
        显示优先级
      </label>
    </div>
  );
```

### reaction 配置面板
```tsx
case 'reaction':
  return (
    <div className="excel-inline-config">
      <span className="config-label">测试轮数：</span>
      <div className="excel-button-group">
        {[10, 20, 30].map(rounds => (
          <button
            key={rounds}
            className={`excel-mini-btn ${config.rounds === rounds ? 'selected' : ''}`}
            onClick={() => onChange({ ...config, rounds })}
          >
            {rounds}轮
          </button>
        ))}
      </div>
    </div>
  );
```

### precision 配置面板
```tsx
case 'precision':
  return (
    <div className="excel-inline-config">
      <span className="config-label">目标大小：</span>
      <input
        type="range"
        min={0.25}
        max={1.0}
        step={0.25}
        value={config.targetScale || 0.5}
        onChange={(e) => onChange({ ...config, targetScale: parseFloat(e.target.value) })}
        style={{ width: 100 }}
      />
      <span>{Math.round((config.targetScale || 0.5) * 100)}%</span>
      <span className="config-label config-label-right">数量：</span>
      <input
        type="range"
        min={1}
        max={5}
        value={config.targetCount || 3}
        onChange={(e) => onChange({ ...config, targetCount: parseInt(e.target.value) })}
        style={{ width: 80 }}
      />
      <span>{config.targetCount || 3}</span>
    </div>
  );
```

## 预计工作量

- Phase 1: 2-3 小时
- Phase 2: 1-2 小时
- Phase 3: 2-3 小时
- Phase 4: 1 小时
- Phase 5: 1 小时
- Phase 6: 30 分钟
- Phase 7: 1-2 小时

总计：9-13 小时

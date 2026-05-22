# Phase C 完整实现计划：扩展内容 + 50 关可玩 + 视觉反馈系统

## 现状分析

**已完成的部分：**
- 66 植物元数据已定义，大部分已升级为 `full` 实现
- 30 僵尸元数据已定义，大部分已升级为 `full` 实现
- 100 关主线数据已生成
- 解锁树系统已完成（进度存储、Sheet9 UI、Sheet7 选卡页）
- 植物独特行为逻辑已实现（机枪射手 4 连发、裂荚双向、星星果 5 方向、西瓜溅射、忧郁蘑菇范围攻击等）
- 僵尸独特行为逻辑已实现（潜水僵尸潜行、气球僵尸空中、矿工僵尸后切、舞王召唤、巨人投掷小鬼等）

**缺失的部分：**
1. **视觉反馈系统**：植物/僵尸独特行为没有对应的视觉特效
2. **弹道特效**：溅射范围、减速效果没有视觉表现
3. **僵尸状态显示**：潜行、空中、召唤等状态没有 UI 区分

---

## 阶段划分

### Phase C1：植物独特行为视觉反馈

#### C1.1 扩展 PvZProjectile 类型

**文件：** `src/features/pvz/pvzTypes.ts`（修改）

**新增字段：**
```typescript
export interface PvZProjectile {
  projectileId: string;
  kind: PvZProjectileKind;
  row: number;
  x: number;
  speed: number;
  damage: number;
  // 新增：
  splashRadius?: number;      // 溅射范围（西瓜投手）
  slowEffect?: boolean;       // 减速效果（冰瓜投手、寒冰射手）
  targetRow?: number;         // 追踪目标行（猫尾草、香蒲投手）
  isTracking?: boolean;       // 是否追踪（猫尾草、香蒲投手）
}
```

#### C1.2 扩展 PvZPlantInstance 类型

**文件：** `src/features/pvz/pvzTypes.ts`（修改）

**新增字段：**
```typescript
export interface PvZPlantInstance {
  // ... 现有字段
  // 新增：
  isAttacking?: boolean;      // 正在攻击状态（用于攻击动画）
  attackTargetRow?: number;   // 攻击目标行（用于多方向射击）
  lastAttackTime?: number;    // 上次攻击时间（用于攻击动画）
}
```

#### C1.3 修改弹道创建逻辑

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**修改内容：**
- `createProjectile` 函数增加 `splashRadius`、`slowEffect`、`targetRow` 参数
- 西瓜投手弹道添加 `splashRadius: 3`
- 冰瓜投手弹道添加 `splashRadius: 3, slowEffect: true`
- 寒冰射手弹道添加 `slowEffect: true`
- 猫尾草/香蒲投手弹道添加 `isTracking: true, targetRow`

#### C1.4 添加植物攻击动画触发

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**修改内容：**
- 在 `applyPlantAttacks` 中，攻击时设置 `isAttacking: true, lastAttackTime: Date.now()`
- 在 `tickPvZBoard` 中，超过 300ms 后清除 `isAttacking` 状态

#### C1.5 添加植物视觉反馈组件

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增视觉反馈：**
- 机枪射手：攻击时显示 4 连发动画（快速闪烁）
- 裂荚射手：显示双向射击指示器（前后两个箭头）
- 星星果：显示 5 方向射击指示器（5 个箭头）
- 西瓜投手：弹道命中时显示 3×3 溅射范围圈
- 冰瓜投手：弹道命中时显示溅射范围 + 冰冻效果
- 忧郁蘑菇：攻击时显示 3×3 范围攻击特效（紫色脉冲）
- 火炬树桩：豌豆经过时变为火焰弹道（橙色）
- 窝瓜：跳跃砸击时显示跳跃动画

---

### Phase C2：僵尸独特行为视觉反馈

#### C2.1 扩展 PvZZombieInstance 类型

**文件：** `src/features/pvz/pvzTypes.ts`（修改）

**新增字段：**
```typescript
export interface PvZZombieInstance {
  // ... 现有字段
  // 新增：
  isStealth?: boolean;        // 潜行状态（潜水僵尸）
  isAirborne?: boolean;       // 空中状态（气球僵尸）
  isSummoning?: boolean;      // 正在召唤（舞王僵尸）
  summonTimerMs?: number;     // 召唤计时器
  hasThrownImp?: boolean;     // 已投掷小鬼（巨人僵尸）
}
```

#### C2.2 修改僵尸移动逻辑

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**修改内容：**
- 潜水僵尸：`x > 3` 时设置 `isStealth: true`，接近前线时 `isStealth: false`
- 气球僵尸：始终设置 `isAirborne: true`
- 舞王僵尸：召唤时设置 `isSummoning: true`，召唤完成后 `isSummoning: false`
- 巨人僵尸：投掷小鬼后设置 `hasThrownImp: true`

#### C2.3 添加僵尸视觉反馈组件

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增视觉反馈：**
- 潜水僵尸：潜行时显示半透明 + 水波纹效果，显形时显示正常
- 气球僵尸：空中状态显示气球图标 + 飞行动画
- 舞王僵尸：召唤时显示召唤光环 + 伴舞生成动画
- 巨人僵尸：投掷小鬼时显示投掷动画
- 矿工僵尸：从后排切入时显示地下隧道效果

---

### Phase C3：弹道特效系统

#### C3.1 添加弹道命中特效

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**新增数据结构：**
```typescript
export interface PvZHitEffect {
  effectId: string;
  row: number;
  x: number;
  kind: 'splash' | 'slow' | 'fire' | 'shock';
  radius?: number;
  durationMs: number;
  startTime: number;
}
```

**修改内容：**
- 弹道命中僵尸时，根据弹道类型创建命中特效
- 溅射弹道：创建 `splash` 特效，显示 3×3 范围圈
- 减速弹道：创建 `slow` 特效，显示冰冻效果
- 火焰弹道：创建 `fire` 特效，显示火焰爆炸
- 电击弹道：创建 `shock` 特效，显示电击连锁

#### C3.2 添加命中特效渲染

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增渲染：**
- 溅射特效：显示橙色范围圈，300ms 后消失
- 减速特效：显示蓝色冰冻效果，500ms 后消失
- 火焰特效：显示红色火焰爆炸，200ms 后消失
- 电击特效：显示黄色电击连锁，300ms 后消失

#### C3.3 添加弹道飞行特效

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增渲染：**
- 普通豌豆：绿色圆形
- 双发豌豆：两个绿色圆形
- 寒冰豌豆：蓝色圆形 + 冰霜尾迹
- 火焰豌豆：橙色圆形 + 火焰尾迹
- 电击豌豆：黄色圆形 + 电击尾迹
- 抛投弹道：抛物线轨迹 + 落地特效

---

### Phase C4：CSS 动画系统

#### C4.1 添加植物攻击动画

**文件：** `src/styles/pvz.css`（修改）

**新增动画：**
```css
.pvz-plant--attacking {
  animation: pvz-attack-pulse 0.3s ease-out;
}

.pvz-plant--splash-attack {
  animation: pvz-splash-pulse 0.5s ease-out;
}

.pvz-plant--range-attack {
  animation: pvz-range-pulse 0.4s ease-out;
}
```

#### C4.2 添加僵尸状态动画

**文件：** `src/styles/pvz.css`（修改）

**新增动画：**
```css
.pvz-zombie--stealth {
  opacity: 0.4;
  animation: pvz-stealth-wave 1s infinite;
}

.pvz-zombie--airborne {
  animation: pvz-fly-bounce 0.5s infinite;
}

.pvz-zombie--summoning {
  animation: pvz-summon-glow 1s infinite;
}
```

#### C4.3 添加弹道特效动画

**文件：** `src/styles/pvz.css`（修改）

**新增动画：**
```css
.pvz-hit-effect--splash {
  animation: pvz-splash-expand 0.3s ease-out forwards;
}

.pvz-hit-effect--slow {
  animation: pvz-ice-freeze 0.5s ease-out forwards;
}

.pvz-hit-effect--fire {
  animation: pvz-fire-burst 0.2s ease-out forwards;
}

.pvz-hit-effect--shock {
  animation: pvz-shock-chain 0.3s ease-out forwards;
}
```

---

### Phase C5：前 50 关完整可玩

#### C5.1 验证 1-5 章关卡数据

**文件：** `src/features/pvz/pvzAdventureLevels.ts`（检查）

**验证内容：**
- 1-5 章每关的 `availablePlants` 是否正确
- 1-5 章每关的 `enemyRoster` 是否合理
- 1-5 章每关的 `spawnQueue` 是否完整
- 1-5 章每关的 `recommendedCards` 是否合理

#### C5.2 验证解锁树逻辑

**文件：** `src/features/pvz/pvzProgressStorage.ts`（检查）

**验证内容：**
- 1-01 到 5-10 的解锁顺序是否正确
- 每关通关后解锁的植物是否正确
- 每关通关后解锁的僵尸是否正确

#### C5.3 验证战斗逻辑

**文件：** `src/features/pvz/pvzBoardState.ts`（检查）

**验证内容：**
- 1-5 章所有植物的行为是否正确
- 1-5 章所有僵尸的行为是否正确
- 弹道系统是否正常工作
- 胜利/失败判定是否正确

---

## 实施顺序

1. **C1.1-C1.4**：类型扩展 + 弹道创建逻辑修改
2. **C2.1-C2.2**：僵尸状态扩展 + 移动逻辑修改
3. **C3.1**：命中特效数据结构
4. **C4.1-C4.3**：CSS 动画系统
5. **C1.5**：植物视觉反馈组件
6. **C2.3**：僵尸视觉反馈组件
7. **C3.2-C3.3**：弹道特效渲染
8. **C5.1-C5.3**：前 50 关验证

---

## 技术要点

### 视觉反馈设计原则
- 不影响游戏性能：特效持续时间控制在 500ms 以内
- 不干扰玩家视线：特效透明度适中，不遮挡关键信息
- 一致性：同类特效使用相同颜色和动画

### 弹道特效实现
- 溅射范围：使用 CSS 圆形 + 渐变效果
- 减速效果：使用蓝色冰霜效果
- 火焰效果：使用橙色火焰效果
- 电击效果：使用黄色电击效果

### 僵尸状态显示
- 潜行：半透明 + 水波纹动画
- 空中：气球图标 + 飞行动画
- 召唤：光环 + 伴舞生成动画

### 测试策略
- 手动测试：在浏览器中验证视觉反馈效果
- 性能测试：确保特效不影响游戏流畅度
- 功能测试：确保 1-5 章所有关卡可正常游玩
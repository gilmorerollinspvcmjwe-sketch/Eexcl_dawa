# PvZ 核心机制完善 Spec

## Why
当前 PvZ 模块缺少原版游戏的核心机制，包括波次系统、僵尸攻击植物、小推车逻辑、阳光掉落等，导致游戏体验与原版差距较大。需要系统性地补充这些核心机制，使游戏玩法完整。

## What Changes
- 新增波次系统：小波 → 大波（旗帜标记）→ 最终波（Boss）
- 新增僵尸攻击植物逻辑：僵尸接触植物后停止移动，开始啃食
- 新增小推车触发逻辑：僵尸到达左边界时自动触发，清空该行所有僵尸
- 新增天空阳光掉落：定期在随机位置掉落阳光，玩家点击收集
- 新增铲子工具：移除植物，返还部分阳光
- 新增游戏速度控制：暂停、正常、加速三档
- 新增环境限制机制：迷雾视野、水路种植、屋顶抛投限制
- 新增植物被攻击动画：血条减少、视觉反馈
- **BREAKING**：关卡数据结构扩展，增加波次配置

## Impact
- Affected specs: PvZBoardState, PvZLevelDefinition, PvZAdventureLevels
- Affected code: 
  - `src/features/pvz/pvzTypes.ts` - 类型定义扩展
  - `src/features/pvz/pvzBoardState.ts` - 核心逻辑修改
  - `src/features/pvz/pvzAdventureLevels.ts` - 关卡数据扩展
  - `src/components/pvz/PvZBoard.tsx` - UI 渲染
  - `src/components/pvz/PvZHud.tsx` - HUD 控制
  - `src/styles/pvz.css` - 动画样式

---

## ADDED Requirements

### Requirement: 波次系统
系统应提供多波次战斗机制，每关包含多个波次，波次之间有间隔和提示。

#### Scenario: 小波开始
- **WHEN** 关卡开始
- **THEN** 系统生成第一波僵尸（数量较少）

#### Scenario: 大波来临
- **WHEN** 大波开始前
- **THEN** 系统显示"大波僵尸来袭"提示，生成旗帜僵尸标记

#### Scenario: 最终波
- **WHEN** 最后一波
- **THEN** 系统显示"最终波"提示，生成 Boss 或大量僵尸

#### Scenario: 波次间隔
- **WHEN** 波次之间
- **THEN** 系统暂停出怪 3-5 秒，给玩家喘息时间

---

### Requirement: 僵尸攻击植物
僵尸接触植物后应停止移动，开始啃食植物，逐步减少植物血量。

#### Scenario: 僵尸接触植物
- **WHEN** 僵尸移动到植物所在格子
- **THEN** 僵尸停止移动，开始攻击植物

#### Scenario: 植物被啃食
- **WHEN** 僵尸攻击植物
- **THEN** 植物血量每秒减少 20-40 点（根据僵尸类型）

#### Scenario: 植物死亡
- **WHEN** 植物血量降至 0
- **THEN** 植物消失，僵尸继续移动

#### Scenario: 僵尸被阻挡
- **WHEN** 僵尸被高坚果等阻挡植物阻挡
- **THEN** 僵尸无法跳过，必须啃食

---

### Requirement: 小推车逻辑
每行应有一个小推车，僵尸到达左边界时自动触发，清空该行所有僵尸。

#### Scenario: 小推车初始状态
- **WHEN** 关卡开始
- **THEN** 每行左侧显示一个小推车

#### Scenario: 小推车触发
- **WHEN** 僵尸到达左边界（x < 0）
- **THEN** 小推车自动触发，沿该行向右移动，消灭所有僵尸

#### Scenario: 小推车消耗
- **WHEN** 小推车触发后
- **THEN** 小推车消失，该行失去保护

#### Scenario: 无小推车
- **WHEN** 僵尸到达左边界且该行无小推车
- **THEN** 游戏失败

---

### Requirement: 天空阳光掉落
系统应定期在天空随机位置掉落阳光，玩家点击收集。

#### Scenario: 阳光掉落
- **WHEN** 每 8-10 秒
- **THEN** 天空随机位置掉落一个阳光（25 或 50）

#### Scenario: 阳光落地
- **WHEN** 阳光落到地面
- **THEN** 阳光停留在该位置 10 秒，等待收集

#### Scenario: 阳光收集
- **WHEN** 玩家点击阳光
- **THEN** 阳光消失，玩家阳光数增加

#### Scenario: 阳光消失
- **WHEN** 阳光停留超过 10 秒
- **THEN** 阳光自动消失

---

### Requirement: 铲子工具
玩家应能使用铲子移除植物，返还部分阳光。

#### Scenario: 铲子选择
- **WHEN** 玩家点击铲子按钮
- **THEN** 进入铲子模式，鼠标显示铲子图标

#### Scenario: 植物移除
- **WHEN** 玩家在铲子模式下点击植物
- **THEN** 植物消失，返还 50% 阳光成本

#### Scenario: 铲子取消
- **WHEN** 玩家右键点击或点击其他按钮
- **THEN** 退出铲子模式

---

### Requirement: 游戏速度控制
玩家应能控制游戏速度，包括暂停、正常、加速三档。

#### Scenario: 正常速度
- **WHEN** 游戏开始
- **THEN** 游戏以正常速度（1x）运行

#### Scenario: 加速
- **WHEN** 玩家点击加速按钮
- **THEN** 游戏以 2x 速度运行

#### Scenario: 暂停
- **WHEN** 玩家点击暂停按钮
- **THEN** 游戏暂停，所有计时器停止

#### Scenario: 恢复
- **WHEN** 玩家在暂停状态下点击恢复
- **THEN** 游戏恢复运行

---

### Requirement: 迷雾视野限制
迷雾关卡应限制视野，玩家需要灯笼草照明。

#### Scenario: 迷雾遮挡
- **WHEN** 迷雾关卡开始
- **THEN** 大部分区域被迷雾遮挡，无法看到僵尸

#### Scenario: 灯笼草照明
- **WHEN** 玩家放置灯笼草
- **THEN** 灯笼草周围 3x3 区域视野清晰

#### Scenario: 僵尸显形
- **WHEN** 僵尸进入照明区域
- **THEN** 僵尸变得可见

---

### Requirement: 水路种植限制
水路格子必须先放置睡莲才能种植其他植物。

#### Scenario: 水路限制
- **WHEN** 玩家尝试在水路格子种植非水生植物
- **THEN** 系统提示"需要睡莲"，种植失败

#### Scenario: 睡莲放置
- **WHEN** 玩家在水路放置睡莲
- **THEN** 睡莲占据格子，允许在其上种植其他植物

#### Scenario: 水生植物
- **WHEN** 玩家种植海蘑菇等水生植物
- **THEN** 可直接种植在水路，无需睡莲

---

### Requirement: 屋顶抛投限制
屋顶关卡只能使用抛投类植物，直线射击植物无法使用。

#### Scenario: 屋顶限制
- **WHEN** 屋顶关卡开始
- **THEN** 直线射击植物（豌豆射手、双发等）不可选

#### Scenario: 抛投可用
- **WHEN** 屋顶关卡
- **THEN** 抛投植物（卷心菜、玉米、西瓜）可用

#### Scenario: 花盆放置
- **WHEN** 玩家在屋顶放置花盆
- **THEN** 花盆占据格子，允许在其上种植植物

---

### Requirement: 植物被攻击动画
植物被僵尸啃食时应显示视觉反馈。

#### Scenario: 血条减少
- **WHEN** 僵尸攻击植物
- **THEN** 植物血条逐步减少，显示红色闪烁

#### Scenario: 植物摇晃
- **WHEN** 植物被攻击
- **THEN** 植物显示摇晃动画

#### Scenario: 植物死亡动画
- **WHEN** 植物血量降至 0
- **THEN** 植物显示消失动画（缩小 + 消失）

---

## MODIFIED Requirements

### Requirement: 关卡数据结构
关卡数据应包含波次配置，定义每波的僵尸类型和数量。

**原结构**：
```typescript
interface PvZLevelDefinition {
  intensity: 'S1' | 'S2' | ...;
  enemyRoster: PvZZombieId[];
  spawnQueue: PvZSpawnEvent[];
}
```

**新结构**：
```typescript
interface PvZWaveConfig {
  waveIndex: number;
  waveType: 'small' | 'large' | 'final';
  zombieCount: number;
  zombieTypes: PvZZombieId[];
  spawnIntervalMs: number;
  preWaveDelayMs: number;
}

interface PvZLevelDefinition {
  intensity: 'S1' | 'S2' | ...;
  enemyRoster: PvZZombieId[];
  waves: PvZWaveConfig[];
  hasLawnMowers: boolean;
  skyDropSun: boolean;
  environment: 'day' | 'night' | 'pool' | 'fog' | 'roof';
}
```

---

## REMOVED Requirements

### Requirement: 单波次出怪
**Reason**：原单波次设计不符合原版玩法，需要改为多波次系统。
**Migration**：现有 `spawnQueue` 将被 `waves` 配置替代，系统按波次分批生成僵尸。
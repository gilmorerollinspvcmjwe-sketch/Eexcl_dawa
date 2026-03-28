# FPS 训练模式详细设计

> 版本：1.0  
> 最后更新：2026-03-28  
> 状态：设计完成，待实现

---

## 1. 五种训练模式核心循环

### 1.1 Motion Track（移动射击）

**训练目标**：提升对移动目标的追踪和跟枪能力

#### 核心循环

```
┌─────────────────────────────────────────────────────────────┐
│                    Motion Track 循环                        │
├─────────────────────────────────────────────────────────────┤
│  1. 生成移动目标（从屏幕边缘或随机位置）                      │
│  2. 目标按设定模式移动（直线/正弦波/弹跳）                    │
│  3. 玩家持续追踪并射击                                       │
│  4. 命中后目标消失，立即生成新目标                           │
│  5. 计时结束，计算追踪评分                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 目标移动模式

| 模式 | 描述 | 算法 | 适用场景 |
|------|------|------|----------|
| `linear` | 直线水平移动 | `x = x0 + speed * t * direction` | 基础跟枪 |
| `sine` | 正弦波曲线 | `x = x0 + speed * t`, `y = y0 + sin(t * freq) * amplitude` | 不规则移动目标 |
| `bounce` | 弹跳移动 | `x = x0 + speed * t`, `y = y0 + abs(sin(t * freq)) * amplitude` | 上下起伏目标 |

#### 速度等级

| 等级 | 速度 (格/秒) | 像素/秒 (64px/格) | 解锁条件 |
|------|-------------|------------------|----------|
| `slow` | 0.5 | 32 | 默认 |
| `normal` | 1.0 | 64 | 累计得分 ≥ 500 |
| `fast` | 2.0 | 128 | 累计得分 ≥ 1500 |
| `extreme` | 3.0 | 192 | 累计得分 ≥ 3000 |

#### 追踪评分机制

追踪评分基于**持续瞄准时间**与**总暴露时间**的比率：

```
trackingScore = (aimTime / exposureTime) * 100 * comboMultiplier
```

- `aimTime`: 准星停留在目标上的时间（毫秒）
- `exposureTime`: 目标在屏幕上的总时间
- `comboMultiplier`: 连续命中连击倍率

---

### 1.2 Peek Shot（拐角射击）

**训练目标**：提升预瞄和快速反应能力

#### 核心循环

```
┌─────────────────────────────────────────────────────────────┐
│                    Peek Shot 循环                           │
├─────────────────────────────────────────────────────────────┤
│  1. 目标隐藏在掩体后（不可见）                               │
│  2. 目标探头（从掩体后出现）                                 │
│  3. 玩家在限定时间内射击                                     │
│  4. 超时则目标缩回掩体                                       │
│  5. 重复步骤 2-4，直到训练结束                               │
└─────────────────────────────────────────────────────────────┘
```

#### 探头状态机

```
                    ┌──────────┐
         ┌─────────│  hidden  │─────────┐
         │ timeout └──────────┘ timeout │
         │              │peek            │
         │              ▼                │
         │         ┌──────────┐         │
         │         │ peeking  │         │
         │         │ (动画中)  │         │
         │              │                │
         │              ▼                │
         │         ┌──────────┐         │
         └────────▶│ visible  │◀────────┘
          timeout  │ (可射击)  │ timeout
                   └──────────┘
                        │
                   return
                        ▼
                   ┌──────────┐
                   │ returning│
                   │ (动画中)  │
                   └──────────┘
                        │
                        ▼
                   ┌──────────┐
                   │  hidden  │
                   └──────────┘
```

#### 探头持续时间等级

| 等级 | 持续时间 | 动画时间 | 解锁条件 |
|------|---------|---------|----------|
| `long` | 2000ms | 200ms | 默认 |
| `normal` | 1200ms | 150ms | 平均反应 < 300ms |
| `short` | 600ms | 100ms | 平均反应 < 220ms |
| `blink` | 300ms | 80ms | 平均反应 < 180ms |

#### 探头动画曲线（缓入缓出）

使用 `ease-in-out` 曲线：

```
peekProgress = 0 → 1 (探头)
position = start + (end - start) * (3t² - 2t³)

peekProgress = 1 → 0 (缩回)
position = end + (start - end) * (3t² - 2t³)
```

#### 反应评分

```
reactionScore = max(0, 100 - (reactionTime / maxTime) * 100) * difficultyMultiplier

maxTime = peekDuration + peekAnimTime
```

---

### 1.3 Switch Track（目标切换）

**训练目标**：提升多目标优先级判断和快速切换能力

#### 核心循环

```
┌─────────────────────────────────────────────────────────────┐
│                   Switch Track 循环                         │
├─────────────────────────────────────────────────────────────┤
│  1. 同时生成多个目标（2-5 个）                               │
│  2. 每个目标有不同优先级标识                                 │
│  3. 玩家按优先级顺序射击（critical → high → medium → low）   │
│  4. 错误顺序触发惩罚（重置/扣分）                            │
│  5. 完成一轮后生成新的一组目标                               │
└─────────────────────────────────────────────────────────────┘
```

#### 优先级系统

| 优先级 | 图标 | 颜色 | 时间限制 | 基础分 |
|--------|------|------|---------|--------|
| `critical` | 🔴 | #dc2626 | 1.5s | 200 |
| `high` | 🟠 | #f97316 | 2.5s | 150 |
| `medium` | 🟡 | #eab308 | 4.0s | 100 |
| `low` | 🟢 | #22c55e | 6.0s | 50 |

#### 切换惩罚机制

```typescript
if (shotPriority !== expectedPriority) {
  if (config.wrongOrderPenalty === 'reset') {
    // 重置当前轮次所有目标
    resetCurrentRound();
    applyPenalty(50); // 扣 50 分
  } else {
    // 仅扣分，继续
    applyPenalty(30);
  }
}
```

#### 准确率评分

```
accuracyScore = (correctOrderHits / totalShots) * 100

switchSpeedScore = (idealTime / actualTime) * 100
idealTime = sum(priorityTimeLimits for all targets)
```

---

### 1.4 Reaction（反应测试）

**训练目标**：测量和提升纯反应时间

#### 核心循环

```
┌─────────────────────────────────────────────────────────────┐
│                    Reaction 循环                            │
├─────────────────────────────────────────────────────────────┤
│  1. 屏幕空白，显示"准备"提示                                 │
│  2. 随机等待时间（1-3 秒）                                   │
│  3. 目标突然出现                                             │
│  4. 玩家尽快射击                                             │
│  5. 记录反应时间                                             │
│  6. 重复 N 轮，计算平均值                                    │
└─────────────────────────────────────────────────────────────┘
```

#### 反应时间计算

```
reactionTime = shotTime - targetAppearTime
```

#### 反应等级评定

| 反应时间 | 评级 | 百分位 | 颜色 |
|---------|------|--------|------|
| ≤ 150ms | 超神 | 99% | #8b5cf6 |
| ≤ 180ms | 优秀 | 95% | #3b82f6 |
| ≤ 200ms | 良好 | 85% | #22c55e |
| ≤ 230ms | 中等 | 60% | #eab308 |
| ≤ 270ms | 一般 | 30% | #f97316 |
| ≤ 350ms | 较慢 | 10% | #ef4444 |
| > 350ms | 需要练习 | 0% | #6b7280 |

#### 多次平均机制

```
finalReactionTime = average(reactionTimes)
bestReactionTime = min(reactionTimes)
consistency = stdev(reactionTimes) / average(reactionTimes) * 100
```

建议进行 5-10 轮测试以获得可靠平均值。

---

### 1.5 Precision（精准射击）

**训练目标**：提升对微小目标的精准命中能力

#### 核心循环

```
┌─────────────────────────────────────────────────────────────┐
│                   Precision 循环                            │
├─────────────────────────────────────────────────────────────┤
│  1. 生成缩小比例的目标（25%-100% 正常大小）                  │
│  2. 目标静止或微动                                           │
│  3. 玩家精准射击                                             │
│  4. 命中后目标消失，生成新目标                               │
│  5. 根据目标大小给予不同评分                                 │
└─────────────────────────────────────────────────────────────┘
```

#### 目标缩放等级

| 缩放比例 | 实际大小 (像素) | 难度 | 解锁条件 |
|---------|----------------|------|----------|
| 1.0 | 64x20 | 简单 | 默认 |
| 0.75 | 48x15 | 中等 | 命中率 ≥ 80% |
| 0.5 | 32x10 | 困难 | 命中率 ≥ 85% |
| 0.25 | 16x5 | 专家 | 命中率 ≥ 90% |

#### 微操评分

```
precisionScore = baseScore * sizeMultiplier * accuracyMultiplier

sizeMultiplier = 1 / targetScale  // 目标越小，倍率越高
accuracyMultiplier = (headshots / totalShots) * 2 + 1
```

#### 稳定性评分

基于连续命中之间的时间间隔稳定性：

```
stabilityScore = 100 - (stdev(intervals) / average(intervals)) * 100
```

---

## 2. 评分算法详解

### 2.1 追踪准确率公式（Motion Track）

```typescript
function calculateTrackingScore(aimTime: number, exposureTime: number, hits: number, combo: number): number {
  const baseAccuracy = (aimTime / exposureTime) * 100;
  const hitBonus = Math.min(20, hits * 2); // 命中奖励，最多 20 分
  const comboMultiplier = 1 + (combo * 0.05); // 每连击 +5%
  
  return Math.min(100, (baseAccuracy + hitBonus) * comboMultiplier);
}
```

**评分等级**：
- S: ≥ 95
- A: ≥ 85
- B: ≥ 70
- C: ≥ 50
- D: < 50

### 2.2 反应时间计算公式（Peek Shot / Reaction）

```typescript
function calculateReactionScore(reactionTime: number, maxTime: number): number {
  const baseScore = Math.max(0, 100 - (reactionTime / maxTime) * 100);
  const bonus = reactionTime < 150 ? 20 : reactionTime < 200 ? 10 : 0;
  return Math.min(100, baseScore + bonus);
}

function getReactionRating(reactionTime: number): ReactionRating {
  if (reactionTime <= 150) return { rating: '超神', color: '#8b5cf6' };
  if (reactionTime <= 180) return { rating: '优秀', color: '#3b82f6' };
  if (reactionTime <= 200) return { rating: '良好', color: '#22c55e' };
  if (reactionTime <= 230) return { rating: '中等', color: '#eab308' };
  if (reactionTime <= 270) return { rating: '一般', color: '#f97316' };
  if (reactionTime <= 350) return { rating: '较慢', color: '#ef4444' };
  return { rating: '需要练习', color: '#6b7280' };
}
```

### 2.3 切换速度评分（Switch Track）

```typescript
function calculateSwitchSpeedScore(actualTime: number, idealTime: number, correctOrder: boolean): number {
  const speedRatio = idealTime / actualTime;
  const baseScore = Math.min(100, speedRatio * 100);
  const orderBonus = correctOrder ? 15 : -20;
  return Math.max(0, Math.min(100, baseScore + orderBonus));
}
```

### 2.4 精准度评分（Precision）

```typescript
function calculatePrecisionScore(targetScale: number, isHeadshot: boolean, combo: number): number {
  const sizeMultiplier = 1 / targetScale; // 0.25 → 4x, 0.5 → 2x, 1.0 → 1x
  const headshotMultiplier = isHeadshot ? 1.5 : 1.0;
  const comboMultiplier = 1 + (combo * 0.03);
  
  const baseScore = 50;
  return Math.min(100, baseScore * sizeMultiplier * headshotMultiplier * comboMultiplier);
}
```

---

## 3. 难度曲线设计

### 3.1 Motion Track 难度等级

| 难度 | 速度 | 模式 | 持续时间 | 目标数量 | 解锁分数 |
|------|------|------|---------|---------|----------|
| Easy | slow | linear | 60s | 1-2 | 默认 |
| Normal | normal | linear/sine | 60s | 2-3 | ≥ 500 |
| Hard | fast | sine/bounce | 90s | 3-4 | ≥ 1500 |
| Expert | extreme | random | 120s | 4-5 | ≥ 3000 |

### 3.2 Peek Shot 难度等级

| 难度 | 停留时间 | 探头间隔 | 目标数量 | 解锁条件 |
|------|---------|---------|---------|----------|
| Easy | long (2s) | 3s | 1 | 默认 |
| Normal | normal (1.2s) | 2.5s | 1-2 | 平均反应 < 300ms |
| Hard | short (0.6s) | 2s | 2-3 | 平均反应 < 220ms |
| Expert | blink (0.3s) | 1.5s | 3-4 | 平均反应 < 180ms |

### 3.3 Switch Track 难度等级

| 难度 | 目标数量 | 优先级显示 | 惩罚 | 时间缩减 | 解锁分数 |
|------|---------|-----------|------|---------|----------|
| Easy | 2-3 | 显示 | 无 | 100% | 默认 |
| Normal | 3-4 | 显示 | 扣分 | 90% | ≥ 600 |
| Hard | 4-5 | 可选 | 重置 | 75% | ≥ 1500 |
| Expert | 5 | 隐藏 | 重置 | 60% | ≥ 3000 |

### 3.4 Reaction 难度等级

| 难度 | 轮数 | 警告时间 | 目标大小 | 解锁条件 |
|------|------|---------|---------|----------|
| Easy | 3 | 1.5s | 正常 | 默认 |
| Normal | 5 | 1s | 正常 | 完成 Easy |
| Hard | 10 | 0.5s | 缩小 25% | 平均反应 < 220ms |
| Expert | 15 | 随机 | 缩小 50% | 平均反应 < 180ms |

### 3.5 Precision 难度等级

| 难度 | 目标缩放 | 目标数量 | 移动 | 解锁命中率 |
|------|---------|---------|------|-----------|
| Easy | 1.0 (100%) | 3 | 静止 | 默认 |
| Normal | 0.75 (75%) | 4 | 微动 | ≥ 80% |
| Hard | 0.5 (50%) | 5 | 线性移动 | ≥ 85% |
| Expert | 0.25 (25%) | 6 | 随机移动 | ≥ 90% |

---

## 4. 训练报告格式

### 4.1 训练结束统计数据

```typescript
interface TrainingReport {
  // 基础统计
  mode: FPSTrainingMode;
  difficulty: string;
  duration: number; // 秒
  timestamp: string;
  
  // 命中统计
  totalShots: number;
  hits: number;
  misses: number;
  accuracy: number; // 百分比
  
  // 得分
  totalScore: number;
  bestCombo: number;
  
  // 模式特定统计
  modeStats: {
    // Motion Track
    avgTrackingAccuracy?: number;
    totalAimTime?: number;
    
    // Peek Shot / Reaction
    avgReactionTime?: number;
    bestReactionTime?: number;
    reactionRating?: string;
    
    // Switch Track
    correctOrderHits?: number;
    wrongOrderHits?: number;
    avgSwitchTime?: number;
    
    // Precision
    headshots?: number;
    avgTargetSize?: number;
    stabilityScore?: number;
  };
}
```

### 4.2 历史最佳对比

```typescript
interface HistoryComparison {
  personalBest: {
    score: number;
    accuracy: number;
    reactionTime?: number;
    date: string;
  };
  
  lastSession: {
    score: number;
    accuracy: number;
    reactionTime?: number;
    date: string;
  };
  
  improvement: {
    score: number; // 差值
    accuracy: number; // 差值
    trend: 'up' | 'down' | 'stable';
  };
  
  average: {
    score: number; // 近 10 次平均
    accuracy: number;
    reactionTime?: number;
  };
}
```

### 4.3 改进建议生成逻辑

```typescript
function generateImprovementSuggestions(report: TrainingReport, history: HistoryComparison): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // 准确率建议
  if (report.accuracy < 70) {
    suggestions.push({
      category: 'accuracy',
      priority: 'high',
      title: '提升命中率',
      description: '当前命中率低于 70%，建议降低难度，专注于精准射击而非速度。',
      recommendedMode: 'precision',
      recommendedDifficulty: 'easy',
    });
  }
  
  // 反应时间建议
  if (report.modeStats.avgReactionTime && report.modeStats.avgReactionTime > 250) {
    suggestions.push({
      category: 'reaction',
      priority: 'medium',
      title: '加快反应速度',
      description: `平均反应时间 ${report.modeStats.avgReactionTime}ms，建议进行 Reaction 模式训练。`,
      recommendedMode: 'reaction',
      recommendedDifficulty: 'normal',
    });
  }
  
  // 切换速度建议
  if (report.mode === 'switch_track' && report.modeStats.wrongOrderHits && report.modeStats.wrongOrderHits > 3) {
    suggestions.push({
      category: 'priority',
      priority: 'high',
      title: '加强优先级识别',
      description: '多次射击顺序错误，建议先熟悉优先级颜色标识。',
      tip: '记住：🔴 > 🟠 > 🟡 > 🟢',
    });
  }
  
  // 稳定性建议
  if (report.modeStats.stabilityScore && report.modeStats.stabilityScore < 60) {
    suggestions.push({
      category: 'consistency',
      priority: 'medium',
      title: '提升稳定性',
      description: '射击间隔波动较大，建议保持稳定的节奏。',
      tip: '尝试使用节拍器，保持固定频率射击。',
    });
  }
  
  // 进步鼓励
  if (history.improvement.trend === 'up' && history.improvement.score > 50) {
    suggestions.push({
      category: 'encouragement',
      priority: 'low',
      title: '继续保持！',
      description: `相比上次训练提升了 ${history.improvement.score} 分，进步明显！`,
    });
  }
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

### 4.4 报告界面数据展示

```
┌─────────────────────────────────────────────────────────────┐
│                    训练报告                                 │
├─────────────────────────────────────────────────────────────┤
│  模式：移动射击 (Motion Track)          难度：Hard          │
│  时间：2026-03-28 14:30                 持续：90 秒          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 总得分   │  │ 命中率   │  │ 连击     │  │ 评级     │   │
│  │  1,850   │  │  87%     │  │  x24     │  │   A      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  详细统计：                                                 │
│  • 总射击：120 次  • 命中：104 次  • 失误：16 次             │
│  • 追踪准确率：82%  • 平均瞄准时间：1.2s                     │
│                                                             │
│  历史对比：                                                 │
│  • 个人最佳：2,100 (2026-03-25)  相差：-250                │
│  • 上次训练：1,620 (2026-03-27)  进步：+230 ✓              │
│  • 10 次平均：1,740                                         │
│                                                             │
│  改进建议：                                                 │
│  ⚠️ 追踪准确率有提升空间，建议尝试 Normal 难度巩固基础       │
│  ✓ 连击能力优秀，继续保持！                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              得分趋势图（近 10 次）                    │   │
│  │   2200 ┤                      ●                      │   │
│  │   2000 ┤            ●         │                      │   │
│  │   1800 ┤      ●     │    ●────┘                      │   │
│  │   1600 ┤   ●  │  ●  │  ●                             │   │
│  │   1400 ┤───┴──┴─────┴────────────────────────────────│   │
│  │         1   2   3   4   5   6   7   8   9   10        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [重新训练]  [更换模式]  [查看详细分析]  [分享成绩]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 附录：数值配置总表

### 5.1 全局常量

```typescript
// 评分权重
const SCORE_WEIGHTS = {
  accuracy: 0.4,      // 准确率权重
  speed: 0.3,         // 速度权重
  consistency: 0.2,   // 稳定性权重
  difficulty: 0.1,    // 难度系数
};

// 连击倍率
const COMBO_MULTIPLIERS = [
  { threshold: 0, multiplier: 1.0 },
  { threshold: 5, multiplier: 1.2 },
  { threshold: 10, multiplier: 1.5 },
  { threshold: 20, multiplier: 2.0 },
  { threshold: 30, multiplier: 2.5 },
  { threshold: 50, multiplier: 3.0 },
];

// 难度系数
const DIFFICULTY_MULTIPLIERS = {
  easy: 0.8,
  normal: 1.0,
  hard: 1.3,
  expert: 1.7,
};
```

### 5.2 模式特定配置

| 参数 | Motion Track | Peek Shot | Switch Track | Reaction | Precision |
|------|-------------|-----------|--------------|----------|-----------|
| 基础分/命中 | 10 | 15 | 20 | 25 | 30 |
| 连击上限 | 50 | 30 | 40 | 20 | 50 |
| 时间奖励 | ✓ | ✓ | ✓ | ✗ | ✓ |
| 精度奖励 | ✓ | ✓ | ✓ | ✗ | ✓✓ |

---

*文档结束*

# 奇幻战线对推 v2 关卡脚本规格

- 日期：2026-04-15
- 作用：定义章节、关卡、波段、触发器、Boss 事件和评分结构，供 `fantasyLaneLevelCatalog` 与测试实现。

---

## 1. 脚本目标

关卡脚本必须做到 3 件事：

1. 每关都能表达清晰考点，而不是单纯数值上涨。
2. 每关都能用统一结构写出来，不靠大量组件内特判。
3. 失败后能回溯到“是哪个波段、哪个事件把玩家打穿了”。

---

## 2. 顶层数据结构

```ts
type FantasyLaneLevelDef = {
  id: string;
  chapterId: string;
  indexInChapter: number;
  name: string;
  battleTimeLimitSec: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  startingGold: number;
  recommendedTags: string[];
  bannedTags?: string[];
  suggestedHeroes: string[];
  unlockReward?: UnlockReward;
  phases: FantasyLanePhaseDef[];
  boss?: FantasyLaneBossDef;
  ratingRules: FantasyLaneRatingRules;
  failureHints: FantasyLaneFailureHintMap;
};
```

---

## 3. 阶段结构

### 3.1 Phase 定义

```ts
type FantasyLanePhaseDef = {
  id: string;
  label: string;
  startAtSec: number;
  endAtSec?: number;
  pressure: 'read' | 'contest' | 'pressure' | 'boss';
  spawnGroups: FantasyLaneSpawnGroup[];
  scriptedEvents?: FantasyLaneTriggerDef[];
  clearCondition?: 'timeElapsed' | 'allSpawnsDone' | 'bossThreshold';
};
```

### 3.2 Spawn Group 定义

```ts
type FantasyLaneSpawnGroup = {
  id: string;
  side: 'enemy';
  unitId: string;
  variantId?: string;
  firstDelaySec: number;
  count: number;
  intervalSec: number;
  laneOverride?: 'front' | 'mid' | 'rear' | 'air';
  elite?: boolean;
  note?: string;
};
```

### 3.3 Trigger 定义

```ts
type FantasyLaneTriggerDef = {
  id: string;
  when:
    | 'time'
    | 'playerBaseHp'
    | 'enemyBaseHp'
    | 'frontline'
    | 'phaseClear'
    | 'bossHp'
    | 'unitDeath';
  compare: '>=' | '<=' | '==';
  value: number | string;
  once: boolean;
  actions: FantasyLaneActionDef[];
};
```

### 3.4 Action 定义

```ts
type FantasyLaneActionDef =
  | { type: 'spawn'; spawnGroup: FantasyLaneSpawnGroup }
  | { type: 'showWarning'; text: string; leadSec?: number }
  | { type: 'grantGold'; amount: number }
  | { type: 'applyModifier'; target: 'player' | 'enemy'; modifierId: string; durationSec: number }
  | { type: 'castBossSkill'; skillId: string }
  | { type: 'advanceBossPhase'; nextPhaseId: string }
  | { type: 'completeObjective'; objectiveId: string };
```

---

## 4. 统一脚本约束

### 4.1 每关必须包含

- 至少 2 个 phase
- 至少 1 个清晰压力点
- 至少 1 条结算评价规则
- 至少 1 组失败提示映射

### 4.2 Boss 关必须包含

- 至少 3 个 phase
- 至少 1 次预警
- 至少 1 个阈值触发事件
- 至少 1 个技能或规则变化

### 4.3 首发禁止

- 随机分支脚本
- 同关多 Boss
- 复杂条件树嵌套
- 无提示秒杀事件

---

## 5. 章节与 30 关目录

## 5.1 第 1 章 哥布林边境

| 关卡 | 主题 | 重点 | 解锁 / 奖励 |
| --- | --- | --- | --- |
| 1-1 | 稳线入门 | 认识前排和后排 | 解锁 `archer` |
| 1-2 | 哥布林海 | 学群伤 | 解锁 `flame_warlock` |
| 1-3 | 重甲来袭 | 学破甲 | 解锁 `crypt_crawler` |
| 1-4 | 技能急救 | 学火球 / 治疗 | 解锁战术技能 `fireball` |
| 1-5 | 前线考试 | 混合波段 | 解锁 `orc_heavy` |
| 1-6 | 骸骨巨王 | 第一次 Boss 战 | 解锁英雄 `战帅` 分支点 |

## 5.2 第 2 章 亡骨荒原

| 关卡 | 主题 | 重点 | 解锁 / 奖励 |
| --- | --- | --- | --- |
| 2-1 | 亡骨复起 | 长线消耗 | 解锁 `plague_thrower` |
| 2-2 | 召唤狂潮 | 清召唤物 | 解锁 `dwarf_ironwall` |
| 2-3 | 压线推进 | 稳线和换线节奏 | 解锁 `wolf_rider` |
| 2-4 | 骨墙突破 | 破甲与冲锋配合 | 解锁战术技能 `shield` |
| 2-5 | 墓地风暴 | 综合考试 | 解锁 `musketeer` |
| 2-6 | 亡骨祭司 | 召唤型 Boss | 解锁英雄 `法导师` |

## 5.3 第 3 章 冰霜峡谷

| 关卡 | 主题 | 重点 | 解锁 / 奖励 |
| --- | --- | --- | --- |
| 3-1 | 第一波空袭 | 学对空 | 解锁 `bat_swarm` |
| 3-2 | 冰封前线 | 学解冻和拖线 | 解锁 `ice_witch` |
| 3-3 | 双层压力 | 地空同时压 | 解锁 `griffin_knight` |
| 3-4 | 空军考试 | 对空资源分配 | 解锁战术技能 `freeze` |
| 3-5 | 冰龙前夜 | 混合空袭 + 重甲 | 解锁 `elf_shooter` |
| 3-6 | 冰霜巨龙 | 空地混合 Boss | 解锁英雄 `驭龙者` |

## 5.4 第 4 章 熔火山口

| 关卡 | 主题 | 重点 | 解锁 / 奖励 |
| --- | --- | --- | --- |
| 4-1 | 熔岩重装 | 纯地面强压 | 解锁 `stone_guard` |
| 4-2 | 爆破雨 | 学护盾和保关键位 | 解锁 `thunder_mage` |
| 4-3 | 裂地推进 | 巨型单位出现 | 解锁 `tree_ancient` |
| 4-4 | 熔火总攻 | 学留终结费 | 解锁战术技能 `haste` |
| 4-5 | 破甲考试 | 破甲与群伤统筹 | 解锁 `ogre_lord` |
| 4-6 | 熔岩暴君 | 地面 Boss | 解锁 `young_dragon` |

## 5.5 第 5 章 龙火王庭

| 关卡 | 主题 | 重点 | 解锁 / 奖励 |
| --- | --- | --- | --- |
| 5-1 | 王庭杂压 | 全体系混编 | 解锁 `ballista` |
| 5-2 | 焚天空袭 | 高压对空 | 解锁 `berserker` |
| 5-3 | 大怪集群 | 学终结兵 timing | 解锁 `shadow_assassin` |
| 5-4 | 双技能协同 | 技能节奏考试 | 解锁战术技能 `heal` |
| 5-5 | 王庭决战前 | 最终综合考试 | 解锁 `fire_dragon` |
| 5-6 | 赤焰龙皇 | 最终 Boss | 完成首发主线 |

---

## 6. Boss 数据结构

```ts
type FantasyLaneBossDef = {
  id: string;
  name: string;
  unitId: string;
  phases: {
    id: string;
    hpThreshold: number;
    enterWarning: string;
    skills: string[];
    phaseSpawnGroups?: FantasyLaneSpawnGroup[];
  }[];
};
```

Boss 规则：

- `hpThreshold` 按剩余生命百分比定义
- 进入新阶段时必须显示预警文本
- Boss 技能必须存在至少 1 秒前摇警告

---

## 7. 评价与失败提示

### 7.1 评价规则

```ts
type FantasyLaneRatingRules = {
  threeStarBaseHpPercent: number;
  twoStarBaseHpPercent: number;
  timeBonusSec?: number;
};
```

首发统一规则：

- 1 星：通关
- 2 星：通关 + 我方主堡剩余生命 >= 50%
- 3 星：通关 + 我方主堡剩余生命 >= 75% + 未进入终局加压

### 7.2 失败提示

```ts
type FantasyLaneFailureHintMap = {
  lowAntiAir?: string;
  lowFrontline?: string;
  lowAoE?: string;
  overSavingGold?: string;
  lateSkillUse?: string;
};
```

运行时结算时从统计数据中选最多 2 条显示。

---

## 8. 三个完整示例

### 8.1 `1-1 稳线入门`

```ts
{
  id: '1-1',
  chapterId: 'chapter-1',
  indexInChapter: 1,
  name: '稳线入门',
  battleTimeLimitSec: 360,
  playerBaseHp: 3000,
  enemyBaseHp: 2600,
  startingGold: 140,
  recommendedTags: ['前排', '远程'],
  suggestedHeroes: ['warlord'],
  phases: [
    {
      id: 'read-open',
      label: '读题',
      startAtSec: 0,
      endAtSec: 40,
      pressure: 'read',
      spawnGroups: [
        { id: 'g1', side: 'enemy', unitId: 'goblin_shield', firstDelaySec: 4, count: 3, intervalSec: 4 }
      ]
    },
    {
      id: 'contest-core',
      label: '中段对推',
      startAtSec: 40,
      pressure: 'contest',
      spawnGroups: [
        { id: 'g2', side: 'enemy', unitId: 'goblin_shield', variantId: 'goblin_swarm', firstDelaySec: 2, count: 6, intervalSec: 2.5 },
        { id: 'g3', side: 'enemy', unitId: 'archer', firstDelaySec: 10, count: 3, intervalSec: 6 }
      ]
    }
  ],
  ratingRules: { threeStarBaseHpPercent: 75, twoStarBaseHpPercent: 50 },
  failureHints: {
    lowFrontline: '这关主要考稳线，先补前排再谈输出。',
    lateSkillUse: '别把第一发火球留到主堡挨打后再按。'
  }
}
```

### 8.2 `3-4 空军考试`

```ts
{
  id: '3-4',
  chapterId: 'chapter-3',
  indexInChapter: 4,
  name: '空军考试',
  battleTimeLimitSec: 420,
  playerBaseHp: 3000,
  enemyBaseHp: 3200,
  startingGold: 120,
  recommendedTags: ['antiAir', 'slow'],
  suggestedHeroes: ['dragon-rider', 'mage-master'],
  phases: [
    {
      id: 'mixed-open',
      label: '混合试探',
      startAtSec: 0,
      endAtSec: 70,
      pressure: 'read',
      spawnGroups: [
        { id: 'air-1', side: 'enemy', unitId: 'bat_swarm', firstDelaySec: 8, count: 4, intervalSec: 5 },
        { id: 'ground-1', side: 'enemy', unitId: 'orc_heavy', firstDelaySec: 20, count: 2, intervalSec: 12 }
      ]
    },
    {
      id: 'air-pressure',
      label: '空袭主压',
      startAtSec: 70,
      pressure: 'pressure',
      spawnGroups: [
        { id: 'air-2', side: 'enemy', unitId: 'young_dragon', variantId: 'dragon_frost', firstDelaySec: 5, count: 2, intervalSec: 16 }
      ],
      scriptedEvents: [
        {
          id: 'warn-air',
          when: 'time',
          compare: '==',
          value: 74,
          once: true,
          actions: [{ type: 'showWarning', text: '高空冰袭来袭，优先补对空。', leadSec: 1 }]
        }
      ]
    }
  ],
  ratingRules: { threeStarBaseHpPercent: 75, twoStarBaseHpPercent: 50 },
  failureHints: {
    lowAntiAir: '这关不是单纯堆地面火力，至少要带两张对空位。',
    overSavingGold: '空袭波之间不要空转存钱，提早铺对空。'
  }
}
```

### 8.3 `5-6 赤焰龙皇`

```ts
{
  id: '5-6',
  chapterId: 'chapter-5',
  indexInChapter: 6,
  name: '赤焰龙皇',
  battleTimeLimitSec: 480,
  playerBaseHp: 3200,
  enemyBaseHp: 4200,
  startingGold: 150,
  recommendedTags: ['antiAir', 'giant', 'pierce'],
  suggestedHeroes: ['dragon-rider', 'warlord'],
  phases: [
    {
      id: 'opening',
      label: '王庭前压',
      startAtSec: 0,
      endAtSec: 120,
      pressure: 'contest',
      spawnGroups: [
        { id: 'g1', side: 'enemy', unitId: 'orc_heavy', variantId: 'orc_elite', firstDelaySec: 6, count: 3, intervalSec: 12 },
        { id: 'g2', side: 'enemy', unitId: 'bat_swarm', firstDelaySec: 18, count: 6, intervalSec: 4 }
      ]
    },
    {
      id: 'boss-enter',
      label: '龙皇降临',
      startAtSec: 120,
      pressure: 'boss',
      spawnGroups: [],
      scriptedEvents: [
        {
          id: 'boss-warning',
          when: 'time',
          compare: '==',
          value: 120,
          once: true,
          actions: [{ type: 'showWarning', text: '赤焰龙皇降临，留技能应对焚天吐息。', leadSec: 2 }]
        }
      ]
    }
  ],
  boss: {
    id: 'scarlet-dragon-king',
    name: '赤焰龙皇',
    unitId: 'scarlet_dragon_king',
    phases: [
      { id: 'phase-1', hpThreshold: 100, enterWarning: '龙皇入场', skills: ['flame-sweep'] },
      { id: 'phase-2', hpThreshold: 70, enterWarning: '龙皇升空', skills: ['meteor-breath'], phaseSpawnGroups: [{ id: 'help-air', side: 'enemy', unitId: 'young_dragon', firstDelaySec: 2, count: 2, intervalSec: 6 }] },
      { id: 'phase-3', hpThreshold: 35, enterWarning: '龙皇狂怒', skills: ['burning-sky', 'dragon-call'] }
    ]
  },
  ratingRules: { threeStarBaseHpPercent: 75, twoStarBaseHpPercent: 50 },
  failureHints: {
    lowAntiAir: '龙皇阶段会反复升空，没有稳定对空会被持续压垮。',
    lowFrontline: '只带输出会被前排冲散，先站住线再找总攻窗口。'
  }
}
```

---

## 9. 脚本开发顺序

1. 先实现 `1-1`、`1-2`、`1-6`
2. 再实现每章第 3 关和第 6 关
3. 最后补齐中间关卡

这样可以优先验证：

- 基础波段
- 章节考试关
- Boss 脚本

---

## 10. 必测清单

- 30 关是否都能被统一结构表达
- Trigger 是否支持时间、血量、前线三类核心条件
- Boss 是否能按阈值切阶段
- 失败提示是否能定位到具体波段压力

# Phase D 实现计划：终局内容 + 100 关完成

## 现状分析

**已完成的部分：**
- 66 植物元数据已定义，全部升级为 `full` 实现
- 30 僵尸元数据已定义，全部升级为 `full` 实现
- 100 关主线数据已生成
- 解锁树系统已完成
- 视觉反馈系统已完成（植物攻击动画、僵尸状态动画、弹道特效）
- CSS 动画系统已完成

**当前 UI 设计模式：**
- 植物展示：健康条 + 充能环 + 简称 + 名称 + 元数据行
- 僵尸展示：健康条 + 简称 + 名称 + 元数据行
- 弹道展示：toneClass + 特效类（slowEffect 对应 snow-pea）
- 状态动画：stealth、airborne、summoning 等 CSS 类
- 攻击动画：attacking、splash-attack、range-attack 等 CSS 类

**缺失的部分：**
1. **终局植物独特行为**：激光豆、菜问、电能射手、冰西瓜藤、磁暴菇、护盾花、审计豆等需要独特行为逻辑
2. **终局僵尸独特行为**：审计官僵尸需要指挥增益逻辑
3. **100 关验证**：确保所有关卡可正常游玩

---

## 阶段划分

### Phase D1：终局植物独特行为实现

#### D1.1 激光豆（laserBean）- 整线穿透

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 攻击时对整行所有僵尸造成伤害（穿透效果）
- 弹道类型：`shock`（电击弹道）
- UI 展示：使用现有 `pvz-plant--range-attack` 动画类

**实现逻辑：**
```typescript
// 激光豆：整线穿透攻击
if (plant.plantId === 'laserBean' && definition.projectileKind === 'shock') {
  const zombiesInLane = state.zombies.filter((zombie) => zombie.row === plant.row && zombie.x >= plant.col);
  if (zombiesInLane.length > 0) {
    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer >= definition.attackIntervalMs) {
      // 对整行所有僵尸造成伤害
      for (const zombie of zombiesInLane) {
        zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
      }
      return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
    }
    return { ...plant, attackTimerMs: nextTimer };
  }
  return plant;
}
```

#### D1.2 菜问（bonkChoy）- 高速近战连打

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 近战攻击，只攻击相邻格子内的僵尸
- 高速连打（attackIntervalMs: 850）
- UI 展示：使用现有 `pvz-plant--attacking` 动画类

**实现逻辑：**
```typescript
// 菜问：高速近战连打
if (plant.plantId === 'bonkChoy' && definition.damage && definition.attackIntervalMs) {
  const adjacentZombies = state.zombies.filter((zombie) => {
    const rowDiff = Math.abs(zombie.row - plant.row);
    const colDiff = Math.abs(zombie.x - plant.col);
    return rowDiff <= 1 && colDiff <= 1.5;
  });
  if (adjacentZombies.length > 0) {
    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer >= definition.attackIntervalMs) {
      // 对相邻僵尸造成伤害
      for (const zombie of adjacentZombies) {
        zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + definition.damage);
      }
      return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
    }
    return { ...plant, attackTimerMs: nextTimer };
  }
  return plant;
}
```

#### D1.3 电能射手（electricPea）- 连锁输出

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 弹道命中后，对相邻僵尸造成连锁伤害（50% 伤害）
- 弹道类型：`shock`
- UI 展示：弹道使用 `pvz-projectile--shock` 特效类

**实现逻辑：**
```typescript
// 在 moveProjectiles 中添加连锁效果
if (projectile.kind === 'shock' && target) {
  zombieDamage.set(target.instanceId, (zombieDamage.get(target.instanceId) || 0) + projectile.damage);
  // 连锁效果：对相邻僵尸造成 50% 伤害
  const chainTargets = state.zombies.filter((zombie) => {
    const rowDiff = Math.abs(zombie.row - projectile.row);
    const colDiff = Math.abs(zombie.x - projectile.x);
    return rowDiff <= 1 && colDiff <= 1 && zombie.instanceId !== target.instanceId;
  });
  for (const chainTarget of chainTargets) {
    zombieDamage.set(chainTarget.instanceId, (zombieDamage.get(chainTarget.instanceId) || 0) + Math.floor(projectile.damage * 0.5));
  }
}
```

#### D1.4 冰西瓜藤（frostMelonVine）- 强控抛投

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 抛投弹道，命中后 3×3 溅射 + 减速效果
- 弹道类型：`lobbed`
- UI 展示：使用现有 `pvz-plant--splash-attack` 动画类

**实现逻辑：**
```typescript
// 冰西瓜藤：强控抛投（已在弹道创建逻辑中实现）
if (plant.plantId === 'frostMelonVine') {
  createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6, definition.damage, { splashRadius: 3, slowEffect: true }));
}
```

#### D1.5 磁暴菇（magnetBurstShroom）- 群体脱甲

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 定期移除周围僵尸的护甲
- 支持效果：`armor-strip`
- UI 展示：使用现有 `pvz-plant--range-attack` 动画类

**实现逻辑：**
```typescript
// 磁暴菇：群体脱甲
if (plant.plantId === 'magnetBurstShroom' && definition.supportEffect === 'armor-strip') {
  const armoredZombies = state.zombies.filter((zombie) => {
    const rowDiff = Math.abs(zombie.row - plant.row);
    const colDiff = Math.abs(zombie.x - plant.col);
    const zombieDef = PVZ_ZOMBIE_MAP[zombie.zombieId];
    return rowDiff <= 2 && colDiff <= 3 && zombieDef.armorHp > 0;
  });
  if (armoredZombies.length > 0) {
    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer >= (definition.attackIntervalMs || 10000)) {
      // 移除护甲（简化实现：直接扣除护甲血量）
      for (const zombie of armoredZombies) {
        const zombieDef = PVZ_ZOMBIE_MAP[zombie.zombieId];
        zombieDamage.set(zombie.instanceId, (zombieDamage.get(zombie.instanceId) || 0) + zombieDef.armorHp);
      }
      return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
    }
    return { ...plant, attackTimerMs: nextTimer };
  }
  return plant;
}
```

#### D1.6 护盾花（shieldBlossom）- 队友保护

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 为相邻植物提供护盾（增加临时护甲血量）
- 支持效果：`shield`
- UI 展示：使用现有 `pvz-plant--attacking` 动画类

**实现逻辑：**
```typescript
// 护盾花：队友保护（为相邻植物增加护甲血量）
if (plant.plantId === 'shieldBlossom' && definition.supportEffect === 'shield') {
  const adjacentPlants = state.plants.filter((p) => {
    const rowDiff = Math.abs(p.row - plant.row);
    const colDiff = Math.abs(p.col - plant.col);
    return rowDiff <= 1 && colDiff <= 1 && p.instanceId !== plant.instanceId;
  });
  if (adjacentPlants.length > 0) {
    const nextTimer = plant.attackTimerMs + elapsedMs;
    if (nextTimer >= (definition.attackIntervalMs || 10000)) {
      // 为相邻植物增加护甲血量（简化实现：直接增加 hp）
      const shieldAmount = 200;
      const updatedPlants = state.plants.map((p) => {
        if (adjacentPlants.some((adj) => adj.instanceId === p.instanceId)) {
          const plantDef = PVZ_PLANT_MAP[p.plantId];
          return { ...p, hp: Math.min(p.hp + shieldAmount, plantDef.maxHp + shieldAmount) };
        }
        return p;
      });
      // 需要在 applyPlantAttacks 返回时传递 updatedPlants
      return { ...plant, attackTimerMs: 0, isAttacking: true, lastAttackTime: Date.now() };
    }
    return { ...plant, attackTimerMs: nextTimer };
  }
  return plant;
}
```

**注意：** 需要修改 `applyPlantAttacks` 函数返回值，增加 `updatedPlants` 字段，并在 `tickPvZBoard` 中合并。

#### D1.7 审计豆（auditBean）- 高威胁标记

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 弹道命中后，标记僵尸为高威胁（增加后续伤害倍数）
- 弹道类型：`shock`
- UI 展示：弹道使用 `pvz-projectile--shock` 特效类

**实现逻辑：**
```typescript
// 审计豆：高威胁标记（增加伤害倍数 + 标记效果）
if (plant.plantId === 'auditBean' && definition.projectileKind === 'shock') {
  // 弹道命中后，标记僵尸增加后续伤害倍数
  // 需要在 PvZProjectile 中增加 markEffect 字段
  createdProjectiles.push(createProjectile(definition.projectileKind, plant.row, plant.col + 0.6, definition.damage, { markEffect: true }));
}

// 在 moveProjectiles 中处理标记效果
if (projectile.markEffect && target) {
  zombieDamage.set(target.instanceId, (zombieDamage.get(target.instanceId) || 0) + projectile.damage * 1.5);
  // 标记僵尸：后续攻击增加 50% 伤害（简化实现：直接增加本次伤害）
}
```

**注意：** 需要在 `PvZProjectile` 类型中增加 `markEffect?: boolean` 字段。

---

### Phase D2：终局僵尸独特行为实现

#### D2.1 审计官僵尸（auditChief）- 指挥增益

**文件：** `src/features/pvz/pvzBoardState.ts`（修改）

**独特行为：**
- 为周围僵尸提供增益（增加移动速度）
- UI 展示：使用现有 `pvz-zombie--summoning` 动画类（光环效果）

**实现逻辑：**
```typescript
// 审计官僵尸：指挥增益（增加周围僵尸速度）
if (zombie.zombieId === 'auditChief') {
  const nearbyZombies = state.zombies.filter((z) => {
    const rowDiff = Math.abs(z.row - zombie.row);
    const colDiff = Math.abs(z.x - zombie.x);
    return rowDiff <= 1 && colDiff <= 2 && z.instanceId !== zombie.instanceId;
  });
  // 审计官僵尸自己速度不变，但标记为召唤状态（光环效果）
  const isSummoning = nearbyZombies.length > 0;
  return { ...zombie, x: zombie.x - definition.speed * elapsedMs, isSummoning };
}

// 在 moveZombies 中，为审计官僵尸周围的僵尸增加速度
// 需要在处理所有僵尸时，检查是否有审计官僵尸在附近
for (const zombie of state.zombies) {
  const nearbyAuditChief = state.zombies.find((z) => {
    if (z.zombieId !== 'auditChief') return false;
    const rowDiff = Math.abs(z.row - zombie.row);
    const colDiff = Math.abs(z.x - zombie.x);
    return rowDiff <= 1 && colDiff <= 2 && z.instanceId !== zombie.instanceId;
  });
  const boostedSpeed = nearbyAuditChief ? definition.speed * 1.2 : definition.speed;
  // 使用 boostedSpeed 移动僵尸
}
```

**注意：** 需要在 `moveZombies` 函数中实现审计官僵尸对周围僵尸的速度增益逻辑。

---

### Phase D3：100 关全部可玩验证

#### D3.1 验证关卡数据完整性

**文件：** `src/features/pvz/pvzAdventureLevels.ts`（检查）

**验证内容：**
- 1-10 章每关的 `availablePlants` 是否正确
- 1-10 章每关的 `enemyRoster` 是否合理
- 1-10 章每关的 `spawnQueue` 是否完整
- 1-10 章每关的 `recommendedCards` 是否合理

#### D3.2 验证解锁树逻辑

**文件：** `src/features/pvz/pvzProgressStorage.ts`（检查）

**验证内容：**
- 1-01 到 10-10 的解锁顺序是否正确
- 每关通关后解锁的植物是否正确
- 每关通关后解锁的僵尸是否正确

#### D3.3 验证战斗逻辑

**文件：** `src/features/pvz/pvzBoardState.ts`（检查）

**验证内容：**
- 1-10 章所有植物的行为是否正确
- 1-10 章所有僵尸的行为是否正确
- 弹道系统是否正常工作
- 胜利/失败判定是否正确

---

### Phase D4：UI 展示和 UE 交互优化

#### D4.1 确保终局植物 UI 符合现有设计

**文件：** `src/components/pvz/PvZBoard.tsx`（检查）

**验证内容：**
- 激光豆使用 `pvz-plant--range-attack` 动画类
- 菜问使用 `pvz-plant--attacking` 动画类
- 电能射手弹道使用 `pvz-projectile--shock` 特效类
- 冰西瓜藤使用 `pvz-plant--splash-attack` 动画类
- 磁暴菇使用 `pvz-plant--range-attack` 动画类
- 护盾花使用 `pvz-plant--attacking` 动画类
- 审计豆弹道使用 `pvz-projectile--shock` 特效类

#### D4.2 确保终局僵尸 UI 符合现有设计

**文件：** `src/components/pvz/PvZBoard.tsx`（检查）

**验证内容：**
- 审计官僵尸使用 `pvz-zombie--summoning` 动画类（光环效果）

#### D4.3 确保 Boss 关 UI 特效

**文件：** `src/styles/pvz.css`（修改）

**新增 Boss 关特效：**
```css
.pvz-zombie--boss {
  animation: pvz-boss-glow 1s infinite;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

@keyframes pvz-boss-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
}
```

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**应用 Boss 关特效：**
```typescript
// 在僵尸渲染中，为 Boss 级僵尸添加 boss 类
const zombieBossClass = zombieDefinition.archetype === 'boss' ? 'pvz-zombie--boss' : '';

// 在僵尸 div 的 className 中添加
className={`pvz-zombie ${getPvZZombieToneClass(zombie.zombieId)} ${getPvZZombieFrameClass(zombieDefinition)} ${zombieStealthClass} ${zombieAirborneClass} ${zombieSummoningClass} ${zombieBossClass}`.trim()}
```

**Boss 级僵尸列表：**
- `gargantuar`（巨人僵尸）
- `auditChief`（审计官僵尸）
- `finalGargantuar`（最终巨人僵尸）

---

### Phase D5：PvZBoard.tsx 终局植物/僵尸动画类判断

#### D5.1 终局植物动画类判断

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增判断逻辑：**
```typescript
// 激光豆：范围攻击动画
const plantRangeAttackClass = plant && plant.plantId === 'laserBean' && plant.isAttacking ? 'pvz-plant--range-attack' : '';

// 菜问：普通攻击动画
const plantMeleeAttackClass = plant && plant.plantId === 'bonkChoy' && plant.isAttacking ? 'pvz-plant--attacking' : '';

// 冰西瓜藤：溅射攻击动画
const plantFrostSplashClass = plant && plant.plantId === 'frostMelonVine' && plant.isAttacking ? 'pvz-plant--splash-attack' : '';

// 磁暴菇：范围攻击动画
const plantMagnetBurstClass = plant && plant.plantId === 'magnetBurstShroom' && plant.isAttacking ? 'pvz-plant--range-attack' : '';

// 护盾花：普通攻击动画
const plantShieldClass = plant && plant.plantId === 'shieldBlossom' && plant.isAttacking ? 'pvz-plant--attacking' : '';

// 合并所有动画类
const allPlantAttackClasses = `${plantAttackClass} ${plantSplashClass} ${plantRangeClass} ${plantRangeAttackClass} ${plantMeleeAttackClass} ${plantFrostSplashClass} ${plantMagnetBurstClass} ${plantShieldClass}`.trim();
```

#### D5.2 终局僵尸动画类判断

**文件：** `src/components/pvz/PvZBoard.tsx`（修改）

**新增判断逻辑：**
```typescript
// 审计官僵尸：召唤光环动画
const zombieAuditChiefClass = zombie.zombieId === 'auditChief' && zombie.isSummoning ? 'pvz-zombie--summoning' : '';

// Boss 级僵尸：Boss 光环动画
const zombieBossClass = zombieDefinition.archetype === 'boss' ? 'pvz-zombie--boss' : '';

// 合并所有动画类
const allZombieStateClasses = `${zombieStealthClass} ${zombieAirborneClass} ${zombieSummoningClass} ${zombieAuditChiefClass} ${zombieBossClass}`.trim();
```

---

## 实施顺序

1. **D1.1-D1.7**：终局植物独特行为实现
2. **D2.1**：终局僵尸独特行为实现
3. **D4.1-D4.3**：UI 展示和 UE 交互优化（CSS + PvZBoard.tsx Boss 特效）
4. **D5.1-D5.2**：PvZBoard.tsx 终局植物/僵尸动画类判断
5. **D3.1-D3.3**：100 关验证

---

## 技术要点

### UI 设计一致性
- 所有终局植物使用现有 CSS 动画类（attacking、splash-attack、range-attack）
- 所有终局僵尸使用现有 CSS 动画类（stealth、airborne、summoning）
- 弹道特效使用现有 CSS 特效类（snow-pea、shock）

### UE 交互一致性
- 植物攻击动画持续时间：300ms
- 僵尸状态动画：持续循环
- 弹道特效：命中后 300ms 消失

### 性能优化
- 终局植物独特行为不增加额外渲染负担
- 终局僵尸独特行为不增加额外渲染负担
- Boss 关特效使用 CSS 动画，不使用 JavaScript 动画

### 测试策略
- 手动测试：在浏览器中验证终局植物/僵尸行为
- 性能测试：确保终局内容不影响游戏流畅度
- 功能测试：确保 100 关全部可玩
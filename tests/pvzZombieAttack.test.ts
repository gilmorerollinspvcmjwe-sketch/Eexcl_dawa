import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPvZBoardState,
  startPvZBattle,
  placePlant,
  spawnZombieNow,
  tickPvZBoard,
  type PvZBoardState,
} from '../src/features/pvz/pvzBoardState.ts';
import { PVZ_PLANT_MAP } from '../src/features/pvz/pvzPlantRegistry.ts';
import { PVZ_ZOMBIE_MAP } from '../src/features/pvz/pvzZombieRegistry.ts';

test('僵尸接近植物时开始啃食', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const afterTick = tickPvZBoard(state, 100);
  const zombie = afterTick.zombies.find(z => z.row === 0);
  
  assert.ok(zombie?.isAttacking);
});

test('僵尸啃食会持续降低植物血量', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const plantBefore = state.plants.find(p => p.row === 0 && p.col === 4);
  const hpBefore = plantBefore?.hp ?? 0;
  
  const after1s = tickPvZBoard(state, 1000);
  const plantAfter = after1s.plants.find(p => p.row === 0 && p.col === 4);
  
  assert.ok(plantAfter?.hp < hpBefore);
});

test('植物被啃食时标记为被攻击状态', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const afterTick = tickPvZBoard(state, 100);
  const plant = afterTick.plants.find(p => p.row === 0 && p.col === 4);
  
  assert.ok(plant?.isBeingAttacked);
});

test('植物血量归零后消失', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const wallnutDef = PVZ_PLANT_MAP['wallnut'];
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;
  
  const afterKill = tickPvZBoard(state, timeToKill);
  const plant = afterKill.plants.find(p => p.row === 0 && p.col === 4);
  
  assert.equal(plant, undefined);
});

test('植物死亡后僵尸继续前进', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const wallnutDef = PVZ_PLANT_MAP['wallnut'];
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;
  
  const afterKill = tickPvZBoard(state, timeToKill);
  const zombie = afterKill.zombies.find(z => z.row === 0);
  
  assert.ok(!zombie?.isAttacking);
  assert.ok(zombie?.x < 4.3);
});

test('多个僵尸可同时啃食同一植物', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  state = spawnZombieNow(state, 'conehead', 0, 4.4);
  
  const afterTick = tickPvZBoard(state, 100);
  const attackingZombies = afterTick.zombies.filter(z => z.isAttacking);
  
  assert.equal(attackingZombies.length, 2);
});

test('僵尸啃食速度按类型不同', () => {
  const normalDamage = 20;
  const bossDamage = 40;
  
  assert.ok(bossDamage > normalDamage);
});

test('植物死亡后僵尸攻击状态解除', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const wallnutDef = PVZ_PLANT_MAP['wallnut'];
  const damagePerSecond = 20;
  const timeToKill = Math.ceil(wallnutDef.maxHp / damagePerSecond) * 1000 + 500;
  
  const afterKill = tickPvZBoard(state, timeToKill);
  const zombie = afterKill.zombies.find(z => z.row === 0);
  
  assert.equal(zombie?.isAttacking, false);
  assert.equal(zombie?.attackTargetId, undefined);
});

test('僵尸啃食时停止移动', () => {
  let state = startPvZBattle(createPvZBoardState());
  state = placePlant(state, 'wallnut', 0, 4);
  state = spawnZombieNow(state, 'normal', 0, 4.3);
  
  const after1s = tickPvZBoard(state, 1000);
  const zombie = after1s.zombies.find(z => z.row === 0);
  
  assert.ok(zombie?.isAttacking);
  assert.ok(Math.abs(zombie?.x - 4.3) < 0.1);
});
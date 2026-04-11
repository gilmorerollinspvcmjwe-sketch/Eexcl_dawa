import type { PvZZombieDefinition } from './pvzTypes';

export const PVZ_ZOMBIES: PvZZombieDefinition[] = [
  { id: 'normal', name: '普通僵尸', shortName: '僵', maxHp: 200, speed: 0.00002, rewardSun: 25 },
  { id: 'flag', name: '旗帜僵尸', shortName: '旗', maxHp: 200, speed: 0.000024, rewardSun: 25 },
  { id: 'conehead', name: '路障僵尸', shortName: '障', maxHp: 370, speed: 0.00002, rewardSun: 25 },
  { id: 'buckethead', name: '铁桶僵尸', shortName: '桶', maxHp: 1100, speed: 0.000018, rewardSun: 50 },
];

export const PVZ_ZOMBIE_MAP = Object.fromEntries(PVZ_ZOMBIES.map((zombie) => [zombie.id, zombie])) as Record<
  PvZZombieDefinition['id'],
  PvZZombieDefinition
>;


import type { PvZPlantDefinition } from './pvzTypes';

export const PVZ_PLANTS: PvZPlantDefinition[] = [
  { id: 'sunflower', name: '向日葵', shortName: '阳', cost: 50, cooldownMs: 7500, maxHp: 300, producesSun: true, sunIntervalMs: 6000, sunAmount: 25 },
  { id: 'peashooter', name: '豌豆射手', shortName: '豌', cost: 100, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'pea', projectileCount: 1 },
  { id: 'wallnut', name: '坚果墙', shortName: '坚', cost: 50, cooldownMs: 30000, maxHp: 4000, laneBlocker: true },
  { id: 'cherryBomb', name: '樱桃炸弹', shortName: '樱', cost: 150, cooldownMs: 50000, maxHp: 1, explodeRadius: 3 },
  { id: 'potatoMine', name: '土豆雷', shortName: '雷', cost: 25, cooldownMs: 30000, maxHp: 1, damage: 1800, attackIntervalMs: 14000 },
  { id: 'repeater', name: '双发射手', shortName: '双', cost: 200, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'double-pea', projectileCount: 2 },
  { id: 'snowPea', name: '寒冰射手', shortName: '冰', cost: 175, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'snow-pea', projectileCount: 1 },
  { id: 'cabbagePult', name: '卷心菜投手', shortName: '菜', cost: 100, cooldownMs: 7500, maxHp: 300, damage: 35, attackIntervalMs: 1800, projectileKind: 'lobbed', projectileCount: 1 },
  { id: 'chomper', name: '大嘴花', shortName: '嘴', cost: 150, cooldownMs: 7500, maxHp: 300, damage: 1800, attackIntervalMs: 3000 },
  { id: 'threepeater', name: '三线射手', shortName: '三', cost: 325, cooldownMs: 7500, maxHp: 300, damage: 20, attackIntervalMs: 1400, projectileKind: 'pea', projectileCount: 1 },
  { id: 'torchwood', name: '火炬树桩', shortName: '炬', cost: 175, cooldownMs: 7500, maxHp: 300 },
  { id: 'kernelPult', name: '玉米投手', shortName: '米', cost: 100, cooldownMs: 7500, maxHp: 300, damage: 30, attackIntervalMs: 1800, projectileKind: 'lobbed', projectileCount: 1 },
];

export const PVZ_PLANT_MAP = Object.fromEntries(PVZ_PLANTS.map((plant) => [plant.id, plant])) as Record<
  PvZPlantDefinition['id'],
  PvZPlantDefinition
>;

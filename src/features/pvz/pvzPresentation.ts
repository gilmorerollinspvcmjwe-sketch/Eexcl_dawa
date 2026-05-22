/* PvZ 表现辅助。把内容 registry 转成 UI 色调、标签、血条与节奏信息。 */
import { getPvZPlantById } from './pvzPlantRegistry.ts';
import { getPvZZombieById } from './pvzZombieRegistry.ts';
import type {
  PvZPlantDefinition,
  PvZPlantInstance,
  PvZProjectileKind,
  PvZZombieDefinition,
  PvZZombieInstance,
} from './pvzTypes.ts';

function getPlantTone(plant: PvZPlantDefinition): string {
  if (plant.producesSun) return 'sun';
  if (plant.supportEffect === 'torch' || plant.tags.includes('火系')) return 'fire';
  if (plant.projectileKind === 'snow-pea' || plant.tags.includes('减速')) return 'ice';
  if (plant.archetype === 'blocker' || plant.archetype === 'container' || plant.archetype === 'platform') return 'nut';
  if (plant.archetype === 'bomb') return 'bomb';
  if (plant.archetype === 'trap' || plant.archetype === 'spike') return 'mine';
  if (plant.archetype === 'lobber') return plant.id === 'kernelPult' || plant.id === 'butterCannon' ? 'kernel' : 'lob';
  if (plant.archetype === 'melee') return 'bite';
  if (plant.multiLane) return 'triple';
  if ((plant.projectileCount ?? 0) >= 2) return 'double';
  return 'pea';
}

function getZombieTone(zombie: PvZZombieDefinition): string {
  if (zombie.id === 'flag') return 'flag';
  if (zombie.tags.includes('快攻') || zombie.speed >= 0.00003) return 'football';
  if (zombie.tags.includes('跳跃')) return 'pole';
  if (zombie.tags.includes('护盾') || zombie.archetype === 'ranged') return 'door';
  if ((zombie.armorHp ?? 0) >= 600 || zombie.archetype === 'boss') return 'bucket';
  if ((zombie.armorHp ?? 0) > 0) return 'cone';
  if (zombie.tags.includes('变速') || zombie.archetype === 'summoner' || zombie.archetype === 'support') return 'paper';
  return 'normal';
}

const PROJECTILE_TONE_MAP: Record<PvZProjectileKind, string> = {
  pea: 'pea',
  'double-pea': 'double-pea',
  'snow-pea': 'snow-pea',
  lobbed: 'lobbed',
  'fire-pea': 'double-pea',
  shock: 'snow-pea',
  spike: 'lobbed',
};

export const getPvZPlantToneClass = (plantIdOrPlant: PvZPlantDefinition['id'] | PvZPlantDefinition): string =>
  `pvz-plant--${getPlantTone(typeof plantIdOrPlant === 'string' ? getPvZPlantById(plantIdOrPlant) : plantIdOrPlant)}`;

export const getPvZZombieToneClass = (zombieIdOrZombie: PvZZombieDefinition['id'] | PvZZombieDefinition): string =>
  `pvz-zombie--${getZombieTone(typeof zombieIdOrZombie === 'string' ? getPvZZombieById(zombieIdOrZombie) : zombieIdOrZombie)}`;

export const getPvZProjectileToneClass = (kind: PvZProjectileKind): string => `kind-${PROJECTILE_TONE_MAP[kind]}`;

export const getPvZPlantRoleLabel = (plant: PvZPlantDefinition): string => {
  switch (plant.archetype) {
    case 'economy':
      return '经济';
    case 'blocker':
    case 'container':
    case 'platform':
      return '防线';
    case 'lobber':
      return '抛投';
    case 'bomb':
      return '爆发';
    case 'trap':
    case 'spike':
      return '陷阱';
    case 'melee':
      return '近战';
    case 'support':
      return '支援';
    case 'special':
      return '特殊';
    default:
      return '输出';
  }
};

export const getPvZZombieThreatLabel = (zombie: PvZZombieDefinition): string => zombie.threatLabel;

export const getPvZProjectileLabel = (kind: PvZProjectileKind): string => {
  switch (kind) {
    case 'double-pea':
      return '双发';
    case 'snow-pea':
      return '冰弹';
    case 'lobbed':
      return '抛投';
    case 'fire-pea':
      return '火弹';
    case 'shock':
      return '电束';
    case 'spike':
      return '尖刺';
    default:
      return '直射';
  }
};

export const getPvZPlantTraitLabel = (plant: PvZPlantDefinition): string => {
  if (plant.producesSun) return '产阳';
  if ((plant.armorHp ?? 0) > 0 || plant.laneBlocker || plant.maxHp >= 1000) return '高血';
  if (plant.explodeRadius || plant.archetype === 'bomb' || plant.archetype === 'trap') return '爆发';
  if (plant.projectileKind === 'snow-pea' || plant.tags.includes('减速')) return '减速';
  if (plant.multiLane) return '多线';
  if (plant.projectileKind === 'lobbed') return '抛投';
  if (plant.supportEffect) return '支援';
  return '输出';
};

export const getPvZZombieTraitLabel = (zombie: PvZZombieDefinition): string => {
  if (zombie.archetype === 'boss' || (zombie.armorHp ?? 0) >= 600) return '高压';
  if (zombie.archetype === 'fast' || zombie.speed >= 0.00003) return '快速';
  if (zombie.archetype === 'summoner' || zombie.archetype === 'support') return '精英';
  return '步压';
};

export const getPvZPlantTraitClass = (plant: PvZPlantDefinition): string => {
  if ((plant.armorHp ?? 0) > 0 || plant.laneBlocker || plant.maxHp >= 1000) return 'pvz-trait--tank';
  if (plant.explodeRadius || plant.archetype === 'bomb' || plant.archetype === 'trap' || plant.archetype === 'spike') return 'pvz-trait--blast';
  if (plant.projectileKind || plant.archetype === 'lobber') return 'pvz-trait--ranged';
  return 'pvz-trait--support';
};

export const getPvZZombieTraitClass = (zombie: PvZZombieDefinition): string => {
  if (zombie.archetype === 'boss' || (zombie.armorHp ?? 0) >= 600) return 'pvz-trait--tank';
  if (zombie.archetype === 'fast' || zombie.speed >= 0.00003) return 'pvz-trait--fast';
  return 'pvz-trait--pressure';
};

export const getPvZPlantFrameClass = (plant: PvZPlantDefinition): string =>
  (plant.armorHp ?? 0) > 0 || plant.laneBlocker || plant.maxHp >= 1000 ? 'pvz-unit-frame--armor' : '';

export const getPvZZombieFrameClass = (zombie: PvZZombieDefinition): string =>
  (zombie.armorHp ?? 0) > 0 ? 'pvz-unit-frame--armor' : '';

export const getPvZPlantHpPercent = (plant: PvZPlantInstance, definition: PvZPlantDefinition): number =>
  Math.max(0, Math.min(100, (plant.hp / definition.maxHp) * 100));

export const getPvZZombieHpPercent = (zombie: PvZZombieInstance, definition: PvZZombieDefinition): number =>
  Math.max(0, Math.min(100, (zombie.hp / definition.maxHp) * 100));

function formatPvZCadenceMs(ms: number): string {
  const seconds = ms / 1000;
  return `${Number.isInteger(seconds) ? seconds.toFixed(0) : seconds.toFixed(1)}秒`;
}

export function getPvZPlantCadenceLabels(plant: PvZPlantDefinition): string[] {
  const labels: string[] = [];
  if (plant.producesSun && plant.sunIntervalMs) labels.push(`产${formatPvZCadenceMs(plant.sunIntervalMs)}`);
  if (plant.attackIntervalMs) labels.push(`${plant.archetype === 'trap' ? '埋' : '攻'}${formatPvZCadenceMs(plant.attackIntervalMs)}`);
  labels.push(`冷${formatPvZCadenceMs(plant.cooldownMs)}`);
  return labels.slice(0, 3);
}

export function getPvZPlantCompactLabel(plant: PvZPlantDefinition): string {
  if (plant.producesSun) return '产阳';
  if (plant.archetype === 'bomb') return '清场';
  if (plant.archetype === 'trap' || plant.archetype === 'spike') return '陷阱';
  if (plant.archetype === 'support' || plant.supportEffect) return '支援';
  if (plant.projectileKind === 'snow-pea' || plant.tags.includes('减速')) return '减速';
  if (plant.multiLane) return '多线';
  if (plant.projectileKind === 'lobbed') return '抛投';
  if ((plant.armorHp ?? 0) > 0 || plant.laneBlocker || plant.maxHp >= 1000) return '高血';
  return '输出';
}

export function getPvZZombieCadenceLabels(zombie: PvZZombieDefinition): string[] {
  const labels = [`移${(zombie.speed / 0.00002).toFixed(1)}x`];
  if ((zombie.armorHp ?? 0) > 0) labels.push(`甲${zombie.armorHp}`);
  if (zombie.archetype === 'summoner' && zombie.summonIds?.length) labels.push(`召${zombie.summonIds.length}`);
  if (zombie.tags.includes('后切')) labels.push('后切');
  if (zombie.tags.includes('空中')) labels.push('空中');
  if (zombie.tags.includes('水路')) labels.push('水路');
  return labels.slice(0, 3);
}

export function getPvZZombieArmorHp(zombie: PvZZombieDefinition): number {
  return zombie.armorHp ?? 0;
}

export function getPvZZombieBaseHp(zombie: PvZZombieDefinition): number {
  return zombie.maxHp - getPvZZombieArmorHp(zombie);
}

export function getPvZPlantArmorHp(plant: PvZPlantDefinition): number {
  return plant.armorHp ?? 0;
}

export function getPvZPlantBaseHp(plant: PvZPlantDefinition): number {
  return plant.maxHp - getPvZPlantArmorHp(plant);
}

export function getPvZPlantHealthSegments(plant: PvZPlantInstance, definition: PvZPlantDefinition) {
  const armorHp = getPvZPlantArmorHp(definition);
  const baseHp = getPvZPlantBaseHp(definition);
  const currentArmorHp = Math.max(0, Math.min(armorHp, plant.hp - baseHp));
  const currentBaseHp = Math.max(0, Math.min(baseHp, plant.hp));
  return {
    armorPercent: definition.maxHp > 0 ? (currentArmorHp / definition.maxHp) * 100 : 0,
    basePercent: definition.maxHp > 0 ? (currentBaseHp / definition.maxHp) * 100 : 0,
    hasArmor: armorHp > 0,
  };
}

export function getPvZZombieHealthSegments(zombie: PvZZombieInstance, definition: PvZZombieDefinition) {
  const armorHp = getPvZZombieArmorHp(definition);
  const baseHp = getPvZZombieBaseHp(definition);
  const currentArmorHp = Math.max(0, Math.min(armorHp, zombie.hp - baseHp));
  const currentBaseHp = Math.max(0, Math.min(baseHp, zombie.hp));
  return {
    armorPercent: definition.maxHp > 0 ? (currentArmorHp / definition.maxHp) * 100 : 0,
    basePercent: definition.maxHp > 0 ? (currentBaseHp / definition.maxHp) * 100 : 0,
    hasArmor: armorHp > 0,
  };
}

export function getPvZPlantChargeState(plant: PvZPlantInstance, definition: PvZPlantDefinition): {
  progress: number;
  label: string;
  toneClass: string;
} | null {
  if (definition.producesSun && definition.sunIntervalMs) {
    return {
      progress: Math.max(0, Math.min(1, plant.sunTimerMs / definition.sunIntervalMs)),
      label: '产',
      toneClass: 'pvz-charge--sun',
    };
  }
  if (definition.attackIntervalMs) {
    return {
      progress: Math.max(0, Math.min(1, plant.attackTimerMs / definition.attackIntervalMs)),
      label: definition.archetype === 'trap' ? '埋' : '攻',
      toneClass: definition.archetype === 'bomb' || definition.archetype === 'trap' ? 'pvz-charge--blast' : 'pvz-charge--attack',
    };
  }
  return null;
}

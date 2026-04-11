export type PvZPlantId =
  | 'sunflower'
  | 'peashooter'
  | 'wallnut'
  | 'cherryBomb'
  | 'potatoMine'
  | 'repeater'
  | 'snowPea'
  | 'cabbagePult'
  | 'chomper'
  | 'threepeater'
  | 'torchwood'
  | 'kernelPult';

export type PvZZombieId = 'normal' | 'flag' | 'conehead' | 'buckethead' | 'newspaper' | 'pole' | 'football' | 'screenDoor';

export interface PvZPlantDefinition {
  id: PvZPlantId;
  name: string;
  shortName: string;
  cost: number;
  cooldownMs: number;
  maxHp: number;
  damage?: number;
  attackIntervalMs?: number;
  producesSun?: boolean;
  sunIntervalMs?: number;
  sunAmount?: number;
  laneBlocker?: boolean;
  explodeRadius?: 1 | 3;
  projectileKind?: PvZProjectileKind;
  projectileCount?: number;
}

export interface PvZZombieDefinition {
  id: PvZZombieId;
  name: string;
  shortName: string;
  maxHp: number;
  speed: number;
  rewardSun?: number;
}

export interface PvZPlantInstance {
  instanceId: string;
  plantId: PvZPlantId;
  row: number;
  col: number;
  hp: number;
  attackTimerMs: number;
  sunTimerMs: number;
  armed: boolean;
}

export interface PvZZombieInstance {
  instanceId: string;
  zombieId: PvZZombieId;
  row: number;
  x: number;
  hp: number;
}

export type PvZProjectileKind = 'pea' | 'double-pea' | 'snow-pea' | 'lobbed';

export interface PvZProjectile {
  projectileId: string;
  kind: PvZProjectileKind;
  row: number;
  x: number;
  speed: number;
  damage: number;
  targetZombieId?: string;
}

export interface PvZSpawnEvent {
  id: string;
  zombieId: PvZZombieId;
  row: number;
  spawnAtMs: number;
}

export interface PvZBoardState {
  rows: number;
  cols: number;
  sun: number;
  phase: 'setup' | 'playing' | 'won' | 'lost';
  status: 'playing' | 'won' | 'lost';
  elapsedMs: number;
  waveProgress: number;
  selectedPlantId: PvZPlantId | null;
  selectedCards: PvZPlantId[];
  plants: PvZPlantInstance[];
  zombies: PvZZombieInstance[];
  projectiles: PvZProjectile[];
  spawnQueue: PvZSpawnEvent[];
  lawnMowers: boolean[];
  cardCooldownsMs: Partial<Record<PvZPlantId, number>>;
}

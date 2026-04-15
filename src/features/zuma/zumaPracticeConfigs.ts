/* 祖玛练习配置表。负责练习模块的状态层参数和练习专用开局构造。 */

import { createZumaBoardState } from './zumaBoardState.ts';
import type { ZumaBallColor, ZumaBoardState, ZumaPowerupType } from './zumaTypes.ts';

export interface ZumaPracticeConfig {
  id: string;
  name: string;
  description: string;
  objective: string;
  trackId: string;
  colorPool: ZumaBallColor[];
  durationMs: number;
  initialBalls: number;
  baseSpeed: number;
  powerupChance?: number;
  powerupPool?: ZumaPowerupType[];
  startDangerLevel?: boolean;
  targetAccuracy?: number;
  targetHits?: number;
  targetChainCount?: number;
  targetRescues?: number;
  targetPowerupHits?: number;
}

export const ZUMA_PRACTICE_CONFIGS: Record<string, ZumaPracticeConfig> = {
  'curve-aim': {
    id: 'curve-aim',
    name: '弯道命中练习',
    description: '在波浪轨道上练习弯道瞄准',
    objective: '提高弯道命中率',
    trackId: 'track-wave-01',
    colorPool: ['red', 'blue'],
    durationMs: 60000,
    initialBalls: 20,
    baseSpeed: 35,
    targetAccuracy: 0.7,
    targetHits: 15,
  },
  'chain-basic': {
    id: 'chain-basic',
    name: '回缩连锁练习',
    description: '练习消除后球链回缩与连锁触发',
    objective: '触发至少3次连锁消除',
    trackId: 'track-simple-01',
    colorPool: ['red', 'blue', 'green'],
    durationMs: 90000,
    initialBalls: 30,
    baseSpeed: 30,
    targetChainCount: 3,
  },
  'danger-rescue': {
    id: 'danger-rescue',
    name: '危险线抢救练习',
    description: '在球链接近终点线时练习抢救',
    objective: '在危险等级下成功抢救',
    trackId: 'track-zigzag-01',
    colorPool: ['red', 'blue', 'green'],
    durationMs: 60000,
    initialBalls: 25,
    baseSpeed: 40,
    startDangerLevel: true,
    targetRescues: 2,
  },
  'powerup-basic': {
    id: 'powerup-basic',
    name: '道具球专项练习',
    description: '练习各类道具球的使用时机',
    objective: '合理使用道具球扭转局势',
    trackId: 'track-circle-01',
    colorPool: ['red', 'blue', 'green', 'yellow'],
    durationMs: 90000,
    initialBalls: 35,
    baseSpeed: 35,
    powerupChance: 0.2,
    powerupPool: ['burst', 'lightning', 'slow', 'rewind', 'wild'],
    targetPowerupHits: 5,
  },
};

export function getZumaPracticeConfig(practiceId: string): ZumaPracticeConfig | undefined {
  return ZUMA_PRACTICE_CONFIGS[practiceId];
}

export function getZumaPracticeConfigs(): ZumaPracticeConfig[] {
  return Object.values(ZUMA_PRACTICE_CONFIGS);
}

const PRACTICE_TAG_TO_CONFIG_ID: Record<string, string> = {
  'basic-aim': 'curve-aim',
  'curve-aim': 'curve-aim',
  'color-matching': 'curve-aim',
  'chain-basic': 'chain-basic',
  'chain-advanced': 'chain-basic',
  'chain-master': 'chain-basic',
  'rewind-timing': 'chain-basic',
  'danger-awareness': 'danger-rescue',
  'timed-survival': 'danger-rescue',
  'powerup-basic': 'powerup-basic',
  'powerup-advanced': 'powerup-basic',
  'powerup-chain': 'powerup-basic',
};

export function resolveZumaPracticeId(tag: string): string | null {
  return PRACTICE_TAG_TO_CONFIG_ID[tag] ?? (ZUMA_PRACTICE_CONFIGS[tag] ? tag : null);
}

export function createZumaPracticeBoardState(practiceId: string): ZumaBoardState {
  const config = getZumaPracticeConfig(practiceId);
  if (!config) {
    return createZumaBoardState({
      levelId: `practice-${practiceId}`,
      mode: 'practice',
    });
  }

  let state = createZumaBoardState({
    levelId: `practice-${practiceId}`,
    levelTitle: config.name,
    mode: 'practice',
    trackId: config.trackId,
    colorPool: config.colorPool,
    powerupPool: config.powerupPool ?? ['burst', 'lightning', 'slow', 'rewind', 'wild'],
    powerupSpawnChance: config.powerupChance ?? 0.05,
    baseSpeed: config.baseSpeed,
    initialBallCount: config.initialBalls,
    spawnScript: [],
  });

  if (!config.startDangerLevel || state.chains.length === 0) {
    return state;
  }

  const chain = state.chains[0];
  const desiredHeadDistance = Math.max(
    state.trackDefinition.finishLineDistance - config.initialBalls * 2,
    chain.balls.length * 24,
  );
  const balls = chain.balls.map((ball, index) => ({
    ...ball,
    distanceAlongTrack: desiredHeadDistance - index * 24,
  }));

  state = {
    ...state,
    chains: [
      {
        ...chain,
        balls,
        headDistance: balls[0]?.distanceAlongTrack ?? 0,
        tailDistance: balls[balls.length - 1]?.distanceAlongTrack ?? 0,
      },
    ],
    dangerLevel: 'critical',
    previousDangerLevel: 'warning',
  };

  return state;
}

/* 吃豆人内容包数据。包含经典街机包和路线教学包的完整关卡调优参数表。 */

import type { LevelTuningParams, ScatterChasePhase } from './pacmanTypes.ts';

/* Level 1 Scatter/Chase 周期表 */
const LEVEL_1_SCHEDULE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: Infinity },
];

/* Level 2-4 Scatter/Chase 周期表 */
const LEVEL_2_4_SCHEDULE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 1033000 },
  { mode: 'scatter', durationMs: 1000 },
  { mode: 'chase', durationMs: Infinity },
];

/* Level 5+ Scatter/Chase 周期表 */
const LEVEL_5_PLUS_SCHEDULE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 1037000 },
  { mode: 'scatter', durationMs: 1000 },
  { mode: 'chase', durationMs: Infinity },
];

/* Level 21+ 循环关 Scatter/Chase 周期表（纯追击） */
const LEVEL_21_PLUS_SCHEDULE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 1000 },
  { mode: 'chase', durationMs: Infinity },
];

/* 经典街机包完整调优参数表（21关） */
export const ARCADE_LEVEL_TUNING_TABLE: LevelTuningParams[] = [
  {
    level: 1,
    pacmanSpeed: 0.80,
    ghostSpeed: 0.75,
    ghostTunnelSpeedMultiplier: 0.40,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 6000,
    frightenedBlinkStartMs: 4000,
    scatterChaseSchedule: LEVEL_1_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 0,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.00,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.00,
  },
  {
    level: 2,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 6000,
    frightenedBlinkStartMs: 4000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 1,
    elroy1Threshold: 30,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 15,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 3,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 5000,
    frightenedBlinkStartMs: 3000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 2,
    elroy1Threshold: 40,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 20,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 4,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 5000,
    frightenedBlinkStartMs: 3000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 3,
    elroy1Threshold: 40,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 20,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 5,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 4,
    elroy1Threshold: 50,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 25,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 6,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 4,
    elroy1Threshold: 50,
    elroy1SpeedBonus: 0.04,
    elroy2Threshold: 25,
    elroy2SpeedBonus: 0.08,
  },
  {
    level: 7,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 3000,
    frightenedBlinkStartMs: 1000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 5,
    elroy1Threshold: 60,
    elroy1SpeedBonus: 0.04,
    elroy2Threshold: 30,
    elroy2SpeedBonus: 0.08,
  },
  {
    level: 8,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 3000,
    frightenedBlinkStartMs: 1000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 5,
    elroy1Threshold: 60,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 30,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 9,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 2000,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 6,
    elroy1Threshold: 80,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 40,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 10,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 2000,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 6,
    elroy1Threshold: 80,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 40,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 11,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 1000,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 100,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 50,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 12,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 1000,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 100,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 50,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 13,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 120,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 60,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 14,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 120,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 60,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 15,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 140,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 70,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 16,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 140,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 70,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 17,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 160,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 80,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 18,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 160,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 80,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 19,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 180,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 90,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 20,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 180,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 90,
    elroy2SpeedBonus: 0.10,
  },
  {
    level: 21,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.60,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 0,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_21_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 7,
    elroy1Threshold: 200,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 100,
    elroy2SpeedBonus: 0.10,
  },
];

/* 路线教学包调优参数表（10关，难度较低） */
export const TUTORIAL_LEVEL_TUNING_TABLE: LevelTuningParams[] = [
  {
    level: 1,
    pacmanSpeed: 0.80,
    ghostSpeed: 0.60,
    ghostTunnelSpeedMultiplier: 0.30,
    frightenedGhostSpeed: 0.40,
    frightenedDurationMs: 8000,
    frightenedBlinkStartMs: 6000,
    scatterChaseSchedule: LEVEL_1_SCHEDULE,
    fruitSpawnThreshold1: 50,
    fruitSpawnThreshold2: 150,
    fruitLifetimeMs: 12000,
    fruitIndex: 0,
    elroy1Threshold: 30,
    elroy1SpeedBonus: 0.00,
    elroy2Threshold: 15,
    elroy2SpeedBonus: 0.00,
  },
  {
    level: 2,
    pacmanSpeed: 0.85,
    ghostSpeed: 0.65,
    ghostTunnelSpeedMultiplier: 0.35,
    frightenedGhostSpeed: 0.40,
    frightenedDurationMs: 8000,
    frightenedBlinkStartMs: 6000,
    scatterChaseSchedule: LEVEL_1_SCHEDULE,
    fruitSpawnThreshold1: 50,
    fruitSpawnThreshold2: 150,
    fruitLifetimeMs: 12000,
    fruitIndex: 0,
    elroy1Threshold: 30,
    elroy1SpeedBonus: 0.01,
    elroy2Threshold: 15,
    elroy2SpeedBonus: 0.02,
  },
  {
    level: 3,
    pacmanSpeed: 0.85,
    ghostSpeed: 0.70,
    ghostTunnelSpeedMultiplier: 0.40,
    frightenedGhostSpeed: 0.45,
    frightenedDurationMs: 7000,
    frightenedBlinkStartMs: 5000,
    scatterChaseSchedule: LEVEL_1_SCHEDULE,
    fruitSpawnThreshold1: 60,
    fruitSpawnThreshold2: 160,
    fruitLifetimeMs: 10000,
    fruitIndex: 1,
    elroy1Threshold: 25,
    elroy1SpeedBonus: 0.01,
    elroy2Threshold: 12,
    elroy2SpeedBonus: 0.02,
  },
  {
    level: 4,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.75,
    ghostTunnelSpeedMultiplier: 0.40,
    frightenedGhostSpeed: 0.45,
    frightenedDurationMs: 7000,
    frightenedBlinkStartMs: 5000,
    scatterChaseSchedule: LEVEL_1_SCHEDULE,
    fruitSpawnThreshold1: 60,
    fruitSpawnThreshold2: 160,
    fruitLifetimeMs: 10000,
    fruitIndex: 1,
    elroy1Threshold: 25,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 12,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 5,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.80,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 6000,
    frightenedBlinkStartMs: 4000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 2,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 6,
    pacmanSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 6000,
    frightenedBlinkStartMs: 4000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 2,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 7,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.90,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 5000,
    frightenedBlinkStartMs: 3000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 3,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 8,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 5000,
    frightenedBlinkStartMs: 3000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 3,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 9,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 4,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.04,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.08,
  },
  {
    level: 10,
    pacmanSpeed: 1.00,
    ghostSpeed: 1.00,
    ghostTunnelSpeedMultiplier: 0.50,
    frightenedGhostSpeed: 0.50,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 4,
    elroy1Threshold: 20,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 10,
    elroy2SpeedBonus: 0.10,
  },
];

/* 水果冲分包调优参数表（4关，强化果窗与中心压缩）。 */
export const FRUIT_RUSH_LEVEL_TUNING_TABLE: LevelTuningParams[] = [
  {
    level: 1,
    pacmanSpeed: 0.92,
    ghostSpeed: 0.82,
    ghostTunnelSpeedMultiplier: 0.45,
    frightenedGhostSpeed: 0.46,
    frightenedDurationMs: 6500,
    frightenedBlinkStartMs: 4500,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 45,
    fruitSpawnThreshold2: 110,
    fruitLifetimeMs: 11000,
    fruitIndex: 0,
    elroy1Threshold: 40,
    elroy1SpeedBonus: 0.02,
    elroy2Threshold: 20,
    elroy2SpeedBonus: 0.04,
  },
  {
    level: 2,
    pacmanSpeed: 0.95,
    ghostSpeed: 0.88,
    ghostTunnelSpeedMultiplier: 0.48,
    frightenedGhostSpeed: 0.46,
    frightenedDurationMs: 5500,
    frightenedBlinkStartMs: 3500,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 45,
    fruitSpawnThreshold2: 105,
    fruitLifetimeMs: 10000,
    fruitIndex: 1,
    elroy1Threshold: 45,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 22,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 3,
    pacmanSpeed: 0.98,
    ghostSpeed: 0.95,
    ghostTunnelSpeedMultiplier: 0.5,
    frightenedGhostSpeed: 0.48,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 40,
    fruitSpawnThreshold2: 95,
    fruitLifetimeMs: 9000,
    fruitIndex: 2,
    elroy1Threshold: 50,
    elroy1SpeedBonus: 0.04,
    elroy2Threshold: 25,
    elroy2SpeedBonus: 0.08,
  },
  {
    level: 4,
    pacmanSpeed: 1.0,
    ghostSpeed: 1.0,
    ghostTunnelSpeedMultiplier: 0.52,
    frightenedGhostSpeed: 0.5,
    frightenedDurationMs: 3000,
    frightenedBlinkStartMs: 1000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 38,
    fruitSpawnThreshold2: 88,
    fruitLifetimeMs: 8500,
    fruitIndex: 3,
    elroy1Threshold: 55,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 28,
    elroy2SpeedBonus: 0.1,
  },
];

/* 一命挑战包调优参数表（4关，整体更保守，但不给奖励命兜底）。 */
export const ONE_LIFE_LEVEL_TUNING_TABLE: LevelTuningParams[] = [
  {
    level: 1,
    pacmanSpeed: 0.9,
    ghostSpeed: 0.82,
    ghostTunnelSpeedMultiplier: 0.42,
    frightenedGhostSpeed: 0.45,
    frightenedDurationMs: 5000,
    frightenedBlinkStartMs: 3000,
    scatterChaseSchedule: LEVEL_2_4_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 0,
    elroy1Threshold: 35,
    elroy1SpeedBonus: 0.03,
    elroy2Threshold: 18,
    elroy2SpeedBonus: 0.06,
  },
  {
    level: 2,
    pacmanSpeed: 0.94,
    ghostSpeed: 0.9,
    ghostTunnelSpeedMultiplier: 0.46,
    frightenedGhostSpeed: 0.46,
    frightenedDurationMs: 4000,
    frightenedBlinkStartMs: 2000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 65,
    fruitSpawnThreshold2: 155,
    fruitLifetimeMs: 9000,
    fruitIndex: 1,
    elroy1Threshold: 40,
    elroy1SpeedBonus: 0.04,
    elroy2Threshold: 20,
    elroy2SpeedBonus: 0.08,
  },
  {
    level: 3,
    pacmanSpeed: 0.97,
    ghostSpeed: 0.97,
    ghostTunnelSpeedMultiplier: 0.5,
    frightenedGhostSpeed: 0.48,
    frightenedDurationMs: 3000,
    frightenedBlinkStartMs: 1000,
    scatterChaseSchedule: LEVEL_5_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: 2,
    elroy1Threshold: 48,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 24,
    elroy2SpeedBonus: 0.1,
  },
  {
    level: 4,
    pacmanSpeed: 1.0,
    ghostSpeed: 1.0,
    ghostTunnelSpeedMultiplier: 0.52,
    frightenedGhostSpeed: 0.5,
    frightenedDurationMs: 2000,
    frightenedBlinkStartMs: 0,
    scatterChaseSchedule: LEVEL_21_PLUS_SCHEDULE,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 8500,
    fruitIndex: 3,
    elroy1Threshold: 55,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: 28,
    elroy2SpeedBonus: 0.1,
  },
];

/* 获取经典街机包关卡调优参数 */
export function getArcadeLevelTuning(levelNumber: number): LevelTuningParams {
  if (levelNumber <= 21) {
    return ARCADE_LEVEL_TUNING_TABLE[levelNumber - 1];
  }
  return ARCADE_LEVEL_TUNING_TABLE[20];
}

/* 获取路线教学包关卡调优参数 */
export function getTutorialLevelTuning(levelNumber: number): LevelTuningParams {
  if (levelNumber <= 10) {
    return TUTORIAL_LEVEL_TUNING_TABLE[levelNumber - 1];
  }
  return TUTORIAL_LEVEL_TUNING_TABLE[9];
}

/* 获取水果冲分包调优参数 */
export function getFruitRushLevelTuning(levelNumber: number): LevelTuningParams {
  if (levelNumber <= FRUIT_RUSH_LEVEL_TUNING_TABLE.length) {
    return FRUIT_RUSH_LEVEL_TUNING_TABLE[levelNumber - 1];
  }
  return FRUIT_RUSH_LEVEL_TUNING_TABLE[FRUIT_RUSH_LEVEL_TUNING_TABLE.length - 1];
}

/* 获取一命挑战包调优参数 */
export function getOneLifeLevelTuning(levelNumber: number): LevelTuningParams {
  if (levelNumber <= ONE_LIFE_LEVEL_TUNING_TABLE.length) {
    return ONE_LIFE_LEVEL_TUNING_TABLE[levelNumber - 1];
  }
  return ONE_LIFE_LEVEL_TUNING_TABLE[ONE_LIFE_LEVEL_TUNING_TABLE.length - 1];
}

/* 根据关卡包类型获取调优参数 */
export function getLevelTuningByPack(packId: string, levelNumber: number): LevelTuningParams {
  if (packId === 'tutorial') {
    return getTutorialLevelTuning(levelNumber);
  }
  if (packId === 'fruit_rush') {
    return getFruitRushLevelTuning(levelNumber);
  }
  if (packId === 'one_life') {
    return getOneLifeLevelTuning(levelNumber);
  }
  return getArcadeLevelTuning(levelNumber);
}

/* 获取关卡难度等级描述 */
export function getLevelDifficultyDescription(levelNumber: number, packId: string): string {
  if (packId === 'fruit_rush') {
    if (levelNumber <= 1) return '取果入门';
    if (levelNumber <= 2) return '收益压缩';
    if (levelNumber <= 3) return '高压取果';
    return '尾豆终盘';
  }

  if (packId === 'one_life') {
    if (levelNumber <= 1) return '单命起手';
    if (levelNumber <= 2) return '稳态推进';
    if (levelNumber <= 3) return '中压连战';
    return '终局冲线';
  }

  if (packId === 'tutorial') {
    if (levelNumber <= 2) return '入门';
    if (levelNumber <= 4) return '基础';
    if (levelNumber <= 6) return '进阶';
    if (levelNumber <= 8) return '熟练';
    return '精通';
  }

  if (levelNumber <= 2) return '简单';
  if (levelNumber <= 6) return '中等';
  if (levelNumber <= 12) return '困难';
  if (levelNumber <= 20) return '极限';
  return '循环';
}

/* 获取关卡速度描述 */
export function getLevelSpeedDescription(tuning: LevelTuningParams): string {
  const pacmanSpeed = tuning.pacmanSpeed;
  const ghostSpeed = tuning.ghostSpeed;

  if (pacmanSpeed <= 0.85 && ghostSpeed <= 0.75) return '慢速';
  if (pacmanSpeed <= 0.95 && ghostSpeed <= 0.95) return '中速';
  if (pacmanSpeed >= 1.0 && ghostSpeed >= 1.0) return '高速';
  return '变速';
}

/* 获取关卡Frightened效果描述 */
export function getLevelFrightenedDescription(tuning: LevelTuningParams): string {
  const duration = tuning.frightenedDurationMs;

  if (duration === 0) return '无效果';
  if (duration <= 1000) return '极短';
  if (duration <= 3000) return '短';
  if (duration <= 5000) return '中等';
  return '长';
}

/* 获取关卡Elroy状态描述 */
export function getLevelElroyDescription(tuning: LevelTuningParams): string {
  const elroy1 = tuning.elroy1Threshold;

  if (elroy1 >= 100) return '后期激活';
  if (elroy1 >= 50) return '中期激活';
  return '早期激活';
}

/* 关卡参数汇总表（用于UI展示） */
export interface LevelSummary {
  level: number;
  packId: string;
  pacmanSpeed: string;
  ghostSpeed: string;
  frightenedDuration: string;
  elroyThreshold: string;
  difficulty: string;
}

/* 获取关卡参数汇总 */
export function getLevelSummary(packId: string, levelNumber: number): LevelSummary {
  const tuning = getLevelTuningByPack(packId, levelNumber);

  return {
    level: levelNumber,
    packId,
    pacmanSpeed: `${tuning.pacmanSpeed.toFixed(2)}`,
    ghostSpeed: `${tuning.ghostSpeed.toFixed(2)}`,
    frightenedDuration: getLevelFrightenedDescription(tuning),
    elroyThreshold: getLevelElroyDescription(tuning),
    difficulty: getLevelDifficultyDescription(levelNumber, packId),
  };
}

/* 获取所有关卡参数汇总表 */
export function getAllLevelSummaries(packId: string): LevelSummary[] {
  const pack = packId === 'tutorial'
    ? TUTORIAL_LEVEL_TUNING_TABLE
    : packId === 'fruit_rush'
      ? FRUIT_RUSH_LEVEL_TUNING_TABLE
      : packId === 'one_life'
        ? ONE_LIFE_LEVEL_TUNING_TABLE
        : ARCADE_LEVEL_TUNING_TABLE;
  return pack.map((_, index) => getLevelSummary(packId, index + 1));
}

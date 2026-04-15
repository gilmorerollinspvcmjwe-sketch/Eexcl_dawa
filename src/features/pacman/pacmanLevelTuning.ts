/* 吃豆人全局模式时序系统。负责 Scatter/Chase 周期表驱动、模式切换反向行为、Frightened 结束恢复、速度参数表。 */

import type {
  PacmanBoardState,
  GlobalModeState,
  GlobalMode,
  ScatterChasePhase,
  LevelTuningParams,
  GhostInstance,
  GhostState,
} from './pacmanTypes.ts';

import { OPPOSITE_DIRECTION } from './pacmanTypes.ts';
import { getLevelTuningByPack } from './pacmanContent.ts';

/* 原版 Scatter/Chase 周期表（Level 1） */
export const LEVEL_1_SCATTER_CHASE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: Infinity },
];

/* 原版 Scatter/Chase 周期表（Level 2-4） */
export const LEVEL_2_4_SCATTER_CHASE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 1033000 },
  { mode: 'scatter', durationMs: 1000 },
  { mode: 'chase', durationMs: Infinity },
];

/* 原版 Scatter/Chase 周期表（Level 5+） */
export const LEVEL_5_PLUS_SCATTER_CHASE: ScatterChasePhase[] = [
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 1037000 },
  { mode: 'scatter', durationMs: 1000 },
  { mode: 'chase', durationMs: Infinity },
];

/* Frightened 持续时间表（按关卡） */
export const FRIGHTENED_DURATION_TABLE: number[] = [
  6000, 6000, 5000, 5000, 4000, 4000, 3000, 3000, 2000, 2000,
  1000, 1000, 0, 0, 0, 0, 0, 0, 0, 0,
];

/* Frightened 闪烁开始时间（提前2秒） */
export const FRIGHTENED_BLINK_OFFSET = 2000;

/* 速度参数表（按关卡） */
export const SPEED_TABLE: { pacman: number; ghost: number; tunnel: number }[] = [
  { pacman: 0.8, ghost: 0.75, tunnel: 0.4 },
  { pacman: 0.9, ghost: 0.85, tunnel: 0.45 },
  { pacman: 0.9, ghost: 0.85, tunnel: 0.45 },
  { pacman: 0.9, ghost: 0.85, tunnel: 0.45 },
  { pacman: 0.95, ghost: 0.95, tunnel: 0.5 },
  { pacman: 0.95, ghost: 0.95, tunnel: 0.5 },
  { pacman: 0.95, ghost: 0.95, tunnel: 0.5 },
  { pacman: 0.95, ghost: 0.95, tunnel: 0.5 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.5 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.5 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
  { pacman: 1.0, ghost: 1.0, tunnel: 0.6 },
];

/* Elroy 阈值表（按关卡） */
export const ELROY_THRESHOLD_TABLE: { elroy1: number; elroy2: number }[] = [
  { elroy1: 20, elroy2: 10 },
  { elroy1: 30, elroy2: 15 },
  { elroy1: 40, elroy2: 20 },
  { elroy1: 40, elroy2: 20 },
  { elroy1: 50, elroy2: 25 },
  { elroy1: 50, elroy2: 25 },
  { elroy1: 60, elroy2: 30 },
  { elroy1: 60, elroy2: 30 },
  { elroy1: 80, elroy2: 40 },
  { elroy1: 80, elroy2: 40 },
  { elroy1: 100, elroy2: 50 },
  { elroy1: 100, elroy2: 50 },
  { elroy1: 120, elroy2: 60 },
  { elroy1: 120, elroy2: 60 },
  { elroy1: 140, elroy2: 70 },
  { elroy1: 140, elroy2: 70 },
  { elroy1: 160, elroy2: 80 },
  { elroy1: 160, elroy2: 80 },
  { elroy1: 180, elroy2: 90 },
  { elroy1: 180, elroy2: 90 },
];

/* 获取关卡调优参数 */
export function getLevelTuning(level: number): LevelTuningParams {
  const levelIndex = Math.min(level - 1, SPEED_TABLE.length - 1);

  const speedParams = SPEED_TABLE[levelIndex];
  const elroyParams = ELROY_THRESHOLD_TABLE[levelIndex];
  const frightenedDuration = FRIGHTENED_DURATION_TABLE[levelIndex];

  let schedule: ScatterChasePhase[];
  if (level === 1) {
    schedule = LEVEL_1_SCATTER_CHASE;
  } else if (level >= 2 && level <= 4) {
    schedule = LEVEL_2_4_SCATTER_CHASE;
  } else {
    schedule = LEVEL_5_PLUS_SCATTER_CHASE;
  }

  return {
    level,
    pacmanSpeed: speedParams.pacman,
    ghostSpeed: speedParams.ghost,
    ghostTunnelSpeedMultiplier: speedParams.tunnel,
    frightenedGhostSpeed: 0.5,
    frightenedDurationMs: frightenedDuration,
    frightenedBlinkStartMs: frightenedDuration > 0 ? frightenedDuration - FRIGHTENED_BLINK_OFFSET : 0,
    scatterChaseSchedule: schedule,
    fruitSpawnThreshold1: 70,
    fruitSpawnThreshold2: 170,
    fruitLifetimeMs: 9000,
    fruitIndex: Math.min(level - 1, 7),
    elroy1Threshold: elroyParams.elroy1,
    elroy1SpeedBonus: 0.05,
    elroy2Threshold: elroyParams.elroy2,
    elroy2SpeedBonus: 0.1,
  };
}

/* 更新全局模式状态 */
export function updateGlobalModeState(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.status !== 'playing' || state.isPaused) return state;

  const globalMode = { ...state.globalMode };
  let ghosts = [...state.ghosts];

  if (globalMode.currentMode === 'frightened') {
    globalMode.frightenedTimerMs -= deltaMs;

    if (globalMode.frightenedTimerMs <= globalMode.frightenedBlinkStartMs) {
      globalMode.frightenedBlinkPhase = true;
    }

    if (globalMode.frightenedTimerMs <= 0) {
      globalMode.currentMode = getNextModeAfterFrightened(globalMode);
      globalMode.frightenedTimerMs = 0;
      globalMode.frightenedBlinkPhase = false;

      ghosts = ghosts.map(ghost => {
        if (ghost.state === 'frightened') {
          return {
            ...ghost,
            state: globalMode.currentMode as GhostState,
            frightenedTimerMs: 0,
          };
        }
        return ghost;
      });
    }

    return {
      ...state,
      globalMode,
      ghosts,
    };
  }

  globalMode.modeTimerMs += deltaMs;
  const currentPhase = globalMode.scatterChaseSchedule[globalMode.modeIndex];

  if (currentPhase && globalMode.modeTimerMs >= currentPhase.durationMs) {
    const nextModeIndex = globalMode.modeIndex + 1;
    const nextPhase = globalMode.scatterChaseSchedule[nextModeIndex];

    if (nextPhase) {
      globalMode.currentMode = nextPhase.mode;
      globalMode.modeIndex = nextModeIndex;
      globalMode.modeTimerMs = 0;

      ghosts = applyReverseOnModeChange(ghosts, globalMode.currentMode);
    }
  }

  return {
    ...state,
    globalMode,
    ghosts,
  };
}

/* Frightened 结束后恢复原模式 */
function getNextModeAfterFrightened(globalMode: GlobalModeState): GlobalMode {
  const currentPhase = globalMode.scatterChaseSchedule[globalMode.modeIndex];
  return currentPhase?.mode || 'chase';
}

/* 模式切换时鬼反向 */
function applyReverseOnModeChange(ghosts: GhostInstance[], newMode: GlobalMode): GhostInstance[] {
  return ghosts.map(ghost => {
    if (ghost.state === 'scatter' || ghost.state === 'chase') {
      return {
        ...ghost,
        state: newMode as GhostState,
        direction: OPPOSITE_DIRECTION[ghost.direction],
      };
    }
    return ghost;
  });
}

/* 触发 Frightened 模式 */
export function triggerFrightenedMode(state: PacmanBoardState): PacmanBoardState {
  const frightenedDuration = state.levelTuning.frightenedDurationMs;

  if (frightenedDuration <= 0) return state;

  const globalMode: GlobalModeState = {
    ...state.globalMode,
    currentMode: 'frightened',
    frightenedTimerMs: frightenedDuration,
    frightenedBlinkPhase: false,
  };

  const ghosts = state.ghosts.map(ghost => {
    if (ghost.state === 'scatter' || ghost.state === 'chase') {
      return {
        ...ghost,
        state: 'frightened' as GhostState,
        frightenedTimerMs: frightenedDuration,
        direction: OPPOSITE_DIRECTION[ghost.direction],
      };
    }
    return ghost;
  });

  return {
    ...state,
    globalMode,
    ghosts,
    ghostsEatenInFrightened: 0,
  };
}

/* 获取当前模式描述 */
export function getModeText(state: PacmanBoardState): string {
  const modeNames: Record<GlobalMode, string> = {
    scatter: '散开',
    chase: '追击',
    frightened: '惊吓',
  };

  const currentMode = state.globalMode.currentMode;
  let text = modeNames[currentMode];

  if (currentMode === 'frightened') {
    const remainingSeconds = Math.ceil(state.globalMode.frightenedTimerMs / 1000);
    text += ` (${remainingSeconds}秒)`;

    if (state.globalMode.frightenedBlinkPhase) {
      text += ' ⚠️';
    }
  }

  return text;
}

/* 获取当前周期进度 */
export function getModeCycleProgress(state: PacmanBoardState): { phase: number; total: number; progress: number } {
  const { modeIndex, modeTimerMs, scatterChaseSchedule } = state.globalMode;
  const currentPhase = scatterChaseSchedule[modeIndex];

  if (!currentPhase || currentPhase.durationMs === Infinity) {
    return { phase: modeIndex + 1, total: scatterChaseSchedule.length, progress: 1 };
  }

  const progress = Math.min(modeTimerMs / currentPhase.durationMs, 1);

  return {
    phase: modeIndex + 1,
    total: scatterChaseSchedule.length,
    progress,
  };
}

/* 获取下一个模式切换时间 */
export function getNextModeChangeTime(state: PacmanBoardState): number | null {
  const { modeIndex, modeTimerMs, scatterChaseSchedule } = state.globalMode;
  const currentPhase = scatterChaseSchedule[modeIndex];

  if (!currentPhase || currentPhase.durationMs === Infinity) {
    return null;
  }

  return currentPhase.durationMs - modeTimerMs;
}

/* 检查是否处于 Frightened 闪烁阶段 */
export function isFrightenedBlinking(state: PacmanBoardState): boolean {
  return state.globalMode.currentMode === 'frightened' && state.globalMode.frightenedBlinkPhase;
}

/* 获取 Frightened 剩余时间 */
export function getFrightenedRemainingTime(state: PacmanBoardState): number {
  if (state.globalMode.currentMode !== 'frightened') return 0;
  return Math.max(0, state.globalMode.frightenedTimerMs);
}

/* 重置全局模式状态 */
export function resetGlobalModeState(state: PacmanBoardState): PacmanBoardState {
  const tuning = getLevelTuningByPack(state.packId, state.level);

  const globalMode: GlobalModeState = {
    currentMode: 'scatter',
    modeIndex: 0,
    modeTimerMs: 0,
    frightenedTimerMs: 0,
    frightenedBlinkPhase: false,
    scatterChaseSchedule: tuning.scatterChaseSchedule,
    frightenedDurationMs: tuning.frightenedDurationMs,
    frightenedBlinkStartMs: tuning.frightenedBlinkStartMs,
  };

  return {
    ...state,
    globalMode,
    levelTuning: tuning,
  };
}

/* 获取关卡速度参数 */
export function getLevelSpeedParams(level: number): { pacman: number; ghost: number; tunnel: number } {
  const levelIndex = Math.min(level - 1, SPEED_TABLE.length - 1);
  return SPEED_TABLE[levelIndex];
}

/* 获取关卡 Frightened 持续时间 */
export function getLevelFrightenedDuration(level: number): number {
  const levelIndex = Math.min(level - 1, FRIGHTENED_DURATION_TABLE.length - 1);
  return FRIGHTENED_DURATION_TABLE[levelIndex];
}

/* 获取关卡 Elroy 阈值 */
export function getLevelElroyThresholds(level: number): { elroy1: number; elroy2: number } {
  const levelIndex = Math.min(level - 1, ELROY_THRESHOLD_TABLE.length - 1);
  return ELROY_THRESHOLD_TABLE[levelIndex];
}

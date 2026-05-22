/* 吃豆人跨页启动意图。负责 Guide/结算页给主对局页写入待启动练习或教学关。 */

import type { PacmanMode, PacmanPracticeId } from './pacmanTypes.ts';
import type { PacmanPackId } from './pacmanMapRegistry.ts';

const PACMAN_LAUNCH_INTENT_KEY = 'pacman_launch_intent';
const PACMAN_GUIDE_TAB_KEY = 'pacman_guide_tab';

export type PacmanGuideTab = 'ghosts' | 'fruits' | 'maze' | 'input' | 'practice';
export type PacmanReturnTarget = 'setup' | 'source_level' | 'guide';

export interface PacmanLaunchIntent {
  packId: PacmanPackId;
  levelNumber: number;
  mode: PacmanMode;
  practiceId?: PacmanPracticeId;
  sourcePackId?: PacmanPackId;
  sourceLevel?: number;
  returnTarget?: PacmanReturnTarget;
  guideTab?: PacmanGuideTab;
}

/* 写入待启动意图。 */
export function setPendingPacmanLaunchIntent(intent: PacmanLaunchIntent): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PACMAN_LAUNCH_INTENT_KEY, JSON.stringify(intent));
}

/* 读取并消费待启动意图。 */
export function consumePendingPacmanLaunchIntent(): PacmanLaunchIntent | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(PACMAN_LAUNCH_INTENT_KEY);
  if (!raw) return null;

  window.localStorage.removeItem(PACMAN_LAUNCH_INTENT_KEY);

  try {
    return JSON.parse(raw) as PacmanLaunchIntent;
  } catch {
    return null;
  }
}

/* 清空待启动意图。 */
export function clearPendingPacmanLaunchIntent(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PACMAN_LAUNCH_INTENT_KEY);
}

/* 解析练习回流目标，避免 Guide/结算入口混用时语义丢失。 */
export function getPacmanLaunchReturnTarget(intent: PacmanLaunchIntent | null | undefined): PacmanReturnTarget {
  if (!intent) {
    return 'setup';
  }

  if (intent.returnTarget) {
    return intent.returnTarget;
  }

  if (intent.sourcePackId && intent.sourceLevel) {
    return 'source_level';
  }

  return 'setup';
}

/* 获取练习回到图鉴时应恢复的 tab。 */
export function getPacmanLaunchGuideTab(intent: PacmanLaunchIntent | null | undefined): PacmanGuideTab {
  return intent?.guideTab || 'practice';
}

/* 记录图鉴页应恢复到的 tab。 */
export function setPendingPacmanGuideTab(tab: PacmanGuideTab): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PACMAN_GUIDE_TAB_KEY, tab);
}

/* 读取并消费待恢复的图鉴 tab。 */
export function consumePendingPacmanGuideTab(): PacmanGuideTab | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(PACMAN_GUIDE_TAB_KEY);
  if (!raw) {
    return null;
  }

  window.localStorage.removeItem(PACMAN_GUIDE_TAB_KEY);
  if (raw === 'ghosts' || raw === 'fruits' || raw === 'maze' || raw === 'input' || raw === 'practice') {
    return raw;
  }
  return null;
}

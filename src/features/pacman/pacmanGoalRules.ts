/* 吃豆人教学/练习目标规则。负责把关卡元数据里的目标条件转成可执行判定。 */

import type { PacmanBoardState } from './pacmanTypes.ts';
import type { PacmanLevelMeta } from './pacmanMapRegistry.ts';

/* 判断当前关卡是否已达到脚本目标。 */
export function hasCompletedPacmanLevelGoal(
  state: PacmanBoardState,
  levelMeta: PacmanLevelMeta | null | undefined,
): boolean {
  if (!levelMeta?.completionRule) {
    return state.pelletsRemaining <= 0;
  }

  const { completionRule } = levelMeta;

  if (completionRule.pelletsCollected !== undefined && state.pelletsCollectedTotal < completionRule.pelletsCollected) {
    return false;
  }

  if (completionRule.ghostsEaten !== undefined && state.totalGhostsEaten < completionRule.ghostsEaten) {
    return false;
  }

  if (completionRule.surviveMs !== undefined && state.elapsedMs < completionRule.surviveMs) {
    return false;
  }

  if (completionRule.tunnelUses !== undefined && state.tunnelUses < completionRule.tunnelUses) {
    return false;
  }

  if (completionRule.fruitsCollected !== undefined && state.fruitsCollected < completionRule.fruitsCollected) {
    return false;
  }

  return true;
}

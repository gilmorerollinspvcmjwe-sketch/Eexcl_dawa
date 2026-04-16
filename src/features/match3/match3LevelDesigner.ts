/* 三消关卡设计辅助：提供安全字段覆盖的模板化变体生成，不直接参与运行时结算。 */

import type { Match3ColorWeights, Match3Goal, Match3ObstacleType, Match3Portal, Match3PrebuiltSpecial } from './match3Types.ts';
import type { Match3LevelScript } from './match3LevelCatalog.ts';

export interface Match3LevelVariantOverrides {
  suffix: string;
  name?: string;
  packId?: string;
  packName?: string;
  chapterId?: string;
  chapterName?: string;
  goals?: Match3Goal[];
  maxMoves?: number;
  maxTimeMs?: number;
  colorWeights?: Match3ColorWeights;
  initialObstacles?: {
    type: Match3ObstacleType;
    positions: { row: number; col: number }[];
  }[];
  portals?: Match3Portal[];
  prebuiltSpecials?: Match3PrebuiltSpecial[];
  tutorialHint?: string;
  spreaderConfig?: Match3LevelScript['spreaderConfig'];
}

function cloneGoals(goals: Match3Goal[]): Match3Goal[] {
  return goals.map((goal) => ({ ...goal }));
}

// 基于已有脚本生成安全变体，只开放当前运行时已经支持的字段。
export function createMatch3LevelVariant(
  base: Match3LevelScript,
  overrides: Match3LevelVariantOverrides,
): Match3LevelScript {
  return {
    ...base,
    id: `${base.id}-${overrides.suffix}`,
    name: overrides.name ?? `${base.name}·${overrides.suffix}`,
    packId: overrides.packId ?? base.packId,
    packName: overrides.packName ?? base.packName,
    chapterId: overrides.chapterId ?? base.chapterId,
    chapterName: overrides.chapterName ?? base.chapterName,
    goals: cloneGoals(overrides.goals ?? base.goals),
    maxMoves: overrides.maxMoves ?? base.maxMoves,
    maxTimeMs: overrides.maxTimeMs ?? base.maxTimeMs,
    colorWeights: overrides.colorWeights ?? base.colorWeights,
    initialObstacles: overrides.initialObstacles ?? base.initialObstacles,
    portals: overrides.portals ?? base.portals,
    prebuiltSpecials: overrides.prebuiltSpecials ?? base.prebuiltSpecials,
    tutorialHint: overrides.tutorialHint ?? base.tutorialHint,
    spreaderConfig: overrides.spreaderConfig ?? base.spreaderConfig,
  };
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneLevelStatus,
  loadFantasyLaneProgress,
  recordFantasyLaneLevelResult,
  recordFantasyLaneLevelStart,
  saveFantasyLaneProgress,
  unlockUnit,
  addUnitFragment,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import {
  emitFantasyLaneLevelSelection,
  getLatestFantasyLaneLevelSelection,
  subscribeFantasyLaneLevelSelection,
} from '../../features/fantasy_lane/fantasyLaneSelectionBridge.ts';
import { fantasyLaneRuntimeAdapter, getFantasyLaneRecommendedLoadoutWarnings } from '../../features/fantasy_lane/fantasyLaneRuntime.ts';
import type { FantasyLaneRuntimeState, FantasyLaneSheetSnapshot } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import {
  buildFantasyLaneBattleSnapshot,
  buildFantasyLaneProgressDebugSnapshot,
  buildFantasyLaneRuntimeDebugSnapshot,
  buildFantasyLaneRuntimeStatsSnapshot,
} from '../../features/fantasy_lane/runtime/fantasyLaneTelemetry.ts';
import type { WorkbookStatusSummary } from '../../types/workbook.ts';
import { FantasyLaneBoard } from './FantasyLaneBoard';
import { FantasyLaneHud } from './FantasyLaneHud';
import { FantasyLaneLoadoutPanel } from './FantasyLaneLoadoutPanel';
import { FantasyLaneResultPanel } from './FantasyLaneResultPanel';
import { useFantasyLaneBattleLoop } from './useFantasyLaneBattleLoop.ts';
import '../../styles/fantasy-lane.css';

interface FantasyLaneSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
  onOpenRoster?: () => void;
  onOpenChapters?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

export const FantasyLaneSheet: React.FC<FantasyLaneSheetProps> = ({
  onFormulaChange,
  onStatusChange,
  onExit: _onExit,
  onOpenRoster: _onOpenRoster,
  onOpenChapters: _onOpenChapters,
  initialSnapshot,
  onSnapshotChange,
}) => {
  const snapshot = initialSnapshot as FantasyLaneSheetSnapshot | null;
  const [state, setState] = useState<FantasyLaneRuntimeState>(() => {
    if (snapshot?.state) return snapshot.state;
    const selectedLevelId = getLatestFantasyLaneLevelSelection();
    return fantasyLaneRuntimeAdapter.selectLevel(fantasyLaneRuntimeAdapter.createInitialState(), selectedLevelId);
  });
  const [setupCollapsed, setSetupCollapsed] = useState(snapshot?.setupCollapsed ?? false);
  const [progress, setProgress] = useState(() => loadFantasyLaneProgress());
  const previousPhaseRef = useRef(state.phase);
  const latestStateRef = useRef(state);

  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const chapters = useMemo(() => fantasyLaneRuntimeAdapter.getChapters(), []);
  const warnings = useMemo(
    () => getFantasyLaneRecommendedLoadoutWarnings(state.loadoutUnitIds, state.selectedLevelId),
    [state.loadoutUnitIds, state.selectedLevelId],
  );
  const canEditSetup = state.phase === 'setup' || state.phase === 'won' || state.phase === 'lost';
  latestStateRef.current = state;

  useFantasyLaneBattleLoop({
    stateRef: latestStateRef,
    setState,
    tick: fantasyLaneRuntimeAdapter.tick,
  });

  useEffect(() => {
    onFormulaChange?.(fantasyLaneRuntimeAdapter.getFormulaText(state));
    onStatusChange?.(fantasyLaneRuntimeAdapter.getStatusSummary(state));
  }, [onFormulaChange, onStatusChange, state]);

  useEffect(() => {
    // 战斗开始时自动收起侧边栏，战斗结束/暂停时保持收起状态
    if (state.phase === 'playing') {
      setSetupCollapsed(true);
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === 'playing') return;
    onSnapshotChange?.({
      state,
      setupCollapsed,
      battleSnapshot: buildFantasyLaneBattleSnapshot(state),
      debugSnapshot: buildFantasyLaneRuntimeDebugSnapshot(state),
    });
  }, [onSnapshotChange, setupCollapsed, state]);

  useEffect(() => {
    if (!onSnapshotChange || state.phase !== 'playing') return;
    const timer = window.setInterval(() => {
      onSnapshotChange({
        state: latestStateRef.current,
        setupCollapsed,
        battleSnapshot: buildFantasyLaneBattleSnapshot(latestStateRef.current),
        debugSnapshot: buildFantasyLaneRuntimeDebugSnapshot(latestStateRef.current),
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onSnapshotChange, setupCollapsed, state.phase]);

  useEffect(() => {
    const unsubscribe = subscribeFantasyLaneLevelSelection((levelId) => {
      setState((current) => fantasyLaneRuntimeAdapter.selectLevel(current, levelId));
      setProgress(loadFantasyLaneProgress());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    if (previousPhase !== 'playing' && state.phase === 'playing') {
      setProgress(recordFantasyLaneLevelStart(state.selectedLevelId, {
        runId: `${state.selectedLevelId}-${Date.now()}`,
        heroId: state.selectedHeroId,
        tacticalSkillId: state.selectedTacticalId,
        loadoutUnitIds: state.loadoutUnitIds,
        runtimeSeed: state.rngSeed,
        startedAt: Date.now(),
      }));
    }
    if (previousPhase !== state.phase && (state.phase === 'won' || state.phase === 'lost') && state.result) {
      const baseHpPercent = (state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100;
      const result = recordFantasyLaneLevelResult(state.selectedLevelId, state.result, baseHpPercent, {
        finishedAt: Date.now(),
        currentPhaseId: state.currentPhaseId,
        runtimeStats: buildFantasyLaneRuntimeStatsSnapshot(state),
        debug: buildFantasyLaneProgressDebugSnapshot(state),
      });
      setProgress(result);

      // 应用奖励到进度
      if (state.result.rewards) {
        let updatedProgress = result;

        // 解锁单位
        for (const unitId of state.result.rewards.unlockedUnits) {
          updatedProgress = unlockUnit(updatedProgress, unitId);
        }

        // 添加碎片
        for (const [unitId, count] of Object.entries(state.result.rewards.fragments)) {
          updatedProgress = addUnitFragment(updatedProgress, unitId, count);
        }

        // 保存更新后的进度
        saveFantasyLaneProgress(updatedProgress);
        setProgress(updatedProgress);
      }
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase, state.playerBaseHp, state.playerBaseHpMax, state.result, state.selectedLevelId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        setState((current) => {
          if (current.phase === 'setup') return fantasyLaneRuntimeAdapter.startBattle(current);
          if (current.phase === 'playing') return fantasyLaneRuntimeAdapter.pauseBattle(current);
          if (current.phase === 'paused') return fantasyLaneRuntimeAdapter.resumeBattle(current);
          return current;
        });
        return;
      }

      if (event.code === 'KeyQ') {
        event.preventDefault();
        setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.heroSkill.id));
        return;
      }

      if (event.code === 'KeyW') {
        event.preventDefault();
        setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.tacticalSkill.id));
        return;
      }

      if (event.code === 'KeyR') {
        event.preventDefault();
        setState((current) => fantasyLaneRuntimeAdapter.restartBattle(current));
        return;
      }

      const digitMatch = event.code.match(/^Digit([1-8])$/);
      if (!digitMatch) return;

      const loadoutIndex = Number.parseInt(digitMatch[1] ?? '', 10) - 1;
      setState((current) => {
        const unitId = current.loadoutUnitIds[loadoutIndex];
        return unitId ? fantasyLaneRuntimeAdapter.queueUnit(current, unitId) : current;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLevelSelect = (levelId: string) => {
    if (getFantasyLaneLevelStatus(progress, levelId) === 'locked') {
      setState((current) => ({ ...current, lastHint: '该关卡尚未解锁。' }));
      return;
    }
    emitFantasyLaneLevelSelection(levelId);
    setState((current) => fantasyLaneRuntimeAdapter.selectLevel(current, levelId));
  };

  return (
    <div className="fantasy-lane-sheet">
      <FantasyLaneHud
        state={state}
        onCastHero={() => setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.heroSkill.id))}
        onCastTactical={() => setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.tacticalSkill.id))}
        onTogglePause={() =>
          setState((current) =>
            current.phase === 'paused'
              ? fantasyLaneRuntimeAdapter.resumeBattle(current)
              : fantasyLaneRuntimeAdapter.pauseBattle(current),
          )
        }
        onRestart={() => setState((current) => fantasyLaneRuntimeAdapter.restartBattle(current))}
        onStart={() => setState((current) => fantasyLaneRuntimeAdapter.startBattle(current))}
        onExitLevel={() => setState((current) => fantasyLaneRuntimeAdapter.selectLevel(current, current.selectedLevelId))}
      />

      <div className={`fantasy-lane-layout${setupCollapsed ? ' has-collapsed-sidebar' : ''}`}>
        <FantasyLaneLoadoutPanel
          state={state}
          chapters={chapters}
          warnings={warnings}
          canEditSetup={canEditSetup}
          getLevelStatus={(levelId) => getFantasyLaneLevelStatus(progress, levelId)}
          onLevelSelect={handleLevelSelect}
          onHeroSelect={(heroId) => setState((current) => fantasyLaneRuntimeAdapter.selectHero(current, heroId))}
          onToggleLoadout={(unitId) => setState((current) => fantasyLaneRuntimeAdapter.toggleLoadoutUnit(current, unitId))}
          onQueueUnit={(unitId) => setState((current) => fantasyLaneRuntimeAdapter.queueUnit(current, unitId))}
          onToggleCollapse={() => setSetupCollapsed((current) => !current)}
          collapsed={setupCollapsed}
        />

        <main className="fantasy-lane-main">
          <div className="fantasy-lane-main-head">
            <div className="fantasy-lane-main-title">
              <span className="fantasy-lane-kicker">{currentLevel.chapterName}</span>
              <h2>{currentLevel.id} {currentLevel.name}</h2>
            </div>
          </div>

          <FantasyLaneBoard state={state} />

          <div className="fantasy-lane-footer-note">
            <span>快捷键：Space 开始/暂停，1-8 出兵，Q/W 技能，R 重开</span>
          </div>
        </main>
      </div>

      <FantasyLaneResultPanel
        state={state}
        onRetry={() => setState((current) => fantasyLaneRuntimeAdapter.restartBattle(current))}
        onBackToSetup={() => setState((current) => fantasyLaneRuntimeAdapter.selectLevel(current, current.selectedLevelId))}
      />
    </div>
  );
};

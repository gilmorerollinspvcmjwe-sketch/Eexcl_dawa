import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneLevelStatus,
  getFantasyLaneProgressSummary,
  loadFantasyLaneProgress,
  recordFantasyLaneLevelResult,
  recordFantasyLaneLevelStart,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import {
  emitFantasyLaneLevelSelection,
  getLatestFantasyLaneLevelSelection,
  subscribeFantasyLaneLevelSelection,
} from '../../features/fantasy_lane/fantasyLaneSelectionBridge.ts';
import { fantasyLaneRuntimeAdapter, getFantasyLaneRecommendedLoadoutWarnings } from '../../features/fantasy_lane/fantasyLaneRuntime.ts';
import type { FantasyLaneRuntimeState, FantasyLaneSheetSnapshot } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import type { WorkbookStatusSummary } from '../../types/workbook.ts';
import { FantasyLaneBoard } from './FantasyLaneBoard';
import { FantasyLaneHud } from './FantasyLaneHud';
import { FantasyLaneLoadoutPanel } from './FantasyLaneLoadoutPanel';
import { FantasyLaneResultPanel } from './FantasyLaneResultPanel';
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
  onExit,
  onOpenRoster,
  onOpenChapters,
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
  const [selectedTab, setSelectedTab] = useState<'levels' | 'loadout'>(snapshot?.selectedTab ?? 'levels');
  const [progress, setProgress] = useState(() => loadFantasyLaneProgress());
  const previousPhaseRef = useRef(state.phase);
  const latestStateRef = useRef(state);

  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const chapters = useMemo(() => fantasyLaneRuntimeAdapter.getChapters(), []);
  const warnings = useMemo(
    () => getFantasyLaneRecommendedLoadoutWarnings(state.loadoutUnitIds, state.selectedLevelId),
    [state.loadoutUnitIds, state.selectedLevelId],
  );
  const progressSummary = useMemo(
    () => getFantasyLaneProgressSummary(progress),
    [progress],
  );
  const canEditSetup = state.phase === 'setup' || state.phase === 'won' || state.phase === 'lost';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => fantasyLaneRuntimeAdapter.tick(current, 200));
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    latestStateRef.current = state;
    onFormulaChange?.(fantasyLaneRuntimeAdapter.getFormulaText(state));
    onStatusChange?.(fantasyLaneRuntimeAdapter.getStatusSummary(state));
  }, [onFormulaChange, onStatusChange, state]);

  useEffect(() => {
    if (state.phase === 'playing') return;
    onSnapshotChange?.({ state, setupCollapsed, selectedTab });
  }, [onSnapshotChange, selectedTab, setupCollapsed, state]);

  useEffect(() => {
    if (!onSnapshotChange || state.phase !== 'playing') return;
    const timer = window.setInterval(() => {
      onSnapshotChange({ state: latestStateRef.current, setupCollapsed, selectedTab });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onSnapshotChange, selectedTab, setupCollapsed, state.phase]);

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
      setProgress(recordFantasyLaneLevelStart(state.selectedLevelId));
    }
    if (previousPhase !== state.phase && (state.phase === 'won' || state.phase === 'lost') && state.result) {
      const baseHpPercent = (state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100;
      setProgress(recordFantasyLaneLevelResult(state.selectedLevelId, state.result, baseHpPercent));
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
        onTogglePause={() =>
          setState((current) =>
            current.phase === 'paused'
              ? fantasyLaneRuntimeAdapter.resumeBattle(current)
              : fantasyLaneRuntimeAdapter.pauseBattle(current),
          )
        }
        onRestart={() => setState((current) => fantasyLaneRuntimeAdapter.restartBattle(current))}
        onExit={onExit}
      />

      <div className="fantasy-lane-layout">
        <FantasyLaneLoadoutPanel
          state={state}
          chapters={chapters}
          selectedTab={selectedTab}
          warnings={warnings}
          canEditSetup={canEditSetup}
          getLevelStatus={(levelId) => getFantasyLaneLevelStatus(progress, levelId)}
          onSelectedTabChange={setSelectedTab}
          onLevelSelect={handleLevelSelect}
          onHeroSelect={(heroId) => setState((current) => fantasyLaneRuntimeAdapter.selectHero(current, heroId))}
          onTacticalSelect={(skillId) => setState((current) => fantasyLaneRuntimeAdapter.selectTacticalSkill(current, skillId))}
          onToggleLoadout={(unitId) => setState((current) => fantasyLaneRuntimeAdapter.toggleLoadoutUnit(current, unitId))}
          onQueueUnit={(unitId) => setState((current) => fantasyLaneRuntimeAdapter.queueUnit(current, unitId))}
          onStart={() => setState((current) => fantasyLaneRuntimeAdapter.startBattle(current))}
          onToggleCollapse={() => setSetupCollapsed((current) => !current)}
          onOpenRoster={onOpenRoster}
          onOpenChapters={onOpenChapters}
          collapsed={setupCollapsed}
        />

        <main className="fantasy-lane-main">
          <div className="fantasy-lane-main-head">
            <div>
              <span className="fantasy-lane-kicker">{currentLevel.chapterName}</span>
              <h2>{currentLevel.id} {currentLevel.name}</h2>
              <p>{currentLevel.description}</p>
            </div>

            <div className="fantasy-lane-skill-stack">
              <button
                type="button"
                className="fantasy-lane-skill-btn"
                onClick={() => setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.heroSkill.id))}
                disabled={state.phase !== 'playing' || state.heroSkill.remainingMs > 0}
              >
                <strong>{state.heroSkill.name}</strong>
                <span>{state.heroSkill.remainingMs > 0 ? `${Math.ceil(state.heroSkill.remainingMs / 1000)}s` : '英雄技能'}</span>
              </button>
              <button
                type="button"
                className="fantasy-lane-skill-btn fantasy-lane-skill-btn--tactical"
                onClick={() => setState((current) => fantasyLaneRuntimeAdapter.castSkill(current, current.tacticalSkill.id))}
                disabled={state.phase !== 'playing' || state.tacticalSkill.remainingMs > 0}
              >
                <strong>{state.tacticalSkill.name}</strong>
                <span>{state.tacticalSkill.remainingMs > 0 ? `${Math.ceil(state.tacticalSkill.remainingMs / 1000)}s` : '战术技能'}</span>
              </button>
            </div>
          </div>

          <FantasyLaneBoard state={state} />

          <div className="fantasy-lane-footer-note">
            <strong>当前阶段：</strong>
            <span>{state.phaseLabel}</span>
            <span>推荐标签：{currentLevel.recommendedTags.join(' / ')}</span>
            <span>提示：{currentLevel.hint}</span>
            <span>战场反馈：{state.lastHint}</span>
            <span>主线进度：{progressSummary.completedLevels}/{progressSummary.totalLevels}</span>
            <span>空优：{state.airControl > 0 ? '+' : ''}{state.airControl}</span>
            <span>拥堵：{state.congestion}%</span>
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

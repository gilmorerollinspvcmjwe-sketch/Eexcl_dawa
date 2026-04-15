import React, { useEffect, useMemo, useState } from 'react';
import {
  collectSunDrop,
  createPvZBoardState,
  placePlant,
  removePlantWithShovel,
  resetPvZToSetup,
  restartPvZBattle,
  selectPvZCard,
  setGameSpeed,
  setPvZScenario,
  startPvZBattle,
  tickPvZBoard,
  togglePause,
  toggleShovelMode,
} from '../../features/pvz/pvzBoardState';
import { getPvZChapterGuidance, getPvZOutcomeRecommendation } from '../../features/pvz/pvzChapterGuidance';
import {
  getPvZAdventureChapterTitle,
  getPvZAdventureScenariosByChapterIndex,
  getPvZScenariosByMode,
} from '../../features/pvz/pvzScenarioCatalog';
import { isLevelUnlocked, loadProgress } from '../../features/pvz/pvzProgressStorage';
import type { PvZBoardState, PvZMode, PvZScenarioId } from '../../features/pvz/pvzTypes';
import { PvZBoard } from './PvZBoard';
import { PvZCardTray } from './PvZCardTray';
import { PvZHud } from './PvZHud';
import { PvZResultPanel } from './PvZResultPanel';
import {
  cachePvZContext,
  emitPvZScenarioSelection,
  getCachedPvZContext,
  getLatestPvZScenarioSelection,
  subscribePvZScenarioSelection,
} from './pvzScenarioBridge';
import '../../styles/pvz.css';

const MODE_LABELS: Record<PvZMode, string> = {
  adventure: '主线冒险',
  lab: '洞察试验',
  survival: '长线生存',
};

interface PvZGameSheetProps {
  onFormulaChange?: (text: string) => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

export const PvZGameSheet: React.FC<PvZGameSheetProps> = ({ onFormulaChange, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    state?: PvZBoardState;
    adventurePackIndex?: number;
    setupCollapsed?: boolean;
  } | null;
  const [state, setState] = useState<PvZBoardState>(() => {
    if (snapshot?.state) return snapshot.state;
    const latestSelection = getLatestPvZScenarioSelection();
    const cached = getCachedPvZContext();
    if (latestSelection && cached?.scenarioId === latestSelection) return cached;
    if (latestSelection) return createPvZBoardState({ scenarioId: latestSelection });
    if (cached) return cached;
    return createPvZBoardState();
  });
  const [adventurePackIndex, setAdventurePackIndex] = useState(snapshot?.adventurePackIndex ?? 1);
  const [setupCollapsed, setSetupCollapsed] = useState(snapshot?.setupCollapsed ?? false);
  const progress = useMemo(() => loadProgress(), []);
  const chapterGuidance = getPvZChapterGuidance(state.chapterId);
  const modeLabel = MODE_LABELS[state.mode];
  const visibleScenarios = useMemo(
    () =>
      state.mode === 'adventure'
        ? getPvZAdventureScenariosByChapterIndex(adventurePackIndex)
        : getPvZScenariosByMode(state.mode),
    [adventurePackIndex, state.mode],
  );
  const segmentSeconds = Math.max(1, Math.round(state.scenarioSegmentDurationMs / 1000));
  const totalSeconds = Math.max(1, Math.round(state.waveDurationMs / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickPvZBoard(current, 200));
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.mode === 'adventure' && state.levelNumber) {
      setAdventurePackIndex(Math.max(1, Math.ceil(state.levelNumber / 10)));
    }
  }, [state.levelNumber, state.mode]);

  useEffect(() => {
    cachePvZContext(state);
  }, [state]);

  useEffect(() => {
    onSnapshotChange?.({
      state,
      adventurePackIndex,
      setupCollapsed,
    });
  }, [state, adventurePackIndex, setupCollapsed, onSnapshotChange]);

  useEffect(() => {
    onFormulaChange?.(
      state.phase === 'setup'
        ? `=${state.levelId ?? state.chapterTitle} | ${modeLabel} | 目标：${state.scenarioObjective} | 卡组 ${state.selectedCards.length}/6`
        : state.status === 'playing'
          ? `=${state.levelId ?? state.chapterTitle} | 进度 ${Math.round(state.waveProgress * 100)}% | 阳光 ${Math.round(state.sun)} | 僵尸 ${state.zombies.length}`
          : state.status === 'won'
            ? `=${state.levelId ?? state.chapterTitle} 通关 | ${getPvZOutcomeRecommendation(state)}`
            : `=${state.levelId ?? state.chapterTitle} 失守 | ${getPvZOutcomeRecommendation(state)}`,
    );
  }, [onFormulaChange, state, modeLabel]);

  useEffect(() => {
    const unsubscribe = subscribePvZScenarioSelection((scenarioId) => {
      setState((current) => {
        if (current.scenarioId === scenarioId && current.phase === 'setup') return current;
        return createPvZBoardState({ scenarioId });
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const latestSelection = getLatestPvZScenarioSelection();
    if (!latestSelection) return;
    setState((current) => {
      if (current.scenarioId === latestSelection && current.phase === 'setup') return current;
      return createPvZBoardState({ scenarioId: latestSelection });
    });
  }, []);

  const handleModeSwitch = (mode: PvZMode) => {
    const firstScenario = getPvZScenariosByMode(mode)[0];
    if (!firstScenario) return;
    setState(() => createPvZBoardState({ scenarioId: firstScenario.id, mode }));
    if (mode === 'adventure') setAdventurePackIndex(1);
    emitPvZScenarioSelection(firstScenario.id);
  };

  const handleScenarioSelect = (scenarioId: PvZScenarioId) => {
    setState((current) => setPvZScenario(current, scenarioId));
    emitPvZScenarioSelection(scenarioId);
  };

  return (
    <div className="pvz-sheet">
      <PvZHud
        state={state}
        onTogglePause={() => setState((current) => togglePause(current))}
        onToggleSpeed={() => setState((current) => setGameSpeed(current, current.gameSpeed === 1 ? 2 : 1))}
        onToggleShovel={() => setState((current) => toggleShovelMode(current))}
      />

      {state.phase === 'setup' && (
        <div className={`pvz-setup-panel${setupCollapsed ? ' is-collapsed' : ''}`}>
          <div className="pvz-setup-toolbar">
            <div className="pvz-setup-toolbar-copy">
              <strong>{state.levelId ? `${state.levelId} · ${state.levelTitle}` : state.chapterTitle}</strong>
              <span>{modeLabel}</span>
              <span>卡组 {state.selectedCards.length}/6</span>
            </div>
            <div className="pvz-setup-toolbar-actions">
              <button
                type="button"
                className="pvz-mode-tab"
                aria-expanded={!setupCollapsed}
                aria-controls="pvz-setup-content"
                aria-label={setupCollapsed ? '展开植物大战僵尸设置面板' : '收起植物大战僵尸设置面板'}
                onClick={() => setSetupCollapsed((current) => !current)}
              >
                {setupCollapsed ? '展开设置' : '收起设置'}
              </button>
              <button
                type="button"
                className="pvz-start-btn"
                aria-label="开始植物大战僵尸战斗"
                onClick={() => setState((current) => startPvZBattle(current))}
              >
                开始防线
              </button>
            </div>
          </div>

          {!setupCollapsed && (
            <>
              <div className="pvz-setup-copy" id="pvz-setup-content">
                <strong>{state.levelId ? `${state.levelId} · ${state.levelTitle}` : state.chapterTitle}</strong>
                <span>当前模式：{modeLabel}</span>
                <span>{state.chapterSummary}</span>
                <span>本关目标：{state.scenarioObjective}</span>
                <span>主要威胁：{chapterGuidance.majorThreats.join('、')}</span>
                <span>关卡强度：{state.scenarioIntensity}</span>
                <span>卡池规模：{state.availablePlants.length} 张，本关推荐 {state.recommendedCards.length} 张</span>
                <span>解锁内容：植物 {state.latestUnlockPlants.length} / 僵尸 {state.latestUnlockZombies.length}</span>
                <span>规则摘要：{state.scenarioRules.join(' / ')}</span>
                <div className="pvz-scenario-detail-grid">
                  <div className="pvz-scenario-detail-item">
                    <strong>单段时长</strong>
                    <span>{segmentSeconds} 秒</span>
                  </div>
                  <div className="pvz-scenario-detail-item">
                    <strong>总时长</strong>
                    <span>{totalSeconds} 秒</span>
                  </div>
                  <div className="pvz-scenario-detail-item">
                    <strong>阳光漏</strong>
                    <span>{state.scenarioSunDrainPerSecond > 0 ? `${state.scenarioSunDrainPerSecond.toFixed(2)} /秒` : '稳定'}</span>
                  </div>
                  <div className="pvz-scenario-detail-item">
                    <strong>段数</strong>
                    <span>{state.scenarioSegmentsTotal}</span>
                  </div>
                </div>
              </div>

              <div className="pvz-mode-panel">
                <div className="pvz-mode-tabs" role="tablist" aria-label="PvZ 模式切换">
                  {(['adventure', 'lab', 'survival'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={state.mode === mode}
                      aria-label={`切换到${MODE_LABELS[mode]}模式`}
                      className={`pvz-mode-tab${state.mode === mode ? ' active' : ''}`}
                      onClick={() => handleModeSwitch(mode)}
                    >
                      {MODE_LABELS[mode]}
                    </button>
                  ))}
                </div>

                {state.mode === 'adventure' ? (
                  <div className="pvz-adventure-pack-grid" role="tablist" aria-label="冒险章节">
                    {Array.from({ length: 10 }, (_, index) => {
                      const packIndex = index + 1;
                      const isActive = adventurePackIndex === packIndex;
                      return (
                        <button
                          key={packIndex}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`选择${getPvZAdventureChapterTitle(packIndex)}`}
                          className={`pvz-mode-tab${isActive ? ' active' : ''}`}
                          onClick={() => setAdventurePackIndex(packIndex)}
                        >
                          {getPvZAdventureChapterTitle(packIndex)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="pvz-scenario-grid">
                  {visibleScenarios.map((scenario) => {
                    const unlocked = state.mode !== 'adventure' || isLevelUnlocked(progress, scenario.id);
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        aria-pressed={state.scenarioId === scenario.id}
                        aria-label={`${scenario.levelNumber ? `${scenario.id} ${scenario.title}` : scenario.title}${unlocked ? '' : '（未解锁）'}`}
                        aria-disabled={!unlocked}
                        className={`pvz-scenario-card${state.scenarioId === scenario.id ? ' active' : ''}${!unlocked ? ' pvz-scenario-card--locked' : ''}`}
                        onClick={() => unlocked && handleScenarioSelect(scenario.id)}
                        disabled={!unlocked}
                      >
                        <strong>
                          {scenario.levelNumber ? `${scenario.id} ${scenario.title}` : scenario.title}
                        </strong>
                        <span>{scenario.summary}</span>
                        <small>{scenario.objective}</small>
                        <small>
                          {scenario.intensity ? `强度 ${scenario.intensity}` : '特别规则'} · 阳光 {scenario.baseSun ?? state.sun}
                        </small>
                        {!unlocked && <small className="pvz-lock-hint">需通过前置关卡解锁</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <PvZResultPanel
        state={state}
        onRetry={() => setState((current) => restartPvZBattle(current))}
        onBackToSetup={() => setState((current) => resetPvZToSetup(current))}
      />

      <PvZCardTray
        state={state}
        onSelect={(plantId) =>
          setState((current) =>
            current.phase === 'setup'
              ? selectPvZCard(current, plantId)
              : { ...current, selectedPlantId: plantId },
          )
        }
        unlockedPlants={progress.unlockedPlants}
      />

      {state.phase !== 'setup' ? (
        <PvZBoard
          state={state}
          onSunDropClick={(dropId) => setState((current) => collectSunDrop(current, dropId))}
          onCellClick={(row, col) => {
            setState((current) => {
              if (current.phase !== 'playing') return current;
              if (current.shovelMode) return removePlantWithShovel(current, row, col);
              if (!current.selectedPlantId) return current;
              return placePlant(current, current.selectedPlantId, row, col);
            });
          }}
        />
      ) : (
        <div className="pvz-setup-board-placeholder">主线 100 关、实验关和生存关都从这里手动开始，配完卡再点“开始防线”。</div>
      )}
    </div>
  );
};

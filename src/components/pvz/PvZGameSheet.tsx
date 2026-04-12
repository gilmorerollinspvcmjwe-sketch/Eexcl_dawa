import React, { useEffect, useMemo, useState } from 'react';
import {
  createPvZBoardState,
  placePlant,
  resetPvZToSetup,
  restartPvZBattle,
  selectPvZCard,
  setPvZScenario,
  startPvZBattle,
  tickPvZBoard,
} from '../../features/pvz/pvzBoardState';
import { getPvZChapterGuidance, getPvZOutcomeRecommendation } from '../../features/pvz/pvzChapterGuidance';
import {
  getPvZAdventureChapterTitle,
  getPvZAdventureScenariosByChapterIndex,
  getPvZScenariosByMode,
} from '../../features/pvz/pvzScenarioCatalog';
import type { PvZBoardState, PvZMode, PvZPlantId, PvZScenarioId } from '../../features/pvz/pvzTypes';
import { PvZHud } from './PvZHud';
import { PvZCardTray } from './PvZCardTray';
import { PvZBoard } from './PvZBoard';
import { PvZResultPanel } from './PvZResultPanel';
import { emitPvZScenarioSelection, subscribePvZScenarioSelection } from './pvzScenarioBridge';
import '../../styles/pvz.css';

const MODE_LABELS: Record<PvZMode, string> = {
  adventure: '主线冒险',
  lab: '洞察试验',
  survival: '长线生存',
};

interface PvZGameSheetProps {
  onFormulaChange?: (text: string) => void;
}

export const PvZGameSheet: React.FC<PvZGameSheetProps> = ({ onFormulaChange }) => {
  const [state, setState] = useState<PvZBoardState>(() => createPvZBoardState());
  const [adventurePackIndex, setAdventurePackIndex] = useState(1);
  const [setupCollapsed, setSetupCollapsed] = useState(false);
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
      setState((current) => setPvZScenario(current, scenarioId));
    });
    return unsubscribe;
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
      <PvZHud state={state} />

      {state.phase === 'setup' && (
        <div className={`pvz-setup-panel${setupCollapsed ? ' is-collapsed' : ''}`}>
          <div className="pvz-setup-toolbar">
            <div className="pvz-setup-toolbar-copy">
              <strong>{state.levelId ? `${state.levelId} · ${state.levelTitle}` : state.chapterTitle}</strong>
              <span>{modeLabel}</span>
              <span>卡组 {state.selectedCards.length}/6</span>
            </div>
            <div className="pvz-setup-toolbar-actions">
              <button type="button" className="pvz-mode-tab" onClick={() => setSetupCollapsed((current) => !current)}>
                {setupCollapsed ? '展开设置' : '收起设置'}
              </button>
              <button type="button" className="pvz-start-btn" onClick={() => setState((current) => startPvZBattle(current))}>
                开始防线
              </button>
            </div>
          </div>

          {!setupCollapsed && (
            <>
              <div className="pvz-setup-copy">
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
                <div className="pvz-mode-tabs">
                  {(['adventure', 'lab', 'survival'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`pvz-mode-tab${state.mode === mode ? ' active' : ''}`}
                      onClick={() => handleModeSwitch(mode)}
                    >
                      {MODE_LABELS[mode]}
                    </button>
                  ))}
                </div>

                {state.mode === 'adventure' ? (
                  <div className="pvz-adventure-pack-grid">
                    {Array.from({ length: 10 }, (_, index) => {
                      const packIndex = index + 1;
                      const isActive = adventurePackIndex === packIndex;
                      return (
                        <button
                          key={packIndex}
                          type="button"
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
                  {visibleScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      className={`pvz-scenario-card${state.scenarioId === scenario.id ? ' active' : ''}`}
                      onClick={() => handleScenarioSelect(scenario.id)}
                    >
                      <strong>
                        {scenario.levelNumber ? `${scenario.id} ${scenario.title}` : scenario.title}
                      </strong>
                      <span>{scenario.summary}</span>
                      <small>{scenario.objective}</small>
                      <small>
                        {scenario.intensity ? `强度 ${scenario.intensity}` : '特别规则'} · 阳光 {scenario.baseSun ?? state.sun}
                      </small>
                    </button>
                  ))}
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
      />

      {state.phase !== 'setup' ? (
        <PvZBoard
          state={state}
          onCellClick={(row, col) => {
            if (state.phase !== 'playing') return;
            if (!state.selectedPlantId) return;
            setState((current) => placePlant(current, current.selectedPlantId as PvZPlantId, row, col));
          }}
        />
      ) : (
        <div className="pvz-setup-board-placeholder">主线 100 关、实验关和生存关都从这里手动开始，配完卡再点“开始防线”。</div>
      )}
    </div>
  );
};

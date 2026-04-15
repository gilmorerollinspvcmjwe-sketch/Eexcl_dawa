/* 祖玛主玩法Sheet14组件。包含选关、模式切换、游戏控制、棋盘渲染和结算面板。 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import '../../styles/zuma.css';
import {
  createZumaBoardState,
  startZumaGame,
  resetZumaGame,
  toggleZumaPause,
  setZumaGameSpeed,
  rotateCannonToTarget,
  fireCannon,
  swapCannonBalls,
  tickZumaBoard,
  getZumaFormulaBarText,
} from '../../features/zuma/zumaBoardState';
import {
  getAdventureLevels,
  getChainRewindLevels,
  getTimedLevelsByDuration,
  getTimedLevelDurations,
  getLevelDefinition,
  getLevelPackSummary,
  isLevelUnlocked,
} from '../../features/zuma/zumaLevelCatalog';
import { getClearedLevelIds } from '../../features/zuma/zumaProgressStorage';
import type { ZumaBoardState, ZumaLevelMode, ZumaClearEvent } from '../../features/zuma/zumaTypes';
import { ZumaBoard } from './ZumaBoard';
import { ZumaHud } from './ZumaHud';
import { ZumaResultPanel } from './ZumaResultPanel';
import {
  playZumaShootSound,
  playZumaMissSound,
  playZumaClearSound,
  playZumaChainComboSound,
  playZumaSwapSound,
  playZumaPowerupSound,
  playZumaDangerSound,
  playZumaWinSound,
  playZumaLoseSound,
} from '../../utils/zumaSoundUtils';

const MODE_LABELS: Record<ZumaLevelMode, string> = {
  adventure: '神庙征途',
  timed: '计时冲分',
  endless: '无尽模式',
  practice: '练习模式',
};

interface ZumaGameSheetProps {
  onFormulaChange?: (text: string) => void;
  onExit?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

export const ZumaGameSheet: React.FC<ZumaGameSheetProps> = ({ onFormulaChange, onExit, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    state?: ZumaBoardState;
    selectedMode?: ZumaLevelMode;
    selectedPack?: 'temple' | 'chain' | 'timed';
    selectedTimedDuration?: number;
    selectedLevelId?: string | null;
    setupCollapsed?: boolean;
  } | null;
  const [state, setState] = useState<ZumaBoardState>(() => snapshot?.state ?? createZumaBoardState());
  const [selectedMode, setSelectedMode] = useState<ZumaLevelMode>(snapshot?.selectedMode ?? 'adventure');
  const [selectedPack, setSelectedPack] = useState<'temple' | 'chain' | 'timed'>(snapshot?.selectedPack ?? 'temple');
  const [selectedTimedDuration, setSelectedTimedDuration] = useState(snapshot?.selectedTimedDuration ?? 3);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(snapshot?.selectedLevelId ?? null);
  const [setupCollapsed, setSetupCollapsed] = useState(snapshot?.setupCollapsed ?? false);

  const prevEventsLengthRef = useRef(0);
  const prevDangerLevelRef = useRef(state.dangerLevel);
  const prevPhaseRef = useRef(state.phase);
  const prevShotsMissedRef = useRef(0);

  const clearedLevelIds = useMemo(() => getClearedLevelIds(), []);

  const adventureLevels = useMemo(() => {
    if (selectedPack === 'temple') return getAdventureLevels();
    if (selectedPack === 'chain') return getChainRewindLevels();
    return [];
  }, [selectedPack]);

  const timedLevels = useMemo(() => {
    return getTimedLevelsByDuration(selectedTimedDuration);
  }, [selectedTimedDuration]);

  const timedDurations = useMemo(() => getTimedLevelDurations(), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => {
        const newState = tickZumaBoard(current, 16);

        if (newState.events.length > prevEventsLengthRef.current) {
          const newEvents = newState.events.slice(prevEventsLengthRef.current);
          for (const event of newEvents) {
            switch (event.eventType) {
              case 'SHOT_FIRED':
                playZumaShootSound();
                break;
              case 'MATCH_CLEARED':
                if (event.data && typeof event.data === 'object' && 'chainComboLevel' in event.data) {
                  const clearEvent = event.data as ZumaClearEvent;
                  playZumaClearSound(clearEvent.chainComboLevel);
                  if (clearEvent.chainComboLevel > 1) {
                    playZumaChainComboSound(clearEvent.chainComboLevel);
                  }
                }
                break;
              case 'POWERUP_TRIGGERED':
                playZumaPowerupSound('burst');
                break;
            }
          }
          prevEventsLengthRef.current = newState.events.length;
        }

        if (newState.dangerLevel !== prevDangerLevelRef.current) {
          if (newState.dangerLevel === 'warning' || newState.dangerLevel === 'critical') {
            playZumaDangerSound(newState.dangerLevel);
          }
          prevDangerLevelRef.current = newState.dangerLevel;
        }

        if (newState.phase !== prevPhaseRef.current) {
          if (newState.phase === 'won') {
            playZumaWinSound();
          } else if (newState.phase === 'lost') {
            playZumaLoseSound();
          }
          prevPhaseRef.current = newState.phase;
        }

        if (newState.score.shotsMissed > prevShotsMissedRef.current) {
          playZumaMissSound();
          prevShotsMissedRef.current = newState.score.shotsMissed;
        }

        return newState;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(getZumaFormulaBarText(state));
  }, [onFormulaChange, state]);

  useEffect(() => {
    onSnapshotChange?.({
      state,
      selectedMode,
      selectedPack,
      selectedTimedDuration,
      selectedLevelId,
      setupCollapsed,
    });
  }, [state, selectedMode, selectedPack, selectedTimedDuration, selectedLevelId, setupCollapsed, onSnapshotChange]);

  const handleModeSwitch = useCallback((mode: ZumaLevelMode) => {
    setSelectedMode(mode);
    if (mode === 'adventure') {
      setSelectedPack('temple');
    } else if (mode === 'timed') {
      setSelectedPack('timed');
    }
  }, []);

  const handlePackSwitch = useCallback((pack: 'temple' | 'chain') => {
    setSelectedPack(pack);
  }, []);

  const handleTimedDurationSwitch = useCallback((duration: number) => {
    setSelectedTimedDuration(duration);
  }, []);

  const handleLevelSelect = useCallback((levelId: string) => {
    const level = getLevelDefinition(levelId);
    if (!level) return;

    setSelectedLevelId(levelId);
    setState(() => createZumaBoardState({
      levelId,
      mode: level.mode,
      trackId: level.trackId,
      colorPool: level.colorPool,
      powerupPool: level.powerupPool,
      baseSpeed: level.baseSpeed,
      timeLimitMs: level.timeLimitMs,
      shotLimit: level.shotLimit,
      levelNumber: level.levelNumber,
      levelTitle: level.title,
      spawnScript: level.spawnScript,
    }));
  }, []);

  const handleStartGame = useCallback(() => {
    setState((current) => startZumaGame(current));
  }, []);

  const handleRestart = useCallback(() => {
    prevEventsLengthRef.current = 0;
    prevDangerLevelRef.current = 'safe';
    prevPhaseRef.current = 'setup';
    prevShotsMissedRef.current = 0;
    setState((current) => resetZumaGame(current));
  }, []);

  const handleTogglePause = useCallback(() => {
    setState((current) => toggleZumaPause(current));
  }, []);

  const handleToggleSpeed = useCallback(() => {
    setState((current) => {
      const newSpeed = current.gameSpeed === 1 ? 2 : current.gameSpeed === 2 ? 3 : 1;
      return setZumaGameSpeed(current, newSpeed);
    });
  }, []);

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (state.phase !== 'playing') return;
    if (!state.cannon.isReady) return;

    setState((current) => {
      const rotated = rotateCannonToTarget(current, x, y);
      return fireCannon(rotated);
    });
  }, [state.phase, state.cannon.isReady]);

  const handleCanvasMouseMove = useCallback((x: number, y: number) => {
    if (state.phase !== 'playing') return;
    setState((current) => rotateCannonToTarget(current, x, y));
  }, [state.phase]);

  const handleSwapBalls = useCallback(() => {
    playZumaSwapSound();
    setState((current) => swapCannonBalls(current));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase === 'setup') {
        if (e.key === 'Escape' && onExit) {
          e.preventDefault();
          onExit();
        }
        return;
      }
      if (state.phase !== 'playing') return;
      if (state.isPaused) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          handleSwapBalls();
          break;
        case 'Escape':
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          handleTogglePause();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.isPaused, handleSwapBalls, handleTogglePause, onExit]);

  const handleBackToSetup = useCallback(() => {
    prevEventsLengthRef.current = 0;
    prevDangerLevelRef.current = 'safe';
    prevPhaseRef.current = 'setup';
    prevShotsMissedRef.current = 0;
    setState((current) => ({
      ...resetZumaGame(current),
      phase: 'setup',
    }));
  }, []);

  const packSummary = useMemo(() => getLevelPackSummary(selectedPack === 'timed' ? 'timed' : selectedPack), [selectedPack]);

  return (
    <div className="zuma-sheet">
      <ZumaHud
        state={state}
        onTogglePause={handleTogglePause}
        onToggleSpeed={handleToggleSpeed}
        onRestart={handleRestart}
      />

      {state.phase === 'setup' && (
        <div className={`zuma-setup-panel${setupCollapsed ? ' is-collapsed' : ''}`}>
          <div className="zuma-setup-toolbar">
            <div className="zuma-setup-toolbar-copy">
              <strong>{selectedLevelId ? `关卡 ${getLevelDefinition(selectedLevelId)?.levelNumber}: ${getLevelDefinition(selectedLevelId)?.title}` : '选择关卡'}</strong>
              <span>{MODE_LABELS[selectedMode]}</span>
              <span>{packSummary.name}</span>
            </div>
            <div className="zuma-setup-toolbar-actions">
              <button
                type="button"
                className="zuma-setup-toggle"
                aria-expanded={!setupCollapsed}
                onClick={() => setSetupCollapsed((current) => !current)}
              >
                {setupCollapsed ? '展开设置' : '收起设置'}
              </button>
              <button
                type="button"
                className="zuma-start-btn"
                onClick={handleStartGame}
                disabled={!selectedLevelId}
              >
                开始游戏
              </button>
            </div>
          </div>

          {!setupCollapsed && (
            <div className="zuma-setup-content">
              <div className="zuma-mode-tabs" role="tablist">
                {(['adventure', 'timed'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={selectedMode === mode}
                    className={`zuma-mode-tab${selectedMode === mode ? ' active' : ''}`}
                    onClick={() => handleModeSwitch(mode)}
                  >
                    {MODE_LABELS[mode]}
                  </button>
                ))}
              </div>

              {selectedMode === 'adventure' && (
                <div className="zuma-pack-tabs" role="tablist">
                  {(['temple', 'chain'] as const).map((pack) => {
                    const summary = getLevelPackSummary(pack);
                    return (
                      <button
                        key={pack}
                        type="button"
                        role="tab"
                        aria-selected={selectedPack === pack}
                        className={`zuma-pack-tab${selectedPack === pack ? ' active' : ''}`}
                        onClick={() => handlePackSwitch(pack)}
                      >
                        {summary.name} ({summary.levelCount}关)
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedMode === 'timed' && (
                <div className="zuma-duration-tabs" role="tablist">
                  {timedDurations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      role="tab"
                      aria-selected={selectedTimedDuration === duration}
                      className={`zuma-duration-tab${selectedTimedDuration === duration ? ' active' : ''}`}
                      onClick={() => handleTimedDurationSwitch(duration)}
                    >
                      {duration}分钟
                    </button>
                  ))}
                </div>
              )}

              <div className="zuma-level-grid">
                {selectedMode === 'adventure' &&
                  adventureLevels.map((level) => {
                    const unlocked = isLevelUnlocked(level.levelId, clearedLevelIds);
                    const isSelected = selectedLevelId === level.levelId;
                    return (
                      <button
                        key={level.levelId}
                        type="button"
                        className={`zuma-level-card${isSelected ? ' active' : ''}${!unlocked ? ' locked' : ''}`}
                        onClick={() => unlocked && handleLevelSelect(level.levelId)}
                        disabled={!unlocked}
                        aria-pressed={isSelected}
                      >
                        <strong>关卡 {level.levelNumber}</strong>
                        <span>{level.title}</span>
                        <small>{level.summary}</small>
                        <small>强度 {level.intensity}</small>
                        {!unlocked && <small className="zuma-lock-hint">需通过前置关卡</small>}
                      </button>
                    );
                  })}

                {selectedMode === 'timed' &&
                  timedLevels.map((level) => {
                    const isSelected = selectedLevelId === level.levelId;
                    return (
                      <button
                        key={level.levelId}
                        type="button"
                        className={`zuma-level-card${isSelected ? ' active' : ''}`}
                        onClick={() => handleLevelSelect(level.levelId)}
                        aria-pressed={isSelected}
                      >
                        <strong>{level.title}</strong>
                        <span>{level.summary}</span>
                        <small>强度 {level.intensity}</small>
                      </button>
                    );
                  })}
              </div>

              {selectedLevelId && (
                <div className="zuma-level-detail">
                  <strong>关卡详情</strong>
                  <span>目标：{getLevelDefinition(selectedLevelId)?.objective}</span>
                  <span>规则：{getLevelDefinition(selectedLevelId)?.rules.join(' / ')}</span>
                  <span>颜色池：{getLevelDefinition(selectedLevelId)?.colorPool.join('、')}</span>
                  <span>道具池：{getLevelDefinition(selectedLevelId)?.powerupPool.join('、') || '无'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ZumaBoard
        state={state}
        onCanvasClick={handleCanvasClick}
        onCanvasMouseMove={handleCanvasMouseMove}
      />

      {state.phase === 'playing' && (
        <div className="zuma-game-controls">
          <button
            type="button"
            className="zuma-control-btn"
            onClick={handleSwapBalls}
            disabled={!state.cannon.isReady || state.isPaused}
            title="切换当前球与下一球（Tab键）"
          >
            切换球
          </button>
        </div>
      )}

      <ZumaResultPanel
        state={state}
        onRetry={handleRestart}
        onBackToSetup={handleBackToSetup}
        onEnterPractice={() => {
          setSetupCollapsed(false);
        }}
      />
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  applyGoldMinerShopPurchase,
  advanceGoldMinerToLevel,
  createGoldMinerBoardState,
  createGoldMinerSnapshot,
  launchGoldMinerHook,
  pauseGoldMiner,
  restartGoldMinerLevel,
  resumeGoldMiner,
  tickGoldMinerBoardState,
  useGoldMinerDynamite,
} from '../../features/gold_miner/goldMinerBoardState.ts';
import {
  buildGoldMinerFormulaText,
  buildGoldMinerHudViewModel,
  buildGoldMinerOverlayViewModel,
  buildGoldMinerResultSummary,
  buildGoldMinerStatusSummary,
} from '../../features/gold_miner/goldMinerSelectors.ts';
import {
  clearGoldMinerActiveRun,
  getGoldMinerProgressSummary,
  loadGoldMinerStorage,
  recordGoldMinerLevelResult,
  recordGoldMinerLevelStart,
  saveGoldMinerActiveRun,
} from '../../features/gold_miner/goldMinerProgressStorage.ts';
import { createEndlessGoldMinerLevel, getGoldMinerLevel, getGoldMinerMaxAdventureLevel, getGoldMinerStartingLevel } from '../../features/gold_miner/goldMinerLevelCatalog.ts';
import { GOLD_MINER_SHOP_REGISTRY } from '../../features/gold_miner/goldMinerShopRegistry.ts';
import type { GoldMinerMode } from '../../features/gold_miner/goldMinerTypes.ts';
import type { WorkbookStatusSummary } from '../../types';
import { GoldMinerBoard } from './GoldMinerBoard';
import { GoldMinerHud } from './GoldMinerHud';
import { GoldMinerOverlay } from './GoldMinerOverlay';
import '../../styles/gold-miner.css';

export interface GoldMinerSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary | undefined) => void;
  onExit?: () => void;
  onOpenGuide?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

const TICK_MS = 16;

export const GoldMinerSheet: React.FC<GoldMinerSheetProps> = ({
  onFormulaChange,
  onStatusChange,
  onExit,
  onOpenGuide,
  initialSnapshot,
  onSnapshotChange,
}) => {
  const storageSnapshot = useMemo(() => loadGoldMinerStorage(), []);
  const snapshot = initialSnapshot as { mode?: GoldMinerMode; state?: ReturnType<typeof createGoldMinerBoardState> } | null;
  const [selectedMode, setSelectedMode] = useState<GoldMinerMode>(snapshot?.mode ?? storageSnapshot.activeRun?.snapshot.mode ?? 'adventure');
  const [state, setState] = useState(() => {
    if (snapshot?.state) return snapshot.state;
    if (storageSnapshot.activeRun?.snapshot.state) return storageSnapshot.activeRun.snapshot.state;
    return createGoldMinerBoardState({ level: getGoldMinerStartingLevel(selectedMode) });
  });
  const runKeyRef = useRef('');
  const prevStatusRef = useRef(state.status);

  const hudViewModel = useMemo(() => buildGoldMinerHudViewModel(state), [state]);
  const overlayViewModel = useMemo(() => buildGoldMinerOverlayViewModel(state), [state]);
  const resultSummary = useMemo(() => buildGoldMinerResultSummary(state), [state]);
  const progressSummary = useMemo(() => getGoldMinerProgressSummary(), [state.levelId, state.status, state.score]);

  const togglePauseState = () => {
    setState((current) => (current.status === 'paused' ? resumeGoldMiner(current) : pauseGoldMiner(current)));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickGoldMinerBoardState(current, TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(buildGoldMinerFormulaText(state));
  }, [onFormulaChange, state]);

  useEffect(() => {
    onStatusChange?.(buildGoldMinerStatusSummary(state));
  }, [onStatusChange, state]);

  useEffect(() => {
    onSnapshotChange?.({ mode: selectedMode, state });
  }, [selectedMode, state, onSnapshotChange]);

  useEffect(() => {
    const runKey = `${state.levelId}-${state.rngSeed}`;
    if (runKeyRef.current !== runKey) {
      runKeyRef.current = runKey;
      recordGoldMinerLevelStart(state.levelId);
    }
  }, [state.levelId, state.rngSeed]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    if ((state.status === 'shop' || state.status === 'game_over') && previousStatus !== state.status) {
      recordGoldMinerLevelResult(state);
      clearGoldMinerActiveRun();
    }
    if (state.status === 'swinging' || state.status === 'extending' || state.status === 'retracting') {
      saveGoldMinerActiveRun(createGoldMinerSnapshot(state));
    }
    prevStatusRef.current = state.status;
  }, [state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === ' ' || key === 'enter') {
        event.preventDefault();
        setState((current) => launchGoldMinerHook(current));
        return;
      }
      if (key === 'arrowup' || key === 'd') {
        event.preventDefault();
        setState((current) => useGoldMinerDynamite(current));
        return;
      }
      if (key === 'p') {
        event.preventDefault();
        togglePauseState();
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        setState((current) => restartGoldMinerLevel(current, current.mode === 'endless' ? createEndlessGoldMinerLevel(current.levelId) : getGoldMinerLevel(current.levelId)));
        return;
      }
      if (key === 'escape' && onExit) {
        event.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const handleNextLevel = () => {
    if (state.mode === 'adventure') {
      if (state.levelId >= getGoldMinerMaxAdventureLevel()) {
        setSelectedMode('endless');
        setState(advanceGoldMinerToLevel(state, createEndlessGoldMinerLevel(1)));
        return;
      }
      setState(advanceGoldMinerToLevel(state, getGoldMinerLevel(state.levelId + 1)));
      return;
    }
    setState(advanceGoldMinerToLevel(state, createEndlessGoldMinerLevel(state.levelId + 1)));
  };

  return (
    <div className="gold-miner-sheet">
      <GoldMinerHud
        viewModel={hudViewModel}
        onPause={togglePauseState}
        onUseDynamite={() => setState((current) => useGoldMinerDynamite(current))}
        onOpenGuide={onOpenGuide}
      />

      <div className="gold-miner-sheet__meta">
        <div className="gold-miner-sheet__mode-switch">
          <button
            type="button"
            className={`gold-miner-pill${selectedMode === 'adventure' ? ' active' : ''}`}
            onClick={() => {
              setSelectedMode('adventure');
              setState(createGoldMinerBoardState({ level: getGoldMinerLevel(Math.min(progressSummary.highestLevel, getGoldMinerMaxAdventureLevel())) }));
            }}
          >
            主线模式
          </button>
          <button
            type="button"
            className={`gold-miner-pill${selectedMode === 'endless' ? ' active' : ''}`}
            onClick={() => {
              setSelectedMode('endless');
              setState(createGoldMinerBoardState({ level: createEndlessGoldMinerLevel(Math.max(1, progressSummary.highestLevel - getGoldMinerMaxAdventureLevel())) }));
            }}
          >
            无尽模式
          </button>
        </div>
        <span>历史最高分 {progressSummary.bestScore.toLocaleString()}</span>
        <span>总收入 {progressSummary.totalGoldCollected.toLocaleString()}</span>
      </div>

      <GoldMinerBoard state={state} onLaunch={() => setState((current) => launchGoldMinerHook(current))} />

      <GoldMinerOverlay
        overlay={overlayViewModel}
        result={resultSummary}
        shopItems={GOLD_MINER_SHOP_REGISTRY}
        currentBank={state.totalBank + state.score}
        onBuyShopItem={(itemId) => setState((current) => applyGoldMinerShopPurchase(current, itemId))}
        onPrimaryAction={() => {
          if (state.status === 'paused') {
            setState((current) => resumeGoldMiner(current));
            return;
          }
          if (state.status === 'shop') {
            handleNextLevel();
            return;
          }
          if (state.status === 'game_over') {
            setState((current) => restartGoldMinerLevel(current, current.mode === 'endless' ? createEndlessGoldMinerLevel(current.levelId) : getGoldMinerLevel(current.levelId)));
          }
        }}
        onSecondaryAction={() => {
          if (state.status === 'paused' || state.status === 'shop') {
            setState((current) => restartGoldMinerLevel(current, current.mode === 'endless' ? createEndlessGoldMinerLevel(current.levelId) : getGoldMinerLevel(current.levelId)));
            return;
          }
          onExit?.();
        }}
      />
    </div>
  );
};

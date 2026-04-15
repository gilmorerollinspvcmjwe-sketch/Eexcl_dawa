import React, { useEffect, useRef, useState } from 'react';
import {
  hardDropActivePiece,
  holdActivePiece,
  moveActivePiece,
  restartTetrisGame,
  rotateActivePiece,
  setTetrisMode,
  softDropActivePiece,
  startTetrisGame,
  tickTetrisBoard,
  toggleTetrisPause,
} from '../../features/tetris/tetrisBoardState';
import {
  getTetrisFormulaText,
  getTetrisModeGoalText,
  getTetrisModeLabel,
  getTetrisModeProgressText,
} from '../../features/tetris/tetrisSelectors';
import {
  findDefaultTetrisPresetId,
  getTetrisPresetById,
  getTetrisPresetsByPack,
  TETRIS_PACKS,
  type TetrisPackId,
} from '../../features/tetris/tetrisContent';
import { applyTetrisRunResult, readTetrisModuleRecord, saveTetrisModuleRecord, type TetrisRunRecordUpdate } from '../../features/tetris/tetrisStorage';
import type { TetrisBoardState, TetrisMode } from '../../features/tetris/tetrisTypes';
import type { WorkbookStatusSummary } from '../../types';
import { createTetrisBoardState } from '../../features/tetris/tetrisBoardState';
import { TetrisBoard } from './TetrisBoard';
import { TetrisHud } from './TetrisHud';
import { TetrisOverlay } from './TetrisOverlay';
import '../../styles/tetris.css';

interface TetrisSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

export const TetrisSheet: React.FC<TetrisSheetProps> = ({ onFormulaChange, onStatusChange, onExit, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    state?: TetrisBoardState;
    selectedPackId?: TetrisPackId;
    selectedPresetId?: string;
    settingsCollapsed?: boolean;
  } | null;
  const [state, setState] = useState<TetrisBoardState>(() => snapshot?.state ?? createTetrisBoardState('marathon'));
  const [moduleRecord, setModuleRecord] = useState(() => readTetrisModuleRecord());
  const [lastRunUpdate, setLastRunUpdate] = useState<TetrisRunRecordUpdate | null>(null);
  const [settingsCollapsed, setSettingsCollapsed] = useState(snapshot?.settingsCollapsed ?? true);
  const [selectedPackId, setSelectedPackId] = useState<TetrisPackId>(snapshot?.selectedPackId ?? 'core');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(snapshot?.selectedPresetId ?? findDefaultTetrisPresetId('marathon'));
  const previousStatusRef = useRef(state.status);
  const visiblePresets = getTetrisPresetsByPack(selectedPackId).filter((preset) => preset.enabled);
  const selectedPreset = getTetrisPresetById(selectedPresetId);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickTetrisBoard(current, 50));
    }, 50);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(getTetrisFormulaText(state));
  }, [state, onFormulaChange]);

  useEffect(() => {
    const tertiaryMetric =
      state.status === 'playing' || state.status === 'paused'
        ? getTetrisModeProgressText(state)
        : `消行 ${state.linesCleared}`;
    const secondaryMetric =
      state.mode === 'marathon'
        ? `等级 ${state.level}`
        : getTetrisModeGoalText(state).replace('目标：', '');

    onStatusChange?.({
      isPlaying: state.status === 'playing',
      primaryText:
        state.status === 'playing'
          ? '堆积处理中'
          : state.status === 'paused'
            ? '已暂停'
            : state.status === 'dead'
              ? '已溢出'
              : state.status === 'finished'
                ? '本局完成'
                : '就绪',
      score: state.score,
      secondaryMetric,
      tertiaryMetric,
      mode: `${selectedPreset.title} / ${getTetrisModeLabel(state.mode)}`,
      alertTone: state.status === 'dead' ? 'danger' : state.lastClearType === 'tetris' ? 'success' : 'neutral',
    });
  }, [onStatusChange, selectedPreset.title, state]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const isTerminal = state.status === 'dead' || state.status === 'finished';
    const leftGameplay = previousStatus === 'playing' || previousStatus === 'paused';

    if (isTerminal && leftGameplay) {
      const runUpdate = applyTetrisRunResult(moduleRecord, state);
      setModuleRecord(runUpdate.nextRecord);
      saveTetrisModuleRecord(runUpdate.nextRecord);
      setLastRunUpdate(runUpdate);
    }

    if (state.status === 'playing' && previousStatus !== 'playing') {
      setLastRunUpdate(null);
    }

    previousStatusRef.current = state.status;
  }, [moduleRecord, state]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (event.key === ' ' || event.key.startsWith('Arrow')) {
        event.preventDefault();
      }

      setState((current) => {
        if (event.key === 'Enter' && current.status === 'idle') return startTetrisGame(current);
        if ((event.key === 'r' || event.key === 'R') && current.status !== 'idle') return restartTetrisGame(current);
        if (event.key === 'p' || event.key === 'P') return toggleTetrisPause(current);

        if (current.status !== 'playing') return current;
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') return moveActivePiece(current, -1);
        if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') return moveActivePiece(current, 1);
        if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') return softDropActivePiece(current);
        if (event.key === 'ArrowUp' || event.key === 'x' || event.key === 'X') return rotateActivePiece(current, 'cw');
        if (event.key === 'z' || event.key === 'Z') return rotateActivePiece(current, 'ccw');
        if (event.key === ' ') return hardDropActivePiece(current);
        if (event.key === 'c' || event.key === 'C' || event.key === 'Shift') return holdActivePiece(current);
        return current;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    onSnapshotChange?.({
      state,
      selectedPackId,
      selectedPresetId,
      settingsCollapsed,
    });
  }, [state, selectedPackId, selectedPresetId, settingsCollapsed, onSnapshotChange]);

  const handleModeChange = (mode: TetrisMode) => {
    const nextPresetId = findDefaultTetrisPresetId(mode);
    setSelectedPackId('core');
    setSelectedPresetId(nextPresetId);
    setLastRunUpdate(null);
    setState((current) => setTetrisMode(current, mode));
  };

  const applyPreset = (presetId: string) => {
    const preset = getTetrisPresetById(presetId);
    if (!preset.enabled) return;
    setSelectedPackId(preset.packId);
    setSelectedPresetId(preset.id);
    setLastRunUpdate(null);
    setState(createTetrisBoardState(preset.boardOptions));
  };

  const handleStart = () => {
    setLastRunUpdate(null);
    setState((current) => startTetrisGame(current));
  };

  const handleRestart = () => {
    setLastRunUpdate(null);
    setState((current) => restartTetrisGame(current));
  };

  return (
    <div className="tetris-sheet">
      <section className={`tetris-settings-shell${settingsCollapsed ? ' collapsed' : ''}`}>
        <div className="tetris-settings-summary">
          <div>
            <strong>俄罗斯方块设置</strong>
            <p>{selectedPreset.title} / {getTetrisModeLabel(state.mode)}</p>
          </div>
          <div className="tetris-settings-actions">
            <span>调整完成后，手动点击开始。</span>
            <button
              type="button"
              className="tetris-settings-toggle primary"
              onClick={handleStart}
              disabled={state.status !== 'idle'}
            >
              开始
            </button>
            <button
              type="button"
              className="tetris-settings-toggle"
              onClick={() => setSettingsCollapsed((current) => !current)}
            >
              {settingsCollapsed ? '展开设置' : '收起设置'}
            </button>
          </div>
        </div>
        {!settingsCollapsed ? (
          <>
            <div className="tetris-config-panel">
              <div className="tetris-config-copy">
                <strong>模式与挑战</strong>
                <p>{selectedPreset.summary}</p>
              </div>
              <div className="tetris-config-target">
                <strong>当前目标</strong>
                <p>{getTetrisModeGoalText(state)}</p>
                <small>{getTetrisModeProgressText(state)}</small>
              </div>
              <div className="tetris-pack-tabs">
                {TETRIS_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    className={`tetris-pack-tab${selectedPackId === pack.id ? ' active' : ''}`}
                    style={{ ['--tetris-pack-accent' as string]: pack.accent }}
                    onClick={() => setSelectedPackId(pack.id)}
                  >
                    <span>{pack.title}</span>
                    <small>{pack.summary}</small>
                  </button>
                ))}
              </div>
              <div className="tetris-preset-grid">
                {visiblePresets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`tetris-preset-card${selectedPresetId === preset.id ? ' active' : ''}`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <div className="tetris-preset-top">
                      <strong>{preset.title}</strong>
                      <span>{preset.badge}</span>
                    </div>
                    <p>{preset.summary}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="tetris-toolbar">
              <div className="tetris-toolbar-group">
                <label htmlFor="tetris-mode">模式</label>
                <select
                  id="tetris-mode"
                  value={state.mode}
                  onChange={(event) => handleModeChange(event.target.value as TetrisMode)}
                >
                  <option value="marathon">马拉松</option>
                  <option value="sprint">40行竞速</option>
                  <option value="ultra">120秒冲分</option>
                </select>
              </div>

              <div className="tetris-toolbar-group">
                <button onClick={handleStart}>开始</button>
                <button onClick={() => setState((current) => toggleTetrisPause(current))}>暂停/继续</button>
                <button onClick={handleRestart}>重开</button>
                {onExit ? <button onClick={onExit}>返回</button> : null}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="tetris-main">
        <TetrisBoard state={state} />
        <TetrisHud state={state} records={moduleRecord.stats} />
      </div>

      <div className="tetris-help">
        <span>当前挑战：{selectedPreset.title}</span>
        <span>键位：←→ 移动，↓ 软降，空格硬降，↑/X 顺时针，Z 逆时针，C/Shift 暂存，P 暂停</span>
      </div>

        <TetrisOverlay
          status={state.status}
          mode={state.mode}
          goalType={state.goalType}
          sprintTargetLines={state.sprintTargetLines}
          ultraDurationMs={state.ultraDurationMs}
          targetLevel={state.targetLevel}
          digRowsRequired={state.digRowsRequired}
          digRegionHeight={state.digRegionHeight}
          puzzleSequence={state.puzzleSequence}
          presetTitle={selectedPreset.title}
          score={state.score}
        linesCleared={state.linesCleared}
        elapsedMs={state.elapsedMs}
        runUpdate={lastRunUpdate}
        onResume={() => setState((current) => toggleTetrisPause(current))}
        onRestart={handleRestart}
        onExit={onExit}
      />
    </div>
  );
};

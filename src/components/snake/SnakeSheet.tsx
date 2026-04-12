import React, { useEffect, useRef, useState } from 'react';
import {
  createSnakeBoardState,
  restartSnakeBoard,
  setSnakeDirection,
  startSnakeBoard,
  tickSnakeBoard,
  toggleSnakePause,
} from '../../features/snake/snakeBoardState';
import {
  getSnakeDifficultyLabel,
  getSnakeFormulaText,
  getSnakeMapSizeLabel,
  getSnakeModeLabel,
  getSnakePrimaryStatusText,
} from '../../features/snake/snakeSelectors';
import {
  getSnakePresetById,
  getSnakePresetsByPack,
  SNAKE_PACKS,
  type SnakePackId,
  type SnakePresetDefinition,
} from '../../features/snake/snakeContent';
import { getSnakeMapSizeOption, SNAKE_MAP_SIZE_OPTIONS } from '../../features/snake/snakeMapSize';
import { readSnakeStorage, recordSnakeRun, withSnakeMapSizePreference, writeSnakeStorage } from '../../features/snake/snakeStorage';
import type {
  Direction,
  SnakeBoardState,
  SnakeDifficulty,
  SnakeMapSizePreset,
  SnakeMode,
  SnakeRunResult,
} from '../../features/snake/snakeTypes';
import type { WorkbookStatusSummary } from '../../types';
import { SnakeBoard } from './SnakeBoard';
import { SnakeHud } from './SnakeHud';
import { SnakeOverlay } from './SnakeOverlay';
import '../../styles/snake.css';

interface SnakeSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
}

const TICK_MS = 60;

function directionFromKey(key: string): Direction | null {
  switch (key) {
    case 'arrowup':
    case 'w':
      return 'up';
    case 'arrowdown':
    case 's':
      return 'down';
    case 'arrowleft':
    case 'a':
      return 'left';
    case 'arrowright':
    case 'd':
      return 'right';
    default:
      return null;
  }
}

function createBoardForMode(
  mode: SnakeMode,
  difficulty: SnakeDifficulty,
  rows: number,
  cols: number,
  durationMs?: number,
  targetPlan?: string[],
  targetSegmentConfig?: Record<string, string[]>,
): SnakeBoardState {
  return createSnakeBoardState({
    rows,
    cols,
    mode,
    difficulty,
    durationMs: mode === 'timed' ? durationMs ?? 60_000 : undefined,
    targetPlan,
    targetSegmentConfig,
  });
}

function createBoardForPreset(preset: SnakePresetDefinition): SnakeBoardState {
  const size = getSnakeMapSizeOption(preset.mapSize);
  return createBoardForMode(
    preset.mode,
    preset.difficulty,
    size.rows,
    size.cols,
    preset.durationMs,
    preset.targetPlan,
    preset.targetSegmentsConfig,
  );
}

function findMatchingPresetId(mode: SnakeMode, difficulty: SnakeDifficulty, mapSize: SnakeMapSizePreset): string | null {
  const matched = SNAKE_PACKS.flatMap((pack) => getSnakePresetsByPack(pack.id)).find(
    (preset) => preset.mode === mode && preset.difficulty === difficulty && preset.mapSize === mapSize,
  );
  return matched?.id ?? null;
}

export const SnakeSheet: React.FC<SnakeSheetProps> = ({ onFormulaChange, onStatusChange, onExit }) => {
  const [initialStorageSnapshot] = useState(() => {
    const storage = typeof window === 'undefined' ? undefined : window.localStorage;
    return readSnakeStorage(storage);
  });
  const [mapSizePreset, setMapSizePreset] = useState<SnakeMapSizePreset>(initialStorageSnapshot.preferences.mapSize);
  const [selectedPackId, setSelectedPackId] = useState<SnakePackId>('starter');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() =>
    findMatchingPresetId('classic', 'normal', initialStorageSnapshot.preferences.mapSize),
  );
  const [state, setState] = useState<SnakeBoardState>(() => {
    const size = getSnakeMapSizeOption(initialStorageSnapshot.preferences.mapSize);
    return createSnakeBoardState({ rows: size.rows, cols: size.cols });
  });
  const [lastRunResult, setLastRunResult] = useState<SnakeRunResult | null>(null);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const prevStatusRef = useRef(state.status);
  const selectedPreset = selectedPresetId ? getSnakePresetById(selectedPresetId) : null;
  const visiblePresets = getSnakePresetsByPack(selectedPackId);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickSnakeBoard(current, TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(getSnakeFormulaText(state));
  }, [onFormulaChange, state]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    const hasEnded = state.status === 'dead' || state.status === 'finished';
    const wasEnded = previousStatus === 'dead' || previousStatus === 'finished';

    if (hasEnded && !wasEnded) {
      const storage = typeof window === 'undefined' ? undefined : window.localStorage;
      const currentData = readSnakeStorage(storage);
      const { data, result } = recordSnakeRun(currentData, state.score, state.length);
      writeSnakeStorage(storage, data);
      setLastRunResult(result);
    }

    prevStatusRef.current = state.status;
  }, [state.status, state.score, state.length]);

  useEffect(() => {
    const timerText =
      state.remainingMs === null
        ? `时间 ${Math.floor(state.elapsedMs / 1000)}秒`
        : `剩余 ${Math.max(0, Math.ceil(state.remainingMs / 1000))}秒`;

    onStatusChange?.({
      isPlaying: state.status === 'playing',
      primaryText: getSnakePrimaryStatusText(state),
      score: state.score,
      secondaryMetric: `长度 ${state.length}`,
      tertiaryMetric: timerText,
      mode: selectedPreset
        ? `${selectedPreset.title} / ${getSnakeModeLabel(state.mode)} / ${getSnakeMapSizeLabel(mapSizePreset)}`
        : `${getSnakeModeLabel(state.mode)} / ${getSnakeDifficultyLabel(state.difficulty)} / ${getSnakeMapSizeLabel(mapSizePreset)}`,
      alertTone: state.status === 'dead' ? 'danger' : state.status === 'finished' ? 'success' : state.speedBoostMs > 0 ? 'success' : 'neutral',
    });
  }, [mapSizePreset, onStatusChange, selectedPreset, state]);

  const applyMapSizePreset = (nextPreset: SnakeMapSizePreset) => {
    const nextSize = getSnakeMapSizeOption(nextPreset);
    setMapSizePreset(nextPreset);
    setSelectedPresetId(null);
    setLastRunResult(null);
    setState((current) => createBoardForMode(current.mode, current.difficulty, nextSize.rows, nextSize.cols, current.remainingMs ?? undefined));

    const storage = typeof window === 'undefined' ? undefined : window.localStorage;
    const currentData = readSnakeStorage(storage);
    writeSnakeStorage(storage, withSnakeMapSizePreference(currentData, nextPreset));
  };

  const applyPreset = (presetId: string) => {
    const preset = getSnakePresetById(presetId);
    setSelectedPackId(preset.packId);
    setSelectedPresetId(preset.id);
    setMapSizePreset(preset.mapSize);
    setLastRunResult(null);
    setState(createBoardForPreset(preset));

    const storage = typeof window === 'undefined' ? undefined : window.localStorage;
    const currentData = readSnakeStorage(storage);
    writeSnakeStorage(storage, withSnakeMapSizePreference(currentData, preset.mapSize));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();
      const direction = directionFromKey(normalizedKey);

      if (direction) {
        event.preventDefault();
        setState((current) => setSnakeDirection(current, direction));
        return;
      }

      if (normalizedKey === 'p') {
        event.preventDefault();
        setState((current) => toggleSnakePause(current));
        return;
      }

      if (normalizedKey === 'r') {
        event.preventDefault();
        setState((current) => restartSnakeBoard(current));
        return;
      }

      if (normalizedKey === ' ') {
        event.preventDefault();
        setState((current) => {
          if (current.status === 'dead' || current.status === 'finished') {
            return restartSnakeBoard(current);
          }
          return startSnakeBoard(current);
        });
        return;
      }

      if (normalizedKey === 'escape' && onExit) {
        event.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  return (
    <div className="snake-sheet">
      <section className={`snake-settings-shell${settingsCollapsed ? ' collapsed' : ''}`}>
        <div className="snake-settings-summary">
          <div>
            <strong>贪吃蛇设置</strong>
            <p>
              {selectedPreset
                ? `${selectedPreset.title} / ${getSnakeMapSizeLabel(mapSizePreset)}`
                : `${getSnakeModeLabel(state.mode)} / ${getSnakeDifficultyLabel(state.difficulty)} / ${getSnakeMapSizeLabel(mapSizePreset)}`}
            </p>
          </div>
          <div className="snake-settings-actions">
            <span>改完设置后，手动点击开始。</span>
            <button
              type="button"
              className="snake-btn"
              onClick={() => setState((current) => startSnakeBoard(current))}
              disabled={state.status !== 'idle'}
            >
              开始
            </button>
            <button
              type="button"
              className="snake-settings-toggle"
              onClick={() => setSettingsCollapsed((current) => !current)}
            >
              {settingsCollapsed ? '展开设置' : '收起设置'}
            </button>
          </div>
        </div>

        {!settingsCollapsed ? (
          <>
            <div className="snake-config-panel">
              <div className="snake-config-header">
                <div>
                  <strong>模式与关卡</strong>
                  <p>{selectedPreset ? selectedPreset.summary : '当前为自定义组合，可手动调模式、难度和地图。'}</p>
                </div>
                <div className="snake-pack-tabs">
                  {SNAKE_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      className={`snake-pack-tab${selectedPackId === pack.id ? ' active' : ''}`}
                      style={{ ['--snake-pack-accent' as string]: pack.accent }}
                      onClick={() => setSelectedPackId(pack.id)}
                    >
                      <span>{pack.title}</span>
                      <small>{pack.summary}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="snake-preset-grid">
                {visiblePresets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`snake-preset-card${selectedPresetId === preset.id ? ' active' : ''}`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <div className="snake-preset-top">
                      <strong>{preset.title}</strong>
                      <span>{preset.badge}</span>
                    </div>
                    <p>{preset.summary}</p>
                    <small>
                      {getSnakeModeLabel(preset.mode)} / {getSnakeDifficultyLabel(preset.difficulty)} / {getSnakeMapSizeLabel(preset.mapSize)}
                    </small>
                  </button>
                ))}
              </div>
            </div>

            <div className="snake-toolbar">
              <label>
                模式
                <select
                  value={state.mode}
                  onChange={(event) => {
                    const nextMode = event.target.value as SnakeMode;
                    setSelectedPresetId(null);
                    setState((current) => createBoardForMode(nextMode, current.difficulty, current.rows, current.cols));
                  }}
                >
                  <option value="classic">经典</option>
                  <option value="timed">限时</option>
                  <option value="challenge">障碍</option>
                </select>
              </label>

              <label>
                难度
                <select
                  value={state.difficulty}
                  onChange={(event) => {
                    const nextDifficulty = event.target.value as SnakeDifficulty;
                    setSelectedPresetId(null);
                    setState((current) => createBoardForMode(current.mode, nextDifficulty, current.rows, current.cols));
                  }}
                >
                  <option value="easy">简单</option>
                  <option value="normal">标准</option>
                  <option value="hard">困难</option>
                </select>
              </label>

              <label>
                地图
                <select
                  value={mapSizePreset}
                  onChange={(event) => applyMapSizePreset(event.target.value as SnakeMapSizePreset)}
                >
                  {SNAKE_MAP_SIZE_OPTIONS.map((option) => (
                    <option key={option.preset} value={option.preset}>
                      {option.label}（{option.rows}×{option.cols}）
                    </option>
                  ))}
                </select>
              </label>

              <div className="snake-key-hint">
                按键：WASD / 方向键、P、R、空格 | 地图：{state.rows}×{state.cols} | {selectedPreset ? `当前关卡：${selectedPreset.title}` : '当前为自定义配置'}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="snake-main">
        <SnakeBoard state={state} />
        <aside className="snake-side">
          <SnakeHud
            state={state}
            onStart={() => setState((current) => startSnakeBoard(current))}
            onPauseToggle={() => setState((current) => toggleSnakePause(current))}
            onRestart={() => setState((current) => restartSnakeBoard(current))}
            onExit={onExit}
          />
          <div className="snake-legend">
            <h4>图例</h4>
            <p>字母 / 数字：挂入身体，拼词拿奖励</p>
            <p>@ 万能格：可顶替当前目标字</p>
            <p>$ 金币：高分补给</p>
            <p>C 咖啡：短时提速</p>
            <p>* 金块：双倍增长</p>
            <p>X 区域：障碍格，挑战模式里吃错还会继续加压</p>
          </div>
          <div className="snake-legend-additional">
            <p>段落计数用于句子关和公式关，看到“段落完成”就说明这一小段已经锁定。</p>
            <p>挑战模式的审计波会定时补障碍，越拖越难走，最好提前给回头路线留空位。</p>
            <p>像 A1+B2 这样的公式关里，字母、数字和符号都算目标字符，顺序不能乱。</p>
          </div>
        </aside>
      </div>

      <SnakeOverlay
        state={state}
        onPauseToggle={() => setState((current) => toggleSnakePause(current))}
        onRestart={() => setState((current) => restartSnakeBoard(current))}
        onExit={onExit}
        lastRunResult={lastRunResult}
      />
    </div>
  );
};

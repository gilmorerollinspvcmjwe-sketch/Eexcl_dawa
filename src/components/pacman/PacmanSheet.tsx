/* 吃豆人主玩法组件。负责选关、模式设置入口、游戏状态管理、键盘输入处理、音效触发。 */

import React, { useEffect, useRef, useState } from 'react';
import {
  createPacmanBoardState,
  getMazeDefinition,
} from '../../features/pacman/pacmanBoardState';
import {
  handleKeyboardEvent,
  startGame,
  pauseGame,
  resumeGame,
  updatePacmanPosition,
} from '../../features/pacman/pacmanMovement';
import {
  updateGlobalModeState,
  isFrightenedBlinking,
} from '../../features/pacman/pacmanLevelTuning';
import {
  updateAllGhosts,
} from '../../features/pacman/pacmanAi';
import {
  updateFruitState,
  triggerFruitSpawn,
  collectFruit,
} from '../../features/pacman/pacmanFruit';
import {
  handleCollision,
  handleWin,
  handleLose,
  handleDeathAnimation,
  handleRespawnAnimation,
  restartLevel,
  proceedToNextLevel,
} from '../../features/pacman/pacmanGameLogic';
import {
  getAllPacks,
  getLevelMeta,
  getLevelDisplayName,
  getDifficultyLabel,
  type PacmanPackType,
} from '../../features/pacman/pacmanMapRegistry';
import {
  loadStorage,
  saveStorage,
  recordRunResult,
  getPackLevelStatuses,
  getHubSummary,
} from '../../features/pacman/pacmanStorage';
import {
  playPelletSound,
  playEnergizerSound,
  playGhostEatSound,
  playFruitSound,
  playDeathSound,
  playFrightenedWarningSound,
  playVictorySound,
  playDefeatSound,
  playStartSound,
} from '../../features/pacman/pacmanSound';
import type { PacmanBoardState } from '../../features/pacman/pacmanTypes';
import type { WorkbookStatusSummary } from '../../types';
import { PacmanBoard } from './PacmanBoard';
import { PacmanHud } from './PacmanHud';
import { PacmanOverlay } from './PacmanOverlay';
import '../../styles/pacman.css';

interface PacmanSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

const TICK_MS = 1000 / 60;

function tickGame(state: PacmanBoardState, deltaMs: number): PacmanBoardState {
  if (state.status !== 'playing' || state.isPaused) {
    return {
      ...state,
      elapsedMs: state.elapsedMs + deltaMs,
    };
  }

  if (state.deathAnimationMs > 0) {
    return handleDeathAnimation(state, deltaMs);
  }

  if (state.respawnAnimationMs > 0) {
    return handleRespawnAnimation(state, deltaMs);
  }

  let newState = { ...state };
  newState.elapsedMs += deltaMs;

  newState = updatePacmanPosition(newState, deltaMs);
  newState = updateGlobalModeState(newState, deltaMs);
  newState = updateAllGhosts(newState, deltaMs);
  newState = triggerFruitSpawn(newState);
  newState = updateFruitState(newState, deltaMs);
  newState = collectFruit(newState);

  const collisionResult = handleCollision(newState);
  if (collisionResult.status !== newState.status) {
    return collisionResult;
  }
  newState = collisionResult;

  if (newState.pelletsRemaining <= 0) {
    return handleWin(newState);
  }

  if (newState.lives <= 0) {
    return handleLose(newState);
  }

  return newState;
}

function getFormulaText(state: PacmanBoardState): string {
  const maze = getMazeDefinition(state.mazeId);
  const totalPellets = maze.totalPellets;
  const collected = totalPellets - state.pelletsRemaining;
  const percentage = Math.round((collected / totalPellets) * 100);

  return `得分=${state.score} | 关卡=${state.level} | 剩命=${state.lives} | 豆子=${collected}/${totalPellets}(${percentage}%) | 模式=${state.globalMode.currentMode}`;
}

function getPrimaryStatusText(state: PacmanBoardState): string {
  const statusNames: Record<string, string> = {
    idle: '等待开始',
    playing: '游戏中',
    paused: '暂停',
    dead: '死亡',
    won: '胜利',
    lost: '失败',
  };
  return statusNames[state.status] || '未知';
}

export const PacmanSheet: React.FC<PacmanSheetProps> = ({ onFormulaChange, onStatusChange, onExit, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    selectedPackId?: PacmanPackType;
    selectedLevel?: number;
    state?: PacmanBoardState;
    settingsCollapsed?: boolean;
    soundEnabled?: boolean;
  } | null;
  const [initialStorageSnapshot] = useState(() => loadStorage());
  const [selectedPackId, setSelectedPackId] = useState<PacmanPackType>(snapshot?.selectedPackId ?? 'arcade');
  const [selectedLevel, setSelectedLevel] = useState(snapshot?.selectedLevel ?? 1);
  const [state, setState] = useState<PacmanBoardState>(() =>
    snapshot?.state ?? createPacmanBoardState({ mazeId: 'classic', level: 1, mode: 'classic' })
  );
  const [settingsCollapsed, setSettingsCollapsed] = useState(snapshot?.settingsCollapsed ?? false);
  const [soundEnabled, setSoundEnabled] = useState(snapshot?.soundEnabled ?? true);

  const prevStatusRef = useRef(state.status);
  const prevPelletsRef = useRef(state.pelletsRemaining);
  const prevEnergizersRef = useRef(state.energizersRemaining);
  const prevGhostsEatenRef = useRef(state.totalGhostsEaten);
  const prevFruitsCollectedRef = useRef(state.fruitsCollected);
  const prevFrightenedBlinkingRef = useRef(false);
  const prevLivesRef = useRef(state.lives);

  const packs = getAllPacks();
  const currentPack = packs.find(p => p.packId === selectedPackId) || packs[0];
  const levelStatuses = getPackLevelStatuses(initialStorageSnapshot, selectedPackId, currentPack.totalLevels);
  const hubSummary = getHubSummary(initialStorageSnapshot);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickGame(current, TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.status !== prevStatusRef.current) {
      onFormulaChange?.(getFormulaText(state));
    }
  }, [onFormulaChange, state.status]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    const hasEnded = state.status === 'won' || state.status === 'lost';
    const wasEnded = previousStatus === 'won' || previousStatus === 'lost';

    if (hasEnded && !wasEnded) {
      const storage = loadStorage();
      const result = {
        score: state.score,
        level: state.level,
        ghostsEaten: state.totalGhostsEaten,
        fruitsCollected: state.fruitsCollected,
        clearTimeMs: state.elapsedMs,
        pelletsCollected: state.pelletsCollectedTotal,
        isNewBestScore: state.score > storage.globalStats.bestScore,
        isNewHighestLevel: state.level > storage.globalStats.highestLevel,
      };
      const newStorage = recordRunResult(
        storage,
        selectedPackId,
        selectedLevel,
        result,
        state.elapsedMs,
        state.lives
      );
      saveStorage(newStorage);

      if (state.status === 'won') {
        playVictorySound(soundEnabled);
      } else {
        playDefeatSound(soundEnabled);
      }
    }

    if (state.status === 'won' && previousStatus !== 'won') {
      setTimeout(() => {
        setState((current) => proceedToNextLevel(current));
      }, 2000);
    }

    prevStatusRef.current = state.status;
  }, [state.status, state.score, selectedPackId, selectedLevel, soundEnabled]);

  useEffect(() => {
    if (state.pelletsRemaining < prevPelletsRef.current) {
      playPelletSound(soundEnabled);
    }
    prevPelletsRef.current = state.pelletsRemaining;
  }, [state.pelletsRemaining, soundEnabled]);

  useEffect(() => {
    if (state.energizersRemaining < prevEnergizersRef.current) {
      playEnergizerSound(soundEnabled);
    }
    prevEnergizersRef.current = state.energizersRemaining;
  }, [state.energizersRemaining, soundEnabled]);

  useEffect(() => {
    if (state.totalGhostsEaten > prevGhostsEatenRef.current) {
      const ghostsEatenCount = state.ghostsEatenInFrightened;
      playGhostEatSound(soundEnabled, ghostsEatenCount);
    }
    prevGhostsEatenRef.current = state.totalGhostsEaten;
  }, [state.totalGhostsEaten, state.ghostsEatenInFrightened, soundEnabled]);

  useEffect(() => {
    if (state.fruitsCollected > prevFruitsCollectedRef.current) {
      playFruitSound(soundEnabled);
    }
    prevFruitsCollectedRef.current = state.fruitsCollected;
  }, [state.fruitsCollected, soundEnabled]);

  useEffect(() => {
    if (state.lives < prevLivesRef.current) {
      playDeathSound(soundEnabled);
    }
    prevLivesRef.current = state.lives;
  }, [state.lives, soundEnabled]);

  useEffect(() => {
    const currentBlinking = state.status === 'playing' &&
      state.globalMode.currentMode === 'frightened' &&
      isFrightenedBlinking(state);

    if (currentBlinking && !prevFrightenedBlinkingRef.current) {
      playFrightenedWarningSound(soundEnabled);
    }
    prevFrightenedBlinkingRef.current = currentBlinking;
  }, [state, soundEnabled]);

  useEffect(() => {
    const modeText = state.globalMode.currentMode === 'frightened'
      ? `惊吓(${Math.ceil(state.globalMode.frightenedTimerMs / 1000)}秒)`
      : state.globalMode.currentMode === 'scatter' ? '散开' : '追击';

    onStatusChange?.({
      isPlaying: state.status === 'playing',
      primaryText: getPrimaryStatusText(state),
      score: state.score,
      secondaryMetric: `剩余 ${state.lives} 条命`,
      tertiaryMetric: `豆子 ${state.pelletsRemaining}`,
      mode: `${currentPack.name} / 第${state.level}关 / ${modeText}`,
      alertTone: state.status === 'lost' ? 'danger' : state.status === 'won' ? 'success' : state.globalMode.currentMode === 'frightened' ? 'success' : 'neutral',
    });
  }, [currentPack, onStatusChange, state]);

  useEffect(() => {
    onSnapshotChange?.({
      selectedPackId,
      selectedLevel,
      state,
      settingsCollapsed,
      soundEnabled,
    });
  }, [selectedPackId, selectedLevel, state, settingsCollapsed, soundEnabled, onSnapshotChange]);

  const applyLevel = (levelNumber: number) => {
    setSelectedLevel(levelNumber);
    setState(createPacmanBoardState({ mazeId: 'classic', level: levelNumber, mode: 'classic' }));
  };

  const applyPack = (packId: PacmanPackType) => {
    setSelectedPackId(packId);
    setSelectedLevel(1);
    setState(createPacmanBoardState({ mazeId: 'classic', level: 1, mode: 'classic' }));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'p', 'P', 'r', 'R', 'Escape', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        setState((current) => handleKeyboardEvent(current, key));
      }

      if (key === 'Escape' && onExit && state.status !== 'playing') {
        onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const handleStart = () => {
    setState((current) => {
      if (current.status === 'paused') {
        return resumeGame(current);
      }
      playStartSound(soundEnabled);
      return startGame(current);
    });
  };
  const handlePauseToggle = () => {
    setState((current) => {
      if (current.isPaused) {
        return resumeGame(current);
      }
      return pauseGame(current);
    });
  };
  const handleRestart = () => setState((current) => restartLevel(current));
  const handleNextLevel = () => setState((current) => proceedToNextLevel(current));
  const handleSoundToggle = () => setSoundEnabled((current) => !current);

  return (
    <div className="pacman-sheet">
      <section className={`pacman-settings-shell${settingsCollapsed ? ' collapsed' : ''}`}>
        <div className="pacman-settings-summary">
          <div>
            <strong>吃豆人设置</strong>
            <p>
              {currentPack.name} / 第{state.level}关 / {getDifficultyLabel(getLevelMeta(selectedPackId, state.level)?.difficulty || 'easy')}
            </p>
          </div>
          <div className="pacman-settings-actions">
            <span>改完设置后，手动点击开始。</span>
            <button
              type="button"
              className="pacman-btn"
              onClick={handleStart}
              disabled={state.status !== 'idle' && state.status !== 'paused'}
            >
              开始
            </button>
            <button
              type="button"
              className="pacman-settings-toggle"
              onClick={() => setSettingsCollapsed((current) => !current)}
            >
              {settingsCollapsed ? '展开设置' : '收起设置'}
            </button>
          </div>
        </div>

        {!settingsCollapsed ? (
          <>
            <div className="pacman-config-panel">
              <div className="pacman-config-header">
                <div>
                  <strong>关卡包选择</strong>
                  <p>选择关卡包，然后选择具体关卡开始游戏。</p>
                </div>
                <div className="pacman-pack-tabs">
                  {packs.map((pack) => (
                    <button
                      key={pack.packId}
                      className={`pacman-pack-tab${selectedPackId === pack.packId ? ' active' : ''}`}
                      onClick={() => applyPack(pack.packId as PacmanPackType)}
                    >
                      <span>{pack.name}</span>
                      <small>{pack.description}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pacman-level-grid">
                {levelStatuses.map((status) => {
                  const meta = getLevelMeta(selectedPackId, status.levelNumber);
                  return (
                    <button
                      key={status.levelNumber}
                      className={`pacman-level-card${selectedLevel === status.levelNumber ? ' active' : ''}${status.status === 'locked' ? ' locked' : ''}`}
                      onClick={() => status.status !== 'locked' && applyLevel(status.levelNumber)}
                      disabled={status.status === 'locked'}
                    >
                      <div className="pacman-level-top">
                        <strong>{getLevelDisplayName(selectedPackId, status.levelNumber)}</strong>
                        <span>{status.status === 'completed' ? '✅' : status.status === 'locked' ? '🔒' : '🔓'}</span>
                      </div>
                      <p>{meta?.description || ''}</p>
                      <small>
                        {getDifficultyLabel(meta?.difficulty || 'easy')} | 最佳: {status.bestScore}分
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pacman-toolbar">
              <label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                />
                音效
              </label>
              <div className="pacman-key-hint">
                按键：WASD / 方向键移动 | P 暂停 | R 重开 | 空格/回车 开始 | ESC 返回
              </div>
              <div className="pacman-progress-summary">
                <span>最佳分数: {hubSummary.bestScore}</span>
                <span>最高关卡: {hubSummary.highestLevel}</span>
                <span>总局数: {hubSummary.totalRuns}</span>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="pacman-main">
        <PacmanBoard state={state} />
        <aside className="pacman-side">
          <PacmanHud
            state={state}
            onStart={handleStart}
            onPauseToggle={handlePauseToggle}
            onRestart={handleRestart}
            onExit={onExit}
          />
          <div className="pacman-legend">
            <h4>图例</h4>
            <p>● 小豆子：10分</p>
            <p>○ 大能量豆：50分，让鬼变蓝可反吃</p>
            <p>🍒 水果：按关卡递增分数（100~5000）</p>
            <p>👻 鬼魂：红鬼直追、粉鬼预判、青鬼配合、橙鬼逃跑</p>
          </div>
          <div className="pacman-legend-additional">
            <p>能量豆让鬼进入惊吓状态，可反过来吃鬼得分（200→400→800→1600递增）。</p>
            <p>鬼魂会周期性散开和追击，利用散开期清豆。</p>
            <p>传送门在迷宫两侧，可快速穿越。</p>
          </div>
        </aside>
      </div>

      <PacmanOverlay
        state={state}
        onPauseToggle={handlePauseToggle}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
        onExit={onExit}
        selectedPackId={selectedPackId}
      />
    </div>
  );
};

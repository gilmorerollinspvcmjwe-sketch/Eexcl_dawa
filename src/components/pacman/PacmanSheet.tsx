/* 吃豆人主玩法组件。负责选关、模式设置入口、游戏状态管理、键盘输入处理、音效触发。 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getMazeDefinition,
  createPacmanBoardState,
} from '../../features/pacman/pacmanBoardState';
import {
  handleKeyboardEvent,
  startGame,
  pauseGame,
  resumeGame,
} from '../../features/pacman/pacmanMovement';
import { isFrightenedBlinking } from '../../features/pacman/pacmanLevelTuning';
import {
  restartLevel,
  proceedToNextLevel,
} from '../../features/pacman/pacmanGameLogic';
import {
  getAllPacks,
  getLevelMeta,
  getLevelDisplayName,
  getDifficultyLabel,
  isLevelValid,
  type PacmanPackId,
} from '../../features/pacman/pacmanMapRegistry';
import {
  loadStorage,
  saveStorage,
  recordRunResult,
  recordPracticeResult,
  getPackLevelStatuses,
  getHubSummary,
} from '../../features/pacman/pacmanStorage';
import { getLevelTuningByPack } from '../../features/pacman/pacmanContent';
import { getPacmanPracticeModule } from '../../features/pacman/pacmanPracticeCatalog';
import {
  clearPendingPacmanLaunchIntent,
  consumePendingPacmanLaunchIntent,
  getPacmanLaunchGuideTab,
  getPacmanLaunchReturnTarget,
  setPendingPacmanGuideTab,
  type PacmanGuideTab,
  type PacmanLaunchIntent,
} from '../../features/pacman/pacmanLaunchIntent';
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
import type { PacmanBoardState, PacmanMode, PacmanPracticeId } from '../../features/pacman/pacmanTypes';
import { applyPacmanEscapeKey, tickPacmanState } from '../../features/pacman/pacmanSession';
import type { WorkbookStatusSummary } from '../../types';
import { PacmanBoard } from './PacmanBoard';
import { PacmanHud } from './PacmanHud';
import { PacmanOverlay } from './PacmanOverlay';
import '../../styles/pacman.css';

interface PacmanSheetProps {
  onFormulaChange?: (text: string) => void;
  onStatusChange?: (summary: WorkbookStatusSummary) => void;
  onExit?: () => void;
  onReturnToGuide?: (tab: PacmanGuideTab) => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

const TICK_MS = 1000 / 60;

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

/* 创建与关卡包绑定的初始状态。 */
function createPackLevelState(packId: PacmanPackId, levelNumber: number, mode: PacmanMode = 'classic'): PacmanBoardState {
  const meta = getLevelMeta(packId, levelNumber);
  return createPacmanBoardState({
    packId,
    mazeId: meta?.mazeId || 'classic',
    level: levelNumber,
    mode,
  });
}

/* 兼容旧快照，补齐新增字段与关卡包调优参数。 */
function hydrateSnapshotState(
  rawState: PacmanBoardState | undefined,
  packId: PacmanPackId,
  levelNumber: number,
): PacmanBoardState {
  if (!rawState) {
    return createPackLevelState(packId, levelNumber);
  }

  const meta = getLevelMeta(packId, rawState.level || levelNumber);
  const mazeId = rawState.mazeId || meta?.mazeId || 'classic';
  const maze = getMazeDefinition(mazeId);

  return {
    ...rawState,
    packId,
    mazeId,
    rows: maze.rows,
    cols: maze.cols,
    levelTuning: getLevelTuningByPack(packId, rawState.level || levelNumber),
    fruitSpawnsTriggered: rawState.fruitSpawnsTriggered ?? (((rawState.fruit?.spawnTimeMs ?? 0) > 0 ? 1 : 0) + rawState.fruitsCollected),
    tunnelUses: rawState.tunnelUses ?? 0,
    extraLifeAwarded: rawState.extraLifeAwarded ?? false,
  };
}

export const PacmanSheet: React.FC<PacmanSheetProps> = ({
  onFormulaChange,
  onStatusChange,
  onExit,
  onReturnToGuide,
  initialSnapshot,
  onSnapshotChange,
}) => {
  const snapshot = initialSnapshot as {
    selectedPackId?: PacmanPackId;
    selectedLevel?: number;
    state?: PacmanBoardState;
    settingsCollapsed?: boolean;
    soundEnabled?: boolean;
    launchIntent?: PacmanLaunchIntent | null;
  } | null;
  const initialSelectedPackId = snapshot?.selectedPackId ?? 'arcade';
  const initialSelectedLevel = snapshot?.selectedLevel ?? 1;
  const [storageSnapshot, setStorageSnapshot] = useState(() => loadStorage());
  const [selectedPackId, setSelectedPackId] = useState<PacmanPackId>(initialSelectedPackId);
  const [selectedLevel, setSelectedLevel] = useState(initialSelectedLevel);
  const [state, setState] = useState<PacmanBoardState>(() =>
    hydrateSnapshotState(snapshot?.state, initialSelectedPackId, initialSelectedLevel)
  );
  const [settingsCollapsed, setSettingsCollapsed] = useState(snapshot?.settingsCollapsed ?? false);
  const [soundEnabled, setSoundEnabled] = useState(snapshot?.soundEnabled ?? true);
  const [launchIntent, setLaunchIntent] = useState<PacmanLaunchIntent | null>(snapshot?.launchIntent ?? null);

  const stateRef = useRef(state);
  const prevStatusRef = useRef(state.status);
  const prevPelletsRef = useRef(state.pelletsRemaining);
  const prevEnergizersRef = useRef(state.energizersRemaining);
  const prevGhostsEatenRef = useRef(state.totalGhostsEaten);
  const prevFruitsCollectedRef = useRef(state.fruitsCollected);
  const prevFrightenedBlinkingRef = useRef(false);
  const prevLivesRef = useRef(state.lives);

  const packs = getAllPacks();
  const currentPack = packs.find(p => p.packId === selectedPackId) || packs[0];
  const currentLevelMeta = getLevelMeta(selectedPackId, selectedLevel);
  const activePractice = launchIntent?.practiceId ? getPacmanPracticeModule(launchIntent.practiceId) : null;
  const practiceReturnTarget = getPacmanLaunchReturnTarget(launchIntent);
  const levelStatuses = getPackLevelStatuses(storageSnapshot, selectedPackId, currentPack.totalLevels);
  const hubSummary = getHubSummary(storageSnapshot);
  const formulaText = useMemo(() => getFormulaText(state), [state]);

  useEffect(() => {
    const pendingIntent = consumePendingPacmanLaunchIntent();
    if (!pendingIntent) {
      return;
    }

    setLaunchIntent(pendingIntent);
    setSelectedPackId(pendingIntent.packId);
    setSelectedLevel(pendingIntent.levelNumber);
    setState(createPackLevelState(pendingIntent.packId, pendingIntent.levelNumber, pendingIntent.mode));
    setSettingsCollapsed(false);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickPacmanState(current, TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(formulaText);
  }, [formulaText, onFormulaChange]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    const hasEnded = state.status === 'won' || state.status === 'lost';
    const wasEnded = previousStatus === 'won' || previousStatus === 'lost';

    if (hasEnded && !wasEnded && state.mode !== 'practice') {
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
      const timer = window.setTimeout(() => setStorageSnapshot(newStorage), 0);

      if (state.status === 'won') {
        playVictorySound(soundEnabled);
      } else {
        playDefeatSound(soundEnabled);
      }
      return () => window.clearTimeout(timer);
    }

    if (hasEnded && !wasEnded && state.mode === 'practice' && launchIntent?.practiceId) {
      const storage = loadStorage();
      const result = {
        score: state.score,
        level: state.level,
        ghostsEaten: state.totalGhostsEaten,
        fruitsCollected: state.fruitsCollected,
        clearTimeMs: state.elapsedMs,
        pelletsCollected: state.pelletsCollectedTotal,
        isNewBestScore: false,
        isNewHighestLevel: false,
      };
      const newStorage = recordPracticeResult(
        storage,
        launchIntent.practiceId,
        result,
        state.status === 'won',
      );
      saveStorage(newStorage);
      const timer = window.setTimeout(() => setStorageSnapshot(newStorage), 0);

      if (state.status === 'won') {
        playVictorySound(soundEnabled);
      } else {
        playDefeatSound(soundEnabled);
      }
      return () => window.clearTimeout(timer);
    }

    if (state.status === 'won' && previousStatus !== 'won' && state.mode !== 'practice') {
      window.setTimeout(() => {
        const current = stateRef.current;
        const nextLevel = current.level + 1;
        if (!isLevelValid(current.packId, nextLevel)) {
          return;
        }
        setSelectedLevel(nextLevel);
        setState((value) => proceedToNextLevel(value));
      }, 2000);
    }

    prevStatusRef.current = state.status;
  }, [
    launchIntent?.practiceId,
    selectedLevel,
    selectedPackId,
    soundEnabled,
    state.elapsedMs,
    state.fruitsCollected,
    state.level,
    state.lives,
    state.mode,
    state.pelletsCollectedTotal,
    state.score,
    state.status,
    state.totalGhostsEaten,
  ]);

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
      mode: `${state.mode === 'practice' ? '专项练习' : currentPack.name} / 第${state.level}关 / ${modeText}`,
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
      launchIntent,
    });
  }, [launchIntent, selectedPackId, selectedLevel, state, settingsCollapsed, soundEnabled, onSnapshotChange]);

  const applyLevel = (levelNumber: number) => {
    setLaunchIntent(null);
    setSelectedLevel(levelNumber);
    setState(createPackLevelState(selectedPackId, levelNumber));
  };

  const applyPack = (packId: PacmanPackId) => {
    setLaunchIntent(null);
    setSelectedPackId(packId);
    setSelectedLevel(1);
    setState(createPackLevelState(packId, 1));
  };

  const handleReturnToSetup = useCallback(() => {
    clearPendingPacmanLaunchIntent();
    setLaunchIntent(null);
    setSettingsCollapsed(false);
    setState(createPackLevelState(selectedPackId, selectedLevel));
  }, [selectedLevel, selectedPackId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === 'Escape') {
        event.preventDefault();
        const result = applyPacmanEscapeKey(stateRef.current);
        if (result.shouldReturnToSetup) {
          handleReturnToSetup();
          return;
        }
        setState(result.nextState);
        if (result.shouldExit) {
          onExit?.();
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'p', 'P', 'r', 'R', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        setState((current) => handleKeyboardEvent(current, key));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleReturnToSetup, onExit, selectedLevel, selectedPackId]);

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
      if (current.status === 'paused' || current.isPaused) {
        return resumeGame(current);
      }
      return pauseGame(current);
    });
  };
  const handleRestart = () => setState((current) => restartLevel(current));
  const handleNextLevel = () => {
    const current = stateRef.current;
    const nextLevel = current.level + 1;
    if (!isLevelValid(current.packId, nextLevel)) {
      return;
    }
    setSelectedLevel(nextLevel);
    setState((value) => proceedToNextLevel(value));
  };
  const handleOpenPractice = (practiceId: PacmanPracticeId) => {
    const practice = getPacmanPracticeModule(practiceId);
    if (!practice) {
      return;
    }

    const nextIntent: PacmanLaunchIntent = {
      packId: practice.packId,
      levelNumber: practice.levelNumber,
      mode: 'practice',
      practiceId,
      returnTarget: 'source_level',
      sourcePackId: selectedPackId,
      sourceLevel: selectedLevel,
    };

    setLaunchIntent(nextIntent);
    setSelectedPackId(practice.packId);
    setSelectedLevel(practice.levelNumber);
    setSettingsCollapsed(false);
    setState(createPackLevelState(practice.packId, practice.levelNumber, 'practice'));
  };
  const handleReturnFromPractice = () => {
    if (practiceReturnTarget === 'guide') {
      clearPendingPacmanLaunchIntent();
      setPendingPacmanGuideTab(getPacmanLaunchGuideTab(launchIntent));
      setLaunchIntent(null);
      setSettingsCollapsed(false);
      if (onReturnToGuide) {
        onReturnToGuide(getPacmanLaunchGuideTab(launchIntent));
        return;
      }
      handleReturnToSetup();
      return;
    }

    if (launchIntent?.sourcePackId && launchIntent.sourceLevel) {
      setLaunchIntent(null);
      setSelectedPackId(launchIntent.sourcePackId);
      setSelectedLevel(launchIntent.sourceLevel);
      setSettingsCollapsed(false);
      setState(createPackLevelState(launchIntent.sourcePackId, launchIntent.sourceLevel));
      return;
    }

    handleReturnToSetup();
  };
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
                  <p>{state.mode === 'practice' && activePractice ? `当前为练习：${activePractice.name}` : '选择关卡包，然后选择具体关卡开始游戏。'}</p>
                </div>
                <div className="pacman-pack-tabs">
                  {packs.map((pack) => (
                    <button
                      key={pack.packId}
                      className={`pacman-pack-tab${selectedPackId === pack.packId ? ' active' : ''}`}
                      onClick={() => applyPack(pack.packId)}
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

            <div className="pacman-session-brief">
              <div className="pacman-session-card">
                <strong>{activePractice?.name || currentLevelMeta?.focusMechanic || '本关目标'}</strong>
                <p>{activePractice?.objective || currentLevelMeta?.objective || currentLevelMeta?.description || '按开始进入本局。'}</p>
              </div>
              <div className="pacman-session-card">
                <strong>开局提示</strong>
                <p>{activePractice?.startHint || currentLevelMeta?.startHint || '先看鬼位，再决定从哪条线起手。'}</p>
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
                <span>最佳通关: {hubSummary.bestClearTime}</span>
                <span>总局数: {hubSummary.totalRuns}</span>
              </div>
              {onExit && (
                <button className="pacman-btn ghost" onClick={onExit}>
                  退出模块
                </button>
              )}
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
            onExit={handleReturnToSetup}
            objective={activePractice?.objective || currentLevelMeta?.objective}
            startHint={activePractice?.startHint || currentLevelMeta?.startHint}
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
        onExit={handleReturnToSetup}
        selectedPackId={selectedPackId}
        levelMeta={currentLevelMeta}
        activePractice={activePractice}
        onOpenPractice={handleOpenPractice}
        onReturnFromPractice={handleReturnFromPractice}
        practiceReturnLabel={practiceReturnTarget === 'guide' ? '返回图鉴' : '回到来源关卡'}
      />
    </div>
  );
};

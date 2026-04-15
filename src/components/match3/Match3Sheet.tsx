/* 三消主玩法组件。包含选关、模式切换入口，整合棋盘、HUD和结算面板。 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  canSwap,
  createBoard,
  createBoardFromConfig,
  decrementMoves,
  executeSwap,
  generateResult,
  hasValidSwaps,
  processChain,
  selectTile,
  shuffleBoard,
  startGame,
  clearSelection,
} from '../../features/match3/match3BoardState';
import {
  getAllLevels,
  getLevelById,
  getLevelsByPack,
  getPackById,
  convertScriptToConfig,
  MATCH3_LEVEL_PACKS,
} from '../../features/match3/match3LevelCatalog';
import {
  isLevelUnlocked,
  isLevelCompleted,
  getLevelStars,
  recordLevelPlay,
} from '../../features/match3/match3ProgressStorage';
import type { Match3BoardState } from '../../features/match3/match3Types';
import { Match3Board } from './Match3Board';
import { Match3Hud } from './Match3Hud';
import { Match3ResultPanel } from './Match3ResultPanel';
import '../../styles/match3.css';
import {
  playMatch3SwapSound,
  playMatch3ChainSound,
  playMatch3WinSound,
  playMatch3LoseSound,
} from '../../utils/match3SoundUtils';

interface Match3SheetProps {
  onFormulaChange?: (text: string) => void;
  onExit?: () => void;
  initialSnapshot?: Record<string, unknown> | null;
  onSnapshotChange?: (snapshot: Record<string, unknown>) => void;
}

export const Match3Sheet: React.FC<Match3SheetProps> = ({ onFormulaChange, onExit: _onExit, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    state?: Match3BoardState;
    selectedPackId?: string;
    selectedLevelId?: string;
    setupCollapsed?: boolean;
    isPaused?: boolean;
    gameSpeed?: number;
    soundEnabled?: boolean;
  } | null;
  const [state, setState] = useState<Match3BoardState>(() => snapshot?.state ?? createBoard());
  const [selectedPackId, setSelectedPackId] = useState<string>(snapshot?.selectedPackId ?? 'beginner');
  const [selectedLevelId, setSelectedLevelId] = useState<string>(snapshot?.selectedLevelId ?? 'beginner-01');
  const [setupCollapsed, setSetupCollapsed] = useState(snapshot?.setupCollapsed ?? false);
  const [isPaused, setIsPaused] = useState(snapshot?.isPaused ?? false);
  const [gameSpeed, setGameSpeed] = useState(snapshot?.gameSpeed ?? 1);
  const [soundEnabled, setSoundEnabled] = useState(snapshot?.soundEnabled ?? true);
  const [showShuffleHint, setShowShuffleHint] = useState(false);

  const selectedPack = useMemo(() => getPackById(selectedPackId), [selectedPackId]);
  const selectedLevel = useMemo(() => getLevelById(selectedLevelId), [selectedLevelId]);
  const packLevels = useMemo(() => getLevelsByPack(selectedPackId), [selectedPackId]);

  useEffect(() => {
    if (state.phase === 'playing' && !isPaused) {
      const timer = window.setInterval(() => {
        setState((current) => {
          if (current.phase !== 'playing' || current.isAnimating) return current;

          if (current.maxTimeMs !== null && current.timeMs !== null) {
            const decrement = gameSpeed === 2 ? 200 : 200;
            const newTimeMs = current.timeMs - decrement;
            if (newTimeMs <= 0) {
              playMatch3LoseSound(soundEnabled);
              return {
                ...current,
                timeMs: 0,
                phase: 'lost',
                failureReason: '时间耗尽',
                failureSuggestion: '尝试更快完成目标，优先处理高价值目标',
              };
            }
            return { ...current, timeMs: newTimeMs };
          }

          if (current.resolvingChain) {
            const prevComboLevel = current.comboLevel;
            const hasMoreChain = processChain(current);
            if (current.comboLevel > prevComboLevel) {
              playMatch3ChainSound(current.comboLevel, soundEnabled);
            }
            if (!hasMoreChain) {
              current.resolvingChain = false;
              current.chainCount = 0;
              current.isAnimating = false;

              if (!hasValidSwaps(current)) {
                shuffleBoard(current);
                setShowShuffleHint(true);
                setTimeout(() => setShowShuffleHint(false), 1500);
              }

              const loseCheck = generateResult(current);
              if (!loseCheck.won) {
                playMatch3LoseSound(soundEnabled);
                current.phase = 'lost';
                current.failureReason = loseCheck.failureReason;
                current.failureSuggestion = loseCheck.suggestion;
              } else if (generateResult(current).won) {
                playMatch3WinSound(soundEnabled);
                current.phase = 'won';
              }
            }
            return { ...current };
          }

          return current;
        });
      }, gameSpeed === 2 ? 100 : 200);

      return () => window.clearInterval(timer);
    }
  }, [state.phase, isPaused, gameSpeed]);

  useEffect(() => {
    const levelName = selectedLevel?.name ?? '三消关卡';
    const packName = selectedPack?.name ?? '关卡包';
    const phaseLabel = state.phase === 'setup' ? '准备' : state.phase === 'playing' ? '进行中' : state.phase === 'won' ? '胜利' : '失败';

    onFormulaChange?.(
      state.phase === 'setup'
        ? `=${levelName} | ${packName} | 目标：${state.goals.map((g) => `${g.type}:${g.target}`).join(' / ')} | ${state.maxMoves ?? '无限'}步`
        : state.phase === 'playing'
          ? `=${levelName} | ${phaseLabel} | 分数 ${state.score} | 步数 ${state.moves}/${state.maxMoves ?? '无限'} | 连锁 ${state.comboLevel + 1}段`
          : `=${levelName} | ${phaseLabel} | 分数 ${state.score} | 目标完成 ${state.goals.filter((g) => g.current >= g.target).length}/${state.goals.length}`,
    );
  }, [onFormulaChange, state, selectedLevel, selectedPack]);

  useEffect(() => {
    onSnapshotChange?.({
      state,
      selectedPackId,
      selectedLevelId,
      setupCollapsed,
      isPaused,
      gameSpeed,
      soundEnabled,
    });
  }, [state, selectedPackId, selectedLevelId, setupCollapsed, isPaused, gameSpeed, soundEnabled, onSnapshotChange]);

  const handlePackSelect = (packId: string) => {
    setSelectedPackId(packId);
    const levels = getLevelsByPack(packId);
    if (levels.length > 0) {
      const firstUnlocked = levels.find((l) => isLevelUnlocked(l.id));
      setSelectedLevelId(firstUnlocked?.id ?? levels[0].id);
    }
  };

  const handleLevelSelect = (levelId: string) => {
    if (!isLevelUnlocked(levelId)) return;
    setSelectedLevelId(levelId);
  };

  const handleStartGame = () => {
    if (!selectedLevel) return;
    const config = convertScriptToConfig(selectedLevel);
    const board = createBoardFromConfig(config);
    startGame(board);
    setState(board);
    setIsPaused(false);
    setSetupCollapsed(true);
    recordLevelPlay(selectedLevelId);
  };

  const handleCellClick = (row: number, col: number) => {
    if (state.phase !== 'playing' || isPaused) return;

    setState((current) => {
      const newState = { ...current };
      selectTile(newState, row, col);

      if (newState.selectedTile && newState.swapTarget) {
        const { row: r1, col: c1 } = newState.selectedTile;
        const { row: r2, col: c2 } = newState.swapTarget;

        if (canSwap(newState, r1, c1, r2, c2)) {
          const result = executeSwap(newState, r1, c1, r2, c2);
          if (result.valid) {
            playMatch3SwapSound(true, soundEnabled);
            decrementMoves(newState);
            newState.isAnimating = true;
            newState.resolvingChain = true;
            newState.chainCount = 1;
            clearSelection(newState);
          }
        } else {
          playMatch3SwapSound(false, soundEnabled);
          clearSelection(newState);
        }
      }

      return newState;
    });
  };

  const handleTogglePause = () => {
    setIsPaused((current) => !current);
  };

  const handleRestart = () => {
    if (!selectedLevel) return;
    const config = convertScriptToConfig(selectedLevel);
    const board = createBoardFromConfig(config);
    startGame(board);
    setState(board);
    setIsPaused(false);
    recordLevelPlay(selectedLevelId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase !== 'playing') {
        if (e.key === 'r' || e.key === 'R') {
          if (state.phase === 'won' || state.phase === 'lost') {
            e.preventDefault();
            handleRestart();
          }
        }
        return;
      }
      if (isPaused) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }
      switch (e.key) {
        case 'Escape':
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          handleTogglePause();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRestart();
          break;
        case 'Tab':
          e.preventDefault();
          if (state.selectedTile) {
            const { row, col } = state.selectedTile;
            const newCol = (col + 1) % state.cols;
            handleCellClick(row, newCol);
          } else {
            setState((current) => {
              const newState = { ...current };
              selectTile(newState, Math.floor(state.rows / 2), Math.floor(state.cols / 2));
              return newState;
            });
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (state.selectedTile) {
            const { row, col } = state.selectedTile;
            if (row < state.rows - 1) {
              handleCellClick(row + 1, col);
            }
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          if (state.selectedTile) {
            const { row, col } = state.selectedTile;
            let newRow = row;
            let newCol = col;
            if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
            else if (e.key === 'ArrowDown') newRow = Math.min(state.rows - 1, row + 1);
            else if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
            else if (e.key === 'ArrowRight') newCol = Math.min(state.cols - 1, col + 1);
            handleCellClick(newRow, newCol);
          } else {
            const centerRow = Math.floor(state.rows / 2);
            const centerCol = Math.floor(state.cols / 2);
            setState((current) => {
              const newState = { ...current };
              selectTile(newState, centerRow, centerCol);
              return newState;
            });
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.selectedTile, state.rows, state.cols, isPaused, handleTogglePause, handleRestart]);

  const handleToggleSpeed = () => {
    setGameSpeed((current) => current === 1 ? 2 : 1);
  };

  const handleBackToSetup = () => {
    setSetupCollapsed(false);
    setIsPaused(false);
    if (selectedLevel) {
      const config = convertScriptToConfig(selectedLevel);
      setState(createBoardFromConfig(config));
    }
  };

  const handleContinue = () => {
    const nextLevel = getLevelById(selectedLevelId);
    if (!nextLevel) return;
    const allLevels = getAllLevels();
    const currentIndex = allLevels.findIndex((l) => l.id === selectedLevelId);
    if (currentIndex >= 0 && currentIndex < allLevels.length - 1) {
      const next = allLevels[currentIndex + 1];
      if (isLevelUnlocked(next.id)) {
        setSelectedLevelId(next.id);
        setSelectedPackId(next.packId);
        const config = convertScriptToConfig(next);
        const board = createBoardFromConfig(config);
        startGame(board);
        setState(board);
        setIsPaused(false);
        setSetupCollapsed(true);
        recordLevelPlay(next.id);
      }
    }
  };

  return (
    <div className="match3-sheet">
      <Match3Hud
        state={state}
        levelName={selectedLevel?.name}
        packName={selectedPack?.name}
        onTogglePause={handleTogglePause}
        onToggleSpeed={handleToggleSpeed}
        onRestart={handleRestart}
        onToggleSound={() => setSoundEnabled((current) => !current)}
        isPaused={isPaused}
        gameSpeed={gameSpeed}
        soundEnabled={soundEnabled}
      />

      {state.phase === 'setup' && (
        <div className={`match3-setup-panel${setupCollapsed ? ' is-collapsed' : ''}`}>
          <div className="match3-setup-toolbar">
            <div className="match3-setup-toolbar-copy">
              <strong>{selectedLevel?.name ?? '选择关卡'}</strong>
              <span>{selectedPack?.name ?? '选择关卡包'}</span>
              <span>难度：{selectedLevel?.difficulty ?? '普通'}</span>
            </div>
            <div className="match3-setup-toolbar-actions">
              <button
                type="button"
                className="match3-mode-tab"
                aria-expanded={!setupCollapsed}
                aria-controls="match3-setup-content"
                aria-label={setupCollapsed ? '展开三消设置面板' : '收起三消设置面板'}
                onClick={() => setSetupCollapsed((current) => !current)}
              >
                {setupCollapsed ? '展开设置' : '收起设置'}
              </button>
              <button
                type="button"
                className="match3-start-btn"
                aria-label="开始三消游戏"
                onClick={handleStartGame}
                disabled={!selectedLevel || !isLevelUnlocked(selectedLevelId)}
              >
                开始游戏
              </button>
            </div>
          </div>

          {!setupCollapsed && (
            <>
              <div className="match3-setup-copy" id="match3-setup-content">
                <strong>{selectedLevel?.name ?? '选择关卡'}</strong>
                <span>当前关卡包：{selectedPack?.name ?? '未知'}</span>
                <span>{selectedLevel?.tutorialHint ?? '点击两个相邻色块进行交换'}</span>
                <span>目标：{state.goals.map((g) => `${g.type === 'score' ? `分数${g.target}` : g.type === 'collectColor' ? `收集${g.colorTarget ?? ''}色${g.target}个` : `${g.type}${g.target}`}`).join(' / ')}</span>
                <span>棋盘大小：{state.rows}×{state.cols} · 步数限制：{state.maxMoves ?? '无限'}</span>
                {selectedLevel?.initialObstacles && selectedLevel.initialObstacles.length > 0 && (
                  <span>障碍：{selectedLevel.initialObstacles.map((o) => `${o.type}${o.positions.length}处`).join(' / ')}</span>
                )}
              </div>

              <div className="match3-mode-panel">
                <div className="match3-mode-tabs" role="tablist" aria-label="关卡包切换">
                  {MATCH3_LEVEL_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedPackId === pack.id}
                      aria-label={`切换到${pack.name}`}
                      className={`match3-mode-tab${selectedPackId === pack.id ? ' active' : ''}`}
                      onClick={() => handlePackSelect(pack.id)}
                    >
                      {pack.name}
                    </button>
                  ))}
                </div>

                <div className="match3-level-grid">
                  {packLevels.map((level) => {
                    const unlocked = isLevelUnlocked(level.id);
                    const completed = isLevelCompleted(level.id);
                    const stars = getLevelStars(level.id);
                    return (
                      <button
                        key={level.id}
                        type="button"
                        aria-pressed={selectedLevelId === level.id}
                        aria-label={`${level.name}${unlocked ? '' : '（未解锁）'}`}
                        aria-disabled={!unlocked}
                        className={`match3-level-card${selectedLevelId === level.id ? ' active' : ''}${completed ? ' match3-level-card--completed' : ''}${!unlocked ? ' match3-level-card--locked' : ''}`}
                        onClick={() => handleLevelSelect(level.id)}
                        disabled={!unlocked}
                      >
                        <strong>{level.orderInPack}. {level.name}</strong>
                        <span>{level.tutorialHint ?? '完成目标即可通关'}</span>
                        <small>难度：{level.difficulty} · {level.maxMoves}步</small>
                        {completed && <small className="match3-completed-hint">✅ 已通关 {'⭐'.repeat(stars)}</small>}
                        {!unlocked && <small className="match3-lock-hint">🔒 需通过前置关卡</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Match3ResultPanel
        state={state}
        levelId={selectedLevelId}
        onRetry={handleRestart}
        onBackToSetup={handleBackToSetup}
        onContinue={handleContinue}
      />

      {state.phase !== 'setup' ? (
        <div className="match3-board-container">
          <Match3Board
            state={state}
            onCellClick={handleCellClick}
          />
          {isPaused && state.phase === 'playing' && (
            <div className="match3-pause-overlay">
              <div className="match3-pause-content">
                <h2>游戏已暂停</h2>
                <p>按 ESC 或点击"恢复"按钮继续游戏</p>
                <button
                  type="button"
                  className="match3-pause-resume-btn"
                  onClick={handleTogglePause}
                >
                  ▶️ 继续游戏
                </button>
              </div>
            </div>
          )}
          {showShuffleHint && (
            <div className="match3-shuffle-hint">
              <span>🔄 棋盘已自动洗牌</span>
            </div>
          )}
        </div>
      ) : (
        <div className="match3-setup-board-placeholder">
          选择关卡后点击"开始游戏"开始三消挑战。交换相邻色块，让三个相同颜色的色块连成一线即可消除。
        </div>
      )}
    </div>
  );
};

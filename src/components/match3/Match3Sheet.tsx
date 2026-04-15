/* 三消主玩法组件。包含选关、模式切换入口，整合棋盘、HUD和结算面板。 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  checkLoseCondition,
  checkWinCondition,
  canSwap,
  createBoard,
  createBoardFromConfig,
  decrementMoves,
  executeSwap,
  hasValidSwaps,
  processChain,
  selectTile,
  shuffleBoard,
  startGame,
  clearSelection,
} from '../../features/match3/match3BoardState';
import {
  getDefaultFocusTile,
  moveFocusTile,
  resolveConfirmAction,
} from '../../features/match3/match3Keyboard';
import {
  getLevelById,
  getLevelsByPack,
  getPackById,
  convertScriptToConfig,
  getNextLevel,
  MATCH3_LEVEL_PACKS,
  type Match3LevelScript,
} from '../../features/match3/match3LevelCatalog';
import {
  MATCH3_RUNTIME_MODES,
  convertModeLevelToConfig,
  getModeChapters,
  getModeLevelById,
  getModeLevelsByChapter,
  type Match3ModeLevel,
} from '../../features/match3/match3ModeRuntime';
import {
  isLevelUnlocked,
  isLevelCompleted,
  getLevelStars,
  recordLevelPlay,
} from '../../features/match3/match3ProgressStorage';
import type { Match3BoardState, Match3ModeId } from '../../features/match3/match3Types';
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

function getGoalSummary(state: Match3BoardState): string {
  const comboLabels = {
    'striped-striped': '条纹+条纹',
    'striped-wrapped': '条纹+包装',
    'wrapped-wrapped': '包装+包装',
    'colorBomb-special': '彩球+特殊块',
    'colorBomb-colorBomb': '双彩球',
  } as const;
  return state.goals.map((goal) => {
    switch (goal.type) {
      case 'score':
        return `分数 ${goal.current}/${goal.target}`;
      case 'collectColor':
        return `收集 ${goal.colorTarget ?? ''}色 ${goal.current}/${goal.target}`;
      case 'clearOverlay':
        return `清覆盖 ${goal.current}/${goal.target}`;
      case 'dropCollect':
        return `送出 ${goal.current}/${goal.target}`;
      case 'clearObstacle':
        return `拆障碍 ${goal.current}/${goal.target}`;
      case 'triggerCombo':
        return `触发 ${goal.comboTarget ? comboLabels[goal.comboTarget] : '组合'} ${goal.current}/${goal.target}`;
      default:
        return `目标 ${goal.current}/${goal.target}`;
    }
  }).join(' / ');
}

function getModeLabel(modeId: Match3ModeId): string {
  if (modeId === 'blitz') return 'Blitz';
  if (modeId === 'puzzle') return 'Puzzle';
  if (modeId === 'practice') return 'Practice';
  return 'Adventure';
}

export const Match3Sheet: React.FC<Match3SheetProps> = ({ onFormulaChange, onExit, initialSnapshot, onSnapshotChange }) => {
  const snapshot = initialSnapshot as {
    state?: Match3BoardState;
    selectedModeId?: Match3ModeId;
    selectedPackId?: string;
    selectedLevelId?: string;
    setupCollapsed?: boolean;
    isPaused?: boolean;
    gameSpeed?: number;
    soundEnabled?: boolean;
    focusedTile?: { row: number; col: number } | null;
  } | null;
  const [state, setState] = useState<Match3BoardState>(() => snapshot?.state ?? createBoard());
  const [selectedModeId, setSelectedModeId] = useState<Match3ModeId>(snapshot?.selectedModeId ?? 'adventure');
  const [selectedPackId, setSelectedPackId] = useState<string>(snapshot?.selectedPackId ?? 'beginner');
  const [selectedLevelId, setSelectedLevelId] = useState<string>(snapshot?.selectedLevelId ?? 'beginner-01');
  const [setupCollapsed, setSetupCollapsed] = useState(snapshot?.setupCollapsed ?? false);
  const [isPaused, setIsPaused] = useState(snapshot?.isPaused ?? false);
  const [gameSpeed, setGameSpeed] = useState(snapshot?.gameSpeed ?? 1);
  const [soundEnabled, setSoundEnabled] = useState(snapshot?.soundEnabled ?? true);
  const [showShuffleHint, setShowShuffleHint] = useState(false);
  const [focusedTile, setFocusedTile] = useState<{ row: number; col: number } | null>(snapshot?.focusedTile ?? null);
  const onExitRef = useRef(onExit);

  const selectedPack = useMemo(
    () => (selectedModeId === 'adventure' ? getPackById(selectedPackId) : getModeChapters(selectedModeId).find((chapter) => chapter.id === selectedPackId)),
    [selectedModeId, selectedPackId]
  );
  const selectedLevel = useMemo(
    () => (selectedModeId === 'adventure' ? getLevelById(selectedLevelId) : getModeLevelById(selectedLevelId)),
    [selectedModeId, selectedLevelId]
  );
  const packLevels = useMemo(
    () => (selectedModeId === 'adventure' ? getLevelsByPack(selectedPackId) : getModeLevelsByChapter(selectedModeId, selectedPackId)),
    [selectedModeId, selectedPackId]
  );

  const previewSetupBoard = useCallback((modeId: Match3ModeId, level: Match3LevelScript | Match3ModeLevel | undefined) => {
    if (state.phase !== 'setup' || !level) return;
    const config = modeId === 'adventure'
      ? convertScriptToConfig(level as Match3LevelScript)
      : convertModeLevelToConfig(level as Match3ModeLevel);
    setState(createBoardFromConfig(config));
  }, [state.phase]);

  useEffect(() => {
    if (!selectedLevel || state.phase !== 'setup') return;
    const targetChapterId = selectedModeId === 'adventure'
      ? (selectedLevel as Match3LevelScript).packId
      : (selectedLevel as Match3ModeLevel).chapterId;
    if (
      state.modeId !== selectedModeId ||
      state.chapterId !== targetChapterId ||
      state.boardTemplateId !== selectedLevel.boardTemplateId
    ) {
      previewSetupBoard(selectedModeId, selectedLevel as Match3LevelScript | Match3ModeLevel);
    }
  }, [previewSetupBoard, selectedLevel, selectedModeId, state.phase, state.modeId, state.chapterId, state.boardTemplateId]);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    if (state.phase === 'playing' && !isPaused) {
      const timer = window.setInterval(() => {
        setState((current) => {
          if (current.phase !== 'playing' || current.isAnimating) return current;

          if (current.maxTimeMs !== null && current.timeMs !== null) {
            const decrement = gameSpeed === 2 ? 100 : 200;
            const newTimeMs = current.timeMs - decrement;
            if (newTimeMs <= 0) {
              const nextPhase = current.modeId === 'blitz' && checkWinCondition(current) ? 'won' : 'lost';
              if (nextPhase === 'won') {
                playMatch3WinSound(soundEnabled);
              } else {
                playMatch3LoseSound(soundEnabled);
              }
              return {
                ...current,
                timeMs: 0,
                phase: nextPhase,
                failureReason: nextPhase === 'lost' ? '时间耗尽' : undefined,
                failureSuggestion: nextPhase === 'lost' ? '尝试更快完成目标，优先处理高价值目标' : undefined,
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

              const won = current.modeId === 'blitz' ? false : checkWinCondition(current);
              const loseCheck = checkLoseCondition(current);
              if (won) {
                playMatch3WinSound(soundEnabled);
                current.phase = 'won';
              } else if (loseCheck.lost) {
                playMatch3LoseSound(soundEnabled);
                current.phase = 'lost';
                current.failureReason = loseCheck.reason;
                current.failureSuggestion = loseCheck.suggestion;
              }
            }
            return { ...current };
          }

          return current;
        });
      }, gameSpeed === 2 ? 100 : 200);

      return () => window.clearInterval(timer);
    }
  }, [state.phase, isPaused, gameSpeed, soundEnabled]);

  useEffect(() => {
    const levelName = selectedLevel?.name ?? '三消关卡';
    const packName = selectedPack?.name ?? '章节';
    const modeName = getModeLabel(selectedModeId);
    const phaseLabel = state.phase === 'setup' ? '准备' : state.phase === 'playing' ? '进行中' : state.phase === 'won' ? '胜利' : '失败';

    onFormulaChange?.(
      state.phase === 'setup'
        ? `=${modeName} | ${levelName} | ${packName} | 目标：${getGoalSummary(state)} | ${state.maxMoves ?? '无限'}步`
        : state.phase === 'playing'
          ? `=${modeName} | ${levelName} | ${phaseLabel} | 分数 ${state.score} | 步数 ${state.moves}/${state.maxMoves ?? '无限'} | 连锁 ${state.comboLevel + 1}段`
          : `=${modeName} | ${levelName} | ${phaseLabel} | 分数 ${state.score} | ${getGoalSummary(state)}`,
    );
  }, [onFormulaChange, state, selectedLevel, selectedPack, selectedModeId]);

  useEffect(() => {
    onSnapshotChange?.({
      state,
      selectedModeId,
      selectedPackId,
      selectedLevelId,
      setupCollapsed,
      isPaused,
      gameSpeed,
      soundEnabled,
      focusedTile,
    });
  }, [state, selectedModeId, selectedPackId, selectedLevelId, setupCollapsed, isPaused, gameSpeed, soundEnabled, focusedTile, onSnapshotChange]);

  const handleModeSelect = (modeId: Match3ModeId) => {
    setSelectedModeId(modeId);
    if (modeId === 'adventure') {
      const firstPack = MATCH3_LEVEL_PACKS[0];
      const firstLevels = getLevelsByPack(firstPack?.id ?? 'beginner');
      const firstUnlocked = firstLevels.find((level) => isLevelUnlocked(level.id));
      const nextLevel = firstUnlocked ?? firstLevels[0];
      setSelectedPackId(firstPack?.id ?? 'beginner');
      setSelectedLevelId(nextLevel?.id ?? 'beginner-01');
      previewSetupBoard(modeId, nextLevel);
      return;
    }

    const chapters = getModeChapters(modeId);
    const firstChapter = chapters[0];
    const firstLevels = getModeLevelsByChapter(modeId, firstChapter?.id ?? '');
    setSelectedPackId(firstChapter?.id ?? '');
    setSelectedLevelId(firstLevels[0]?.id ?? '');
    previewSetupBoard(modeId, firstLevels[0]);
  };

  const handlePackSelect = (packId: string) => {
    setSelectedPackId(packId);
    const levels = selectedModeId === 'adventure' ? getLevelsByPack(packId) : getModeLevelsByChapter(selectedModeId, packId);
    if (levels.length === 0) return;
    if (selectedModeId === 'adventure') {
      const firstUnlocked = levels.find((l) => isLevelUnlocked(l.id));
      const nextLevel = firstUnlocked ?? levels[0];
      setSelectedLevelId(nextLevel.id);
      previewSetupBoard(selectedModeId, nextLevel);
      return;
    }
    setSelectedLevelId(levels[0].id);
    previewSetupBoard(selectedModeId, levels[0]);
  };

  const handleLevelSelect = (levelId: string) => {
    if (selectedModeId === 'adventure' && !isLevelUnlocked(levelId)) return;
    setSelectedLevelId(levelId);
    previewSetupBoard(selectedModeId, selectedModeId === 'adventure' ? getLevelById(levelId) : getModeLevelById(levelId));
  };

  const handleStartGame = () => {
    if (!selectedLevel) return;
    const config = selectedModeId === 'adventure'
      ? convertScriptToConfig(selectedLevel as Match3LevelScript)
      : convertModeLevelToConfig(selectedLevel as Match3ModeLevel);
    const board = createBoardFromConfig(config);
    startGame(board);
    setState(board);
    setFocusedTile(getDefaultFocusTile(board.rows, board.cols));
    setIsPaused(false);
    setSetupCollapsed(true);
    if (selectedModeId === 'adventure') {
      recordLevelPlay(selectedLevelId);
    }
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    if (state.phase !== 'playing' || isPaused) return;
    setFocusedTile({ row, col });

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
  }, [state.phase, isPaused, soundEnabled]);

  const handleTogglePause = useCallback(() => {
    setIsPaused((current) => !current);
  }, []);

  const handleRestart = useCallback(() => {
    if (!selectedLevel) return;
    const config = selectedModeId === 'adventure'
      ? convertScriptToConfig(selectedLevel as Match3LevelScript)
      : convertModeLevelToConfig(selectedLevel as Match3ModeLevel);
    const board = createBoardFromConfig(config);
    startGame(board);
    setState(board);
    setFocusedTile(getDefaultFocusTile(board.rows, board.cols));
    setIsPaused(false);
    if (selectedModeId === 'adventure') {
      recordLevelPlay(selectedLevelId);
    }
  }, [selectedLevel, selectedLevelId, selectedModeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase !== 'playing') {
        if (e.key === 'r' || e.key === 'R') {
          if (state.phase === 'won' || state.phase === 'lost') {
            e.preventDefault();
            handleRestart();
          }
        } else if (e.key === 'Escape') {
          onExitRef.current?.();
        }
        return;
      }
      if (isPaused) {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      const currentFocus = focusedTile ?? getDefaultFocusTile(state.rows, state.cols);
      switch (e.key) {
        case 'Escape':
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
        case 'Enter':
        case ' ':
          e.preventDefault();
          setFocusedTile(currentFocus);
          setState((current) => {
            const newState = { ...current };
            const action = resolveConfirmAction(current.selectedTile, currentFocus);
            if (!current.selectedTile) {
              selectTile(newState, currentFocus.row, currentFocus.col);
              return newState;
            }

            if (action.shouldSwap && action.swapTarget) {
              selectTile(newState, action.swapTarget.row, action.swapTarget.col);
              const { row: r1, col: c1 } = current.selectedTile;
              const { row: r2, col: c2 } = action.swapTarget;

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
              return newState;
            }

            selectTile(newState, action.nextSelectedTile.row, action.nextSelectedTile.col);
            return newState;
          });
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedTile(moveFocusTile(currentFocus, e.key, state.rows, state.cols));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.selectedTile, state.rows, state.cols, isPaused, handleTogglePause, handleRestart, focusedTile, soundEnabled]);

  const handleToggleSpeed = () => {
    setGameSpeed((current) => current === 1 ? 2 : 1);
  };

  const handleBackToSetup = () => {
    setSetupCollapsed(false);
    setIsPaused(false);
    setFocusedTile(null);
    if (selectedLevel) {
      const config = selectedModeId === 'adventure'
        ? convertScriptToConfig(selectedLevel as Match3LevelScript)
        : convertModeLevelToConfig(selectedLevel as Match3ModeLevel);
      setState(createBoardFromConfig(config));
    }
  };

  const handleContinue = () => {
    if (selectedModeId !== 'adventure') return;
    const next = getNextLevel(selectedLevelId);
    if (!next || !isLevelUnlocked(next.id)) return;

    setSelectedLevelId(next.id);
    setSelectedPackId(next.packId);
    const config = convertScriptToConfig(next);
    const board = createBoardFromConfig(config);
    startGame(board);
    setState(board);
    setFocusedTile(getDefaultFocusTile(board.rows, board.cols));
    setIsPaused(false);
    setSetupCollapsed(true);
    recordLevelPlay(next.id);
  };

  return (
    <div className="match3-sheet">
      <Match3Hud
        state={state}
        levelName={selectedLevel?.name}
        modeId={selectedModeId}
        modeName={getModeLabel(selectedModeId)}
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
                disabled={!selectedLevel || (selectedModeId === 'adventure' && !isLevelUnlocked(selectedLevelId))}
              >
                开始游戏
              </button>
            </div>
          </div>

          {!setupCollapsed && (
            <>
              <div className="match3-setup-copy" id="match3-setup-content">
                <strong>{selectedLevel?.name ?? '选择关卡'}</strong>
                <span>当前模式：{getModeLabel(selectedModeId)} · {selectedPack?.name ?? '未知章节'}</span>
                <span>{selectedLevel?.tutorialHint ?? '点击两个相邻色块进行交换'}</span>
                {selectedModeId !== 'adventure' && selectedLevel && 'description' in selectedLevel && typeof selectedLevel.description === 'string' && (
                  <span>{selectedLevel.description}</span>
                )}
                <span>目标：{getGoalSummary(state)}</span>
                <span>棋盘大小：{state.rows}×{state.cols} · {state.maxTimeMs !== null ? `时间限制：${Math.floor(state.maxTimeMs / 1000)}秒` : `步数限制：${state.maxMoves ?? '无限'}`}</span>
                {selectedLevel?.initialObstacles && selectedLevel.initialObstacles.length > 0 && (
                  <span>障碍：{selectedLevel.initialObstacles.map((o) => `${o.type}${o.positions.length}处`).join(' / ')}</span>
                )}
              </div>

              <div className="match3-mode-panel">
                <div className="match3-mode-tabs" role="tablist" aria-label="模式切换">
                  {MATCH3_RUNTIME_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedModeId === mode.id}
                      aria-label={`切换到${mode.name}`}
                      className={`match3-mode-tab${selectedModeId === mode.id ? ' active' : ''}`}
                      onClick={() => handleModeSelect(mode.id)}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>

                <div className="match3-mode-tabs" role="tablist" aria-label="章节切换">
                  {(selectedModeId === 'adventure' ? MATCH3_LEVEL_PACKS : getModeChapters(selectedModeId)).map((pack) => (
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
                    const unlocked = selectedModeId === 'adventure' ? isLevelUnlocked(level.id) : true;
                    const completed = selectedModeId === 'adventure' ? isLevelCompleted(level.id) : false;
                    const stars = selectedModeId === 'adventure' ? getLevelStars(level.id) : 0;
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
                        <span>{level.tutorialHint ?? ('description' in level ? level.description : '完成目标即可通关')}</span>
                        <small>
                          难度：{level.difficulty}
                          {'maxTimeMs' in level && typeof level.maxTimeMs === 'number'
                            ? ` · ${Math.floor(level.maxTimeMs / 1000)}秒`
                            : ` · ${level.maxMoves ?? 0}步`}
                        </small>
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
        levelName={selectedLevel?.name}
        groupName={selectedPack?.name}
        modeId={selectedModeId}
        onRetry={handleRestart}
        onBackToSetup={handleBackToSetup}
        onContinue={selectedModeId === 'adventure' ? handleContinue : undefined}
      />

      {state.phase !== 'setup' ? (
        <div className="match3-board-container">
          <Match3Board
            state={state}
            onCellClick={handleCellClick}
            focusedTile={focusedTile}
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
          先选模式，再选章节与关卡后点击“开始游戏”。方向键移动焦点，Enter 或空格选中并确认交换，让三个相同颜色的色块连成一线即可消除。
        </div>
      )}
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { ExcelHeader } from './components/ExcelHeader';
import { SheetTabs } from './components/SheetTabs';
import { ExcelGrid } from './components/ExcelGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { ConfigCenter } from './components/ConfigCenter';
import { StatsPanel } from './components/StatsPanel';
import { StatusBar } from './components/StatusBar';
import { Crosshair } from './components/Crosshair';
import { GameHub } from './components/GameHub';
import { PerlerHub } from './components/perler/PerlerHub';
import { PvZGameSheet } from './components/pvz/PvZGameSheet';
import { PvZCollectionSheet } from './components/pvz/PvZCollectionSheet';
import { PvZLabSheet } from './components/pvz/PvZLabSheet';
import { SnakeSheet } from './components/snake/SnakeSheet';
import { TetrisSheet } from './components/tetris/TetrisSheet';
import { PacmanSheet } from './components/pacman/PacmanSheet';
import { PacmanGuideSheet } from './components/pacman/PacmanGuideSheet';
import { ZumaGameSheet } from './components/zuma/ZumaGameSheet';
import { ZumaCollectionSheet } from './components/zuma/ZumaCollectionSheet';
import { Match3Sheet } from './components/match3/Match3Sheet';
import { Match3LabSheet } from './components/match3/Match3LabSheet';
import { FancyFeedback } from './components/FancyFeedback';
import { FirstTimeGuide } from './components/FirstTimeGuide';
import { ModeTutorialModal } from './components/ModeTutorialModal';
import { SaveManager } from './components/SaveManager';
import { useGameLogic } from './hooks/useGameLogic';
import { useFeedbackSystem } from './hooks/useFeedbackSystem';
import { useTutorial } from './hooks/useTutorial';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { CrosshairProvider, useCrosshair } from './contexts/CrosshairContext';
import type { FPSTrainingMode } from './components/TrainingModeSelector';
import type { PerlerProgressSummary } from './features/hub/hubData';
import type { DifficultyLevel, GameModeType } from './components/GameHub';
import type { AppSheetId } from './features/sheets/sheetRegistry';
import type { WorkbookStatusSummary } from './types';
import type { SaveSlot } from './types/save';
import { ARCADE_MODULE_MAP, type ArcadeGameId } from './features/workbook/workbookRegistry';
import { getVisibleSheetsForWorkspace } from './features/workbook/workspaceState';
import { createInitialSaveSlot } from './features/save/saveAdapters';
import { loadFromStorage, saveToStorage } from './utils/saveStorage';
import './styles/save.css';

const PERLER_PROGRESS_KEY = 'excel-aim-perler-state-v1';

type ActiveArcadeGame = 'aim' | 'perler' | 'pvz' | 'snake' | 'tetris' | 'pacman' | 'zuma' | 'match3' | null;
type PerlerEntryMode = 'library' | 'resume';
type FPSConfigMap = Record<string, string | number | boolean | undefined>;
type HubStartMode = GameModeType | FPSTrainingMode | 'part_training' | 'peek_shot' | 'moving_target';

function readPerlerProgressFromStorage(): PerlerProgressSummary | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PERLER_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { workspace?: { id: string; title: string; completion: number } | null };
    if (!parsed.workspace || parsed.workspace.completion >= 100) return null;

    return {
      templateId: parsed.workspace.id,
      title: parsed.workspace.title,
      completion: parsed.workspace.completion,
    };
  } catch {
    return null;
  }
}

function AppContent() {
  const { 
    settings, 
    updateSetting, 
    applyPreset, 
    resetSettings,
    tempSettings,
    updateTempSetting,
    saveSettings,
    cancelSettings,
  } = useSettings();
  const { mousePosition, isCrosshairVisible, setCrosshairVisible } = useCrosshair();

  const [activeArcadeGame, setActiveArcadeGame] = useState<ActiveArcadeGame>(null);
  const [workspaceGameId, setWorkspaceGameId] = useState<ArcadeGameId | null>(null);
  const [currentSaveSlot, setCurrentSaveSlot] = useState<SaveSlot | null>(null);
  const [perlerEntryMode, setPerlerEntryMode] = useState<PerlerEntryMode>('library');
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [hubFormulaText, setHubFormulaText] = useState('=今日建议：先热手，再摸鱼，再伪装');
  const [configFormulaText, setConfigFormulaText] = useState('=配置中心：独立管理练枪启动工作台，首页不再挤配置内容');
  const [perlerFormulaText, setPerlerFormulaText] = useState('=拼豆模板库已就绪');
  const [snakeFormulaText, setSnakeFormulaText] = useState('=数据流待命，按方向键开始。');
  const [tetrisFormulaText, setTetrisFormulaText] = useState('=待整理数据块已装载');
  const [pvzFormulaText, setPvZFormulaText] = useState('=PvZ 防线就绪');
  const [pvzCollectionFormulaText, setPvZCollectionFormulaText] = useState('=植物与僵尸图鉴');
  const [pvzLabFormulaText, setPvZLabFormulaText] = useState('=章节、规则与实验室');
  const [pacmanFormulaText, setPacmanFormulaText] = useState('=吃豆人迷宫就绪，按方向键开始');
  const [pacmanGuideFormulaText, setPacmanGuideFormulaText] = useState('=四鬼行为与练习指南');
  const [zumaFormulaText, setZumaFormulaText] = useState('=祖玛轨道就绪，瞄准发射');
  const [zumaCollectionFormulaText, setZumaCollectionFormulaText] = useState('=球种图鉴与练习');
  const [match3FormulaText, setMatch3FormulaText] = useState('=三消棋盘就绪，交换消除');
  const [match3LabFormulaText, setMatch3LabFormulaText] = useState('=特殊块与障碍图鉴');
  const [perlerSelectedCell, setPerlerSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [perlerProgress, setPerlerProgress] = useState<PerlerProgressSummary | null>(() => readPerlerProgressFromStorage());
  const [snakeStatusSummary, setSnakeStatusSummary] = useState<WorkbookStatusSummary | undefined>(undefined);
  const [tetrisStatusSummary, setTetrisStatusSummary] = useState<WorkbookStatusSummary | undefined>(undefined);
  const [currentMode, setCurrentMode] = useState<FPSTrainingMode | null>(null);
  const [, setModeConfig] = useState<FPSConfigMap>({});

  const {
    gameState,
    targets,
    selectedCell,
    currentSheet,
    isHidden,
    hoverCorner,
    stats,
    hitEffects,
    startGame,
    startGameWithMode,
    handleCellClick,
    handleCellHover,
    switchSheet,
    toggleHidden,
    togglePause,
    exitToHub,
    handleCornerEnter,
    handleCornerLeave,
    COLS,
    ROWS,
    multiGridEnemies,
    currentLevel,
    levelConfig,
    levelStatus,
    currentPriorityTarget,
  } = useGameLogic();

  useTutorial();
  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(() => {
    return !localStorage.getItem('excel-aim-tutorial-completed');
  });
  const [showModeTutorial, setShowModeTutorial] = useState<string | null>(null);
  const [pendingGameStart, setPendingGameStart] = useState<{
    mode: HubStartMode;
    duration?: 30 | 60 | 120;
    level?: number;
    difficulty?: DifficultyLevel;
    isFPSMode?: boolean;
    fpsConfig?: FPSConfigMap;
  } | null>(null);

  const { currentFeedback } = useFeedbackSystem({
    combo: gameState.combo,
    missStreak: gameState.missStreak || 0,
    headshotStreak: gameState.headshotStreak || 0,
    headshotRate: gameState.headAppearances > 0 ? (gameState.headHits / gameState.headAppearances) * 100 : 0,
    score: gameState.score,
    bestScore: stats.totalScore,
    isPlaying: gameState.isPlaying,
    feedbackMode: settings.feedbackMode || 'fancy',
  });

  useEffect(() => {
    const shouldHideCursor = currentSheet === 'game' && activeArcadeGame === 'aim' && settings.customCursor && !isHidden;
    if (shouldHideCursor) {
      document.body.style.cursor = 'none';
      setCrosshairVisible(true);
    } else {
      document.body.style.cursor = '';
      setCrosshairVisible(false);
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, [currentSheet, activeArcadeGame, settings.customCursor, isHidden, setCrosshairVisible]);

  const handleResetStats = () => {
    if (confirm('确定要重置所有统计数据吗？')) {
      localStorage.removeItem('excel-aim-stats-v2');
      window.location.reload();
    }
  };

  const handleStartGameFromHub = (
    mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target',
    duration?: 30 | 60 | 120,
    level?: number,
    difficulty?: DifficultyLevel,
  ) => {
    setActiveArcadeGame('aim');
    setWorkspaceGameId('aim');
    const tutorialKey = `tutorial-shown-${mode}`;
    if (!localStorage.getItem(tutorialKey)) {
      setPendingGameStart({ mode, duration, level, difficulty, isFPSMode: false });
      setShowModeTutorial(mode);
      return;
    }

    const finalDuration = duration || settings.trainingDuration || 60;
    startGame(mode, finalDuration as 30 | 60 | 120, level, difficulty || settings.difficulty);
  };

  const handleStartFPSTrainingFromHub = (mode: FPSTrainingMode, config?: FPSConfigMap) => {
    setActiveArcadeGame('aim');
    setWorkspaceGameId('aim');
    const tutorialKey = `tutorial-shown-${mode}`;
    if (!localStorage.getItem(tutorialKey)) {
      setCurrentMode(mode);
      const finalConfig = { ...config, duration: config?.duration || settings.trainingDuration || 60 };
      setModeConfig(finalConfig);
      setPendingGameStart({ mode, isFPSMode: true, fpsConfig: finalConfig });
      setShowModeTutorial(mode);
      return;
    }

    setCurrentMode(mode);
    const finalConfig = { ...config, duration: config?.duration || settings.trainingDuration || 60 };
    setModeConfig(finalConfig);
    startGameWithMode(mode, finalConfig);
  };

  const handleStartPerlerFromHub = (entryMode: PerlerEntryMode = 'library') => {
    setActiveArcadeGame('perler');
    setWorkspaceGameId('perler');
    setPerlerEntryMode(entryMode);
    setPerlerSelectedCell(null);
    setPerlerProgress(readPerlerProgressFromStorage());
    switchSheet('perler');
  };

  const handleStartPvZFromHub = () => {
    setActiveArcadeGame('pvz');
    setWorkspaceGameId('pvz');
    switchSheet('pvz');
  };

  const handleStartSnakeFromHub = () => {
    setActiveArcadeGame('snake');
    setWorkspaceGameId('snake');
    switchSheet('snake');
  };

  const handleStartTetrisFromHub = () => {
    setActiveArcadeGame('tetris');
    setWorkspaceGameId('tetris');
    switchSheet('tetris');
  };

  const handleStartPacmanFromHub = () => {
    setActiveArcadeGame('pacman');
    setWorkspaceGameId('pacman');
    switchSheet('pacman');
  };

  const handleStartZumaFromHub = () => {
    setActiveArcadeGame('zuma');
    setWorkspaceGameId('zuma');
    switchSheet('zuma');
  };

  const handleStartMatch3FromHub = () => {
    setActiveArcadeGame('match3');
    setWorkspaceGameId('match3');
    switchSheet('match3');
  };

  const enterGameWorkspace = (gameId: ArcadeGameId) => {
    const module = ARCADE_MODULE_MAP[gameId];
    if (!module) return;
    setWorkspaceGameId(gameId);
    setActiveArcadeGame(gameId as ActiveArcadeGame);

    if (gameId === 'perler') {
      setPerlerEntryMode('library');
      setPerlerProgress(readPerlerProgressFromStorage());
      setPerlerSelectedCell(null);
    }

    switchSheet(module.entrySheetId);
  };

  const handleExitCurrentGame = () => {
    setActiveArcadeGame(null);
    setWorkspaceGameId(null);
    setCurrentSaveSlot(null);
    setPerlerEntryMode('library');
    setPerlerSelectedCell(null);
    setSnakeStatusSummary(undefined);
    setTetrisStatusSummary(undefined);
    exitToHub();
  };

  const handleNewSave = () => {
    if (!workspaceGameId) {
      setShowSaveManager(true);
      return;
    }
    const slot = createInitialSaveSlot(`${ARCADE_MODULE_MAP[workspaceGameId].title}存档`, workspaceGameId, currentSheet);
    saveToStorage(slot);
    setCurrentSaveSlot(slot);
    setShowSaveManager(true);
  };

  const handleSave = () => {
    if (!workspaceGameId) {
      setShowSaveManager(true);
      return;
    }

    if (currentSaveSlot) {
      saveToStorage({
        ...currentSaveSlot,
        timestamp: Date.now(),
        data: {
          gameType: workspaceGameId,
          workspaceId: workspaceGameId,
          currentSheet,
          payload: currentSaveSlot.data.payload || {},
        },
      });
      return;
    }

    setShowSaveManager(true);
  };

  const handleLoad = () => {
    setShowSaveManager(true);
  };

  const handleDelete = () => {
    setShowSaveManager(true);
  };

  const handleSelectGame = (gameId: ArcadeGameId) => {
    enterGameWorkspace(gameId);
  };

  const handleLoadSave = (slot: SaveSlot) => {
    const loaded = loadFromStorage(slot.id);
    if (loaded) {
      setCurrentSaveSlot(loaded);
      enterGameWorkspace(loaded.gameType);
      switchSheet(loaded.data.currentSheet);
    }
  };

  const handleSheetSwitch = (sheet: AppSheetId) => {
    if (sheet === 'game') {
      setActiveArcadeGame('aim');
    } else if (sheet === 'snake') {
      setActiveArcadeGame('snake');
    } else if (sheet === 'tetris') {
      setActiveArcadeGame('tetris');
    } else if (sheet === 'perler') {
      setActiveArcadeGame('perler');
    } else if (sheet === 'pvz' || sheet === 'pvz_collection' || sheet === 'pvz_lab') {
      setActiveArcadeGame('pvz');
    } else if (sheet === 'pacman' || sheet === 'pacman_guide') {
      setActiveArcadeGame('pacman');
    } else if (sheet === 'zuma' || sheet === 'zuma_collection') {
      setActiveArcadeGame('zuma');
    } else if (sheet === 'match3' || sheet === 'match3_lab') {
      setActiveArcadeGame('match3');
      setWorkspaceGameId('match3');
    } else if (sheet !== currentSheet) {
      setActiveArcadeGame(null);
      setWorkspaceGameId(null);
    }
    switchSheet(sheet);
  };

  const visibleSheets = useMemo<AppSheetId[]>(() => (workspaceGameId ? getVisibleSheetsForWorkspace(workspaceGameId) : ['hub']), [workspaceGameId]);

  useEffect(() => {
    if (workspaceGameId && !visibleSheets.includes(currentSheet)) {
      switchSheet(ARCADE_MODULE_MAP[workspaceGameId].entrySheetId);
    }
  }, [workspaceGameId, visibleSheets, currentSheet, switchSheet]);

  const titleText = currentSheet === 'hub'
    ? 'Microsoft Excel - 工位娱乐中心.xlsx'
    : currentSheet === 'perler'
      ? 'Microsoft Excel - 拼豆工位创作.xlsx'
      : currentSheet === 'pvz'
      ? 'Microsoft Excel - 植物大战僵尸.xlsx'
      : currentSheet === 'pvz_collection'
          ? 'Microsoft Excel - PvZ 图鉴.xlsx'
          : currentSheet === 'pvz_lab'
            ? 'Microsoft Excel - PvZ 实验室.xlsx'
      : currentSheet === 'snake'
        ? 'Microsoft Excel - 贪吃蛇.xlsx'
      : currentSheet === 'tetris'
        ? 'Microsoft Excel - 俄罗斯方块.xlsx'
      : currentSheet === 'pacman'
        ? 'Microsoft Excel - 吃豆人.xlsx'
      : currentSheet === 'pacman_guide'
        ? 'Microsoft Excel - 吃豆人图鉴.xlsx'
      : currentSheet === 'zuma'
        ? 'Microsoft Excel - 祖玛.xlsx'
      : currentSheet === 'zuma_collection'
        ? 'Microsoft Excel - 祖玛图鉴.xlsx'
      : currentSheet === 'match3'
        ? 'Microsoft Excel - 三消.xlsx'
      : currentSheet === 'match3_lab'
        ? 'Microsoft Excel - 三消实验室.xlsx'
      : currentSheet === 'config'
        ? 'Microsoft Excel - 配置中心.xlsx'
      : 'Microsoft Excel - 练枪数据.xlsx';

  const formulaText = currentSheet === 'hub'
    ? hubFormulaText
    : currentSheet === 'perler'
      ? perlerFormulaText
      : currentSheet === 'pvz'
        ? pvzFormulaText
        : currentSheet === 'pvz_collection'
          ? pvzCollectionFormulaText
          : currentSheet === 'pvz_lab'
            ? pvzLabFormulaText
            : currentSheet === 'snake'
              ? snakeFormulaText
              : currentSheet === 'tetris'
                ? tetrisFormulaText
                : currentSheet === 'pacman'
                  ? pacmanFormulaText
                  : currentSheet === 'pacman_guide'
                    ? pacmanGuideFormulaText
                    : currentSheet === 'zuma'
                      ? zumaFormulaText
                      : currentSheet === 'zuma_collection'
                        ? zumaCollectionFormulaText
                        : currentSheet === 'match3'
                          ? match3FormulaText
                          : currentSheet === 'match3_lab'
                            ? match3LabFormulaText
                            : currentSheet === 'config'
                              ? configFormulaText
                              : undefined;

  const effectiveSelectedCell = currentSheet === 'perler'
    ? perlerSelectedCell
    : selectedCell;

  const workbookStatusSummary = currentSheet === 'snake'
    ? snakeStatusSummary
    : currentSheet === 'tetris'
      ? tetrisStatusSummary
      : undefined;

  return (
    <div 
      className="h-screen flex flex-col" 
      style={{ fontFamily: "'Calibri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <Crosshair
        x={mousePosition.x}
        y={mousePosition.y}
        style={settings.crosshairStyle}
        color={settings.crosshairColor}
        size={settings.crosshairSize || 12}
        visible={isCrosshairVisible}
      />

      {activeArcadeGame === 'aim' && settings.feedbackMode !== 'excel' && currentFeedback && (
        <FancyFeedback feedback={currentFeedback} />
      )}

      {!isHidden && currentSheet === 'game' && activeArcadeGame === 'aim' && (
        <div
          className="fixed top-0 left-0 w-24 h-24 z-50"
          onMouseEnter={handleCornerEnter}
          onMouseLeave={handleCornerLeave}
        />
      )}

      {hoverCorner && !isHidden && activeArcadeGame === 'aim' && (
        <div 
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e',
            padding: '8px 16px',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            fontSize: 12,
          }}
        >
          继续悬停以隐藏游戏...
        </div>
      )}

      {isHidden && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {settings.coverImage ? (
            <div 
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                overflow: 'auto',
              }}
            >
              <img 
                src={settings.coverImage} 
                alt="Excel工作表" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <>
              <div 
                style={{
                  display: 'flex',
                  background: '#f3f3f3',
                  borderBottom: '1px solid #d4d4d4',
                  padding: '4px 8px',
                  gap: 4,
                }}
              >
                <div style={{ padding: '4px 12px', fontSize: 11, cursor: 'pointer', borderRadius: 2 }} onClick={toggleHidden}>文件</div>
                <div style={{ padding: '4px 12px', fontSize: 11, cursor: 'pointer', borderRadius: 2 }} onClick={toggleHidden}>打开</div>
              </div>
              <div 
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: 14,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: 8 }}>📫 空白工作簿</p>
                  <p style={{ fontSize: 11, color: '#d1d5db' }}>按 Esc 恢复游戏</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col h-full" style={{ opacity: isHidden ? 0.5 : 1 }}>
        <ExcelHeader
        isHidden={isHidden}
        onToggleHidden={toggleHidden}
        onExit={activeArcadeGame ? handleExitCurrentGame : undefined}
        selectedCell={effectiveSelectedCell}
        feedbackMessage={activeArcadeGame === 'aim' ? currentFeedback : null}
        titleText={titleText}
        formulaText={formulaText}
        formulaTextColor={
          currentSheet === 'hub'
            ? '#107c41'
            : currentSheet === 'perler'
              ? '#7c3aed'
              : currentSheet === 'config'
                ? '#2563eb'
                : currentSheet === 'snake'
                  ? '#0f766e'
                  : currentSheet === 'tetris'
                    ? '#334155'
                    : undefined
        }
        onNewSave={handleNewSave}
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onGameSelect={handleSelectGame}
      />

        <div className="flex-1 flex flex-col overflow-hidden">
          {currentSheet === 'hub' ? (
            <GameHub
              onStartGame={handleStartGameFromHub}
              onStartPerler={handleStartPerlerFromHub}
              onStartSnake={handleStartSnakeFromHub}
              onStartTetris={handleStartTetrisFromHub}
              onStartPvZ={handleStartPvZFromHub}
              onStartPacman={handleStartPacmanFromHub}
              onStartZuma={handleStartZumaFromHub}
              onStartMatch3={handleStartMatch3FromHub}
              onSwitchSheet={(sheet) => handleSheetSwitch(sheet)}
              trainingDuration={settings.trainingDuration}
              difficulty={settings.difficulty as DifficultyLevel}
              totalGames={stats.totalGames}
              totalScore={stats.totalScore}
              perlerProgress={perlerProgress}
              onFormulaChange={setHubFormulaText}
            />
          ) : currentSheet === 'game' ? (
            <ExcelGrid
              key="game-sheet"
              targets={targets}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              onCellHover={handleCellHover}
              COLS={COLS}
              ROWS={ROWS}
              isHidden={isHidden}
              gameState={gameState}
              headshotLineEnabled={settings.headshotLineEnabled || gameState.mode === 'headshot'}
              headshotLineRow={gameState.headshotLineRow}
              targetSize={settings.targetSize}
              hitEffects={hitEffects}
              togglePause={togglePause}
              soundEnabled={settings.soundEnabled}
              onExit={handleExitCurrentGame}
              multiGridEnemies={multiGridEnemies}
              currentLevel={currentLevel}
              levelConfig={levelConfig}
              levelStatus={levelStatus}
              colorlessMode={settings.colorlessMode}
              visualSettings={{
                colorHarmonyMode: settings.colorHarmonyMode,
                spawnAnimation: settings.spawnAnimation,
                enemyFontSize: settings.enemyFontSize,
                enemyFontWeight: settings.enemyFontWeight,
              }}
              cellSettings={settings.cellSettings}
              currentPriorityTarget={currentPriorityTarget}
              fpsMode={currentMode}
            />
          ) : currentSheet === 'stats' ? (
            <StatsPanel stats={stats} onReset={handleResetStats} onExit={() => handleExitCurrentGame()} />
          ) : currentSheet === 'config' ? (
            <ConfigCenter
              onStartGame={handleStartGameFromHub}
              onStartFPSTraining={handleStartFPSTrainingFromHub}
              onSwitchSheet={handleSheetSwitch}
              onFormulaChange={setConfigFormulaText}
            />
          ) : currentSheet === 'perler' ? (
            <PerlerHub
              entryMode={perlerEntryMode}
              onExit={handleExitCurrentGame}
              onFormulaChange={setPerlerFormulaText}
              onSelectedCellChange={setPerlerSelectedCell}
              onProgressChange={(progress) => setPerlerProgress(progress)}
            />
          ) : currentSheet === 'pvz' ? (
            <PvZGameSheet onFormulaChange={setPvZFormulaText} />
          ) : currentSheet === 'pvz_collection' ? (
            <PvZCollectionSheet onFormulaChange={setPvZCollectionFormulaText} />
          ) : currentSheet === 'pvz_lab' ? (
            <PvZLabSheet onFormulaChange={setPvZLabFormulaText} />
          ) : currentSheet === 'snake' ? (
            <SnakeSheet
              onFormulaChange={setSnakeFormulaText}
              onStatusChange={setSnakeStatusSummary}
              onExit={handleExitCurrentGame}
            />
          ) : currentSheet === 'tetris' ? (
            <TetrisSheet
              onFormulaChange={setTetrisFormulaText}
              onStatusChange={setTetrisStatusSummary}
              onExit={handleExitCurrentGame}
            />
          ) : currentSheet === 'pacman' ? (
            <PacmanSheet
              onFormulaChange={setPacmanFormulaText}
              onExit={handleExitCurrentGame}
            />
          ) : currentSheet === 'pacman_guide' ? (
            <PacmanGuideSheet
              onFormulaChange={setPacmanGuideFormulaText}
            />
          ) : currentSheet === 'zuma' ? (
            <ZumaGameSheet
              onFormulaChange={setZumaFormulaText}
              onExit={handleExitCurrentGame}
            />
          ) : currentSheet === 'zuma_collection' ? (
            <ZumaCollectionSheet
              onFormulaChange={setZumaCollectionFormulaText}
            />
          ) : currentSheet === 'match3' ? (
            <Match3Sheet
              onFormulaChange={setMatch3FormulaText}
              onExit={handleExitCurrentGame}
            />
          ) : currentSheet === 'match3_lab' ? (
            <Match3LabSheet
              onFormulaChange={setMatch3LabFormulaText}
            />
          ) : (
            <SettingsPanel
              key="settings-sheet"
              settings={settings}
              onUpdateSettings={updateSetting}
              onApplyPreset={applyPreset}
              onStartGame={startGame}
              onResetSettings={resetSettings}
              tempSettings={tempSettings}
              onUpdateTempSetting={updateTempSetting}
              onSaveSettings={saveSettings}
              onCancelSettings={cancelSettings}
            />
          )}
        </div>

        <SheetTabs currentSheet={currentSheet} visibleSheets={visibleSheets} onSwitch={handleSheetSwitch} isHidden={isHidden} />
        <StatusBar
          selectedCell={effectiveSelectedCell}
          isHidden={isHidden}
          COLS={COLS}
          summary={workbookStatusSummary}
          gameState={activeArcadeGame === 'aim' ? gameState : undefined}
        />
      </div>

      {showFirstTimeGuide && (
        <FirstTimeGuide
          onComplete={() => {
            setShowFirstTimeGuide(false);
            localStorage.setItem('excel-aim-tutorial-completed', 'true');
          }}
        />
      )}

      <SaveManager
        isOpen={showSaveManager}
        onClose={() => setShowSaveManager(false)}
        currentGame={activeArcadeGame || undefined}
        currentSlotId={currentSaveSlot?.id ?? null}
        onSave={(slot) => setCurrentSaveSlot(slot)}
        onLoad={handleLoadSave}
      />

      {showModeTutorial && (
        <ModeTutorialModal
          mode={showModeTutorial}
          modeName={showModeTutorial}
          isOpen={true}
          onClose={() => {
            localStorage.setItem(`tutorial-shown-${showModeTutorial}`, 'true');
            setShowModeTutorial(null);
            setPendingGameStart(null);
          }}
          onStart={() => {
            localStorage.setItem(`tutorial-shown-${showModeTutorial}`, 'true');
            setShowModeTutorial(null);
            if (pendingGameStart) {
              setActiveArcadeGame('aim');
              if (pendingGameStart.isFPSMode && pendingGameStart.fpsConfig) {
                startGameWithMode(pendingGameStart.mode as FPSTrainingMode, pendingGameStart.fpsConfig);
              } else {
                const finalDuration = pendingGameStart.duration || settings.trainingDuration || 60;
                startGame(
                  pendingGameStart.mode,
                  finalDuration as 30 | 60 | 120,
                  pendingGameStart.level,
                  pendingGameStart.difficulty || settings.difficulty,
                );
              }
              setPendingGameStart(null);
            }
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <CrosshairProvider>
        <AppContent />
      </CrosshairProvider>
    </SettingsProvider>
  );
}

export default App;


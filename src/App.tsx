import { useEffect, useState } from 'react';
import { ExcelHeader } from './components/ExcelHeader';
import { SheetTabs } from './components/SheetTabs';
import { ExcelGrid } from './components/ExcelGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { StatusBar } from './components/StatusBar';
import { Crosshair } from './components/Crosshair';
import { GameHub } from './components/GameHub';
import { FancyFeedback } from './components/FancyFeedback';
import { useGameLogic } from './hooks/useGameLogic';
import { useFeedbackSystem } from './hooks/useFeedbackSystem';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { CrosshairProvider, useCrosshair } from './contexts/CrosshairContext';
import type { FPSTrainingMode } from './components/TrainingModeSelector';

function AppContent() {
  const { settings, updateSetting, applyPreset, resetSettings } = useSettings();
  const { mousePosition, isCrosshairVisible, setCrosshairVisible } = useCrosshair();

  const [currentMode, setCurrentMode] = useState<FPSTrainingMode | null>(null);
  const [modeConfig, setModeConfig] = useState<any>({});

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
  } = useGameLogic();

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

  const handleResetStats = () => {
    if (confirm('确定要重置所有统计数据吗？')) {
      localStorage.removeItem('excel-aim-stats-v2');
      window.location.reload();
    }
  };

  // 从 GameHub 启动游戏
  const handleStartGameFromHub = (
    mode: any,
    duration?: 30 | 60 | 120,
    level?: number,
    difficulty?: any
  ) => {
    const finalDuration = duration || settings.trainingDuration || 60;
    startGame(mode, finalDuration as 30 | 60 | 120, level, difficulty || settings.difficulty);
  };

  // 从 GameHub 启动 FPS 训练
  const handleStartFPSTrainingFromHub = (mode: FPSTrainingMode, config?: any) => {
    setCurrentMode(mode);
    const finalConfig = { ...config, duration: config?.duration || settings.trainingDuration || 60 };
    setModeConfig(finalConfig);
    startGameWithMode(mode, finalConfig);
  };

  // Control cursor visibility based on current sheet
  useEffect(() => {
    const shouldHideCursor = currentSheet === 'game' && settings.customCursor && !isHidden;
    
    if (shouldHideCursor) {
      document.body.style.cursor = 'none';
      setCrosshairVisible(true);
    } else {
      document.body.style.cursor = '';
      setCrosshairVisible(false);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.cursor = '';
    };
  }, [currentSheet, settings.customCursor, isHidden, setCrosshairVisible]);

  return (
    <div 
      className="h-screen flex flex-col" 
      style={{ 
        fontFamily: "'Calibri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Crosshair - rendered at top level for smooth tracking */}
      <Crosshair
        x={mousePosition.x}
        y={mousePosition.y}
        style={settings.crosshairStyle}
        color={settings.crosshairColor}
        size={settings.crosshairSize || 12}
        visible={isCrosshairVisible}
      />

      {/* 炫酷反馈 - 仅在炫酷模式下显示 */}
      {settings.feedbackMode !== 'excel' && currentFeedback && (
        <FancyFeedback feedback={currentFeedback} />
      )}

      {/* 紧急隐藏触发区域 */}
      {!isHidden && (
        <div
          className="fixed top-0 left-0 w-24 h-24 z-50"
          onMouseEnter={handleCornerEnter}
          onMouseLeave={handleCornerLeave}
        />
      )}

      {/* 隐藏提示 */}
      {hoverCorner && !isHidden && (
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

      {/* 隐藏状态覆盖层 */}
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
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
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
                <div 
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6f4ea'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={toggleHidden}
                >
                  文件
                </div>
                <div 
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6f4ea'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={toggleHidden}
                >
                  打开
                </div>
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
                  <p style={{ marginBottom: 8 }}>📄 空白工作簿</p>
                  <p style={{ fontSize: 11, color: '#d1d5db' }}>按 Esc 恢复游戏</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Excel 界面 */}
      <div 
        className="flex flex-col h-full" 
        style={{ opacity: isHidden ? 0.5 : 1 }}
      >
        <ExcelHeader 
          isHidden={isHidden} 
          onToggleHidden={toggleHidden}
          onExit={currentSheet === 'game' ? exitToHub : undefined}
          selectedCell={selectedCell}
          feedbackMessage={currentFeedback}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentSheet === 'hub' ? (
            // Sheet1: 游戏中心
            <GameHub
              onStartGame={handleStartGameFromHub}
              onStartFPSTraining={handleStartFPSTrainingFromHub}
              onSwitchSheet={(sheet) => switchSheet(sheet)}
              selectedFPSMode={currentMode}
              trainingDuration={settings.trainingDuration}
              difficulty={settings.difficulty as any}
            />
          ) : currentSheet === 'game' ? (
            // Sheet2: 训练场
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
              onExit={exitToHub}
              multiGridEnemies={multiGridEnemies}
              currentLevel={currentLevel}
              levelConfig={levelConfig}
              levelStatus={levelStatus}
              colorlessMode={settings.colorlessMode}
            />
          ) : currentSheet === 'stats' ? (
            // Sheet3: 统计
            <StatsPanel stats={stats} onReset={handleResetStats} onExit={() => switchSheet('hub')} />
          ) : (
            // Sheet4: 设置
            <SettingsPanel
              key="settings-sheet"
              settings={settings}
              onUpdateSettings={updateSetting}
              onApplyPreset={applyPreset}
              onStartGame={startGame}
              onResetSettings={resetSettings}
            />
          )}
        </div>

        <SheetTabs 
          currentSheet={currentSheet} 
          onSwitch={switchSheet} 
          isHidden={isHidden} 
        />
        <StatusBar 
          selectedCell={selectedCell} 
          isHidden={isHidden} 
          COLS={COLS}
          gameState={gameState}
        />
      </div>
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

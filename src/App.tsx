import { ExcelHeader } from './components/ExcelHeader';
import { SheetTabs } from './components/SheetTabs';
import { ExcelGrid } from './components/ExcelGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { StatusBar } from './components/StatusBar';
import { useGameLogic } from './hooks/useGameLogic';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

function AppContent() {
  const { settings, updateSetting, applyPreset } = useSettings();

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
    handleCellClick,
    handleCellHover,
    switchSheet,
    toggleHidden,
    togglePause,
    handleCornerEnter,
    handleCornerLeave,
    COLS,
    ROWS,
  } = useGameLogic();

  const handleResetStats = () => {
    if (confirm('确定要重置所有统计数据吗？')) {
      localStorage.removeItem('excel-aim-stats-v2');
      window.location.reload();
    }
  };

  // 自定义光标样式
  const cursorStyle = settings.customCursor ? {
    cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cline x1='12' y1='4' x2='12' y2='10' stroke='${encodeURIComponent(settings.crosshairColor)}' stroke-width='2'/%3E%3Cline x1='12' y1='14' x2='12' y2='20' stroke='${encodeURIComponent(settings.crosshairColor)}' stroke-width='2'/%3E%3Cline x1='4' y1='12' x2='10' y2='12' stroke='${encodeURIComponent(settings.crosshairColor)}' stroke-width='2'/%3E%3Cline x1='14' y1='12' x2='20' y2='12' stroke='${encodeURIComponent(settings.crosshairColor)}' stroke-width='2'/%3E%3Ccircle cx='12' cy='12' r='2' fill='${encodeURIComponent(settings.crosshairColor)}'/%3E%3C/svg%3E") 12 12, crosshair`,
  } : {};

  return (
    <div 
      className="h-screen flex flex-col" 
      style={{ 
        fontFamily: "'Calibri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        ...cursorStyle,
      }}
    >
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
              <p style={{ fontSize: 11, color: '#d1d5db' }}>按 F5 恢复游戏</p>
            </div>
          </div>
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
          selectedCell={selectedCell}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentSheet === 'game' ? (
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
              crosshairStyle={settings.crosshairStyle}
              crosshairColor={settings.crosshairColor}
              crosshairSize={settings.crosshairSize || 12}

            />
          ) : currentSheet === 'settings' ? (
            <SettingsPanel
              key="settings-sheet"
              settings={settings}
              onUpdateSettings={updateSetting}
              onApplyPreset={applyPreset}
              onStartGame={startGame}
            />
          ) : (
            <StatsPanel key="stats-sheet" stats={stats} onReset={handleResetStats} />
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
      <AppContent />
    </SettingsProvider>
  );
}

export default App;

// Excel 表格网格组件 - 整合各子组件

import React from 'react';
import type { Target, HitEffect, MultiGridEnemy, LevelConfig, PartType } from '../types';
import { playHitSound, playMissSound } from '../utils/soundUtils';
import { GridTable, HitEffectRenderer, GameHUD, PauseOverlay } from './grid';

interface ExcelGridProps {
  targets: Target[];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  COLS: number;
  ROWS: number;
  isHidden: boolean;
  gameState: {
    isPlaying: boolean;
    isPaused: boolean;
    score: number;
    combo: number;
    timeRemaining: number;
    mode: string;
    misses: number;
    headshotLineRow?: number;
    hits?: number;
    totalClicks?: number;
    maxCombo?: number;
    headHits?: number;
  };
  headshotLineEnabled?: boolean;
  headshotLineRow?: number;
  targetSize?: number;
  hitEffects?: HitEffect[];
  togglePause?: () => void;
  soundEnabled?: boolean;
  onExit?: () => void;
  // 多格敌人支持
  multiGridEnemies?: MultiGridEnemy[];
  enemyRenderMode?: 'text' | 'icon';
  showEnemyPriority?: boolean;
  showEnemyHp?: boolean;
  // 关卡系统
  currentLevel?: number | null;
  levelConfig?: LevelConfig | null;
  levelStatus?: 'playing' | 'completed' | 'failed' | null;
  // 无色模式
  colorlessMode?: boolean;
}

export const ExcelGrid: React.FC<ExcelGridProps> = ({
  targets,
  selectedCell,
  onCellClick,
  onCellHover,
  COLS,
  ROWS,
  isHidden,
  gameState,
  headshotLineEnabled = false,
  headshotLineRow = 10,
  targetSize = 20,
  hitEffects = [],
  togglePause,
  soundEnabled = true,
  onExit,
  // 多格敌人支持
  multiGridEnemies = [],
  enemyRenderMode = 'text',
  showEnemyPriority = true,
  showEnemyHp = true,
  // 关卡系统
  currentLevel,
  levelConfig,
  levelStatus,
  // 无色模式
  colorlessMode = false,
}) => {
  // 处理 miss 音效
  const handleMiss = () => {
    if (gameState.isPlaying) {
      playMissSound(soundEnabled);
    }
  };

  // 处理点击（包含音效）
  const handleCellClickWithSound = (row: number, col: number) => {
    const target = targets.find(t => t.row === row && t.col === col);
    if (target) {
      playHitSound(target.type === 'head', gameState.combo, soundEnabled);
    }
    onCellClick(row, col);
  };

  // 处理多格敌人部位点击
  const handlePartClick = (enemyId: string, partType: PartType, row: number, col: number) => {
    playHitSound(partType === 'head', gameState.combo, soundEnabled);
    onCellClick(row, col);
  };

  if (isHidden) {
    return (
      <GridTable
        COLS={COLS}
        ROWS={ROWS}
        selectedCell={selectedCell}
        onCellClick={onCellClick}
        onCellHover={onCellHover}
        targets={[]}
        isHidden={true}
      />
    );
  }

  return (
    <div className="excel-grid-container">
      {/* 退出按钮 */}
      {onExit && (
        <button
          className="exit-game-btn"
          onClick={onExit}
          title="返回游戏中心"
        >
          ✕ 退出
        </button>
      )}

      {/* 游戏 HUD */}
      {gameState.isPlaying && !gameState.isPaused && (
        <GameHUD
          score={gameState.score}
          combo={gameState.combo}
          timeRemaining={gameState.timeRemaining}
          mode={gameState.mode}
          misses={gameState.misses}
          headshotLineRow={headshotLineRow}
        />
      )}

      {/* 关卡进度显示 */}
      {currentLevel && levelConfig && gameState.isPlaying && !gameState.isPaused && (
        <div className="level-progress-hud">
          <div className="level-header">
            <span className="level-badge">关卡 {currentLevel}</span>
            <span className="level-difficulty">{levelConfig.difficulty <= 3 ? '新手' : levelConfig.difficulty <= 6 ? '进阶' : levelConfig.difficulty <= 9 ? '熟练' : '专家'}</span>
          </div>
          <div className="level-objectives">
            {levelConfig.objectives.map((obj, idx) => {
              let current = 0;
              let isComplete = false;
              
              switch (obj.type) {
                case 'minScore':
                  current = gameState.score;
                  isComplete = current >= obj.target;
                  break;
                case 'accuracy':
                  current = gameState.totalClicks && gameState.hits ? Math.round((gameState.hits / gameState.totalClicks) * 100) : 0;
                  isComplete = current >= obj.target;
                  break;
                case 'combo':
                  current = gameState.maxCombo || 0;
                  isComplete = current >= obj.target;
                  break;
                case 'headshotCount':
                  current = gameState.headHits || 0;
                  isComplete = current >= obj.target;
                  break;
                case 'timeLimit':
                  current = gameState.timeRemaining;
                  isComplete = current > 0;
                  break;
              }
              
              return (
                <div key={idx} className={`objective ${isComplete ? 'complete' : ''}`}>
                  <span className="obj-icon">{isComplete ? '✓' : '○'}</span>
                  <span className="obj-text">{obj.description}</span>
                  <span className="obj-progress">{current.toLocaleString()}/{obj.target.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 关卡完成/失败覆盖层 */}
      {levelStatus && levelStatus !== 'playing' && (
        <div className={`level-result-overlay ${levelStatus}`}>
          <div className="level-result-content">
            <h2>{levelStatus === 'completed' ? '🎉 关卡完成!' : '💔 关卡失败'}</h2>
            <p>关卡 {currentLevel}</p>
            <div className="final-score">得分: {gameState.score.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 暂停覆盖层 */}
      {gameState.isPaused && togglePause && (
        <PauseOverlay onResume={togglePause} />
      )}

      {/* 命中特效渲染 */}
      <HitEffectRenderer effects={hitEffects} />

      {/* 表格网格 */}
      <GridTable
        COLS={COLS}
        ROWS={ROWS}
        selectedCell={selectedCell}
        onCellClick={handleCellClickWithSound}
        onCellHover={onCellHover}
        headshotLineEnabled={headshotLineEnabled}
        headshotLineRow={headshotLineRow}
        targetSize={targetSize}
        targets={targets}
        onMiss={handleMiss}
        // 多格敌人支持
        multiGridEnemies={multiGridEnemies}
        enemyRenderMode={enemyRenderMode}
        showEnemyPriority={showEnemyPriority}
        showEnemyHp={showEnemyHp}
        onPartClick={handlePartClick}
        colorlessMode={colorlessMode}
      />
    </div>
  );
};
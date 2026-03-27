// Excel 表格网格组件 - 整合各子组件

import React from 'react';
import type { Target, HitEffect } from '../types';
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
  };
  headshotLineEnabled?: boolean;
  headshotLineRow?: number;
  targetSize?: number;
  hitEffects?: HitEffect[];
  togglePause?: () => void;
  soundEnabled?: boolean;
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
      />
    </div>
  );
};
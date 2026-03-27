import React, { useCallback, useEffect, useState } from 'react';
import type { Target, HitEffect } from '../types';
import { generateColLetters } from '../utils/gridUtils';
import { playHitSound, playMissSound } from '../utils/soundUtils';

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
  const [missEffects, setMissEffects] = useState<Set<string>>(new Set());

  // 生成列字母 B-AD (30列)
  const colLetters = React.useMemo(() => {
    return generateColLetters(COLS);
  }, [COLS]);

  const getTargetAt = useCallback((row: number, col: number) => {
    return targets.find(t => t.row === row && t.col === col);
  }, [targets]);

  const isSelected = useCallback((row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  }, [selectedCell]);

  // 清理 miss 效果
  useEffect(() => {
    if (missEffects.size > 0) {
      const timer = setTimeout(() => setMissEffects(new Set()), 200);
      return () => clearTimeout(timer);
    }
  }, [missEffects]);

  if (isHidden) {
    // 显示纯表格伪装
    return (
      <div className="excel-grid-container">
        <div className="excel-grid-wrapper">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="excel-corner-cell" />
                {colLetters.map(letter => (
                  <th key={letter} className="excel-col-header">
                    {letter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="excel-row-header">{rowIndex + 1}</td>
                  {colLetters.map(letter => (
                    <td key={`${letter}-${rowIndex + 1}`} className="excel-cell">
                      {Math.random() > 0.92 ? Math.floor(Math.random() * 1000) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const handleCellClick = (row: number, col: number) => {
    const target = getTargetAt(row, col);
    if (target) {
      // 命中音效
      playHitSound(target.type === 'head', gameState.combo, soundEnabled);
    } else if (gameState.isPlaying) {
      // Miss 音效
      playMissSound(soundEnabled);
      setMissEffects(prev => new Set([...prev, `${row}-${col}`]));
    }
    onCellClick(row, col);
  };

  return (
    <div className="excel-grid-container">
      {/* 游戏 HUD */}
      {gameState.isPlaying && !gameState.isPaused && (
        <div className="game-hud">
          <div className="game-hud-left">
            <div className="game-stat">
              <span className="game-stat-label">分数</span>
              <span className="game-stat-value score">{gameState.score.toLocaleString()}</span>
            </div>
            {gameState.combo > 1 && (
              <div className="game-stat combo-pop">
                <span className="game-stat-label">连击</span>
                <span className="game-stat-value combo">{gameState.combo}x</span>
              </div>
            )}
          </div>
          <div className="game-hud-right">
            {gameState.mode === 'timed' && (
              <div className="game-stat">
                <span className={`game-stat-value time ${gameState.timeRemaining <= 10 ? 'warning' : ''}`}>
                  {gameState.timeRemaining}s
                </span>
              </div>
            )}
            {gameState.mode === 'endless' && (
              <div className="game-stat">
                <span className="game-stat-label">剩余</span>
                <span className="game-stat-value" style={{ color: gameState.misses >= 2 ? '#fca5a5' : 'white' }}>
                  {3 - gameState.misses} 条命
                </span>
              </div>
            )}
            {gameState.mode === 'headshot' && (
              <div className="game-stat">
                <span className="game-stat-label">爆头线</span>
                <span className="game-stat-value">第 {headshotLineRow} 行</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 暂停覆盖层 */}
      {gameState.isPaused && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            style={{
              background: 'white',
              padding: '24px 48px',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#107c41', marginBottom: 8 }}>
                      ⏸️ 游戏暂停
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              按 P 键或点击下方按钮继续
            </div>
            <button
              onClick={togglePause}
              style={{
                background: '#107c41',
                color: 'white',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 4,
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              继续游戏
            </button>
          </div>
        </div>
      )}

      {/* 命中特效渲染 */}
      {hitEffects.map(effect => (
        <div
          key={effect.id}
          className={`score-popup ${effect.isCombo ? 'combo' : ''} ${effect.isHeadshot ? 'headshot' : ''}`}
          style={{
            position: 'absolute',
            left: `calc(${effect.col - 1} * var(--excel-cell-width) + var(--excel-row-header-width))`,
            top: `calc(${effect.row - 1} * var(--excel-cell-height))`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          +{effect.score}
          {effect.isHeadshot && ' 💥'}
        </div>
      ))}

      <div className="excel-grid-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="excel-corner-cell" />
              {colLetters.map((letter, colIndex) => (
                <th 
                  key={letter} 
                  className={`excel-col-header ${
                    selectedCell && colIndex + 2 === selectedCell.col ? 'highlighted' : ''
                  }`}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, rowIndex) => {
              const rowNum = rowIndex + 1;
              const isHeadshotLine = headshotLineEnabled && rowNum === headshotLineRow;
              
              return (
                <tr key={rowNum}>
                  <td className={`excel-row-header ${
                    selectedCell?.row === rowNum ? 'highlighted' : ''
                  }`}>
                    {rowNum}
                  </td>
                  {colLetters.map((letter, colIndex) => {
                    const colNum = colIndex + 2;
                    const target = getTargetAt(rowNum, colNum);
                    const selected = isSelected(rowNum, colNum);
                    const isMissEffect = missEffects.has(`${rowNum}-${colNum}`);

                    return (
                      <td
                        key={`${letter}-${rowNum}`}
                        className={`excel-cell ${selected ? 'selected' : ''} ${isMissEffect ? 'miss-flash' : ''}`}
                        style={isHeadshotLine ? { background: 'rgba(255, 0, 0, 0.03)' } : undefined}
                        onClick={() => handleCellClick(rowNum, colNum)}
                        onMouseEnter={() => onCellHover(rowNum, colNum)}
                      >
                        {/* 爆头线指示器 */}
                        {isHeadshotLine && colIndex === 0 && (
                          <div style={{
                            position: 'absolute',
                            left: -8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderTop: '4px solid transparent',
                            borderBottom: '4px solid transparent',
                            borderLeft: '4px solid #dc2626',
                          }} />
                        )}
                        
                        {/* 目标 */}
                        {target && (
                          <div className="target">
                            {target.type === 'head' && (
                              <div 
                                className={`target-head ${isHeadshotLine ? 'target-headshot-line' : ''}`}
                                style={{ width: targetSize, height: targetSize }}
                              >
                                <span className="target-head-value">100</span>
                              </div>
                            )}
                            {target.type === 'body' && (
                              <div 
                                className="target-body"
                                style={{ width: targetSize + 2, height: targetSize + 2 }}
                              >
                                <span className="target-body-value">50</span>
                              </div>
                            )}
                            {target.type === 'feet' && (
                              <div 
                                className="target-feet"
                                style={{ 
                                  borderLeftWidth: (targetSize + 2) / 2,
                                  borderRightWidth: (targetSize + 2) / 2,
                                  borderBottomWidth: targetSize + 2,
                                }}
                              >
                                <span className="target-feet-value">25</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// 基础表格渲染组件

import React, { useCallback, useState, useEffect } from 'react';
import type { Target, MultiGridEnemy, PartType } from '../../types';
import { generateColLetters } from '../../utils/gridUtils';
import { TargetRenderer } from './TargetRenderer';
import { MultiGridEnemies } from './MultiGridEnemyRenderer';
import { CELL_WIDTH, CELL_HEIGHT } from '../../constants';

interface GridTableProps {
  COLS: number;
  ROWS: number;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  headshotLineEnabled?: boolean;
  headshotLineRow?: number;
  targetSize?: number;
  targets: Target[];
  isHidden?: boolean;
  soundEnabled?: boolean;
  onMiss?: (row: number, col: number) => void;
  // 多格敌人支持
  multiGridEnemies?: MultiGridEnemy[];
  enemyRenderMode?: 'text' | 'icon';
  showEnemyPriority?: boolean;
  showEnemyHp?: boolean;
  onPartClick?: (enemyId: string, partType: PartType, row: number, col: number) => void;
}

export const GridTable: React.FC<GridTableProps> = ({
  COLS,
  ROWS,
  selectedCell,
  onCellClick,
  onCellHover,
  headshotLineEnabled = false,
  headshotLineRow = 10,
  targetSize = 20,
  targets,
  isHidden = false,
  onMiss,
  // 多格敌人支持
  multiGridEnemies = [],
  enemyRenderMode = 'text',
  showEnemyPriority = true,
  showEnemyHp = true,
  onPartClick,
}) => {
  const [missEffects, setMissEffects] = useState<Set<string>>(new Set());

  // 生成列字母
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

  // 隐藏模式：显示纯表格伪装
  if (isHidden) {
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
    if (!target && onMiss) {
      setMissEffects(prev => new Set([...prev, `${row}-${col}`]));
      onMiss(row, col);
    }
    onCellClick(row, col);
  };

  return (
    <div className="excel-grid-wrapper" style={{ position: 'relative' }}>
      <table className="excel-table">
        <thead>
          <tr>
            <th className="excel-corner-cell" />
            {colLetters.map((letter, colIndex) => (
              <th 
                key={letter} 
                className={`excel-col-header ${
                  selectedCell && colIndex + 1 === selectedCell.col ? 'highlighted' : ''
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
                  const colNum = colIndex + 1;
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
                        <TargetRenderer
                          target={target}
                          targetSize={targetSize}
                          isHeadshotLine={isHeadshotLine}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 多格敌人渲染层 */}
      {multiGridEnemies.length > 0 && (
        <MultiGridEnemies
          enemies={multiGridEnemies}
          cellWidth={CELL_WIDTH}
          cellHeight={CELL_HEIGHT}
          rowHeaderWidth={24}
          colHeaderHeight={20}
          renderMode={enemyRenderMode}
          showPriority={showEnemyPriority}
          showHp={showEnemyHp}
          onPartClick={onPartClick}
        />
      )}
    </div>
  );
};
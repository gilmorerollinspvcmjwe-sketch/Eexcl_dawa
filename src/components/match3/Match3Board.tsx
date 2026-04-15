/* 三消棋盘组件。渲染棋盘、色块、障碍物，处理点击交互，集成视觉动画。 */

import React, { useEffect, useState } from 'react';
import type { Match3BoardState, Match3Tile, Match3Color, Match3SpecialType, Match3ObstacleType } from '../../features/match3/match3Types';

interface Match3BoardProps {
  state: Match3BoardState;
  onCellClick: (row: number, col: number) => void;
  focusedTile?: { row: number; col: number } | null;
}

interface ChainIndicator {
  id: number;
  level: number;
  row: number;
  col: number;
}

const COLOR_EMOJIS: Record<Match3Color, string> = {
  red: '🔴',
  orange: '🟠',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  purple: '🟣',
};

const SPECIAL_ICONS: Record<Match3SpecialType, string> = {
  'striped-h': '➡️',
  'striped-v': '⬇️',
  'wrapped': '🎁',
  'colorBomb': '🌈',
};

const DROP_ITEM_ICONS = {
  folder: '📁',
  stamp: '🧾',
  formulaChip: '🧩',
} as const;

const OBSTACLE_ICONS: Record<Match3ObstacleType, string> = {
  frost1: '❄️',
  frost2: '🧊',
  chain: '🔗',
  box: '📦',
  stone: '🪨',
  portalIn: '🌀',
  portalOut: '🌀',
  spreader: '🦠',
};

function getTileClass(tile: Match3Tile, isTriggering: boolean): string {
  const classes: string[] = ['match3-tile'];
  if (tile.color) {
    classes.push(`match3-tile--${tile.color}`);
  } else {
    classes.push('match3-tile--empty');
  }
  if (tile.special) {
    classes.push('match3-tile--special');
    classes.push(`match3-tile--${tile.special}`);
    if (isTriggering) {
      classes.push('match3-tile--triggering');
    }
  }
  if (tile.isMatched) {
    classes.push('match3-cell--matched');
  }
  if (tile.isDropping) {
    classes.push('match3-cell--dropping');
  }
  return classes.join(' ');
}

function getObstacleClass(obstacle: Match3ObstacleType, isBreaking: boolean): string {
  const classes = ['match3-obstacle', `match3-obstacle--${obstacle}`];
  if (isBreaking) {
    classes.push('match3-obstacle--breaking');
  }
  return classes.join(' ');
}

function getCellClass(
  state: Match3BoardState,
  row: number,
  col: number,
  focusedTile: { row: number; col: number } | null,
  swapAnim: { from: { row: number; col: number }; to: { row: number; col: number }; valid: boolean } | null,
  chainLevel: number
): string {
  const classes: string[] = ['match3-cell'];
  if (focusedTile?.row === row && focusedTile?.col === col) {
    classes.push('match3-cell--focused');
  }
  if (state.selectedTile?.row === row && state.selectedTile?.col === col) {
    classes.push('match3-cell--selected');
  } else if (state.selectedTile) {
    const { row: selRow, col: selCol } = state.selectedTile;
    const isAdjacent = (Math.abs(row - selRow) === 1 && col === selCol) ||
                       (Math.abs(col - selCol) === 1 && row === selRow);
    if (isAdjacent) {
      classes.push('match3-cell--adjacent');
    }
  }
  const tile = state.tiles[row]?.[col];
  if (tile?.isMatched) {
    classes.push('match3-cell--matched');
    if (chainLevel > 0) {
      classes.push(`match3-cell--chain-${Math.min(chainLevel, 4)}`);
    }
  }
  if (tile?.isDropping) {
    classes.push('match3-cell--dropping');
  }
  if (swapAnim) {
    if ((swapAnim.from.row === row && swapAnim.from.col === col) ||
        (swapAnim.to.row === row && swapAnim.to.col === col)) {
      if (swapAnim.valid) {
        classes.push('match3-cell--swapping');
      } else {
        classes.push('match3-cell--swap-invalid');
      }
    }
  }
  return classes.join(' ');
}

function getCellAriaLabel(state: Match3BoardState, row: number, col: number): string {
  const tile = state.tiles[row]?.[col];
  if (!tile || !tile.color) return `第 ${row + 1} 行第 ${col + 1} 列，空格`;

  const colorName = tile.color;
  const dropInfo = tile.dropItem ? `，携带${tile.dropItem === 'folder' ? '文件夹' : tile.dropItem === 'stamp' ? '印章' : '公式芯片'}` : '';
  const specialInfo = tile.special ? `，${tile.special === 'striped-h' ? '横向条纹' : tile.special === 'striped-v' ? '纵向条纹' : tile.special === 'wrapped' ? '包装块' : '彩球'}` : '';
  const obstacleInfo = tile.obstacle ? `，被${tile.obstacle === 'frost1' ? '单层冰冻' : tile.obstacle === 'frost2' ? '双层冰冻' : tile.obstacle === 'chain' ? '锁链' : tile.obstacle === 'box' ? '木箱' : tile.obstacle === 'stone' ? '石块' : tile.obstacle === 'spreader' ? '蔓延块' : '障碍'}覆盖` : '';

  const isSelected = state.selectedTile?.row === row && state.selectedTile?.col === col;
  const selectionInfo = isSelected ? '，已选中' : '';

  return `第 ${row + 1} 行第 ${col + 1} 列，${colorName}色块${dropInfo}${specialInfo}${obstacleInfo}${selectionInfo}`;
}

export const Match3Board: React.FC<Match3BoardProps> = ({ state, onCellClick, focusedTile = null }) => {
  const [chainIndicators, setChainIndicators] = useState<ChainIndicator[]>([]);
  const [swapAnim, setSwapAnim] = useState<{ from: { row: number; col: number }; to: { row: number; col: number }; valid: boolean } | null>(null);
  const [triggeringTiles, setTriggeringTiles] = useState<Set<string>>(new Set());
  const [breakingObstacles, setBreakingObstacles] = useState<Set<string>>(new Set());
  const popupIdRef = React.useRef(0);

  useEffect(() => {
    if (state.lastSwap) {
      const startTimer = window.setTimeout(() => {
        setSwapAnim(state.lastSwap);
      }, 0);
      const clearTimer = window.setTimeout(() => setSwapAnim(null), 300);
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(clearTimer);
      };
    }
  }, [state.lastSwap]);

  useEffect(() => {
    if (state.chainCount > 0 && state.comboLevel > 0) {
      const matchedTiles = state.tiles.flat().filter(t => t.isMatched);
      if (matchedTiles.length > 0) {
        const centerTile = matchedTiles[Math.floor(matchedTiles.length / 2)];
        const newIndicator: ChainIndicator = {
          id: popupIdRef.current++,
          level: state.comboLevel,
          row: centerTile.row,
          col: centerTile.col,
        };
        const showTimer = window.setTimeout(() => {
          setChainIndicators(prev => [...prev, newIndicator]);
        }, 0);
        const hideTimer = window.setTimeout(() => {
          setChainIndicators(prev => prev.filter(i => i.id !== newIndicator.id));
        }, 500);
        return () => {
          window.clearTimeout(showTimer);
          window.clearTimeout(hideTimer);
        };
      }
    }
  }, [state.chainCount, state.comboLevel, state.tiles]);

  useEffect(() => {
    const matchedTiles = state.tiles.flat().filter(t => t.isMatched && t.special);
    if (matchedTiles.length > 0) {
      const newTriggering = new Set<string>();
      matchedTiles.forEach(t => {
        newTriggering.add(`${t.row}-${t.col}`);
      });
      const startTimer = window.setTimeout(() => setTriggeringTiles(newTriggering), 0);
      const clearTimer = window.setTimeout(() => setTriggeringTiles(new Set()), 400);
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(clearTimer);
      };
    }
  }, [state.tiles]);

  useEffect(() => {
    const breakingTiles = state.tiles.flat().filter(t => t.obstacle && t.obstacleHp === 0);
    if (breakingTiles.length > 0) {
      const newBreaking = new Set<string>();
      breakingTiles.forEach(t => {
        if (t.obstacle) {
          newBreaking.add(`${t.row}-${t.col}`);
        }
      });
      const startTimer = window.setTimeout(() => setBreakingObstacles(newBreaking), 0);
      const clearTimer = window.setTimeout(() => setBreakingObstacles(new Set()), 350);
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(clearTimer);
      };
    }
  }, [state.tiles]);

  const renderChainIndicators = () => {
    return chainIndicators.map(indicator => (
      <div
        key={indicator.id}
        className={`match3-chain-indicator match3-chain-indicator--level-${indicator.level}`}
        style={{
          top: `${((indicator.row + 0.5) / state.rows) * 100}%`,
          left: `${((indicator.col + 0.5) / state.cols) * 100}%`,
        }}
      >
        {indicator.level + 1}连!
      </div>
    ));
  };

  return (
    <div className="match3-board-shell">
      <div className="match3-board">
        {renderChainIndicators()}
        {Array.from({ length: state.rows }, (_, row) => (
          <div key={`row-${row}`} className="match3-row">
            {Array.from({ length: state.cols }, (_, col) => {
              const tile = state.tiles[row]?.[col];
              if (!tile) {
                return (
                  <button
                    key={`cell-${row}-${col}`}
                    type="button"
                    className="match3-cell"
                    onClick={() => onCellClick(row, col)}
                    aria-label={`第 ${row + 1} 行第 ${col + 1} 列，空格`}
                  />
                );
              }

              const isTriggering = triggeringTiles.has(`${row}-${col}`);
              const isBreaking = breakingObstacles.has(`${row}-${col}`);

              return (
                <button
                  key={`cell-${row}-${col}`}
                  type="button"
                  className={`${getCellClass(state, row, col, focusedTile, swapAnim, state.comboLevel)}${state.dropExits.some((exit) => exit.row === row && exit.col === col) ? ' match3-cell--drop-exit' : ''}`}
                  onClick={() => onCellClick(row, col)}
                  aria-label={getCellAriaLabel(state, row, col)}
                  aria-pressed={state.selectedTile?.row === row && state.selectedTile?.col === col}
                >
                    <div className={getTileClass(tile, isTriggering)}>
                      {tile.dropItem
                        ? DROP_ITEM_ICONS[tile.dropItem]
                        : tile.color
                          ? (tile.special ? SPECIAL_ICONS[tile.special] : COLOR_EMOJIS[tile.color])
                          : ''}
                    </div>

                  {tile.obstacle && (
                    <div className={getObstacleClass(tile.obstacle, isBreaking)}>
                      {OBSTACLE_ICONS[tile.obstacle]}
                      {tile.obstacleHp && tile.obstacleHp > 1 && (
                        <span style={{ fontSize: '10px', marginLeft: '2px' }}>{tile.obstacleHp}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

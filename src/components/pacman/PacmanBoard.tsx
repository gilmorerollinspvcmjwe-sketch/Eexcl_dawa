/* 吃豆人棋盘渲染组件。负责迷宫、豆子、能量豆、角色渲染、动画效果。 */

import React, { useState, useEffect } from 'react';
import type { PacmanBoardState, PacmanDirection, GhostId } from '../../features/pacman/pacmanTypes';
import { FRUIT_NAMES, GHOST_EAT_SCORES } from '../../features/pacman/pacmanTypes';
import { getMazeDefinition } from '../../features/pacman/pacmanBoardState';
import { getFrightenedRemainingTime, isFrightenedBlinking } from '../../features/pacman/pacmanLevelTuning';

interface PacmanBoardProps {
  state: PacmanBoardState;
}

interface ScorePopup {
  id: number;
  score: number;
  row: number;
  col: number;
}

interface GhostCellStack {
  ghosts: Array<{
    state: string;
    ghostId: GhostId;
  }>;
}

const PACMAN_SYMBOLS: Record<PacmanDirection, string> = {
  up: '⬆',
  down: '⬇',
  left: '⬅',
  right: '➡',
  none: '●',
};

const GHOST_SYMBOLS: Record<GhostId, string> = {
  blinky: '👻',
  pinky: '👻',
  inky: '👻',
  clyde: '👻',
};

const FRUIT_SYMBOLS: Record<string, string> = {
  cherry: '🍒',
  strawberry: '🍓',
  orange: '🍊',
  apple: '🍎',
  melon: '🍈',
  galaxian: '🌟',
  bell: '🔔',
  key: '🔑',
};

export const PacmanBoard: React.FC<PacmanBoardProps> = ({ state }) => {
  const maze = getMazeDefinition(state.mazeId);
  const cellSize = 14;

  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [fruitAppearing, setFruitAppearing] = useState(false);
  const prevGhostsEatenRef = React.useRef(0);
  const prevFruitActiveRef = React.useRef(false);

  const pacmanRow = Math.round(state.pacman.pixelY);
  const pacmanCol = Math.round(state.pacman.pixelX);

  const ghostPositions = new Map<string, GhostCellStack>();
  for (const ghost of state.ghosts) {
    const row = Math.round(ghost.pixelY);
    const col = Math.round(ghost.pixelX);
    const key = `${row}:${col}`;
    const existing = ghostPositions.get(key);
    if (existing) {
      existing.ghosts.push({
        state: ghost.state,
        ghostId: ghost.ghostId,
      });
    } else {
      ghostPositions.set(key, {
        ghosts: [{
          state: ghost.state,
          ghostId: ghost.ghostId,
        }],
      });
    }
  }

  const fruitRow = state.fruit?.row ?? -1;
  const fruitCol = state.fruit?.col ?? -1;
  const fruitActive = state.fruit?.isActive ?? false;
  const fruitId = state.fruit?.fruitId ?? 'cherry';

  const frightenedRemaining = getFrightenedRemainingTime(state);
  const isBlinking = isFrightenedBlinking(state);

  useEffect(() => {
    if (state.totalGhostsEaten > prevGhostsEatenRef.current) {
      const newPopups: ScorePopup[] = [];
      for (let i = prevGhostsEatenRef.current; i < state.totalGhostsEaten; i++) {
        const scoreIndex = Math.min(i, GHOST_EAT_SCORES.length - 1);
        const score = GHOST_EAT_SCORES[scoreIndex];
        newPopups.push({
          id: Date.now() + i,
          score,
          row: pacmanRow,
          col: pacmanCol,
        });
      }
      const timer = window.setTimeout(() => {
        setScorePopups(prev => [...prev, ...newPopups]);
      }, 0);
      prevGhostsEatenRef.current = state.totalGhostsEaten;
      return () => window.clearTimeout(timer);
    }
  }, [state.totalGhostsEaten, pacmanRow, pacmanCol]);

  useEffect(() => {
    if (fruitActive && !prevFruitActiveRef.current) {
      const startTimer = window.setTimeout(() => setFruitAppearing(true), 0);
      const endTimer = window.setTimeout(() => setFruitAppearing(false), 500);
      prevFruitActiveRef.current = fruitActive;
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(endTimer);
      };
    }
    prevFruitActiveRef.current = fruitActive;
  }, [fruitActive]);

  useEffect(() => {
    if (scorePopups.length > 0) {
      const timer = setTimeout(() => {
        setScorePopups(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [scorePopups]);

  const isDying = state.status === 'dead' && state.deathAnimationMs > 0;
  const isRespawning = state.respawnAnimationMs > 0;
  const isVictory = state.status === 'won';
  const isDefeat = state.status === 'lost';

  const boardShellClass = `pacman-board-shell${isVictory ? ' victory' : ''}${isDefeat ? ' defeat' : ''}`;

  return (
    <div className={boardShellClass}>
      <div
        className="pacman-board-grid"
        style={{
          gridTemplateColumns: `repeat(${maze.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${maze.rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: maze.rows }, (_, row) =>
          Array.from({ length: maze.cols }, (_, col) => {
            const cellType = maze.grid[row][col];
            const key = `${row}:${col}`;

            let className = `pacman-board-cell ${cellType}`;
            let content = '';

            const isPacmanHere = pacmanRow === row && pacmanCol === col;
            const ghostStack = ghostPositions.get(key);
            const isFruitHere = fruitActive && fruitRow === row && fruitCol === col;

            const isEnergizer = maze.energizerPositions.some(
              (pos) => pos.row === row && pos.col === col
            );

            if (isPacmanHere) {
              className = `pacman-board-cell pacman dir-${state.pacman.direction}`;
              if (isDying) {
                className += ' dying';
              }
              if (isRespawning) {
                className += ' respawning';
              }
              content = PACMAN_SYMBOLS[state.pacman.direction];
            } else if (ghostStack) {
              const ghost = state.ghosts.find((g) => {
                const gRow = Math.round(g.pixelY);
                const gCol = Math.round(g.pixelX);
                return gRow === row && gCol === col;
              });

              if (ghost) {
                if (ghost.state === 'frightened') {
                  className = isBlinking
                    ? 'pacman-board-cell ghost frightened-blink'
                    : 'pacman-board-cell ghost frightened';
                  content = '👻';
                } else if (ghost.state === 'eaten') {
                  className = 'pacman-board-cell ghost eaten';
                  content = '👀';
                } else {
                  className = `pacman-board-cell ghost ${ghost.ghostId}`;
                  content = GHOST_SYMBOLS[ghost.ghostId];
                }
                if (ghostStack.ghosts.length > 1) {
                  className += ' multi';
                }
              }
            } else if (isFruitHere) {
              className = `pacman-board-cell fruit ${fruitId}`;
              if (fruitAppearing) {
                className += ' appearing';
              }
              content = FRUIT_SYMBOLS[fruitId] || FRUIT_NAMES[fruitId];
            } else if (isEnergizer && !state.eatenEnergizerPositions.has(key)) {
              className = 'pacman-board-cell energizer';
              content = '';
            } else if (cellType === 'pellet' && !state.eatenPelletPositions.has(key)) {
              className = 'pacman-board-cell pellet';
              content = '';
            }

            return (
              <div key={key} className={className}>
                <span>{content}</span>
                {ghostStack && ghostStack.ghosts.length > 1 ? (
                  <small className="pacman-ghost-stack-count">×{ghostStack.ghosts.length}</small>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {scorePopups.map(popup => (
        <div
          key={popup.id}
          className={`pacman-score-popup score-${popup.score}`}
          style={{
            left: `${popup.col * cellSize + cellSize / 2}px`,
            top: `${popup.row * cellSize}px`,
          }}
        >
          {popup.score}
        </div>
      ))}

      {state.status === 'playing' && state.globalMode.currentMode === 'frightened' && (
        <div className="pacman-frightened-indicator">
          惊吓模式: {Math.ceil(frightenedRemaining / 1000)}秒
          {isBlinking && <span className="pacman-blink-warning">⚠ 即将结束</span>}
        </div>
      )}
    </div>
  );
};
